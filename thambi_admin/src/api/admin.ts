import client from './client';

export const adminApi = {
    getStats: () => client.get('/admin/stats'),
    getRestaurants: () => client.get('/admin/restaurants'),
    getRobots: () => client.get('/admin/robots'),
    getAlerts: (limit = 50) => client.get(`/admin/alerts?limit=${limit}`),
    resolveAlert: (id: string) => client.patch(`/admin/alerts/${id}/resolve`),
};
