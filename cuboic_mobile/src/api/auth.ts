import api from './client';

export interface LoginPayload {
    userId: string;
    password: string;
}

export interface AuthUser {
    id: string;
    name: string;
    userid: string;
    role: 'Owner' | 'Staff' | 'Admin';
    restaurantId: string;
    // legacy alias used in some screens
    restaurant_id: string;
}

export interface LoginResponse {
    access_token: string;
    user: AuthUser;
}

export const login = (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then(r => {
        // Normalize field: backend returns restaurantId
        const user = r.data.user;
        // Ensure both aliases exist
        user.restaurant_id = user.restaurantId ?? user.restaurant_id;
        return r.data;
    });

export const changePassword = (payload: any) =>
    api.patch('/auth/change-password', payload).then(r => r.data);
