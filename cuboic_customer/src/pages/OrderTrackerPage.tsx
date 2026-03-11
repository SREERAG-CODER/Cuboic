import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, cancelOrder, type Order } from '../api/orders';
import { getRestaurant } from '../api/menu';
import { useSocket } from '../hooks/useSocket';
import { StatusTimeline } from '../components/StatusTimeline';
import { ConfirmCancelModal } from '../components/ConfirmCancelModal';
import './OrderTrackerPage.css';

const TERMINAL = new Set<Order['status']>(['Delivered', 'Cancelled']);

export function OrderTrackerPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [tableLabel, setTableLabel] = useState<string>('—');
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fetchOrder = useCallback(() => {
        if (!orderId) return;
        return getOrder(orderId)
            .then(data => {
                setOrder(data);
                setLastUpdated(new Date());

                // Robust table number resolution (FR-5 / Bugfix)
                let tNum: string | number | undefined = data.table?.table_number;
                if (!tNum && typeof data.tableId === 'object' && 'table_number' in data.tableId) {
                    tNum = data.tableId.table_number;
                }

                if (tNum) {
                    setTableLabel(String(tNum));
                } else if (data.restaurantId) {
                    const tid = typeof data.tableId === 'string' ? data.tableId : data.tableId.id;
                    getRestaurant(data.restaurantId)
                        .then(r => {
                            const t = r.tables?.find(tb => tb.id === tid);
                            setTableLabel(t ? String(t.table_number) : tid.slice(-4).toUpperCase());
                        })
                        .catch(() => setTableLabel(tid.slice(-4).toUpperCase()));
                } else {
                    const tid = typeof data.tableId === 'string' ? data.tableId : data.tableId.id;
                    setTableLabel(tid.slice(-4).toUpperCase());
                }
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

    // `tableLabel` manages the resolved state

    const isCancelled = order.status === 'Cancelled';
    const canCancel = ['Pending', 'Confirmed', 'Preparing'].includes(order.status);

    const handleCancel = async () => {
        if (!orderId) return;
        setCancelling(true);
        try {
            const updated = await cancelOrder(orderId);
            setOrder(updated);
            setCancelModalOpen(false);
        } catch (err) {
            console.error('Failed to cancel order:', err);
            // Optionally, we could show an error toast here. For now, just close.
            setCancelModalOpen(false);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="tracker-page fade-in">
            <header className="tracker-header">
                <div className="container">
                    <Link to={`/?r=${order.restaurantId}&t=${typeof order.tableId === 'string' ? order.tableId : order.tableId.id}`} className="tracker-back">← Menu</Link>
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
                    <p className="tracker-table">Table {tableLabel}</p>
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
                                <span className="order-item__price">₹{((item.unit_price ?? item.unitPrice ?? 0) * item.quantity).toFixed(2)}</span>
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

                {canCancel && (
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <button
                            className="btn btn-outline"
                            style={{ borderColor: 'var(--danger, #dc3545)', color: 'var(--danger, #dc3545)', width: '100%' }}
                            onClick={() => setCancelModalOpen(true)}
                        >
                            Cancel Order
                        </button>
                    </div>
                )}
            </main>

            <ConfirmCancelModal
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleCancel}
                loading={cancelling}
            />
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

