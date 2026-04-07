import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const { toggleTheme, theme } = useTheme();
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Alert Console', path: '/alerts', icon: '🚨' },
        { name: 'Fleet Monitor', path: '/fleet', icon: '🤖' },
        { name: 'Restaurants', path: '/restaurants', icon: '🏢' },
        { name: 'System Logs', path: '/logs', icon: '📜' },
    ];

    return (
        <aside className="glass-panel tech-border" style={{ 
            width: '260px', 
            height: '100vh', 
            position: 'fixed', 
            left: 0, 
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100
        }}>
            <div className="sidebar-header" style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                <h1 style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>Thambi</h1>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>Platform Admin Hub v2.0</div>
            </div>

            <nav style={{ flex: 1, padding: '20px 0' }}>
                {menuItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 24px',
                            textDecoration: 'none',
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.85rem',
                            borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                            background: isActive ? 'linear-gradient(90deg, var(--border-glow), transparent)' : 'transparent',
                            transition: 'all 0.2s ease',
                            marginBottom: '4px'
                        })}
                    >
                        <span style={{ marginRight: '12px', fontSize: '1rem' }}>{item.icon}</span>
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
                <button 
                    onClick={toggleTheme} 
                    className="tech-btn" 
                    style={{ width: '100%', marginBottom: '10px' }}
                >
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button 
                    onClick={logout} 
                    className="tech-btn" 
                    style={{ width: '100%', borderColor: 'var(--severity-critical)', color: 'var(--severity-critical)' }}
                >
                    Disconnect
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
