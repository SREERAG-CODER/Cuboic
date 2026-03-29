import { type Customer } from '../api/customers';

const STORAGE_KEY = 'cuboic_customer';
const SESSION_TTL = 60 * 60 * 1000; // 1 hour in ms

export function getCustomer(): Customer | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const data = JSON.parse(stored);
        
        // Check expiration
        if (data.expiresAt && Date.now() > data.expiresAt) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return data.customer as Customer;
    } catch {
        // If JSON fails or old format, return legacy raw object, but wrap it for next time
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const legacyCustomer = JSON.parse(raw);
                if (legacyCustomer && typeof legacyCustomer === 'object' && !('expiresAt' in legacyCustomer)) {
                    // It's a legacy plain customer object, upgrade it.
                    setCustomer(legacyCustomer);
                    return legacyCustomer;
                }
            }
        } catch { /* ignore */ }
        return null;
    }
}

export function setCustomer(customer: Customer) {
    const data = {
        customer,
        expiresAt: Date.now() + SESSION_TTL
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearCustomer() {
    localStorage.removeItem(STORAGE_KEY);
}
