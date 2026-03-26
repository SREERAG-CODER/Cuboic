import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getRevenueTrends(restaurantId: string, startDate?: string, endDate?: string, timeframe?: 'daily' | 'weekly' | 'monthly'): Promise<{
        totalRevenue: number;
        orderVolume: number;
        averageOrderValue: number;
        trends: {
            date: string;
            revenue: number;
            volume: number;
        }[];
        peakHours: {
            hour: number;
            count: any;
        }[];
    }>;
    getMenuAnalytics(restaurantId: string, startDate?: string, endDate?: string): Promise<{
        popularItems: {
            type: string;
            id: string;
            name: string;
            quantity: number;
            revenue: number;
            categoryId?: string;
        }[];
        categoryPerformance: {
            name: string;
            revenue: number;
            volume: number;
            id: string;
        }[];
    }>;
    getCustomerInsights(restaurantId: string, startDate?: string, endDate?: string): Promise<{
        newCustomers: number;
        returningCustomers: number;
        topSpenders: {
            id: string;
            name: string;
            phone: string;
            totalSpent: number;
            orderCount: number;
        }[];
    }>;
}
