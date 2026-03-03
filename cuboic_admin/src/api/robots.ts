import { apiClient } from './client'

export const robotsApi = {
    findAll: (restaurant_id: string) =>
        apiClient.get('/robots', { params: { restaurant_id } }),

    findOne: (id: string) => apiClient.get(`/robots/${id}`),
}
