import { apiClient } from './client'

export const ordersApi = {
    findAll: (restaurant_id: string, status?: string) =>
        apiClient.get('/orders', { params: { restaurant_id, status } }),

    updateStatus: (id: string, status: string) =>
        apiClient.patch(`/orders/${id}/status`, { status }),
}
