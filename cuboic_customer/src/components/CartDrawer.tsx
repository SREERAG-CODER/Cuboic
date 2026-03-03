import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../hooks/useCart';
import './CartDrawer.css';

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
    items: CartItem[];
    total: number;
    restaurantId: string;
    tableId: string;
    sessionId: string;
    onAdd: (item: any) => void;
    onRemove: (itemId: string) => void;
    onClear: () => void;
}

export function CartDrawer({
    open,
    onClose,
    items,
    total,
    restaurantId,
    tableId,
    sessionId,
    onAdd,
    onRemove,
}: CartDrawerProps) {
    const navigate = useNavigate();

    if (!open) return null;

    const taxAmount = total * 0.05;
    const grandTotal = total + taxAmount;

    const handleCheckout = () => {
        if (items.length === 0) return;
        onClose();
        navigate('/checkout', {
            state: { items, total, restaurantId, tableId, sessionId },
        });
    };

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />

            <div className="cart-sheet" role="dialog" aria-label="Your cart">
                <div className="cart-sheet__handle" />

                {/* Header */}
                <div className="cart-sheet__header">
                    <h2 className="cart-sheet__title">Your Order 🛒</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {tableId && (
                            <div className="cart-sheet__table">
                                🪑 Table {tableId.slice(-3).toUpperCase()}
                            </div>
                        )}
                        <button className="cart-close" onClick={onClose} aria-label="Close">✕</button>
                    </div>
                </div>

                {/* Body */}
                <div className="cart-sheet__body">
                    {items.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty__icon">🍽️</div>
                            <p>Your order is empty</p>
                            <p className="cart-empty__sub">Tap + on any item to add it</p>
                        </div>
                    ) : (
                        items.map(c => (
                            <div key={c.item._id} className="cart-row fade-in">
                                <div className="cart-row__info">
                                    <p className="cart-row__name">{c.item.name}</p>
                                    <p className="cart-row__price">₹{(c.item.price * c.quantity).toFixed(2)}</p>
                                </div>
                                <div className="qty-control">
                                    <button className="qty-btn" onClick={() => onRemove(c.item._id)}>−</button>
                                    <span className="qty-value">{c.quantity}</span>
                                    <button className="qty-btn" onClick={() => onAdd(c.item)}>+</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="cart-sheet__footer">
                        <div className="cart-totals">
                            <div className="cart-line">
                                <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
                            </div>
                            <div className="cart-line">
                                <span>GST (5%)</span><span>₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="cart-line cart-line--grand">
                                <span>Total</span><span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <button className="cart-cta" onClick={handleCheckout}>
                            <span>Proceed to Payment</span>
                            <span className="cart-cta__total">₹{grandTotal.toFixed(2)} →</span>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
