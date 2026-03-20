import api from './client';

export interface Customer {
    id: string;
    phone: string;
    name: string;
}

export const customersApi = {
    verifyFirebaseToken: (idToken: string) =>
        api.post<{ verified: boolean; customer: Customer | null }>('/customers/verify-firebase-token', { idToken }).then(r => r.data),
    register: (phone: string, name: string) =>
        api.post<Customer>('/customers/register', { phone, name }).then(r => r.data),
};
