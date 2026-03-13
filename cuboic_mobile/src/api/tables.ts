import api from './client';

export interface RestaurantTable {
    id: string;
    table_number: string;
    is_active: boolean;
    restaurantId: string;
}

export const tablesApi = {
    findAll: (restaurantId: string) =>
        api.get<any>(`/restaurants/${restaurantId}`).then(r => (r.data?.tables || []) as RestaurantTable[]),
};
