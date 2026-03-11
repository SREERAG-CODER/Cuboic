import { apiClient } from './client'

export interface CreateDeliveryStop {
    orderId: string
    tableId: string
    cabinets: string[]
    sequence: number
}

export interface CreateDeliveryDto {
    restaurantId: string
    robotId: string
    stops: CreateDeliveryStop[]
}

export const deliveriesApi = {
    findAll: (restaurantId: string) =>
        apiClient.get('/deliveries', { params: { restaurantId } }),

    findActive: (restaurantId: string) =>
        apiClient.get('/deliveries/active', { params: { restaurantId } }),

    create: (dto: CreateDeliveryDto) => apiClient.post('/deliveries', dto),

    confirmStop: (id: string, index: number) =>
        apiClient.patch(`/deliveries/${id}/stops/${index}/confirm`),
}
