import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Toast from '../components/Toast'

export default function AppLayout() {
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="app-main">
                <Outlet />
            </main>
            <Toast />
        </div>
    )
}
