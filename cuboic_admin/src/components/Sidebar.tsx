import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/orders', label: 'Orders', icon: '≡' },
    { to: '/deliveries', label: 'Deliveries', icon: '⬡' },
    { to: '/menu', label: 'Menu', icon: '≋' },
    { to: '/robots', label: 'Robot Fleet', icon: '◉' },
]

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="logo-cube">⬡</span>
                <span className="logo-text">Cuboic</span>
                <span className="logo-sub">Admin</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}

                {user?.role === 'Owner' && (
                    <NavLink
                        to="/payments"
                        className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}
                    >
                        <span className="nav-icon">₹</span>
                        <span className="nav-label">Payments</span>
                    </NavLink>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">{user?.name?.[0] ?? 'U'}</div>
                    <div className="user-details">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
            </div>
        </aside>
    )
}
