import type { ReactNode } from 'react';
import type { Order } from '../api/orders';
import './StatusTimeline.css';

// Maps backend status values to display steps (FR-5)
// Pending + Confirmed → step 0 "Order Received"
// Preparing → step 1, Ready → step 2, Assigned → step 3 "Delivering", Delivered → step 4
type DisplayStatus = 'OrderReceived' | 'Preparing' | 'Ready' | 'Delivering' | 'Delivered';

const ClipboardSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 13H16M8 17H16M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const ChefSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M7.7 10.3C6.2 9.4 5 7.8 5 6C5 3.2 7.2 1 10 1C12.8 1 15 3.2 15 6C15 7.8 13.8 9.4 12.3 10.3" fill="currentColor" fillOpacity="0.2" />
        <path d="M6 14H18V21C18 22.1 17.1 23 16 23H8C6.9 23 6 22.1 6 21V14Z" fill="currentColor" fillOpacity="0.5" />
        <path d="M6 14H18M6 14L4 10M18 14L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ReadySVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const RobotSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="6" width="14" height="12" rx="3" fill="currentColor" fillOpacity="0.2" />
        <rect x="5" y="6" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8.5" cy="11.5" r="1.5" fill="currentColor" />
        <circle cx="15.5" cy="11.5" r="1.5" fill="currentColor" />
        <path d="M12 2V6M9 4H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 20 M17 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Wheels that Spin */}
        <circle cx="7" cy="20" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" className="robot-wheel" />
        <circle cx="17" cy="20" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" className="robot-wheel" />
    </svg>
);

const DeliveredSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M3 9L12 2L21 9V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const STEPS: { display: DisplayStatus; label: string; icon: ReactNode }[] = [
    { display: 'OrderReceived', label: 'Order Received', icon: <ClipboardSVG /> },
    { display: 'Preparing', label: 'Being Prepared', icon: <ChefSVG /> },
    { display: 'Ready', label: 'Ready to Serve', icon: <ReadySVG /> },
    { display: 'Delivering', label: 'Delivering', icon: <RobotSVG /> },
    { display: 'Delivered', label: 'Delivered!', icon: <DeliveredSVG /> },
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
