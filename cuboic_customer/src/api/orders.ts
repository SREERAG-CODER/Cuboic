import api from './client';

export interface OrderItem {
    itemId: string;
    quantity: number;
}

export interface PlaceOrderPayload {
    restaurantId: string;
    tableId: string;
    customerId?: string;
    customerSessionId: string;
    notes?: string;
    items: OrderItem[];
}

// Matches the backend Order schema exactly
export interface Order {
    id: string;
    restaurantId: string;
    tableId: string | { id: string; table_number: number };
    table?: { id: string; table_number: number };
    /** Backend field name is `status` (not order_status) */
    status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Assigned' | 'Delivered' | 'Cancelled';
    notes?: string;
    items: Array<{
        name: string;
        quantity: number;
        unit_price?: number;
        unitPrice?: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    createdAt: string;
}

export const placeOrder = (payload: PlaceOrderPayload) =>
    api.post<Order>('/orders', payload).then(r => r.data);

export const getOrder = (id: string) =>
    api.get<Order>(`/orders/${id}`).then(r => r.data);

export const updateOrderTable = (id: string, tableId: string) =>
    api.patch<Order>(`/orders/${id}/table`, { tableId }).then(r => r.data);

export const cancelOrder = (id: string) =>
    api.patch<Order>(`/orders/${id}/cancel`).then(r => r.data);
