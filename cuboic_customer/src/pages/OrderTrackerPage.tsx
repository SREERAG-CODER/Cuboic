import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, type Order } from '../api/orders';
import { useSocket } from '../hooks/useSocket';
import { StatusTimeline } from '../components/StatusTimeline';
import './OrderTrackerPage.css';

const TERMINAL = new Set<Order['status']>(['Delivered', 'Cancelled']);

export function OrderTrackerPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchOrder = useCallback(() => {
        if (!orderId) return;
        return getOrder(orderId)
            .then(data => {
                setOrder(data);
                setLastUpdated(new Date());
            })
            .catch(() => setError('Order not found.'))
            .finally(() => setLoading(false));
    }, [orderId]);

    // Initial fetch
    useEffect(() => { fetchOrder(); }, [fetchOrder]);

    // 10-second polling — stops when order reaches terminal state
    useEffect(() => {
        if (!orderId) return;
        if (order && TERMINAL.has(order.status)) return; // no more polling needed

        const interval = setInterval(() => {
            fetchOrder();
        }, 10_000);

        return () => clearInterval(interval);
    }, [orderId, order?.status, fetchOrder]);

    // Real-time updates via WebSocket — still active for instant pushes
    const socketRef = useSocket(order?.restaurantId?.toString() ?? null);
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !orderId) return;

        const handler = (data: { id: string; status: Order['status'] }) => {
            if (data.id === orderId || data.id?.toString() === orderId) {
                setOrder(prev => prev ? { ...prev, status: data.status } : prev);
                setLastUpdated(new Date());
            }
        };
        socket.on('order:updated', handler);
        return () => { socket.off('order:updated', handler); };
    }, [socketRef, orderId, order?.restaurantId]);

    if (loading) return <div className="tracker-page"><div className="spinner-center"><div className="spinner" /></div></div>;
    if (error || !order) return (
        <div className="tracker-page tracker-error">
            <p>{error || 'Something went wrong'}</p>
            <Link to="/" className="btn btn-ghost">Go back</Link>
        </div>
    );

    const tableNumber = typeof order.tableId === 'object'
        ? (order.tableId as { table_number: number }).table_number
        : '—';

    const isCancelled = order.status === 'Cancelled';

    return (
        <div className="tracker-page fade-in">
            <header className="tracker-header">
                <div className="container">
                    <Link to="/" className="tracker-back">← Menu</Link>
                    <p className="tracker-brand">Cuboic</p>
                    {lastUpdated && (
                        <span className="tracker-updated">
                            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                </div>
            </header>

            <main className="container tracker-body">
                {/* Status hero */}
                <div className="tracker-hero card">
                    <div className="tracker-hero__status-label">
                        {isCancelled
                            ? 'Order Cancelled'
                            : order.status === 'Delivered'
                                ? 'Enjoy your meal!'
                                : 'Tracking your order…'}
                    </div>
                    <h1 className="tracker-hero__status">{getStatusMessage(order.status)}</h1>
                    <p className="tracker-table">Table {tableNumber}</p>
                </div>

                {/* Timeline — hidden for Cancelled */}
                {!isCancelled && (
                    <section className="tracker-section card">
                        <h2 className="tracker-section__title">Order Progress</h2>
                        <StatusTimeline status={order.status} />
                    </section>
                )}

                {/* Order summary */}
                <section className="tracker-section card">
                    <h2 className="tracker-section__title">Order Summary</h2>
                    <div className="order-items">
                        {order.items.map((item, i) => (
                            <div key={i} className="order-item">
                                <span className="order-item__name">{item.quantity}× {item.name}</span>
                                <span className="order-item__price">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <hr className="divider" />
                    <div className="order-totals">
                        <div className="order-total-row"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
                        <div className="order-total-row"><span>Tax (5%)</span><span>₹{order.tax.toFixed(2)}</span></div>
                        <div className="order-total-row order-total-row--grand">
                            <span>Total</span><span>₹{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                <p className="tracker-note">Order ID: <code>{order.id}</code></p>
            </main>
        </div>
    );
}

function getStatusMessage(status: Order['status']): string {
    const map: Record<Order['status'], string> = {
        Pending: 'Order Received',
        Confirmed: 'Order Confirmed',
        Preparing: 'Being Prepared',
        Ready: 'Ready to Serve',
        Assigned: 'Robot on the Way',
        Delivered: 'Delivered!',
        Cancelled: 'Order Cancelled',
    };
    return map[status] ?? status;
}

