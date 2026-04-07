import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { robotsApi } from '../api/robots'
import RobotCard from '../components/RobotCard'

interface Robot {
    id: string
    name: string
    status: string
    isOnline: boolean
    battery: number
    location: { x: number; y: number }
    cabinets: Array<{ id: string; status: 'Free' | 'Occupied' }>
    mode: string
}

export default function RobotsPage() {
    const { user } = useAuth()
    const [robots, setRobots] = useState<Robot[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            const res = await robotsApi.findAll(user?.restaurantId ?? '')
            setRobots(res.data)
        } catch { /* ignore */ }
        finally { setLoading(false) }
    }, [user?.restaurantId])

    useEffect(() => {
        load()
        // Refresh every 10s for live updates
        const interval = setInterval(load, 10000)
        return () => clearInterval(interval)
    }, [load])

    const online = robots.filter((r) => r.isOnline).length

    return (
        <div className="page">
            <div className="page-header">
                <h2>Robot Fleet</h2>
                <div className="fleet-stats">
                    <span className="fleet-stat">{online} / {robots.length} online</span>
                    <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
                </div>
            </div>

            {loading ? (
                <div className="loading-msg">Loading robots…</div>
            ) : robots.length === 0 ? (
                <div className="empty-state"><p>No robots registered.</p></div>
            ) : (
                <div className="robots-grid">
                    {robots.map((robot) => (
                        <RobotCard key={robot.id} robot={robot} />
                    ))}
                </div>
            )}

            <p className="page-hint">Auto-refreshes every 10 seconds. Manual robot control is managed by the robot device directly.</p>
        </div>
    )
}
