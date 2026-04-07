import api from './client';

export interface DeliveryStop {
    orderId: string;
    tableId: string;
    cabinets: string[];
    status: string;
    sequence: number;
    delivered_at?: string;
}

export interface Delivery {
    id: string;
    robotId: string;
    stops: DeliveryStop[];
    status: string;
    createdAt: string;
}

export interface Robot {
    id: string;
    name: string;
    status: 'Idle' | 'Delivering' | 'Charging' | 'Error';
    isOnline: boolean;
    battery: number;
    location: { x: number; y: number };
    cabinets: Array<{ id: string; status: 'Free' | 'Occupied' }>;
    mode: string;
}

export interface CreateDeliveryStop {
    orderId: string;
    tableId: string;
    cabinets: string[];
    sequence: number;
}

export interface CreateDeliveryPayload {
    restaurantId: string;
    robotId: string;
    stops: CreateDeliveryStop[];
}

export const deliveriesApi = {
    findAll: (restaurantId: string) =>
        api.get<Delivery[]>('/deliveries', { params: { restaurantId } }).then(r => r.data),

    findActive: (restaurantId: string) =>
        api.get<Delivery[]>('/deliveries/active', { params: { restaurantId } }).then(r => r.data),

    create: (payload: CreateDeliveryPayload) =>
        api.post<Delivery>('/deliveries', payload).then(r => r.data),

    confirmStop: (deliveryId: string, stopIndex: number) =>
        api.patch<Delivery>(`/deliveries/${deliveryId}/stops/${stopIndex}/confirm`).then(r => r.data),
};

export const robotsApi = {
    findAll: (restaurantId: string) =>
        api.get<Robot[]>('/robots', { params: { restaurantId } }).then(r => r.data),

    findOne: (id: string) =>
        api.get<Robot>(`/robots/${id}`).then(r => r.data),
};
