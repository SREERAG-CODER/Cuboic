import { Link } from 'react-router-dom';
import './CartDrawer.css'; // Reusing established bottom sheet styles

export interface ActiveOrderSession {
    id: string;
    time: number;
    total: number;
    itemCount: number;
}

interface OrdersDrawerProps {
    open: boolean;
    onClose: () => void;
    orders: ActiveOrderSession[];
    restaurantId: string;
    tableId: string;
}

export function OrdersDrawer({
    open,
    onClose,
    orders,
}: OrdersDrawerProps) {
    if (!open) return null;

    // Sort newest orders first
    const sortedOrders = [...orders].sort((a, b) => b.time - a.time);

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />

            <div className="cart-sheet" role="dialog" aria-label="Your active orders">
                <div className="cart-sheet__handle" />

                {/* Header */}
                <div className="cart-sheet__header">
                    <h2 className="cart-sheet__title">Active Orders</h2>
                    <button className="cart-close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Body */}
                <div className="cart-sheet__body">
                    {sortedOrders.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty__icon" style={{ marginBottom: '8px' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <p>No active orders</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 24px' }}>
                            {sortedOrders.map((order, index) => {
                                const localTime = new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <Link key={order.id} to={`/order/${order.id}`} className="bento-tile" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1rem', marginBottom: '4px' }}>
                                                Order #{orders.length - index}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                                                {localTime} • {order.itemCount} items
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1rem' }}>₹{order.total.toFixed(2)}</span>
                                            <span style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>→</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
