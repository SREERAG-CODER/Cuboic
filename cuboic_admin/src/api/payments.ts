import { apiClient } from './client'

export const paymentsApi = {
    findAll: (restaurant_id: string, from?: string, to?: string) =>
        apiClient.get('/payments', { params: { restaurant_id, from, to } }),

    getSummary: (restaurant_id: string) =>
        apiClient.get('/payments/summary', { params: { restaurant_id } }),
}
