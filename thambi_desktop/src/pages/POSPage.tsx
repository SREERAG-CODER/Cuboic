import { useState, useEffect } from 'react'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'

type OrderType = 'Dine-In' | 'Takeaway' | 'Delivery'
type MenuItem = { id: string; name: string; price: number; categoryId: string; is_available: boolean }
type Category = { id: string; name: string }
type Table = { id: string; table_number: string; is_active: boolean }

export default function POSPage() {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tables, setTables] = useState<Table[]>([])
  
  const [orderType, setOrderType] = useState<OrderType>('Dine-In')
  const [selectedTableId, setSelectedTableId] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState('All')
  const [cart, setCart] = useState<{item: MenuItem, qty: number}[]>([])

  const fetchData = async () => {
    if (!user?.restaurantId) return
    try {
      const [menuRes, catsRes, tablesRes] = await Promise.all([
        apiClient.get(`/menu?restaurantId=${user.restaurantId}`),
        apiClient.get(`/categories?restaurantId=${user.restaurantId}`),
        apiClient.get(`/restaurants/${user.restaurantId}/tables`)
      ])
      setMenuItems(menuRes.data)
      setCategories(catsRes.data)
      setTables((tablesRes.data as Table[]).filter((t: Table) => t.is_active ?? true))
    } catch (e) {
      console.error("Failed to fetch POS data", e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const filteredMenu = menuItems.filter(item => 
    activeCategoryId === 'All' || item.categoryId === activeCategoryId
  )

  const addToCart = (item: MenuItem) => {
    if (!item.is_available) return
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id)
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { item, qty: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.item.id === id) {
        const newQty = Math.max(0, c.qty + delta)
        return { ...c, qty: newQty }
      }
      return c
    }).filter(c => c.qty > 0))
  }

  const subtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.qty), 0)
  const gst = subtotal * 0.05
  const total = subtotal + gst

  const handleCreateOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty")
    if (orderType === 'Dine-In' && !selectedTableId) return alert("Select a table for Dine-In")
    
    try {
      // For Dine-In, use selected table UUID. For others, use first table as a dummy stand-in.
      const tableId = orderType === 'Dine-In'
        ? selectedTableId
        : (tables[0]?.id ?? '')

      const payload = {
        restaurantId: user?.restaurantId,
        outletId: user?.outletId,
        tableId,
        customerSessionId: `pos-${Date.now()}`,
        orderType: orderType === 'Dine-In' ? 'DineIn' : orderType,
        items: cart.map(c => ({ itemId: c.item.id, quantity: c.qty }))
      }

      const { data } = await apiClient.post('/orders', payload)
      
      // Trigger KOT print in electron
      if (window.ipcRenderer) {
         window.ipcRenderer.invoke('print:kot', 'Default_Printer', [
           { type: 'text', value: `KOT Order: #${data.id}`, style: 'font-weight: bold; text-align: center;' }
         ])
      }

      alert(`Order Created! ₹${total.toFixed(2)}\nKOT sent to printer.`)
      setCart([])
      setSelectedTableId('')
    } catch (e: any) {
      console.error("Order completion failed", e)
      alert(e.response?.data?.message || "Order Failed")
    }
  }

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      {/* LEFT PANE: Menu & Categories */}
      <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-900">
        
        {/* Header: Order Type & Meta */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm z-10 transition-colors duration-300">
          <div className="flex bg-zinc-100 dark:bg-zinc-950 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
            {['Dine-In', 'Takeaway', 'Delivery'].map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type as OrderType)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  orderType === type 
                    ? 'bg-accent shadow-lg text-white' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {orderType === 'Dine-In' && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-400">Table:</span>
              <select 
                value={selectedTableId} 
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="">Select Table</option>
                {tables.map(t => <option key={t.id} value={t.id}>{t.table_number}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-32 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
            <button
              onClick={() => setActiveCategoryId('All')}
              className={`w-full text-left px-4 py-4 text-xs font-semibold uppercase tracking-tighter transition-all border-l-4 ${
                activeCategoryId === 'All' 
                  ? 'border-accent bg-accent/10 text-accent dark:text-accent' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`w-full text-left px-4 py-4 text-xs font-semibold uppercase tracking-tighter transition-all border-l-4 ${
                  activeCategoryId === cat.id 
                    ? 'border-accent bg-accent/10 text-accent dark:text-accent' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="flex-1 p-6 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMenu.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={!item.is_available}
                  className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                    item.is_available 
                      ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-accent hover:bg-zinc-50 hover:dark:bg-zinc-800 cursor-pointer active:scale-95' 
                      : 'border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[2.5rem]">
                    {item.name}
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between w-full">
                    <span className="text-accent font-medium">₹{item.price}</span>
                    {!item.is_available && <span className="text-xs text-red-500 font-medium bg-red-500/10 px-2 py-1 rounded">Out of Stock</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Cart & Checkout */}
      <div className="w-96 bg-white dark:bg-zinc-900 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20 relative transition-colors duration-300">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm z-10">
          <h2 className="text-lg font-bold">Current Order</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{orderType} {selectedTableId ? `• ${tables.find(t => t.id === selectedTableId)?.table_number ?? ''}` : ''}</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(c => (
              <div key={c.item.id} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{c.item.name}</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">₹{c.item.price} x {c.qty}</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                  <button onClick={() => updateQty(c.item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300">-</button>
                  <span className="w-4 text-center text-sm font-medium">{c.qty}</span>
                  <button onClick={() => updateQty(c.item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded bg-accent hover:bg-accent text-white">+</button>
                </div>
                <div className="w-16 text-right font-medium text-sm">
                  ₹{c.item.price * c.qty}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 mt-auto transition-colors duration-300">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>GST (5%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800 border-dashed">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            onClick={handleCreateOrder}
            className="w-full bg-accent hover:bg-accent active:bg-accent-dark text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(101,163,13,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Pay & Print KOT
          </button>
        </div>

      </div>

    </div>
  )
}
