import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Toast from '../components/Toast'

export default function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="app-shell">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="app-main">
                <div className="mobile-header">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        ☰
                    </button>
                    <div className="mobile-logo">
                        <img src="/pic1.png" className="logo-cube" alt="Thambi Logo" />
                        <span className="logo-text">Thambi</span>
                    </div>
                </div>

                <Outlet />
            </main>
            <Toast />
        </div>
    )
}
