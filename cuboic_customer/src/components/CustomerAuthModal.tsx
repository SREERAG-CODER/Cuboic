import React, { useState } from 'react';
import { customersApi, type Customer } from '../api/customers';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: (customer: Customer) => void;
}

export function CustomerAuthModal({ open, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<1 | 2>(1); // 1: Phone lookup, 2: Register name
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleLookup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');
        const trimmed = phone.trim();
        if (trimmed.length < 5) return setError('Enter a valid phone number');

        // Note: Backend adds +91 if missing or cleans it up
        setLoading(true);
        try {
            const data = await customersApi.lookup(trimmed);
            if (data.customer) {
                // If customer exists, we're done
                onSuccess(data.customer);
            } else {
                // Not found, move to register name step
                setStep(2);
            }
        } catch (err: any) {
            setError('Something went wrong. Please try again.');
            console.error('[Lookup] error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) return setError('Name is required');
        setLoading(true);
        try {
            const customer = await customersApi.register(phone, name);
            onSuccess(customer);
        } catch {
            setError('Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100000 }}>
            <div className="modal-content fade-up" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Welcome to Thambi</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="co-error" style={{ marginBottom: 16, color: '#ef4444', backgroundColor: '#fef2f2', padding: 8, borderRadius: 8 }}>
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleLookup}>
                            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
                                Enter your phone number to proceed with your order.
                            </p>
                            <input
                                autoFocus
                                type="tel"
                                placeholder="10-digit phone number"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="checkout-notes-input"
                                disabled={loading}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 16 }}
                                disabled={loading}
                            >
                                {loading ? 'Checking...' : 'Continue'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleRegister}>
                            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>Welcome! What's your name?</p>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="checkout-notes-input"
                                disabled={loading}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 16 }}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Continue to Order'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ width: '100%', marginTop: 8 }}
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Change Phone Number
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
