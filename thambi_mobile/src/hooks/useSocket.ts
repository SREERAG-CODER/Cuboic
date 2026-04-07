import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { BASE_URL } from '../api/client';

type EventMap = Record<string, (...args: any[]) => void>;

export function useSocket(restaurantId: string | null | undefined, events?: EventMap) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!restaurantId) return;

        const socket = io(BASE_URL, {
            transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log(`[DEBUG] Socket connected: ${socket.id} for restaurant ${restaurantId}`);
            socket.emit('join', { restaurantId });
        });

        socket.on('disconnect', (reason) => {
            console.log(`[DEBUG] Socket disconnected: ${reason}`);
        });

        socket.on('connect_error', (error) => {
            console.error('[DEBUG] Socket connection error:', error);
        });

        if (events) {
            Object.entries(events).forEach(([event, handler]) => {
                const fullEventName = `${event}:${restaurantId}`;
                console.log(`[DEBUG] Registering socket listener: ${fullEventName}`);
                socket.on(fullEventName, handler);
            });
        }

        return () => {
            if (events) {
                Object.keys(events).forEach(event => socket.off(`${event}:${restaurantId}`));
            }
            socket.disconnect();
            socketRef.current = null;
        };
    }, [restaurantId]);

    return socketRef;
}
