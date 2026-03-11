import { useState, useCallback, useEffect } from 'react';
import type { MenuItem } from '../api/menu';

export interface CartItem {
    item: MenuItem;
    quantity: number;
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('cuboic_cart');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('cuboic_cart', JSON.stringify(items));
    }, [items]);

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

    const total = items.reduce((sum, c) => sum + (Number(c.item.price) || 0) * (Number(c.quantity) || 1), 0);
    const count = items.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);

    return { items, add, remove, clear, total, count };
}
