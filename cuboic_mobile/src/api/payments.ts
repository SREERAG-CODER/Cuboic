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

export const paymentsApi = {
    findAll: (restaurantId: string, from?: string, to?: string) =>
        api.get<Payment[]>('/payments', {
            params: { restaurantId, from, to },
        }).then(r => r.data),

    getSummary: (restaurantId: string) =>
        api.get<PaymentSummary>('/payments/summary', { params: { restaurantId } }).then(r => r.data),
};
