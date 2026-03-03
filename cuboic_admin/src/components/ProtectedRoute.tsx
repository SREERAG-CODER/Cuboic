import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
    children: React.ReactNode
    role?: 'Staff' | 'Owner'
}

export default function ProtectedRoute({ children, role }: Props) {
    const { user, isLoading } = useAuth()

    if (isLoading) return <div className="loading-screen">Loading…</div>
    if (!user) return <Navigate to="/login" replace />
    if (role && user.role !== role) return <Navigate to="/dashboard" replace />

    return <>{children}</>
}
