import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { customersApi, type Customer } from '../api/customers';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: (customer: Customer) => void;
}

const RESEND_COOLDOWN = 30; // seconds
const MAX_ATTEMPTS = 3;

export function CustomerAuthModal({ open, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Resend cooldown
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Attempt tracking
    const [attempts, setAttempts] = useState(0);
    const locked = attempts >= MAX_ATTEMPTS;

    const confirmationRef = useRef<ConfirmationResult | null>(null);
    const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

    // Clean up on unmount / close
    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            if (recaptchaRef.current) {
                try { recaptchaRef.current.clear(); } catch { /* ignore */ }
                recaptchaRef.current = null;
            }
        };
    }, []);

    if (!open) return null;

    const startCooldown = () => {
        setCooldown(RESEND_COOLDOWN);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const initRecaptcha = () => {
        if (recaptchaRef.current) {
            try { recaptchaRef.current.clear(); } catch { /* ignore */ }
        }
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
        });
        return recaptchaRef.current;
    };

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (cooldown > 0) return;

        setError('');
        const trimmed = phone.trim();
        if (trimmed.length < 5) return setError('Enter a valid phone number');

        // Format: +91XXXXXXXXXX for Indian numbers
        let formatted = trimmed.replace(/\D/g, '');
        if (formatted.length === 10) formatted = '+91' + formatted;
        else if (!formatted.startsWith('+')) formatted = '+' + formatted;

        setLoading(true);
        try {
            const verifier = initRecaptcha();
            const result = await signInWithPhoneNumber(auth, formatted, verifier);
            confirmationRef.current = result;
            setStep(2);
            setAttempts(0);
            startCooldown();
        } catch (err: any) {
            const msg = err?.message || '';
            if (msg.includes('invalid-phone-number')) {
                setError('Invalid phone number. Use 10-digit format.');
            } else if (msg.includes('too-many-requests')) {
                setError('Too many requests. Please try again later.');
            } else {
                setError('Failed to send OTP. Please try again.');
            }
            console.error('[Firebase] signInWithPhoneNumber error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (locked) return setError(`Too many attempts. Please request a new OTP.`);
        if (otp.length < 6) return setError('Enter the 6-digit OTP');
        if (!confirmationRef.current) return setError('Please request OTP first.');

        setError('');
        setLoading(true);
        try {
            const result = await confirmationRef.current.confirm(otp);
            const idToken = await result.user.getIdToken();

            // Send token to backend
            const data = await customersApi.verifyFirebaseToken(idToken);
            if (data.customer) {
                onSuccess(data.customer);
            } else {
                setStep(3);
            }
        } catch (err: any) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= MAX_ATTEMPTS) {
                setError(`Incorrect OTP. Maximum attempts reached. Request a new OTP.`);
            } else {
                setError(`Incorrect OTP. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
            }
            console.error('[Firebase] OTP confirm error:', err);
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

    const handleResend = () => {
        if (cooldown > 0) return;
        setOtp('');
        setAttempts(0);
        setError('');
        handleSendOtp();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100000 }}>
            {/* Invisible reCAPTCHA container */}
            <div id="recaptcha-container" />

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
                        <form onSubmit={handleSendOtp}>
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
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp}>
                            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
                                Enter the 6-digit OTP sent to <strong>{phone}</strong>.
                            </p>
                            <input
                                autoFocus
                                type="text"
                                inputMode="numeric"
                                placeholder="6-digit OTP"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="checkout-notes-input"
                                disabled={loading || locked}
                                style={{ width: '100%', boxSizing: 'border-box', letterSpacing: '0.3em' }}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 16 }}
                                disabled={loading || locked}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ width: '100%', marginTop: 8 }}
                                onClick={handleResend}
                                disabled={cooldown > 0 || loading}
                            >
                                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
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
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
