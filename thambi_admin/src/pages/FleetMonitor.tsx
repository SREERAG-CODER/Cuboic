import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';

interface Robot {
    id: string;
    name: string;
    status: string;
    battery: number;
    isOnline: boolean;
    lastSeen: string;
    restaurant: { name: string };
}

const FleetMonitor: React.FC = () => {
    const [robots, setRobots] = useState<Robot[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFleet = async () => {
        try {
            const res = await adminApi.getRobots();
            setRobots(res.data);
        } catch (err) {
            console.error('Failed to load fleet data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadFleet(); }, []);

    if (loading) return <div className="font-display">Pinging remote units...</div>;

    return (
        <div className="scifi-page">
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem' }}>Global Fleet Monitor</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time telemetry from all active robotics platforms</p>
                </div>
                <button className="tech-btn" onClick={loadFleet}>Update Status</button>
            </header>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '24px' 
            }}>
                {robots.map(robot => (
                    <div key={robot.id} className="glass-panel tech-border" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: robot.isOnline ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                    {robot.name}
                                </h3>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    UID: {robot.id.slice(0, 8)}...
                                </div>
                            </div>
                            <div style={{ 
                                padding: '4px 8px', 
                                background: robot.isOnline ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                color: robot.isOnline ? 'var(--accent-primary)' : 'var(--text-muted)',
                                border: `1px solid ${robot.isOnline ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                fontSize: '0.6rem',
                                textTransform: 'uppercase',
                                fontFamily: 'var(--font-display)'
                            }}>
                                {robot.isOnline ? 'Online' : 'Offline'}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Host Restaurant</span>
                                <span>{robot.restaurant.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                                <span style={{ color: robot.status === 'Error' ? 'var(--severity-critical)' : 'inherit' }}>{robot.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Last Signal</span>
                                <span style={{ fontSize: '0.7rem' }}>{new Date(robot.lastSeen).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="battery-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>
                                <span>Energy Core</span>
                                <span>{robot.battery}%</span>
                            </div>
                            <div style={{ height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ 
                                    width: `${robot.battery}%`, 
                                    height: '100%', 
                                    background: robot.battery < 20 ? 'var(--severity-critical)' : 'var(--accent-primary)',
                                    boxShadow: `0 0 10px ${robot.battery < 20 ? 'var(--severity-critical)' : 'var(--accent-primary)'}`
                                }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FleetMonitor;
