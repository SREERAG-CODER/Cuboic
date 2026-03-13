import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { BASE_URL } from '../api/client';

type EventMap = Record<string, (...args: any[]) => void>;

export function useSocket(restaurantId: string | null | undefined, events?: EventMap) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!restaurantId) return;

        const socket = io(BASE_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join', { restaurantId });
        });

        if (events) {
            Object.entries(events).forEach(([event, handler]) => {
                socket.on(event, handler);
            });
        }

        return () => {
            if (events) {
                Object.keys(events).forEach(event => socket.off(event));
            }
            socket.disconnect();
            socketRef.current = null;
        };
    }, [restaurantId]);

    return socketRef;
}
