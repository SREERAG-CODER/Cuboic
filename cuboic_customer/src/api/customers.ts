import api from './client';

export interface Customer {
    id: string;
    phone: string;
    name: string;
}

export const customersApi = {
    lookup: (phone: string) =>
        api.get<{ customer: Customer | null; phone: string }>('/customers/lookup', { params: { phone } }).then(r => r.data),
    register: (phone: string, name: string) =>
        api.post<Customer>('/customers/register', { phone, name }).then(r => r.data),
};
