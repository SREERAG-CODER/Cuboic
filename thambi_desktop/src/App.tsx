import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import ProvisionPage from './pages/ProvisionPage'
import DashboardPage from './pages/DashboardPage'
import POSPage from './pages/POSPage'
import OrdersPage from './pages/OrdersPage'
import InventoryPage from './pages/InventoryPage'
import RecipesPage from './pages/RecipesPage'
import CustomersPage from './pages/CustomersPage'
import ReportsPage from './pages/ReportsPage'
import IntegrationsPage from './pages/IntegrationsPage'
import Layout from './components/Layout'
import { useAuth } from './contexts/AuthContext'
import { connectSocket, disconnectSocket } from './api/socket'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        if (location.pathname !== '/provision') {
          navigate('/provision')
        }
      } else {
        // Connect socket when user is logged in
        connectSocket()
        if (location.pathname === '/' || location.pathname === '/provision') {
          navigate('/dashboard')
        }
      }
    }

    return () => {
      disconnectSocket()
    }
  }, [user, isLoading, navigate, location.pathname])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse">Initializing Thambi OS...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/provision" element={<ProvisionPage />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/settings" element={<div className="p-8">Settings</div>} />
      </Route>
    </Routes>
  )
}

export default App
