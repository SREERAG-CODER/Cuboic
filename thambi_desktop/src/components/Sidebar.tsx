import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import { PieChart, MonitorSmartphone, List, Package, CookingPot, Settings, User, LogOut, FileText, Database, Share2 } from 'lucide-react'
import { disconnectSocket } from '../api/socket'
import logo from '../assets/logo.png'

const FULL_NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: PieChart, roles: ['Admin', 'Owner', 'Manager', 'Cashier'] },
  { path: '/pos', label: 'POS Terminal', icon: MonitorSmartphone, roles: ['Admin', 'Owner', 'Manager', 'Cashier', 'Waiter'] },
  { path: '/orders', label: 'Orders', icon: List, roles: ['Admin', 'Owner', 'Manager', 'Cashier', 'Waiter', 'Kitchen'] },
  { path: '/inventory', label: 'Inventory', icon: Package, roles: ['Admin', 'Owner', 'Manager'] },
  { path: '/recipes', label: 'Recipes', icon: CookingPot, roles: ['Admin', 'Owner', 'Manager'] },
  { path: '/customers', label: 'CRM', icon: Database, roles: ['Admin', 'Owner', 'Manager'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['Admin', 'Owner'] },
  { path: '/integrations', label: 'Integrations', icon: Share2, roles: ['Admin', 'Owner'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Owner', 'Manager'] },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const role = user?.role || 'Staff'

  const allowedNavItems = FULL_NAV_ITEMS.filter(item => item.roles.includes(role))

  const handleLogout = async () => {
    disconnectSocket()
    await logout()
  }

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 h-full flex flex-col transition-colors duration-300">
      <div className="p-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:bg-accent/10">
             <img src={logo} alt="Thambi Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-accent transition-colors">
            Thambi
          </h1>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {allowedNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const IconComponent = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-zinc-100/50 dark:bg-zinc-900 text-accent shadow-sm' 
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50'
              }`}
            >
              <IconComponent size={20} className={isActive ? 'text-accent' : 'text-zinc-400'} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 space-y-1">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-accent flex-shrink-0">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate dark:text-zinc-50 text-zinc-900">{user?.userId ?? role}</p>
            <p className="text-xs text-zinc-500 truncate">{role}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors group"
        >
          <LogOut size={18} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
