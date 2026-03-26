"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRevenueTrends(restaurantId, startDate, endDate, timeframe = 'daily') {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
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
        const peakHoursCount = new Array(24).fill(0);
        orders.forEach(order => {
            peakHoursCount[order.createdAt.getHours()]++;
        });
        const trends = [];
        const grouped = orders.reduce((acc, order) => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            if (!acc[dateStr])
                acc[dateStr] = { revenue: 0, volume: 0 };
            acc[dateStr].revenue += order.total;
            acc[dateStr].volume += 1;
            return acc;
        }, {});
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
    async getMenuAnalytics(restaurantId, startDate, endDate) {
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
        const itemStats = {};
        orders.forEach(order => {
            const items = order.items;
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
        const catalogItems = await this.prisma.menuItem.findMany({
            where: { restaurantId },
            include: { category: true },
        });
        const categoryStats = {};
        const popularItems = [];
        let totalMenuVolume = 0;
        let totalMenuRevenue = 0;
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
        const categorizedItems = popularItems.map(item => {
            let type = 'Dog';
            if (item.quantity >= avgVolume && item.revenue >= avgRevenue)
                type = 'Star';
            else if (item.quantity >= avgVolume && item.revenue < avgRevenue)
                type = 'Plowhorse';
            else if (item.quantity < avgVolume && item.revenue >= avgRevenue)
                type = 'Puzzle';
            return { ...item, type };
        });
        return {
            popularItems: categorizedItems.sort((a, b) => b.quantity - a.quantity),
            categoryPerformance: Object.entries(categoryStats).map(([id, stats]) => ({ id, ...stats })).sort((a, b) => b.revenue - a.revenue),
        };
    }
    async getCustomerInsights(restaurantId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const orders = await this.prisma.order.findMany({
            where: {
                restaurantId,
                status: { not: 'Cancelled' },
                createdAt: { gte: start, lte: end },
                customerId: { not: null },
            },
            include: { customer: true },
        });
        const spenders = {};
        orders.forEach(order => {
            const cid = order.customerId;
            if (!cid)
                return;
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
            if (returningCustomerIds.has(cid))
                returningCustomers++;
            else
                newCustomers++;
        });
        return {
            newCustomers,
            returningCustomers,
            topSpenders,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map