import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'https://cuboic.onrender.com';

export function useSocket(restaurantId: string | null) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!restaurantId) return;

        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join', { restaurantId: restaurantId });
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [restaurantId]);

    return socketRef;
}
