import api from './client';

export type OrderStatus =
    | 'Pending'
    | 'Confirmed'
    | 'Preparing'
    | 'Ready'
    | 'Assigned'
    | 'Delivered'
    | 'Cancelled';

export interface OrderItem {
    name: string;
    quantity: number;
    unit_price: number;
}

export interface OrderTable {
    id: string;
    table_number: string;
    status?: string;
}

export interface Order {
    id: string;
    tableId: string;
    table?: OrderTable | null;
    status: OrderStatus;
    items: OrderItem[];
    notes?: string;
    total: number;
    createdAt: string;
}

export interface OrderSummary {
    pending: number;
    preparing: number;
    completed: number;
}

export const ordersApi = {
    findAll: (restaurantId: string, status?: string) =>
        api.get<Order[]>('/orders', {
            params: { restaurantId, ...(status && status !== 'All' ? { status } : {}) },
        }).then(r => r.data),

    findById: (id: string) =>
        api.get<Order>(`/orders/${id}`).then(r => r.data),

    getSummary: (restaurantId: string) =>
        api.get<OrderSummary>('/orders/summary', { params: { restaurantId } }).then(r => r.data),

    updateStatus: (id: string, status: string) =>
        api.patch<Order>(`/orders/${id}/status`, { status }).then(r => r.data),
};
