interface Props {
    open: boolean;
    onClose: () => void;
    onSelect: (type: 'Dine-in' | 'Takeaway') => void;
}

export function OrderTypeModal({ open, onClose, onSelect }: Props) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100000 }}>
            <div className="modal-content fade-up" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Order Type</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>Are you dining in or ordering takeaway?</p>
                    <button className="btn btn-primary" onClick={() => onSelect('Takeaway')} style={{ width: '100%' }}>
                        🥡 Takeaway
                    </button>
                    <button className="btn btn-secondary" onClick={() => onSelect('Dine-in')} style={{ width: '100%', backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                        🍽 Dine-in
                    </button>
                </div>
            </div>
        </div>
    );
}
