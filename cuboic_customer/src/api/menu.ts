import api from './client';

export interface Category {
    id: string;
    name: string;
    display_order: number;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    image_url?: string;
    is_available: boolean;
}

export interface Restaurant {
    id: string;
    name: string;
    slug: string;
    settings?: { tax_percentage: number };
}

export const getRestaurant = (id: string) =>
    api.get<Restaurant>(`/restaurants/${id}`).then(r => r.data);

export const getCategories = (restaurantId: string) =>
    api.get<Category[]>('/categories', { params: { restaurantId: restaurantId } }).then(r => r.data);

export const getMenuItems = (restaurantId: string, categoryId?: string) =>
    api
        .get<MenuItem[]>('/menu', {
            params: { restaurantId: restaurantId, ...(categoryId ? { categoryId: categoryId } : {}) },
        })
        .then(r => r.data);
