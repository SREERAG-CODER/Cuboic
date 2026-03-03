import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { ordersApi } from '../api/orders'
import { useSocket } from '../hooks/useSocket'
import StatusBadge from '../components/StatusBadge'

const ALL_STATUSES = ['All', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Assigned', 'Delivered', 'Cancelled']

const NEXT_STATUS: Record<string, string> = {
    Pending: 'Confirmed',
    Confirmed: 'Preparing',
    Preparing: 'Ready',
}

interface OrderItem { name: string; quantity: number; unit_price: number }
interface Order {
    _id: string
    table_id: string | { table_number: string }
    items: OrderItem[]
    total: number
    status: string
    createdAt: string
}

export default function OrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [filterStatus, setFilterStatus] = useState('All')
    const [loading, setLoading] = useState(true)

    const restaurantId = user?.restaurant_id ?? ''

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await ordersApi.findAll(restaurantId, filterStatus === 'All' ? undefined : filterStatus)
            setOrders(res.data)
        } catch {/* ignore */ }
        finally { setLoading(false) }
    }, [restaurantId, filterStatus])

    useEffect(() => { load() }, [load])

    useSocket(restaurantId, {
        'order:new': () => load(),
        'order:updated': () => load(),
    })

    const handleAdvance = async (order: Order) => {
        const next = NEXT_STATUS[order.status]
        if (!next) return
        await ordersApi.updateStatus(order._id, next)
        load()
    }

    const handleCancel = async (order: Order) => {
        await ordersApi.updateStatus(order._id, 'Cancelled')
        load()
    }

    return (
        <div className="page">
            <div className="page-header">
                <h2>Orders</h2>
            </div>

            <div className="filter-tabs">
                {ALL_STATUSES.map((s) => (
                    <button
                        key={s}
                        className={`filter-tab ${filterStatus === s ? 'tab-active' : ''}`}
                        onClick={() => setFilterStatus(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-msg">Loading orders…</div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <span>📋</span>
                    <p>No orders found for the selected filter.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Table</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="cell-mono">{new Date(order.createdAt).toLocaleTimeString()}</td>
                                    <td>{typeof order.table_id === 'string' ? order.table_id.slice(-4) : order.table_id?.table_number ?? '—'}</td>
                                    <td>
                                        <div className="items-list">
                                            {order.items.map((it, i) => (
                                                <span key={i} className="item-chip">
                                                    {it.name} ×{it.quantity}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="cell-mono">${order.total.toFixed(2)}</td>
                                    <td><StatusBadge status={order.status} /></td>
                                    <td>
                                        <div className="action-btns">
                                            {NEXT_STATUS[order.status] && (
                                                <button className="btn btn-sm btn-primary" onClick={() => handleAdvance(order)}>
                                                    → {NEXT_STATUS[order.status]}
                                                </button>
                                            )}
                                            {!['Delivered', 'Cancelled', 'Assigned'].includes(order.status) && (
                                                <button className="btn btn-sm btn-danger" onClick={() => handleCancel(order)}>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
