import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'
import socket from '../api/socket'
import { analyticsApi, type RevenueTrends, type MenuAnalytics, type CustomerInsights } from '../api/analytics'
import { IndianRupee, ShoppingBag, Clock, Zap, Loader2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

type Timeframe = 'today' | '7d' | '30d' | '3m' | 'custom'

const CHIPS: { label: string; value: Timeframe; subLabel: string }[] = [
  { label: 'Today', value: 'today', subLabel: 'Today' },
  { label: '7 Days', value: '7d', subLabel: 'Last 7 Days' },
  { label: '30 Days', value: '30d', subLabel: 'Last 30 Days' },
  { label: '3 Months', value: '3m', subLabel: 'Last 3 Months' },
  { label: 'Custom', value: 'custom', subLabel: 'Custom Range' },
]

function localDate(d: Date): string {
  return d.toLocaleDateString('en-CA')
}

function getDateRange(tf: Timeframe): { startDate: string; endDate: string } {
  const today = new Date()
  const endDate = localDate(today)

  const tomorrowDate = new Date(today)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = localDate(tomorrowDate)

  const sub = (days: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - days)
    return localDate(d)
  }

  switch (tf) {
    case 'today': return { startDate: endDate, endDate: tomorrow }
    case '7d': return { startDate: sub(7), endDate: tomorrow }
    case '30d': return { startDate: sub(30), endDate: tomorrow }
    case '3m': {
      const d = new Date(today)
      d.setMonth(d.getMonth() - 3)
      return { startDate: localDate(d), endDate: tomorrow }
    }
    default: return { startDate: sub(30), endDate: tomorrow }
  }
}

interface LiveStats {
  todaySales: number
  todayOrders: number
  pendingOrders: number
  activeRobots: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const restaurantId = user?.restaurantId ?? ''

  const [liveStats, setLiveStats] = useState<LiveStats>({ todaySales: 0, todayOrders: 0, pendingOrders: 0, activeRobots: 0 })
  const [loadingLive, setLoadingLive] = useState(true)

  // Analytics State
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('30d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')

  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [revenueData, setRevenueData] = useState<RevenueTrends | null>(null)
  const [menuData, setMenuData] = useState<MenuAnalytics | null>(null)
  const [customerData, setCustomerData] = useState<CustomerInsights | null>(null)

  const activeDates = selectedTimeframe === 'custom'
    ? { startDate: appliedStart, endDate: appliedEnd }
    : getDateRange(selectedTimeframe)

  const activeSubLabel = selectedTimeframe === 'custom' && appliedStart && appliedEnd
    ? `${appliedStart} → ${appliedEnd}`
    : CHIPS.find(c => c.value === selectedTimeframe)?.subLabel ?? ''

  // 1. Load Live Info (For Top Cards)
  const loadLiveStats = useCallback(async () => {
    if (!restaurantId) return
    try {
      const [ordersRes, robotsRes] = await Promise.all([
        apiClient.get('/orders', { params: { restaurantId } }),
        apiClient.get('/robots', { params: { restaurantId } }).catch(() => ({ data: [] }))
      ])

      const allOrders = ordersRes.data as any[]
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today)
      const completedToday = todayOrders.filter(o => o.status === 'Delivered')
      const todaySales = completedToday.reduce((s, o) => s + (o.total ?? 0), 0)
      const pendingOrders = allOrders.filter(o => ['Pending', 'Confirmed', 'Preparing'].includes(o.status)).length

      const robots = robotsRes.data as any[]
      const activeRobots = robots.filter(r => r.isOnline).length

      setLiveStats({ todaySales, todayOrders: todayOrders.length, pendingOrders, activeRobots })
    } catch (e) {
      console.error('Failed to load live stats', e)
    } finally {
      setLoadingLive(false)
    }
  }, [restaurantId])

  // 2. Load Analytics Arrays
  const loadAnalytics = useCallback(async (startDate: string, endDate: string) => {
    if (!restaurantId || !startDate || !endDate) return

    setLoadingAnalytics(true)
    try {
      const [rev, menu, cust] = await Promise.all([
        analyticsApi.getRevenueTrends(restaurantId, startDate, endDate),
        analyticsApi.getMenuAnalytics(restaurantId, startDate, endDate),
        analyticsApi.getCustomerInsights(restaurantId, startDate, endDate),
      ])

      setRevenueData(rev)
      setMenuData(menu)
      setCustomerData(cust)
    } catch (error) {
      console.error('Failed to load analytics charts', error)
    } finally {
      setLoadingAnalytics(false)
    }
  }, [restaurantId])

  useEffect(() => {
    loadLiveStats()
  }, [loadLiveStats])

  useEffect(() => {
    if (!activeDates.startDate || !activeDates.endDate) return
    loadAnalytics(activeDates.startDate, activeDates.endDate)
  }, [restaurantId, selectedTimeframe, appliedStart, appliedEnd, loadAnalytics])

  useEffect(() => {
    if (!restaurantId) return
    socket.on(`order:new:${restaurantId}`, loadLiveStats)
    socket.on(`order:updated:${restaurantId}`, loadLiveStats)
    return () => {
      socket.off(`order:new:${restaurantId}`, loadLiveStats)
      socket.off(`order:updated:${restaurantId}`, loadLiveStats)
    }
  }, [restaurantId, loadLiveStats])

  const handleApplyCustom = () => {
    setAppliedStart(customStart)
    setAppliedEnd(customEnd)
  }

  const liveCards = [
    { label: "Today's Revenue", value: loadingLive ? '...' : `₹${liveStats.todaySales.toFixed(0)}`, icon: IndianRupee, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
    { label: "Today's Orders", value: loadingLive ? '...' : liveStats.todayOrders, icon: ShoppingBag, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { label: 'Active Orders', value: loadingLive ? '...' : liveStats.pendingOrders, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Robots Online', value: loadingLive ? '...' : liveStats.activeRobots, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ]

  // Chart config variables
  const textColor = isDark ? '#e4e4e7' : '#52525b'

  // Data processing for charts
  const lineData = useMemo(() => {
    if (!revenueData) return []
    const sorted = [...revenueData.trends].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return sorted.map(t => ({
      name: new Date(t.date).getDate().toString(),
      revenue: t.revenue,
      orders: t.volume
    }))
  }, [revenueData])

  const peakHoursData = useMemo(() => {
    if (!revenueData) return []
    return revenueData.peakHours.filter(h => h.count > 0).map(h => ({
      hour: `${h.hour}:00`,
      count: h.count
    }))
  }, [revenueData])

  const pieColors = ['#4ade80', '#60a5fa', '#f87171', '#c084fc', '#facc15']
  const categoryPieData = useMemo(() => {
    if (!menuData) return []
    return menuData.categoryPerformance.slice(0, 5).map(cat => ({
      name: cat.name,
      value: cat.revenue
    }))
  }, [menuData])

  const customerPieData = [
    { name: 'New', value: customerData?.newCustomers ?? 0 },
    { name: 'Returning', value: customerData?.returningCustomers ?? 0 }
  ]
  const custColors = ['#4ade80', '#60a5fa']

  return (
    <div className="p-8 bg-zinc-50 dark:bg-zinc-950 min-h-full transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard & Analytics</h1>
        <p className="text-zinc-500 mt-1 text-sm">Live overview of your restaurant operations and historical analytics.</p>
      </div>

      {/* Live Stats */}
      <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-200">Live Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {liveCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`bg-white dark:bg-zinc-900 border ${card.border} rounded-2xl p-6 flex flex-col gap-4 transition-colors duration-300 shadow-sm`}>
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

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-200">Historical Analytics</h2>

        <div className="flex items-center gap-2">
          {CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => {
                setSelectedTimeframe(chip.value)
                if (chip.value !== 'custom') { setAppliedStart(''); setAppliedEnd(''); }
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTimeframe === chip.value 
                  ? 'bg-accent text-white shadow-md' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Selector */}
      {selectedTimeframe === 'custom' && (
        <div className="flex items-end gap-4 mb-8 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">From</label>
            <input 
              type="text" 
              placeholder="YYYY-MM-DD" 
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">To</label>
            <input 
              type="text" 
              placeholder="YYYY-MM-DD" 
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white outline-none focus:border-accent"
            />
          </div>
          <button 
            onClick={handleApplyCustom} 
            className="px-4 py-2 bg-accent text-white font-medium rounded-lg hover:opacity-90"
          >
            Apply
          </button>
        </div>
      )}

      {loadingAnalytics ? (
        <div className="flex flex-col items-center justify-center p-20 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
          <p>Loading analytics data...</p>
        </div>
      ) : !revenueData || !menuData || !customerData ? (
        <div className="p-10 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          No data available for the selected period.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Chart */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Revenue Trends</h3>
              <p className="text-zinc-500 text-sm">{activeSubLabel}</p>
            </div>
            {lineData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="revenue" stroke="#a3e635" strokeWidth={3} dot={{ r: 4, fill: '#a3e635', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#27272a' : '#e4e4e7', borderRadius: '12px' }}
                      itemStyle={{ color: isDark ? '#fff' : '#000' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-zinc-500 italic">No trend data available</div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Peak Hours</h3>
                <p className="text-zinc-500 text-sm">Order volume by hour of day</p>
              </div>
              {peakHoursData.length > 0 ? (
                <div className="h-64 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHoursData}>
                      <XAxis dataKey="hour" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <Tooltip cursor={{ fill: 'rgba(163, 230, 53, 0.1)' }} contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#27272a' : '#e4e4e7', borderRadius: '12px' }} />
                      <Bar dataKey="count" fill="#a3e635" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-zinc-500 italic flex-1">No peak hours data available</div>
              )}
            </div>

            {/* Top Selling Items */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Top Selling Items</h3>
                <p className="text-zinc-500 text-sm">{activeSubLabel}</p>
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {menuData.popularItems.slice(0, 5).map(item => {
                  let badgeBg = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  if (item.type === 'Star') badgeBg = 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                  if (item.type === 'Plowhorse') badgeBg = 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                  if (item.type === 'Puzzle') badgeBg = 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                  if (item.type === 'Dog') badgeBg = 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'

                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-zinc-500">{item.quantity} sold • ₹{item.revenue}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${badgeBg}`}>
                        {item.type}
                      </span>
                    </div>
                  )
                })}
                {menuData.popularItems.length === 0 && (
                  <p className="py-4 text-center text-zinc-500 italic">No items sold.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Category Breakdown */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Category Breakdown</h3>
                <p className="text-zinc-500 text-sm">Revenue by category</p>
              </div>
              {categoryPieData.length > 0 ? (
                <div className="h-64 flex items-center">
                  <div className="flex-1 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none">
                          {categoryPieData.map((_, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#27272a' : '#e4e4e7', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/3 flex flex-col gap-2">
                    {categoryPieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                        <span className="text-sm text-zinc-600 dark:text-zinc-300 truncate font-medium">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-zinc-500 italic">No category data</div>
              )}
            </div>

            {/* Customer Insights & Top Spenders */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Customer Insights</h3>
                <p className="text-zinc-500 text-sm">New vs Returning</p>
              </div>
              <div className="h-40 flex items-center">
                {(customerData.newCustomers > 0 || customerData.returningCustomers > 0) ? (
                  <>
                    <div className="flex-1 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={customerPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} stroke="none">
                            {customerPieData.map(c => <Cell key={c.name} fill={c.name === 'New' ? custColors[0] : custColors[1]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#27272a' : '#e4e4e7', borderRadius: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/3 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: custColors[0] }} />
                        <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">New</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: custColors[1] }} />
                        <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">Returning</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex w-full items-center justify-center text-zinc-500 italic h-full">No customer data</div>
                )}
              </div>
              
              <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider mb-3">Top Spenders</h4>
                <div className="space-y-3 max-h-[140px] overflow-auto pr-2">
                  {customerData.topSpenders.slice(0, 3).map((cust, idx) => (
                    <div key={cust.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-zinc-900 dark:text-white">{idx + 1}. {cust.name}</p>
                        <p className="text-xs text-zinc-500">{cust.orderCount} orders</p>
                      </div>
                      <p className="font-bold text-sm text-green-600 dark:text-green-400">₹{cust.totalSpent.toFixed(0)}</p>
                    </div>
                  ))}
                  {customerData.topSpenders.length === 0 && (
                    <p className="text-xs text-zinc-500 italic">No top spenders yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
