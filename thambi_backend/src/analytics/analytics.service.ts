import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueTrends(restaurantId: string, startDate?: string, endDate?: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        status: { not: 'Cancelled' },
        createdAt: { gte: start, lte: end },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const orderVolume = orders.length;
    const averageOrderValue = orderVolume > 0 ? totalRevenue / orderVolume : 0;

    // Peak Hours
    const peakHoursCount = new Array(24).fill(0);
    orders.forEach(order => {
      peakHoursCount[order.createdAt.getHours()]++;
    });

    // Timeframe Grouping
    const trends: { date: string; revenue: number; volume: number }[] = [];
    
    // Grouping by Date (ignoring weekly/monthly for simplicity in this implementation, can be extended)
    // We will just do daily grouping since it's most common, and UI can aggregate if needed
    const grouped = orders.reduce((acc, order) => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { revenue: 0, volume: 0 };
      acc[dateStr].revenue += order.total;
      acc[dateStr].volume += 1;
      return acc;
    }, {} as Record<string, { revenue: number; volume: number }>);

    for (const [date, data] of Object.entries(grouped)) {
      trends.push({ date, ...data });
    }

    return {
      totalRevenue,
      orderVolume,
      averageOrderValue,
      trends,
      peakHours: peakHoursCount.map((count, hour) => ({ hour, count })),
    };
  }

  async getMenuAnalytics(restaurantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        status: { not: 'Cancelled' },
        createdAt: { gte: start, lte: end },
      },
      select: { items: true },
    });

    const itemStats: Record<string, { name: string; quantity: number; revenue: number, categoryId?: string }> = {};

    orders.forEach(order => {
      const items = order.items as any[];
      if (Array.isArray(items)) {
        items.forEach(item => {
          if (!itemStats[item.item_id]) {
            itemStats[item.item_id] = { name: item.name, quantity: 0, revenue: 0 };
          }
          itemStats[item.item_id].quantity += item.quantity || 1;
          itemStats[item.item_id].revenue += (item.quantity || 1) * (item.unit_price || 0);
        });
      }
    });

    // Match with actual categories from MenuItems
    const catalogItems = await this.prisma.menuItem.findMany({
      where: { restaurantId },
      include: { category: true },
    });

    const categoryStats: Record<string, { name: string; revenue: number; volume: number }> = {};
    const popularItems: { id: string; name: string; quantity: number; revenue: number; categoryId?: string }[] = [];

    let totalMenuVolume = 0;
    let totalMenuRevenue = 0;
    
    // map category info and calculate popular items array
    for (const [id, stats] of Object.entries(itemStats)) {
        const catalogItem = catalogItems.find(c => c.id === id);
        if (catalogItem) {
            stats.categoryId = catalogItem.categoryId;
            const catName = catalogItem.category?.name || 'Unknown';
            if (!categoryStats[catalogItem.categoryId]) {
                categoryStats[catalogItem.categoryId] = { name: catName, revenue: 0, volume: 0 };
            }
            categoryStats[catalogItem.categoryId].revenue += stats.revenue;
            categoryStats[catalogItem.categoryId].volume += stats.quantity;
        }
        
        totalMenuVolume += stats.quantity;
        totalMenuRevenue += stats.revenue;
        
        popularItems.push({ id, ...stats });
    }

    const avgVolume = popularItems.length ? totalMenuVolume / popularItems.length : 0;
    const avgRevenue = popularItems.length ? totalMenuRevenue / popularItems.length : 0;

    // Stars, Plowhorses, Dogs, Puzzles
    const categorizedItems = popularItems.map(item => {
        let type = 'Dog'; // Low volume, Low revenue
        if (item.quantity >= avgVolume && item.revenue >= avgRevenue) type = 'Star';
        else if (item.quantity >= avgVolume && item.revenue < avgRevenue) type = 'Plowhorse';
        else if (item.quantity < avgVolume && item.revenue >= avgRevenue) type = 'Puzzle';

        return { ...item, type };
    });

    return {
      popularItems: categorizedItems.sort((a, b) => b.quantity - a.quantity), // sort by quantity descending
      categoryPerformance: Object.entries(categoryStats).map(([id, stats]) => ({ id, ...stats })).sort((a, b) => b.revenue - a.revenue),
    };
  }

  async getCustomerInsights(restaurantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        status: { not: 'Cancelled' },
        createdAt: { gte: start, lte: end },
        customerId: { not: null }, // Only track known customers for insights
      },
      include: { customer: true },
    });

    const spenders: Record<string, { id: string, name: string; phone: string; totalSpent: number; orderCount: number }> = {};
    
    orders.forEach(order => {
        const cid = order.customerId;
        if (!cid) return;
        
        if (!spenders[cid]) {
            spenders[cid] = {
                id: cid,
                name: order.customer?.name || 'Unknown',
                phone: order.customer?.phone || '',
                totalSpent: 0,
                orderCount: 0,
            };
        }
        spenders[cid].totalSpent += order.total;
        spenders[cid].orderCount++;
    });

    const topSpenders = Object.values(spenders).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

    // New vs Returning in this period
    // Since we filtered timeframe, if orderCount == 1 maybe New? (Actually we should check if they ordered BEFORE start date).
    // Let's do a slightly heavier check for returning
    const allCustomerIds = Object.keys(spenders);
    const pastOrdersForTheseCustomers = await this.prisma.order.findMany({
        where: {
            restaurantId,
            customerId: { in: allCustomerIds },
            createdAt: { lt: start },
            status: { not: 'Cancelled' }
        },
        select: { customerId: true },
        distinct: ['customerId']
    });

    const returningCustomerIds = new Set(pastOrdersForTheseCustomers.map(o => o.customerId));
    
    let newCustomers = 0;
    let returningCustomers = 0;
    
    allCustomerIds.forEach(cid => {
        if (returningCustomerIds.has(cid)) returningCustomers++;
        else newCustomers++;
    });

    return {
        newCustomers,
        returningCustomers,
        topSpenders,
    };
  }
}
