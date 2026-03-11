import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { BASE_URL } from '../api/client';

export function useSocket(restaurantId: string | null | undefined) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!restaurantId) return;

        const socket = io(BASE_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join', { restaurant_id: restaurantId });
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [restaurantId]);

    return socketRef;
}
