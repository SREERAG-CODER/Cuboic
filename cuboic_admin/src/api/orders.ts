import { apiClient } from './client'

export const ordersApi = {
    findAll: (restaurantId: string, status?: string) =>
        apiClient.get('/orders', { params: { restaurantId, status } }),

    updateStatus: (id: string, status: string) =>
        apiClient.patch(`/orders/${id}/status`, { status }),
}
