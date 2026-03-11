import './ConfirmTableMoveModal.css';

interface ConfirmTableMoveModalProps {
    open: boolean;
    orderCount: number;
    newTableNumber: string;
    onCancel: () => void;
    onConfirm: (moveOrders: boolean) => void;
}

export function ConfirmTableMoveModal({ open, orderCount, newTableNumber, onCancel, onConfirm }: ConfirmTableMoveModalProps) {
    if (!open) return null;

    return (
        <div className="table-modal-overlay fade-in" onClick={onCancel}>
            <div className="confirm-modal fade-up" onClick={e => e.stopPropagation()}>
                <div className="confirm-modal__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h2 className="confirm-modal__title">Update Active Orders?</h2>
                <p className="confirm-modal__text">
                    You're moving to <strong>Table {newTableNumber}</strong> but you have <strong>{orderCount} active order{orderCount > 1 ? 's' : ''}</strong>.
                    Do you want to automatically move your existing orders to the new table?
                </p>

                <div className="confirm-modal__actions">
                    <button className="confirm-modal__btn confirm-modal__btn--primary" onClick={() => onConfirm(true)}>
                        Yes, move {orderCount === 1 ? 'it' : 'them'}
                    </button>
                    <button className="confirm-modal__btn confirm-modal__btn--secondary" onClick={() => onConfirm(false)}>
                        No, keep at old table
                    </button>
                    <button className="confirm-modal__btn confirm-modal__btn--ghost" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
