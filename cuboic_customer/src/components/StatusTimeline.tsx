import type { Order } from '../api/orders';
import './StatusTimeline.css';

// Maps backend status values to display steps (FR-5)
// Pending + Confirmed → step 0 "Order Received"
// Preparing → step 1, Ready → step 2, Assigned → step 3 "Delivering", Delivered → step 4
type DisplayStatus = 'OrderReceived' | 'Preparing' | 'Ready' | 'Delivering' | 'Delivered';

const STEPS: { display: DisplayStatus; label: string; icon: string }[] = [
    { display: 'OrderReceived', label: 'Order Received', icon: '📋' },
    { display: 'Preparing', label: 'Being Prepared', icon: '👨‍🍳' },
    { display: 'Ready', label: 'Ready to Serve', icon: '✅' },
    { display: 'Delivering', label: 'Delivering', icon: '🤖' },
    { display: 'Delivered', label: 'Delivered!', icon: '🎉' },
];

function toDisplayStep(status: Order['status']): DisplayStatus {
    switch (status) {
        case 'Pending':
        case 'Confirmed': return 'OrderReceived';
        case 'Preparing': return 'Preparing';
        case 'Ready': return 'Ready';
        case 'Assigned': return 'Delivering';
        case 'Delivered': return 'Delivered';
        default: return 'OrderReceived';
    }
}

interface Props { status: Order['status']; }

export function StatusTimeline({ status }: Props) {
    const current = STEPS.findIndex(s => s.display === toDisplayStep(status));
    return (
        <div className="timeline">
            {STEPS.map((step, i) => {
                const done = i <= current;
                const active = i === current;
                return (
                    <div key={step.display} className={`timeline__step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                        <div className="timeline__dot">
                            {done
                                ? <span className="dot-icon">{step.icon}</span>
                                : <span className="dot-num">{i + 1}</span>
                            }
                        </div>
                        {i < STEPS.length - 1 && <div className="timeline__line" />}
                        <p className="timeline__label">{step.label}</p>
                    </div>
                );
            })}
        </div>
    );
}
