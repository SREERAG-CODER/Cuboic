import { useEffect, useState } from 'react'

export interface ToastMessage {
    id: string
    title: string
    message: string
    type: 'success' | 'info' | 'warning'
}

let toastListeners: Array<(t: ToastMessage) => void> = []

export function showToast(title: string, message: string, type: ToastMessage['type'] = 'info') {
    const toast: ToastMessage = { id: `${Date.now()}`, title, message, type }
    toastListeners.forEach((fn) => fn(toast))
}

export default function Toast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    useEffect(() => {
        const handler = (t: ToastMessage) => {
            setToasts((prev) => [...prev, t])
            setTimeout(() => {
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }, 4000)
        }
        toastListeners.push(handler)
        return () => {
            toastListeners = toastListeners.filter((fn) => fn !== handler)
        }
    }, [])

    return (
        <div className="toast-stack">
            {toasts.map((t) => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <strong>{t.title}</strong>
                    <p>{t.message}</p>
                </div>
            ))}
        </div>
    )
}
