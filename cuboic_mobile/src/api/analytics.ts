import api from './client';

export interface RevenueTrends {
  totalRevenue: number;
  orderVolume: number;
  averageOrderValue: number;
  trends: { date: string; revenue: number; volume: number }[];
  peakHours: { hour: number; count: number }[];
}

export interface PopularItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  categoryId?: string;
  type: 'Star' | 'Plowhorse' | 'Dog' | 'Puzzle';
}

export interface CategoryPerformance {
  id: string;
  name: string;
  revenue: number;
  volume: number;
}

export interface MenuAnalytics {
  popularItems: PopularItem[];
  categoryPerformance: CategoryPerformance[];
}

export interface CustomerInsights {
  newCustomers: number;
  returningCustomers: number;
  topSpenders: { id: string; name: string; phone: string; totalSpent: number; orderCount: number }[];
}

export const analyticsApi = {
  getRevenueTrends: (restaurantId: string, startDate?: string, endDate?: string, timeframe?: string) =>
    api.get<RevenueTrends>(`/analytics/${restaurantId}/revenue`, { params: { startDate, endDate, timeframe } }).then(r => r.data),

  getMenuAnalytics: (restaurantId: string, startDate?: string, endDate?: string) =>
    api.get<MenuAnalytics>(`/analytics/${restaurantId}/menu`, { params: { startDate, endDate } }).then(r => r.data),

  getCustomerInsights: (restaurantId: string, startDate?: string, endDate?: string) =>
    api.get<CustomerInsights>(`/analytics/${restaurantId}/customers`, { params: { startDate, endDate } }).then(r => r.data),
};
