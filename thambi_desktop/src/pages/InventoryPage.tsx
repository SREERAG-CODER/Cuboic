import { useState, useEffect, useRef } from 'react'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'
import * as XLSX from 'xlsx'

type InventoryItem = {
  id: string
  name: string
  unit: string
  category: string
  currentStock: number
  reorderLevel: number
  costPerUnit: number
}

export default function InventoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  
  // Modals state
  const [isStockInModalOpen, setStockInModalOpen] = useState(false)
  const [isAdjustModalOpen, setAdjustModalOpen] = useState(false)
  const [isAddModalOpen, setAddModalOpen] = useState(false)

  // Add Item Form
  const [newItemName, setNewItemName] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('kg')
  const [newItemCategory, setNewItemCategory] = useState('Produce')
  const [newItemReorder, setNewItemReorder] = useState('5')
  const [newItemCost, setNewItemCost] = useState('0')
  
  // Stock In Form
  const [stockInQty, setStockInQty] = useState('')
  const [stockInCost, setStockInCost] = useState('')

  // Adjust Form
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustType, setAdjustType] = useState('Wastage')

  const fetchInventory = async () => {
    if (!user?.outletId) return
    try {
      const { data } = await apiClient.get(`/inventory/items?outletId=${user.outletId}`)
      setItems(data)
    } catch (e) {
      console.error("Failed to fetch inventory", e)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [user])

  const totalValue = items.reduce((acc, item) => acc + (item.currentStock * item.costPerUnit), 0)
  const lowStockCount = items.filter(i => i.currentStock <= i.reorderLevel).length

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    const qty = parseFloat(stockInQty)
    if (isNaN(qty) || qty <= 0) return

    try {
      await apiClient.post(`/inventory/items/${selectedItem.id}/stock-in`, {
        outletId: user?.outletId,
        quantity: qty,
        costPerUnit: parseFloat(stockInCost) || selectedItem.costPerUnit,
        referenceId: 'MANUAL_PROCUREMENT'
      })
      alert(`Successfully added ${qty}${selectedItem.unit} to ${selectedItem.name}`)
      
      setStockInModalOpen(false)
      setStockInQty('')
      setStockInCost('')
      fetchInventory() // Refresh
      if (selectedItem) {
          setSelectedItem({ ...selectedItem, currentStock: selectedItem.currentStock + qty })
      }
    } catch (err) {
      alert("Failed to stock in")
      console.error(err)
    }
  }

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    const qty = parseFloat(adjustQty)
    if (isNaN(qty) || qty <= 0) return

    try {
      await apiClient.post(`/inventory/items/${selectedItem.id}/adjust`, {
        outletId: user?.outletId,
        quantity: -qty, // deduct
        type: adjustType,
        notes: `Manual Adjustment: ${adjustType}`
      })
      alert(`Adjusted ${qty}${selectedItem.unit} from ${selectedItem.name}`)
      
      setAdjustModalOpen(false)
      setAdjustQty('')
      fetchInventory() // Refresh
      if (selectedItem) {
          setSelectedItem({ ...selectedItem, currentStock: Math.max(0, selectedItem.currentStock - qty) })
      }
    } catch (err) {
      alert("Failed to adjust stock")
      console.error(err)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.outletId) return

    try {
      await apiClient.post('/inventory/items', {
        outletId: user.outletId,
        name: newItemName,
        category: newItemCategory,
        unit: newItemUnit,
        reorderLevel: parseFloat(newItemReorder),
        costPerUnit: parseFloat(newItemCost),
        currentStock: 0
      })
      alert(`Ingredient ${newItemName} added successfully!`)
      setAddModalOpen(false)
      setNewItemName('')
      setNewItemCategory('Produce')
      setNewItemUnit('kg')
      setNewItemReorder('5')
      setNewItemCost('0')
      fetchInventory()
    } catch (err) {
      alert("Failed to add ingredient")
      console.error(err)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    if (items.length === 0) return alert('No data to export');

    const worksheetData = items.map(item => ({
      'ID (Do Not Edit)': item.id,
      'Item Name': item.name,
      'Category': item.category,
      'Current Stock': item.currentStock,
      'Unit': item.unit,
      'Cost Per Unit (₹)': item.costPerUnit,
      'Reorder Level': item.reorderLevel,
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "Inventory_Export.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        // Real processing: send bulk patch request
        const updates = data.map(row => ({
           id: row['ID (Do Not Edit)'],
           data: {
             costPerUnit: parseFloat(row['Cost Per Unit (₹)']),
             reorderLevel: parseFloat(row['Reorder Level'])
           }
        })).filter(u => u.id); // Only update items with an ID
        
        if (updates.length > 0) {
            await apiClient.patch(`/inventory/items/bulk?outletId=${user?.outletId}`, updates);
            alert(`Successfully updated ${updates.length} items from Excel.`);
        }
        
        fetchInventory();
      } catch (err) {
         console.error(err);
         alert('Failed to import Excel file. Please ensure it follows the exported format.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative transition-colors duration-300">
      
      {/* LEFT PANE: Inventory List */}
      <div className="flex-1 flex flex-col pt-6 px-8 h-full overflow-hidden">
        
        {/* Header Stats */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Watchtower</h1>
            <p className="text-zinc-400 text-sm mt-1">Real-time stock levels & procurement tracking</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <button 
                  onClick={() => setAddModalOpen(true)}
                  className="text-xs px-3 py-1.5 bg-accent text-zinc-900 font-bold rounded hover:bg-lime-400 transition-colors shadow-sm"
              >
                  + Add Ingredient
              </button>
              <button 
                  onClick={handleExportExcel}
                  className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold rounded hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-500/20"
              >
                  Export Data (Excel)
              </button>
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1.5 bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 font-semibold rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors border border-zinc-300 dark:border-zinc-700"
              >
                  Import Data (Excel)
              </button>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={handleImportExcel} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-3 transition-colors duration-300">
              <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Total Capital Value</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-white">₹{totalValue.toLocaleString()}</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-red-500">
              <span className="text-red-500/80 text-xs font-semibold uppercase tracking-wider block">Low Stock Alerts</span>
              <span className="text-xl font-bold">{lowStockCount} Items</span>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-8">
          <div className="grid gap-3">
            {items.map(item => {
              const isLowStock = item.currentStock <= item.reorderLevel
              const isSelected = selectedItem?.id === item.id
              
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-accent bg-accent/5 shadow-[0_0_20px_rgba(101,163,13,0.1)]' 
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-4 w-1/3">
                    <div className={`w-3 h-3 rounded-full ${isLowStock ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-emerald-500'}`} />
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                      <p className="text-xs text-zinc-500">{item.category} • ₹{item.costPerUnit}/{item.unit}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-1/3 justify-end">
                    <div className="text-right">
                      <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Stock Available</div>
                      <div className={`text-xl font-bold ${isLowStock ? 'text-red-500 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>
                        {item.currentStock} <span className="text-sm font-medium text-zinc-500">{item.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Action Center */}
      {selectedItem && (
        <div className="w-96 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-6 flex flex-col shadow-2xl relative z-10 animate-in slide-in-from-right duration-200 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Item Management</h2>
            <button onClick={() => setSelectedItem(null)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-colors">
              ✕
            </button>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-8 transition-colors duration-300">
            <h3 className="text-lg font-bold text-accent mb-1">{selectedItem.name}</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-xs text-zinc-500 block mb-1">Current Stock</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-white">{selectedItem.currentStock}{selectedItem.unit}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block mb-1">Reorder Level</span>
                <span className="text-lg font-medium text-zinc-600 dark:text-zinc-300">{selectedItem.reorderLevel}{selectedItem.unit}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            <button 
              onClick={() => setStockInModalOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(5,150,105,0.3)] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Procurement Stock-in
            </button>
            
            <button 
              onClick={() => setAdjustModalOpen(true)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Manual Adjustment
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY MODALS */}
      {isStockInModalOpen && selectedItem && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Stock In: {selectedItem.name}</h3>
            <form onSubmit={handleStockIn} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Quantity ({selectedItem.unit})</label>
                <input type="number" step="0.01" required value={stockInQty} onChange={e => setStockInQty(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Cost Per {selectedItem.unit} (Optional)</label>
                <input type="number" step="0.01" value={stockInCost} onChange={e => setStockInCost(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none" placeholder={selectedItem.costPerUnit.toString()} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStockInModalOpen(false)} className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdjustModalOpen && selectedItem && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-red-400">Reduce Stock: {selectedItem.name}</h3>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Quantity to Remove ({selectedItem.unit})</label>
                <input type="number" step="0.01" required value={adjustQty} onChange={e => setAdjustQty(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Reason</label>
                <select value={adjustType} onChange={e => setAdjustType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none">
                  <option value="Wastage">Wastage / Spoiled</option>
                  <option value="Correction">Inventory Correction</option>
                  <option value="StaffConsumption">Staff Consumption</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setAdjustModalOpen(false)} className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium">Confirm Deduct</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Add New Ingredient</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Name</label>
                <input required value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-zinc-400 mb-1">Unit</label>
                  <input required value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} placeholder="kg, L, pcs" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-zinc-400 mb-1">Category</label>
                  <input required value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-zinc-400 mb-1">Reorder Level</label>
                  <input type="number" required value={newItemReorder} onChange={e => setNewItemReorder(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-zinc-400 mb-1">Cost Per Unit (₹)</label>
                  <input type="number" step="0.01" required value={newItemCost} onChange={e => setNewItemCost(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none" />
                </div>
              </div>
               
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setAddModalOpen(false)} className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-accent text-zinc-900 hover:bg-lime-400 font-bold">Add Ingredient</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
