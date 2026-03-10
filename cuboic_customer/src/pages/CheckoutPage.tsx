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
                items: items.map(c => ({ itemId: c.item.id, quantity: c.quantity })),
            });

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

            <main className="container checkout-body">
                {/* Order Summary */}
                <section className="co-card">
                    <h2 className="co-section-title">Order Summary</h2>
                    <div className="co-items">
                        {items.map(c => (
                            <div key={c.item.id} className="co-item-row">
                                <span className="co-item-name">{c.quantity}× {c.item.name}</span>
                                <span className="co-item-price">₹{((Number(c.item.price) || 0) * (Number(c.quantity) || 1)).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <hr className="divider" />
                    <div className="co-totals">
                        <div className="co-total-row"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
                        <div className="co-total-row"><span>Tax (5%)</span><span>₹{taxAmount.toFixed(2)}</span></div>
                        <div className="co-total-row co-total-grand"><span>Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
                    </div>
                </section>

                {/* Payment Method */}
                <section className="co-card">
                    <h2 className="co-section-title">Payment Method</h2>
                    <div className="co-methods">
                        {(['Card', 'UPI', 'Cash'] as PaymentMethod[]).map(m => (
                            <button
                                key={m}
                                className={`co-method-btn ${method === m ? 'co-method-btn--active' : ''}`}
                                onClick={() => setMethod(m)}
                            >
                                <span className="co-method-icon">
                                    {m === 'Card' ? 'Card' : m === 'UPI' ? 'UPI' : 'Cash'}
                                </span>
                                <span>{m}</span>
                            </button>
                        ))}
                    </div>

                    {/* Card details — only shown when Card is selected */}
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
                            You'll be redirected to your UPI app after confirming.
                        </p>
                    )}

                    {method === 'Cash' && (
                        <p className="co-method-hint fade-in">
                            Please have exact change ready when the robot arrives.
                        </p>
                    )}
                </section>

                {error && <div className="co-error">{error}</div>}

                <button
                    className="btn btn-primary co-pay-btn"
                    onClick={handlePay}
                    disabled={processing}
                >
                    {processing ? (
                        <span className="co-processing">
                            <span className="co-spinner" />
                            Processing payment…
                        </span>
                    ) : (
                        `Pay ₹${grandTotal.toFixed(2)}`
                    )}
                </button>

                <p className="co-secure-note">Secured and encrypted payment</p>
            </main>
        </div>
    );
}
