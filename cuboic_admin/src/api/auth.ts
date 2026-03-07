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
    login: (userid: string, password: string) =>
        apiClient.post<LoginResponse>('/auth/login', { userid, password }),

    me: () => apiClient.get('/auth/me'),
}
