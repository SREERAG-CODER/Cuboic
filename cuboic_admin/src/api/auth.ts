import { apiClient } from './client'

export interface LoginResponse {
    access_token: string
    user: {
        id: string
        name: string
        userid: string
        role: 'Staff' | 'Owner'
        restaurantId: string
    }
}

export const authApi = {
    login: (userId: string, password: string) =>
        apiClient.post<LoginResponse>('/auth/login', { userId, password }),

    me: () => apiClient.get('/auth/me'),
}
