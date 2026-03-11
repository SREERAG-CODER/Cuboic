import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { placeOrder } from '../api/orders';
import type { CartItem } from '../hooks/useCart';
import './CheckoutPage.css';

type PaymentMethod = 'Card' | 'UPI' | 'Cash';

interface LocationState {
    items: CartItem[];
    total: number;
    restaurantId: string;
    tableId: string;
    tableLabel?: string;
    sessionId: string;
}

// Stable per-session UUID
const SESSION_ID = crypto.randomUUID();

export function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState | null;

    const [method, setMethod] = useState<PaymentMethod>('UPI');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    // Guard — if no cart state, redirect back to menu
    if (!state || !state.items?.length) {
        return (
            <div className="checkout-page">
                <div className="checkout-empty">
                    <p>Your cart is empty.</p>
                    <Link to="/" className="btn btn-primary">← Back to Menu</Link>
                </div>
            </div>
        );
    }

    const { items, total, restaurantId, tableId, tableLabel, sessionId } = state;
    const taxAmount = total * 0.05;
    const grandTotal = total + taxAmount;

    const handlePay = async () => {
        if (method === 'Card') {
            if (!cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
                setError('Please fill in all card details.');
                return;
            }
        }
        setError('');
        setProcessing(true);

        try {
            // Simulate payment gateway processing (FR-4: payment before order creation)
            await new Promise<void>(resolve => setTimeout(resolve, 1500));

            // Payment "succeeded" — now create the order
            const order = await placeOrder({
                restaurantId: restaurantId,
                tableId: tableId,
                customerSessionId: sessionId ?? SESSION_ID,
                notes: notes.trim() || undefined,
                items: items.map(c => ({ itemId: c.item.id, quantity: c.quantity })),
            });

            localStorage.removeItem('cuboic_cart');

            // Save order history array
            try {
                const stored = localStorage.getItem('cuboic_active_orders');
                const prevOrders = stored ? JSON.parse(stored) : [];
                const newOrderSession = {
                    id: order.id,
                    time: Date.now(),
                    total: grandTotal,
                    itemCount: items.reduce((sum, c) => sum + c.quantity, 0)
                };
                localStorage.setItem('cuboic_active_orders', JSON.stringify([...prevOrders, newOrderSession]));
            } catch (err) {
                console.error('Failed to log active order', err);
            }

            navigate(`/order/${order.id}`, { replace: true });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? 'Failed to place order. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <div className="checkout-page fade-in">
            <header className="checkout-header">
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link to={`/?r=${restaurantId}&t=${tableId}`} className="checkout-back">← Menu</Link>
                        {tableLabel && <div className="table-tag" style={{ margin: 0, padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', background: 'var(--surface2)', color: 'var(--text-muted)', fontWeight: 600 }}>{tableLabel}</div>}
                    </div>
                    <p className="checkout-brand">Cuboic</p>
                </div>
            </header>

            <main className="container checkout-bento">
                {/* ── Order Summary Tile (Large) ── */}
                <section className="bento-tile bento-tile--main fade-up">
                    <h2 className="bento-title">Your Order</h2>

                    <div className="bento-items-grid">
                        {items.map(c => (
                            <div key={c.item.id} className="bento-item">
                                <img src={c.item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={c.item.name} className="bento-item-img" />
                                <div className="bento-item-info">
                                    <div className="bento-item-name">
                                        {c.item.name} <span className="bento-item-qty-inline">x{c.quantity}</span>
                                    </div>
                                </div>
                                <div className="bento-item-price">₹{((Number(c.item.price) || 0) * (Number(c.quantity) || 1)).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Totals Tile ── */}
                <section className="bento-tile bento-totals fade-up" style={{ animationDelay: '0.1s' }}>
                    <div className="co-total-row"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
                    <div className="co-total-row"><span>Tax (5%)</span><span>₹{taxAmount.toFixed(2)}</span></div>
                    <hr className="divider" style={{ margin: '12px 0' }} />
                    <div className="co-total-row co-total-grand"><span>Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
                </section>

                {/* ── Special Instructions Tile ── */}
                <section className="bento-tile bento-notes fade-up" style={{ animationDelay: '0.15s' }}>
                    <h2 className="bento-title">Special Instructions (Optional)</h2>
                    <textarea 
                        className="checkout-notes-input"
                        placeholder="e.g. Make it spicy, no onions, etc."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        maxLength={250}
                        rows={3}
                    />
                </section>

                {/* ── Payment Method Tile ── */}
                <section className="bento-tile bento-payment fade-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="bento-title">Payment Method</h2>

                    <div className="co-methods">
                        {(['Card', 'UPI', 'Cash'] as PaymentMethod[]).map(m => (
                            <button
                                key={m}
                                className={`co-method-btn ${method === m ? 'co-method-btn--active' : ''}`}
                                onClick={() => setMethod(m)}
                            >
                                <span className="co-method-icon">
                                    {m === 'Card' ? '💳' : m === 'UPI' ? '📱' : '💵'}
                                </span>
                                <span>{m}</span>
                            </button>
                        ))}
                    </div>

                    {/* Card fields */}
                    {method === 'Card' && (
                        <div className="co-card-fields fade-in">
                            <div className="co-field">
                                <label>Card Number</label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    value={cardNumber}
                                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                />
                            </div>
                            <div className="co-field-row">
                                <div className="co-field">
                                    <label>Expiry</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        value={expiry}
                                        onChange={e => setExpiry(e.target.value)}
                                    />
                                </div>
                                <div className="co-field">
                                    <label>CVV</label>
                                    <input
                                        type="password"
                                        placeholder="•••"
                                        maxLength={4}
                                        value={cvv}
                                        onChange={e => setCvv(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {method === 'UPI' && (
                        <p className="co-method-hint fade-in">
                            Redirecting to your UPI app soon.
                        </p>
                    )}

                    {method === 'Cash' && (
                        <p className="co-method-hint fade-in">
                            Please pay at the end of your meal.
                        </p>
                    )}
                </section>

                {/* ── Checkout Action Tile ── */}
                <section className="bento-action fade-up" style={{ animationDelay: '0.3s' }}>
                    {error && <div className="co-error">{error}</div>}

                    <button
                        className="btn btn-primary co-pay-btn bento-pay-btn"
                        onClick={handlePay}
                        disabled={processing}
                    >
                        {processing ? (
                            <span className="co-processing">
                                <span className="co-spinner" />
                                Processing…
                            </span>
                        ) : (
                            `Pay ₹${grandTotal.toFixed(2)}`
                        )}
                    </button>
                    <p className="co-secure-note">Secured & encrypted</p>
                </section>
            </main>
        </div>
    );
}
