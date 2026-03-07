import { useState, useCallback } from 'react';
import type { MenuItem } from '../api/menu';

export interface CartItem {
    item: MenuItem;
    quantity: number;
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([]);

    const add = useCallback((item: MenuItem) => {
        setItems(prev => {
            const existing = prev.find(c => c.item.id === item.id);
            if (existing) {
                return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { item, quantity: 1 }];
        });
    }, []);

    const remove = useCallback((itemId: string) => {
        setItems(prev => {
            const existing = prev.find(c => c.item.id === itemId);
            if (!existing) return prev;
            if (existing.quantity === 1) return prev.filter(c => c.item.id !== itemId);
            return prev.map(c => c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
        });
    }, []);

    const clear = useCallback(() => setItems([]), []);

    const total = items.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
    const count = items.reduce((sum, c) => sum + c.quantity, 0);

    return { items, add, remove, clear, total, count };
}
