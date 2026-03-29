import api from './client';

export interface MenuItem {
    id: string;
    restaurantId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    is_available: boolean;
    display_order: number;
}

export interface Category {
    id: string;
    name: string;
    display_order: number;
}

export interface CreateMenuItemPayload {
    restaurantId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    is_available?: boolean;
    display_order?: number;
}

export interface UpdateMenuItemPayload {
    categoryId?: string;
    name?: string;
    description?: string;
    price?: number;
    image_url?: string;
    is_available?: boolean;
    display_order?: number;
}

export const menuApi = {
    /** Fetch ALL items (including unavailable) — admin only */
    getAll: (restaurantId: string) =>
        api.get<MenuItem[]>('/menu/admin', { params: { restaurantId } }).then(r => r.data),

    /** Fetch categories for this restaurant */
    getCategories: (restaurantId: string) =>
        api.get<Category[]>('/categories', { params: { restaurantId } }).then(r => r.data),

    /** Create a new menu item */
    createItem: (payload: CreateMenuItemPayload) =>
        api.post<MenuItem>('/menu', payload).then(r => r.data),

    /** Update an existing menu item */
    updateItem: (id: string, payload: UpdateMenuItemPayload) =>
        api.put<MenuItem>(`/menu/${id}`, payload).then(r => r.data),
};
