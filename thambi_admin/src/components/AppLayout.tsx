import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ 
                marginLeft: '260px', 
                flex: 1, 
                minHeight: '100vh', 
                padding: '40px',
                position: 'relative'
            }}>
                <div className="scanline"></div>
                {/* Background "Ambient Neural Glow" */}
                <div style={{
                    position: 'fixed',
                    top: '10%',
                    right: '5%',
                    width: '600px',
                    height: '600px',
                    background: 'var(--accent-secondary)',
                    filter: 'blur(200px)',
                    opacity: 0.03,
                    pointerEvents: 'none',
                    borderRadius: '50%',
                    zIndex: -1
                }}></div>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
