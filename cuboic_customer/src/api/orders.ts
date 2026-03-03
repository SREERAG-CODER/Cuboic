import api from './client';

export interface OrderItem {
    item_id: string;
    quantity: number;
}

export interface PlaceOrderPayload {
    restaurant_id: string;
    table_id: string;
    customer_session_id: string;
    items: OrderItem[];
}

// Matches the backend Order schema exactly
export interface Order {
    _id: string;
    restaurant_id: string;
    table_id: string | { _id: string; table_number: number };
    /** Backend field name is `status` (not order_status) */
    status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Assigned' | 'Delivered' | 'Cancelled';
    items: Array<{
        name: string;
        quantity: number;
        unit_price: number;
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
