import './ConfirmCancelModal.css';

interface ConfirmCancelModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

export function ConfirmCancelModal({ open, onClose, onConfirm, loading }: ConfirmCancelModalProps) {
    if (!open) return null;

    return (
        <div className="cancel-modal-overlay fade-in" onClick={!loading ? onClose : undefined}>
            <div className="cancel-modal fade-up" onClick={e => e.stopPropagation()}>
                <div className="cancel-modal__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <h2 className="cancel-modal__title">Cancel Order?</h2>
                <p className="cancel-modal__text">
                    Are you sure you want to cancel this order? This action cannot be undone.
                </p>

                <div className="cancel-modal__actions">
                    <button
                        className="cancel-btn cancel-btn--danger"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Cancelling...' : 'Yes, cancel order'}
                    </button>
                    <button
                        className="cancel-btn cancel-btn--secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        No, keep it
                    </button>
                </div>
            </div>
        </div>
    );
}
