import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { paymentsApi } from '../api/payments'
import StatusBadge from '../components/StatusBadge'

interface Payment {
    _id: string
    order_id: string
    amount: number
    method: string
    status: string
    transaction_id?: string
    createdAt: string
}

interface Summary { order_count: number; total_revenue: number }

export default function PaymentsPage() {
    const { user } = useAuth()
    const [payments, setPayments] = useState<Payment[]>([])
    const [summary, setSummary] = useState<Summary | null>(null)
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [loading, setLoading] = useState(true)

    const restaurantId = user?.restaurant_id ?? ''

    const load = async () => {
        setLoading(true)
        try {
            const [sumRes, payRes] = await Promise.all([
                paymentsApi.getSummary(restaurantId),
                paymentsApi.findAll(restaurantId, from || undefined, to || undefined),
            ])
            setSummary(sumRes.data)
            setPayments(payRes.data)
        } catch { /* ignore */ }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [restaurantId])

    const totalFiltered = payments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)

    return (
        <div className="page">
            <div className="page-header">
                <h2>Payments</h2>
            </div>

            {summary && (
                <div className="kpi-grid">
                    <div className="kpi-card kpi-green">
                        <div className="kpi-icon">💰</div>
                        <div className="kpi-body">
                            <div className="kpi-value">${summary.total_revenue.toFixed(2)}</div>
                            <div className="kpi-label">Today's Revenue</div>
                            <div className="kpi-sub">paid orders</div>
                        </div>
                    </div>
                    <div className="kpi-card kpi-blue">
                        <div className="kpi-icon">🧾</div>
                        <div className="kpi-body">
                            <div className="kpi-value">{summary.order_count}</div>
                            <div className="kpi-label">Today's Orders</div>
                            <div className="kpi-sub">completed</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="filter-row">
                <div className="form-group form-inline">
                    <label>From</label>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="form-group form-inline">
                    <label>To</label>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={load}>Filter</button>
                <button className="btn btn-secondary" onClick={() => { setFrom(''); setTo(''); load() }}>Reset</button>
            </div>

            {payments.length > 0 && (
                <div className="filter-summary">
                    Showing {payments.length} payment(s) — Paid total: <strong>${totalFiltered.toFixed(2)}</strong>
                </div>
            )}

            {loading ? (
                <div className="loading-msg">Loading payments…</div>
            ) : payments.length === 0 ? (
                <div className="empty-state"><span>💳</span><p>No payments found.</p></div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Order ID</th>
                                <th>Method</th>
                                <th>Amount</th>
                                <th>Transaction</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p._id}>
                                    <td className="cell-mono">{new Date(p.createdAt).toLocaleString()}</td>
                                    <td className="cell-mono">#{typeof p.order_id === 'string' ? p.order_id.slice(-6).toUpperCase() : '—'}</td>
                                    <td>{p.method}</td>
                                    <td className="cell-mono">${p.amount.toFixed(2)}</td>
                                    <td className="cell-mono">{p.transaction_id ?? '—'}</td>
                                    <td><StatusBadge status={p.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
