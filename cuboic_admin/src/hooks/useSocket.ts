import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3000'

let sharedSocket: Socket | null = null

export function useSocket(restaurantId: string | undefined, handlers: Record<string, (data: unknown) => void>) {
    const handlersRef = useRef(handlers)
    handlersRef.current = handlers

    useEffect(() => {
        if (!restaurantId) return

        if (!sharedSocket || !sharedSocket.connected) {
            sharedSocket = io(SOCKET_URL, { transports: ['websocket'] })
        }

        const socket = sharedSocket

        const eventNames = Object.keys(handlersRef.current)
        const scopedHandlers: Record<string, (data: unknown) => void> = {}

        for (const event of eventNames) {
            const scopedEvent = `${event}:${restaurantId}`
            scopedHandlers[scopedEvent] = (data: unknown) => {
                handlersRef.current[event]?.(data)
            }
            socket.on(scopedEvent, scopedHandlers[scopedEvent])
        }

        return () => {
            for (const scopedEvent of Object.keys(scopedHandlers)) {
                socket.off(scopedEvent, scopedHandlers[scopedEvent])
            }
        }
    }, [restaurantId])
}
