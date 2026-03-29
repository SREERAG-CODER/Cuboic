import api from './client';

export interface User {
    id: string;
    name: string;
    user_id: string;
    role: string;
    is_active: boolean;
    restaurantId: string;
    createdAt: string;
}

export const usersApi = {
    findAll: (restaurantId: string) =>
        api.get<User[]>('/users', { params: { restaurantId } }).then(r => r.data),
    
    create: (data: any) =>
        api.post<User>('/users', data).then(r => r.data),
        
    update: (id: string, data: any) =>
        api.patch<User>(`/users/${id}`, data).then(r => r.data),
        
    remove: (id: string) =>
        api.delete<User>(`/users/${id}`).then(r => r.data),
};
