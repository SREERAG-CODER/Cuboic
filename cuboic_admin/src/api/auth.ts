import { apiClient } from './client'

export interface LoginResponse {
    access_token: string
    user: {
        id: string
        name: string
        user_id: string
        role: 'Staff' | 'Owner'
        restaurant_id: string
    }
}

export const authApi = {
    login: (user_id: string, password: string) =>
        apiClient.post<LoginResponse>('/auth/login', { user_id, password }),

    me: () => apiClient.get('/auth/me'),
}
