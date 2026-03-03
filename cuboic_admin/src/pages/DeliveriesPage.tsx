import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { deliveriesApi } from '../api/deliveries'
import { robotsApi } from '../api/robots'
import { ordersApi } from '../api/orders'
import { useSocket } from '../hooks/useSocket'
import { showToast } from '../components/Toast'
import StatusBadge from '../components/StatusBadge'

interface DeliveryStop {
    _id?: string
    order_id: string
    table_id: string
    cabinets: string[]
    sequence: number
    status: string
    delivered_at?: string
}

interface Delivery {
    _id: string
    robot_id: string
    stops: DeliveryStop[]
    status: string
    createdAt: string
}

interface Robot { _id: string; name: string; status: string; cabinets: Array<{ id: string; status: string }> }
interface Order { _id: string; table_id: string; status: string; total: number; items: Array<{ name: string; quantity: number }> }

interface CreateStop {
    order_id: string
    table_id: string
    cabinets: string[]
    sequence: number
}

export default function DeliveriesPage() {
    const { user } = useAuth()
    const [tab, setTab] = useState<'active' | 'history'>('active')
    const [active, setActive] = useState<Delivery[]>([])
    const [history, setHistory] = useState<Delivery[]>([])
    const [robots, setRobots] = useState<Robot[]>([])
    const [readyOrders, setReadyOrders] = useState<Order[]>([])
    const [showCreate, setShowCreate] = useState(false)

    // Create delivery form state
    const [selectedRobot, setSelectedRobot] = useState('')
    const [stops, setStops] = useState<CreateStop[]>([{ order_id: '', table_id: '', cabinets: [], sequence: 1 }])
    const [creating, setCreating] = useState(false)

    const restaurantId = user?.restaurant_id ?? ''

    const load = useCallback(async () => {
        try {
            const [activeRes, allRes, robotsRes, ordersRes] = await Promise.all([
                deliveriesApi.findActive(restaurantId),
                deliveriesApi.findAll(restaurantId),
                robotsApi.findAll(restaurantId),
                ordersApi.findAll(restaurantId, 'Ready'),
            ])
            setActive(activeRes.data)
            setHistory((allRes.data as Delivery[]).filter((d) => d.status !== 'InTransit'))
            setRobots(robotsRes.data as Robot[])
            setReadyOrders(ordersRes.data as Order[])
        } catch { /* ignore */ }
    }, [restaurantId])

    useEffect(() => { load() }, [load])

    useSocket(restaurantId, {
        'delivery:started': (data) => {
            showToast('Delivery Started', 'Robot dispatched!', 'success')
            load()
        },
        'delivery:updated': () => load(),
        'order:updated': () => load(),
    })

    const handleConfirmStop = async (deliveryId: string, stopIndex: number) => {
        await deliveriesApi.confirmStop(deliveryId, stopIndex)
        load()
    }

    const idleRobots = robots.filter((r) => r.status === 'Idle')

    const handleAddStop = () => {
        setStops((prev) => [...prev, { order_id: '', table_id: '', cabinets: [], sequence: prev.length + 1 }])
    }

    const handleStopChange = (index: number, field: keyof CreateStop, value: string | string[]) => {
        setStops((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
    }

    const handleCabinetToggle = (stopIndex: number, cabId: string) => {
        setStops((prev) => prev.map((s, i) => {
            if (i !== stopIndex) return s
            const has = s.cabinets.includes(cabId)
            return { ...s, cabinets: has ? s.cabinets.filter((c) => c !== cabId) : [...s.cabinets, cabId] }
        }))
    }

    const handleCreateDelivery = async () => {
        if (!selectedRobot || stops.some((s) => !s.order_id || s.cabinets.length === 0)) {
            showToast('Validation', 'Select a robot, orders, and cabinets for each stop.', 'warning')
            return
        }
        setCreating(true)
        try {
            const selectedRobotObj = robots.find((r) => r._id === selectedRobot)!
            const payload = {
                restaurant_id: restaurantId,
                robot_id: selectedRobot,
                stops: stops.map((s) => ({
                    order_id: s.order_id,
                    table_id: readyOrders.find((o) => o._id === s.order_id)?.table_id ?? s.table_id,
                    cabinets: s.cabinets,
                    sequence: s.sequence,
                })),
            }
            await deliveriesApi.create(payload)
            setShowCreate(false)
            setSelectedRobot('')
            setStops([{ order_id: '', table_id: '', cabinets: [], sequence: 1 }])
            load()
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create delivery'
            showToast('Error', msg, 'warning')
        } finally { setCreating(false) }
    }

    const selectedRobotObj = robots.find((r) => r._id === selectedRobot)

    return (
        <div className="page">
            <div className="page-header">
                <h2>Deliveries</h2>
                {user?.role === 'Staff' && (
                    <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                        {showCreate ? '✕ Cancel' : '+ New Delivery'}
                    </button>
                )}
            </div>

            {showCreate && (
                <div className="create-panel">
                    <h3>Create Delivery</h3>

                    <div className="form-group">
                        <label>Robot</label>
                        <select value={selectedRobot} onChange={(e) => setSelectedRobot(e.target.value)}>
                            <option value="">Select idle robot…</option>
                            {idleRobots.map((r) => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {stops.map((stop, si) => (
                        <div key={si} className="stop-block">
                            <div className="stop-header">Stop {stop.sequence}</div>

                            <div className="form-group">
                                <label>Order (Ready)</label>
                                <select value={stop.order_id} onChange={(e) => handleStopChange(si, 'order_id', e.target.value)}>
                                    <option value="">Select order…</option>
                                    {readyOrders.map((o) => (
                                        <option key={o._id} value={o._id}>
                                            {o.items.map((i) => `${i.name}×${i.quantity}`).join(', ')} — ${o.total.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Cabinets</label>
                                <div className="cabinet-toggle-row">
                                    {(selectedRobotObj?.cabinets ?? [{ id: 'C1' }, { id: 'C2' }, { id: 'C3' }]).map((cab) => (
                                        <button
                                            key={cab.id}
                                            type="button"
                                            className={`cabinet-toggle ${stop.cabinets.includes(cab.id) ? 'toggle-selected' : ''}`}
                                            onClick={() => handleCabinetToggle(si, cab.id)}
                                        >
                                            {cab.id}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="create-actions">
                        <button className="btn btn-secondary" onClick={handleAddStop}>+ Add Stop</button>
                        <button className="btn btn-primary" onClick={handleCreateDelivery} disabled={creating}>
                            {creating ? 'Dispatching…' : 'Dispatch Robot'}
                        </button>
                    </div>
                </div>
            )}

            <div className="tab-bar">
                <button className={`tab-btn ${tab === 'active' ? 'tab-btn-active' : ''}`} onClick={() => setTab('active')}>
                    Active ({active.length})
                </button>
                <button className={`tab-btn ${tab === 'history' ? 'tab-btn-active' : ''}`} onClick={() => setTab('history')}>
                    History ({history.length})
                </button>
            </div>

            {(tab === 'active' ? active : history).length === 0 ? (
                <div className="empty-state"><span>🤖</span><p>No {tab === 'active' ? 'active' : 'past'} deliveries.</p></div>
            ) : (
                <div className="delivery-list">
                    {(tab === 'active' ? active : history).map((d) => (
                        <div key={d._id} className="delivery-card">
                            <div className="delivery-card-header">
                                <span className="delivery-id">#{d._id.slice(-6).toUpperCase()}</span>
                                <StatusBadge status={d.status} />
                                <span className="delivery-time">{new Date(d.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="stops-grid">
                                {d.stops.map((stop, si) => (
                                    <div key={si} className="stop-row">
                                        <div className="stop-info">
                                            <span className="stop-seq">Stop {stop.sequence}</span>
                                            <span className="stop-cabinets">{stop.cabinets.join(', ')}</span>
                                            <StatusBadge status={stop.status} />
                                        </div>
                                        {tab === 'active' && stop.status === 'Pending' && user?.role === 'Staff' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => handleConfirmStop(d._id, si)}>
                                                Confirm Delivery
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
