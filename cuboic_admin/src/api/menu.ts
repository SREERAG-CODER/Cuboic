import { apiClient } from './client'

export interface AdminMenuItem {
    id: string
    restaurantId: string
    categoryId: string
    name: string
    description?: string
    price: number
    image_url?: string
    is_available: boolean
    display_order: number
}

export interface Category {
    id: string
    name: string
    display_order: number
}

export interface CreateMenuItemPayload {
    restaurantId: string
    categoryId: string
    name: string
    description?: string
    price: number
    image_url?: string
    is_available?: boolean
    display_order?: number
}

export interface UpdateMenuItemPayload {
    categoryId?: string
    name?: string
    description?: string
    price?: number
    image_url?: string
    is_available?: boolean
    display_order?: number
}

export const menuApi = {
    /** Fetch ALL items (including unavailable) — admin only */
    getAll: (restaurantId: string) =>
        apiClient.get<AdminMenuItem[]>('/menu/admin', { params: { restaurantId: restaurantId } }),

    /** Fetch categories for this restaurant */
    getCategories: (restaurantId: string) =>
        apiClient.get<Category[]>('/categories', { params: { restaurantId: restaurantId } }),

    /** Create a new menu item */
    createItem: (payload: CreateMenuItemPayload) =>
        apiClient.post<AdminMenuItem>('/menu', payload),

    /** Update an existing menu item */
    updateItem: (id: string, payload: UpdateMenuItemPayload) =>
        apiClient.put<AdminMenuItem>(`/menu/${id}`, payload),
}
