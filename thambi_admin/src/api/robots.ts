import { apiClient } from './client'

export const robotsApi = {
    findAll: (restaurantId: string) =>
        apiClient.get('/robots', { params: { restaurantId } }),

    findOne: (id: string) => apiClient.get(`/robots/${id}`),
}
