import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import DeliveriesPage from './pages/DeliveriesPage'
import RobotsPage from './pages/RobotsPage'
import PaymentsPage from './pages/PaymentsPage'

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/deliveries" element={<DeliveriesPage />} />
                        <Route path="/robots" element={<RobotsPage />} />
                        <Route
                            path="/payments"
                            element={
                                <ProtectedRoute role="Owner">
                                    <PaymentsPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
