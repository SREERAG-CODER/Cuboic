import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'
import socket from '../api/socket'
import { UtensilsCrossed, Clock, CheckCircle, XCircle, ChevronRight, RefreshCw } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
interface Table {
  id: string
  table_number: string
  is_active: boolean
}

interface OrderItem {
  name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  tableId: string
  table?: { id: string; table_number: string }
  orderType: string
  items: OrderItem[]
  notes?: string
  subtotal: number
  tax: number
  total: number
  status: string
  createdAt: string
}

const ACTIVE_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Assigned']

const STATUS_COLOR: Record<string, string> = {
  Pending:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Confirmed: 'text-sky-400  bg-sky-400/10  border-sky-400/20',
  Preparing: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  Ready:     'text-green-400 bg-green-400/10 border-green-400/20',
  Assigned:  'text-sky-400  bg-sky-400/10  border-sky-400/20',
  Delivered: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  Cancelled: 'text-red-400  bg-red-400/10  border-red-400/20',
}

const NEXT_STATUS: Record<string, string> = {
  Pending:   'Confirmed',
  Confirmed: 'Preparing',
  Preparing: 'Ready',
  Ready:     'Delivered',
}

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diff < 1) return 'Just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { user } = useAuth()
  const [tables, setTables]           = useState<Table[]>([])
  const [orders, setOrders]           = useState<Order[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [filter, setFilter]           = useState<'all' | 'free' | 'occupied'>('all')
  const [loading, setLoading]         = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // ── Data fetching ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user?.restaurantId) return
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        apiClient.get<Table[]>(`/restaurants/${user.restaurantId}/tables`),
        apiClient.get<Order[]>('/orders', {
          params: { restaurantId: user.restaurantId }
        })
      ])
      
      console.log('📡 OrdersPage Data Fetch:', {
        tablesCount: tablesRes.data.length,
        ordersCount: ordersRes.data.length,
        restaurantId: user.restaurantId
      });

      // Filter tables safely
      const filteredTables = tablesRes.data.filter(t => t.is_active !== false);
      setTables(filteredTables)
      setOrders(ordersRes.data)
      setLastRefresh(new Date())
    } catch (e: any) {
      console.error('❌ Failed to load orders/tables:', e.response?.data || e.message)
    } finally {
      setLoading(false)
    }
  }, [user?.restaurantId])

  useEffect(() => { load() }, [load])

  // ── Real-time Socket ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.restaurantId) return
    const rId = user.restaurantId
    const handleOrderNew     = () => load()
    const handleOrderUpdated = () => load()
    socket.on(`order:new:${rId}`,     handleOrderNew)
    socket.on(`order:updated:${rId}`, handleOrderUpdated)
    return () => {
      socket.off(`order:new:${rId}`,     handleOrderNew)
      socket.off(`order:updated:${rId}`, handleOrderUpdated)
    }
  }, [user?.restaurantId, load])

  // ── Computed Values ─────────────────────────────────────────────────────
  // Map table_id → its most recent active order
  const activeOrderByTableId = new Map<string, Order>()
  orders.forEach(o => {
    if (ACTIVE_STATUSES.includes(o.status) && o.orderType === 'DineIn') {
      const existing = activeOrderByTableId.get(o.tableId)
      if (!existing || new Date(o.createdAt) > new Date(existing.createdAt)) {
        activeOrderByTableId.set(o.tableId, o)
      }
    }
  })

  const selectedOrder = selectedTable
    ? activeOrderByTableId.get(selectedTable.id) ?? null
    : null

  // ── Actions ─────────────────────────────────────────────────────────────
  const advanceStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setActionLoading(true)
    try {
      await apiClient.patch(`/orders/${order.id}/status`, { status: next })
      await load()
    } catch (e) { console.error(e) }
    finally { setActionLoading(false) }
  }

  const cancelOrder = async (order: Order) => {
    if (!confirm('Cancel this order?')) return
    setActionLoading(true)
    try {
      await apiClient.patch(`/orders/${order.id}/status`, { status: 'Cancelled' })
      setSelectedTable(null)
      await load()
    } catch (e) { console.error(e) }
    finally { setActionLoading(false) }
  }

  // ── Summary Stats ────────────────────────────────────────────────────────
  const occupiedCount = activeOrderByTableId.size
  const pendingCount  = orders.filter(o => o.status === 'Pending').length
  const readyCount    = orders.filter(o => o.status === 'Ready').length

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading floor plan…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-zinc-950 text-white overflow-hidden">

      {/* ── LEFT: Table Grid ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Live Floor Plan</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Updated {timeAgo(lastRefresh.toISOString())}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {/* Quick-stat pills */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                {occupiedCount} Occupied
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded-full text-xs font-medium text-amber-400">
                <Clock size={12} />
                {pendingCount} Pending
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded-full text-xs font-medium text-green-400">
                <CheckCircle size={12} />
                {readyCount} Ready
              </div>
            </div>
            
            <div className="flex items-center bg-zinc-800 rounded-lg p-1">
              {(['all', 'free', 'occupied'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === f ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-2 bg-zinc-950 border-b border-zinc-800/50 flex items-center gap-6 text-xs text-zinc-500 flex-shrink-0">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-accent bg-accent/10 inline-block"></span> Occupied</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-zinc-700 bg-zinc-900 inline-block"></span> Free</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/10 inline-block"></span> Order Ready</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-amber-500 bg-amber-500/10 inline-block"></span> Pending</span>
        </div>

        {/* Table Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {tables.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600">
              <UtensilsCrossed size={48} className="mb-4 opacity-30" />
              <p className="font-medium">No tables found</p>
              <p className="text-sm mt-1">Check restaurant configuration</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tables
                .filter(table => {
                  const activeOrder = activeOrderByTableId.get(table.id)
                  const isOccupied = !!activeOrder
                  if (filter === 'free') return !isOccupied
                  if (filter === 'occupied') return isOccupied
                  return true
                })
                .map(table => {
                const activeOrder = activeOrderByTableId.get(table.id)
                const isSelected  = selectedTable?.id === table.id
                const isReady     = activeOrder?.status === 'Ready'
                const isPending   = activeOrder?.status === 'Pending'
                const isOccupied  = !!activeOrder

                let borderClass = 'border-zinc-700 hover:border-zinc-500'
                let bgClass     = 'bg-zinc-900 hover:bg-zinc-800'
                let dotColor    = 'bg-zinc-600'
                let labelColor  = 'text-zinc-400'

                if (isOccupied) {
                  if (isReady) {
                    borderClass = 'border-green-500/60 hover:border-green-400'
                    bgClass     = 'bg-green-500/5 hover:bg-green-500/10'
                    dotColor    = 'bg-green-500 animate-pulse'
                    labelColor  = 'text-green-400'
                  } else if (isPending) {
                    borderClass = 'border-amber-500/60 hover:border-amber-400'
                    bgClass     = 'bg-amber-500/5 hover:bg-amber-500/10'
                    dotColor    = 'bg-amber-400 animate-pulse'
                    labelColor  = 'text-amber-400'
                  } else {
                    borderClass = 'border-accent/60 hover:border-accent'
                    bgClass     = 'bg-accent/5 hover:bg-accent/10'
                    dotColor    = 'bg-accent'
                    labelColor  = 'text-accent'
                  }
                }

                if (isSelected) {
                  borderClass = borderClass.replace('hover:', '') + ' ring-2 ring-white/20'
                }

                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(isSelected ? null : table)}
                    className={`relative flex flex-col items-center justify-center aspect-square rounded-2xl border-2 transition-all cursor-pointer ${borderClass} ${bgClass}`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mb-2 ${dotColor}`} />
                    <span className="text-lg font-bold text-white">{table.table_number}</span>
                    {isOccupied && (
                      <>
                        <span className={`text-[10px] font-semibold ${labelColor} mt-1`}>
                          {activeOrder?.status}
                        </span>
                        <span className="text-[9px] text-zinc-500 mt-0.5">
                          {timeAgo(activeOrder!.createdAt)}
                        </span>
                      </>
                    )}
                    {!isOccupied && (
                      <span className="text-[10px] text-zinc-600 mt-1">Free</span>
                    )}
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 bg-white text-zinc-950 rounded-full">
                        <ChevronRight size={14} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Inspector Panel (ONLY RENDER IF SELECTED) ───────────────── */}
      {selectedTable && (
        <div className="w-96 flex flex-col border-l border-zinc-800 bg-zinc-900 animate-in slide-in-from-right duration-300">
          {/* Panel Header */}
          <div className="p-5 border-b border-zinc-800 flex items-start justify-between flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold">Table {selectedTable.table_number}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedOrder ? 'Active order in progress' : 'No active orders'}
              </p>
            </div>
            <button
              onClick={() => setSelectedTable(null)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
            >
              <XCircle size={18} />
            </button>
          </div>

          {/* Panel Body */}
          {!selectedOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-600">
              <UtensilsCrossed size={48} className="mb-4 opacity-30" />
              <p className="font-medium">Table is free</p>
              <p className="text-sm mt-1 text-center">No active dine-in order for this table</p>
            </div>
          ) : (
            <>
              {/* Order Meta */}
              <div className="p-5 border-b border-zinc-800 space-y-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Order ID</span>
                  <span className="text-xs font-mono text-zinc-300">#{selectedOrder.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Placed</span>
                  <span className="text-xs text-zinc-300">{new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {timeAgo(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Status</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[selectedOrder.status] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="flex-1 overflow-y-auto p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-800">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-zinc-100 truncate">{item.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">₹{item.unit_price} × {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm text-white ml-4">₹{(item.unit_price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                {selectedOrder.notes && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs font-semibold text-amber-400 mb-1">Notes</p>
                    <p className="text-sm text-amber-200">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Totals & Actions */}
              <div className="p-5 border-t border-zinc-800 flex-shrink-0 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Tax</span>
                    <span>₹{selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1.5 border-t border-zinc-800 border-dashed">
                    <span>Total</span>
                    <span>₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {NEXT_STATUS[selectedOrder.status] && (
                    <button
                      onClick={() => advanceStatus(selectedOrder)}
                      disabled={actionLoading}
                      className="w-full bg-accent hover:bg-accent-dark text-zinc-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Mark as {NEXT_STATUS[selectedOrder.status]}
                        </>
                      )}
                    </button>
                  )}
                  {!['Delivered', 'Cancelled'].includes(selectedOrder.status) && (
                    <button
                      onClick={() => cancelOrder(selectedOrder)}
                      disabled={actionLoading}
                      className="w-full bg-zinc-800 hover:bg-red-500/20 hover:border-red-500/40 border border-zinc-700 text-zinc-300 hover:text-red-400 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      Cancel Order
                    </button>
                  )}
                  {selectedOrder.status === 'Delivered' && (
                    <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium py-2">
                      <CheckCircle size={16} />
                      Order Completed
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  )
}
