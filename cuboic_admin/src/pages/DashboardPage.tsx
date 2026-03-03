import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { paymentsApi } from '../api/payments'
import { deliveriesApi } from '../api/deliveries'
import { robotsApi } from '../api/robots'
import { ordersApi } from '../api/orders'
import { useSocket } from '../hooks/useSocket'
import { showToast } from '../components/Toast'

interface Summary { order_count: number; total_revenue: number }

export default function DashboardPage() {
    const { user } = useAuth()
    const [summary, setSummary] = useState<Summary>({ order_count: 0, total_revenue: 0 })
    const [activeDeliveries, setActiveDeliveries] = useState(0)
    const [robotsOnline, setRobotsOnline] = useState(0)
    const [pendingOrders, setPendingOrders] = useState(0)
    const [pulse, setPulse] = useState(false)

    const restaurantId = user?.restaurant_id ?? ''

    const load = async () => {
        try {
            const [summaryRes, deliveriesRes, robotsRes, ordersRes] = await Promise.all([
                user?.role === 'Owner' ? paymentsApi.getSummary(restaurantId) : Promise.resolve(null),
                deliveriesApi.findActive(restaurantId),
                robotsApi.findAll(restaurantId),
                ordersApi.findAll(restaurantId, 'Pending'),
            ])
            if (summaryRes) setSummary(summaryRes.data)
            setActiveDeliveries(deliveriesRes.data.length)
            setRobotsOnline((robotsRes.data as Array<{ isOnline: boolean }>).filter((r) => r.isOnline).length)
            setPendingOrders((ordersRes.data as Array<unknown>).length)
        } catch {/* ignore */ }
    }

    useEffect(() => { load() }, [restaurantId])

    useSocket(restaurantId, {
        'order:new': (data) => {
            setPulse(true)
            setTimeout(() => setPulse(false), 2000)
            showToast('New Order', 'A new order has arrived!', 'info')
            load()
        },
        'order:updated': () => load(),
        'delivery:started': () => { showToast('Delivery Started', 'Robot is on its way!', 'success'); load() },
        'delivery:updated': () => load(),
    })

    const kpis = [
        {
            label: "Today's Orders",
            value: user?.role === 'Owner' ? summary.order_count : pendingOrders,
            sub: user?.role === 'Owner' ? 'paid today' : 'pending',
            icon: '🧾',
            accent: 'kpi-blue',
        },
        ...(user?.role === 'Owner'
            ? [{
                label: "Today's Revenue",
                value: `$${summary.total_revenue.toFixed(2)}`,
                sub: 'before tax',
                icon: '💰',
                accent: 'kpi-green',
            }]
            : []),
        {
            label: 'Active Deliveries',
            value: activeDeliveries,
            sub: 'in transit',
            icon: '🤖',
            accent: 'kpi-amber',
        },
        {
            label: 'Robots Online',
            value: robotsOnline,
            sub: 'connected',
            icon: '⚡',
            accent: 'kpi-purple',
        },
    ]

    return (
        <div className="page">
            <div className="page-header">
                <h2>Dashboard</h2>
                <p className="page-sub">Welcome back, {user?.name}</p>
            </div>

            <div className={`kpi-grid ${pulse ? 'kpi-pulse' : ''}`}>
                {kpis.map((k) => (
                    <div key={k.label} className={`kpi-card ${k.accent}`}>
                        <div className="kpi-icon">{k.icon}</div>
                        <div className="kpi-body">
                            <div className="kpi-value">{k.value}</div>
                            <div className="kpi-label">{k.label}</div>
                            <div className="kpi-sub">{k.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-hint">
                <span>⚡</span> Real-time updates are active — new orders and delivery changes appear automatically.
            </div>
        </div>
    )
}
