import api from './client';

export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    method: string;
    status: string;
    transactionid?: string;
    createdAt: string;
}

export interface PaymentSummary {
    order_count: number;
    total_revenue: number;
}

export interface PlatformFee {
    id: string;
    restaurantId: string;
    orderId: string;
    amount: number;
    isPaid: boolean;
    createdAt: string;
    order?: { id: string; total: number; createdAt: string };
}

export interface PlatformFeeSummary {
    totalOwed: number;
    totalPaid: number;
    unpaidCount: number;
}

export const paymentsApi = {
    findAll: (restaurantId: string, from?: string, to?: string) =>
        api.get<Payment[]>('/payments', {
            params: { restaurantId, from, to },
        }).then(r => r.data),

    getSummary: (restaurantId: string) =>
        api.get<PaymentSummary>('/payments/summary', { params: { restaurantId } }).then(r => r.data),
};

export const platformFeesApi = {
    findAll: (restaurantId: string) =>
        api.get<PlatformFee[]>('/platform-fees', { params: { restaurantId } }).then(r => r.data),

    getSummary: (restaurantId: string) =>
        api.get<PlatformFeeSummary>('/platform-fees/summary', { params: { restaurantId } }).then(r => r.data),

    markAsPaid: (feeId: string) =>
        api.patch<PlatformFee>(`/platform-fees/${feeId}/pay`).then(r => r.data),
};
