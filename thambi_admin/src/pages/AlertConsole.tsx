import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';

interface SystemAlert {
    id: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    source: string;
    message: string;
    details: any;
    isResolved: boolean;
    createdAt: string;
    restaurant?: { name: string };
}

const AlertConsole: React.FC = () => {
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
    const [loading, setLoading] = useState(true);

    const loadAlerts = async () => {
        try {
            const res = await adminApi.getAlerts();
            setAlerts(res.data);
        } catch (err) {
            console.error('Failed to load alerts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAlerts(); }, []);

    const resolve = async (id: string) => {
        try {
            await adminApi.resolveAlert(id);
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, isResolved: true } : a));
            if (selectedAlert?.id === id) setSelectedAlert(prev => prev ? { ...prev, isResolved: true } : null);
        } catch (err) {
            console.error('Failed to resolve alert:', err);
        }
    };

    if (loading) return <div className="font-display">Decoding encrypted logs...</div>;

    return (
        <div className="scifi-page" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem' }}>System Alert Console</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Monitoring global neural pathways for anomalies</p>
                </div>
                <button className="tech-btn" onClick={loadAlerts}>Refresh Feed</button>
            </header>

            <div style={{ display: 'flex', flex: 1, gap: '24px', overflow: 'hidden' }}>
                {/* Alert List */}
                <div className="glass-panel tech-border" style={{ flex: 1, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                            <tr style={{ textAlign: 'left', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.7rem' }}>
                                <th style={{ padding: '16px' }}>Severity</th>
                                <th style={{ padding: '16px' }}>Source</th>
                                <th style={{ padding: '16px' }}>Message</th>
                                <th style={{ padding: '16px' }}>Timestamp</th>
                                <th style={{ padding: '16px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map(alert => (
                                <tr 
                                    key={alert.id} 
                                    onClick={() => setSelectedAlert(alert)}
                                    style={{ 
                                        borderBottom: '1px solid var(--border-color)', 
                                        cursor: 'pointer',
                                        background: selectedAlert?.id === alert.id ? 'var(--border-glow)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                    className="alert-row"
                                >
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ 
                                            color: alert.severity === 'CRITICAL' ? 'var(--severity-critical)' : 
                                                   alert.severity === 'WARNING' ? 'var(--severity-warning)' : 'var(--severity-info)',
                                            fontWeight: 'bold'
                                        }}>
                                            [{alert.severity}]
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{alert.source}</td>
                                    <td style={{ padding: '16px', color: alert.isResolved ? 'var(--text-muted)' : 'var(--text-primary)' }}>{alert.message}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(alert.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ 
                                            width: '8px', height: '8px', borderRadius: '50%', 
                                            background: alert.isResolved ? 'var(--text-muted)' : 'var(--accent-primary)',
                                            boxShadow: alert.isResolved ? 'none' : '0 0 5px var(--accent-primary)'
                                        }}></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Detail Inspector */}
                <div className="glass-panel tech-border" style={{ width: '400px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>Neural Inspector</h3>
                    {selectedAlert ? (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Alert ID</label>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{selectedAlert.id}</div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Origin Restaurant</label>
                                <div>{selectedAlert.restaurant?.name || 'Global System'}</div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Detailed Payload</label>
                                <pre style={{ 
                                    background: 'var(--bg-primary)', 
                                    padding: '12px', 
                                    fontSize: '0.7rem', 
                                    fontFamily: 'var(--font-mono)',
                                    whiteSpace: 'pre-wrap',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--accent-primary)'
                                }}>
                                    {JSON.stringify(selectedAlert.details, null, 2)}
                                </pre>
                            </div>
                            {!selectedAlert.isResolved && (
                                <button className="tech-btn" onClick={() => resolve(selectedAlert.id)} style={{ width: '100%', borderColor: 'var(--accent-primary)' }}>
                                    Mark as Resolved
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                            Select a transmission to inspect packet data
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertConsole;
