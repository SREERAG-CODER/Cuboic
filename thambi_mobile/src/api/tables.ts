import api from './client';

export interface RestaurantTable {
    id: string;
    table_number: string;
    is_active: boolean;
    restaurantId: string;
}

export const tablesApi = {
    findAll: (restaurantId: string) =>
        api.get<RestaurantTable[]>(`/restaurants/${restaurantId}/tables`).then(r => r.data),
    
    create: (data: { restaurantId: string; table_number: string }) =>
        api.post<RestaurantTable>('/tables', data).then(r => r.data),
        
    updateStatus: (id: string, is_active: boolean) =>
        api.patch<RestaurantTable>(`/tables/${id}`, { is_active }).then(r => r.data),
};
