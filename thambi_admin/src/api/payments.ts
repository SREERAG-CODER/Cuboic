import { apiClient } from './client'

export const paymentsApi = {
    findAll: (restaurantId: string, from?: string, to?: string) =>
        apiClient.get('/payments', { params: { restaurantId, from, to } }),

    getSummary: (restaurantId: string) =>
        apiClient.get('/payments/summary', { params: { restaurantId } }),
}
