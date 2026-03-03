import { apiClient } from './client'

export interface CreateDeliveryStop {
    order_id: string
    table_id: string
    cabinets: string[]
    sequence: number
}

export interface CreateDeliveryDto {
    restaurant_id: string
    robot_id: string
    stops: CreateDeliveryStop[]
}

export const deliveriesApi = {
    findAll: (restaurant_id: string) =>
        apiClient.get('/deliveries', { params: { restaurant_id } }),

    findActive: (restaurant_id: string) =>
        apiClient.get('/deliveries/active', { params: { restaurant_id } }),

    create: (dto: CreateDeliveryDto) => apiClient.post('/deliveries', dto),

    confirmStop: (id: string, index: number) =>
        apiClient.patch(`/deliveries/${id}/stops/${index}/confirm`),
}
