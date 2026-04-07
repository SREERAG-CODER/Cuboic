import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';

interface Stats {
    restaurants: number;
    orders: number;
    robots: number;
    owners: number;
    totalRevenue: number;
}

const GlobalDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await adminApi.getStats();
                setStats(res.data);
            } catch (err) {
                console.error('Failed to load global stats:', err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) return <div className="font-display">Synchronizing Neural Net...</div>;

    const cards = [
        { label: 'Network Nodes', value: stats?.restaurants, sub: 'Active Restaurants', accent: 'var(--accent-primary)' },
        { label: 'Transmission Volume', value: stats?.orders, sub: 'Total Orders', accent: 'var(--accent-secondary)' },
        { label: 'Active Units', value: stats?.robots, sub: 'Robots Online', accent: 'var(--severity-info)' },
        { label: 'System Revenue', value: `₹${stats?.totalRevenue.toLocaleString()}`, sub: 'Global Credits', accent: '#00ffaa' },
    ];

    return (
        <div className="scifi-page">
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Global Command Center</h2>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-main)' }}>Platform Pulse: Stable | Latency: 24ms</p>
            </header>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '24px' 
            }}>
                {cards.map(card => (
                    <div key={card.label} className="glass-panel tech-border" style={{ padding: '24px' }}>
                        <div style={{ color: card.accent, fontSize: '0.7rem', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
                            {card.label}
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                            {card.value}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{card.sub}</div>
                        <div style={{ 
                            height: '2px', 
                            width: '100%', 
                            background: `linear-gradient(90deg, ${card.accent}, transparent)`,
                            marginTop: '16px'
                        }}></div>
                    </div>
                ))}
            </div>

            <section style={{ marginTop: '48px' }}>
                <div className="tech-border glass-panel" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '1rem' }}>Sector Activity Map</h3>
                    <div style={{ 
                        height: '300px', 
                        background: 'var(--bg-tertiary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        border: '1px dashed var(--border-color)'
                    }}>
                        [ Visualizing Global Deployment Matrix... ]
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GlobalDashboard;
