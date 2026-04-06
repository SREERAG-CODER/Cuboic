import { useState, useEffect } from 'react'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'
import socket from '../api/socket'
import { ShoppingBag, IndianRupee, Clock, Zap } from 'lucide-react'

interface Stats {
  todaySales: number
  todayOrders: number
  pendingOrders: number
  activeRobots: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({ todaySales: 0, todayOrders: 0, pendingOrders: 0, activeRobots: 0 })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user?.restaurantId) return
    try {
      const [ordersRes, robotsRes] = await Promise.all([
        apiClient.get('/orders', { params: { restaurantId: user.restaurantId } }),
        apiClient.get('/robots', { params: { restaurantId: user.restaurantId } }).catch(() => ({ data: [] }))
      ])

      const allOrders = ordersRes.data as any[]
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today)
      const completedToday = todayOrders.filter(o => o.status === 'Delivered')
      const todaySales = completedToday.reduce((s: number, o: any) => s + (o.total ?? 0), 0)
      const pendingOrders = allOrders.filter((o: any) =>
        ['Pending', 'Confirmed', 'Preparing'].includes(o.status)
      ).length

      const robots = robotsRes.data as any[]
      const activeRobots = robots.filter((r: any) => r.isOnline).length

      setStats({ todaySales, todayOrders: todayOrders.length, pendingOrders, activeRobots })
    } catch (e) {
      console.error('Dashboard fetch error', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.restaurantId])

  useEffect(() => {
    if (!user?.restaurantId) return
    const rId = user.restaurantId
    socket.on(`order:new:${rId}`, load)
    socket.on(`order:updated:${rId}`, load)
    return () => {
      socket.off(`order:new:${rId}`, load)
      socket.off(`order:updated:${rId}`, load)
    }
  }, [user?.restaurantId])

  const cards = [
    {
      label: "Today's Revenue",
      value: loading ? '...' : `₹${stats.todaySales.toFixed(0)}`,
      icon: IndianRupee,
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/20',
    },
    {
      label: "Today's Orders",
      value: loading ? '...' : stats.todayOrders,
      icon: ShoppingBag,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
      border: 'border-sky-400/20',
    },
    {
      label: 'Active Orders',
      value: loading ? '...' : stats.pendingOrders,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
    },
    {
      label: 'Robots Online',
      value: loading ? '...' : stats.activeRobots,
      icon: Zap,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
    },
  ]

  return (
    <div className="p-8 bg-zinc-950 min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-500 mt-1 text-sm">Live overview of your restaurant operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`bg-zinc-900 border ${card.border} rounded-2xl p-6 flex flex-col gap-4`}
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <Icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-zinc-500 text-sm font-medium">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-zinc-700 mt-8">
        ↻ Live — updates automatically via real-time socket
      </p>
    </div>
  )
}
