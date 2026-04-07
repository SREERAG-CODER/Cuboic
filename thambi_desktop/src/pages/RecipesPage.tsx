import { useState, useEffect, useRef } from 'react'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'
import * as XLSX from 'xlsx'

type MenuItem = { id: string; name: string; category?: string; price?: number; veg?: boolean }
type InventoryItem = { id: string; name: string; unit: string }

type Ingredient = {
  inventoryItemId: string
  name: string
  quantity: number
  unit: string
}

export default function RecipesPage() {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  
  const [selectedMenuId, setSelectedMenuId] = useState<string>('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. Fetch Menu & Inventory on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.restaurantId || !user?.outletId) return
      try {
        const [menuRes, invRes] = await Promise.all([
          apiClient.get(`/menu?restaurantId=${user.restaurantId}`),
          apiClient.get(`/inventory/items?outletId=${user.outletId}`)
        ])
        setMenuItems(menuRes.data)
        setInventoryItems(invRes.data)
        if (menuRes.data.length > 0) {
          setSelectedMenuId(menuRes.data[0].id)
        }
      } catch (e) {
        console.error("Failed to fetch data for recipes", e)
      }
    }
    fetchData()
  }, [user])

  // 2. Fetch existing recipe when selected menu changes
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!selectedMenuId) return
      setLoading(true)
      try {
        const { data } = await apiClient.get(`/recipes/menu-item/${selectedMenuId}`)
        if (data) {
          setIngredients(data.ingredients.map((ing: any) => ({
            inventoryItemId: ing.inventoryItemId,
            name: ing.inventoryItem.name,
            quantity: ing.quantity,
            unit: ing.inventoryItem.unit
          })))
          setInstructions(data.instructions || '')
        } else {
          setIngredients([])
          setInstructions('')
        }
      } catch (e) {
        // 404 or no recipe exists is fine, just reset
        setIngredients([])
        setInstructions('')
      } finally {
        setLoading(false)
      }
    }
    fetchRecipe()
  }, [selectedMenuId])

  const activeMenuItem = menuItems.find(m => m.id === selectedMenuId)

  const handleAddIngredient = (invId: string) => {
    if (!invId) return
    const invItem = inventoryItems.find(i => i.id === invId)
    if (!invItem) return
    
    if (ingredients.some(ing => ing.inventoryItemId === invId)) return

    setIngredients([...ingredients, { 
      inventoryItemId: invItem.id, 
      name: invItem.name, 
      quantity: 0, 
      unit: invItem.unit 
    }])
  }

  const handleUpdateIngredient = (invId: string, quantity: number) => {
    setIngredients(prev => prev.map(ing => ing.inventoryItemId === invId ? { ...ing, quantity } : ing))
  }

  const handleRemoveIngredient = (invId: string) => {
    setIngredients(prev => prev.filter(ing => ing.inventoryItemId !== invId))
  }

  const handleSaveRecipe = async () => {
    if (!selectedMenuId) return
    try {
      await apiClient.post('/recipes', {
        menuItemId: selectedMenuId,
        ingredients: ingredients.map(ing => ({
          inventoryItemId: ing.inventoryItemId,
          quantity: ing.quantity
        })),
        instructions
      })
      alert(`Recipe for ${activeMenuItem?.name} saved successfully!`)
    } catch (e) {
      console.error("Save recipe failed", e)
      alert("Failed to save recipe")
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMenu = async () => {
      if (!user?.restaurantId) return;
      try {
        const { data } = await apiClient.get(`/menu?restaurantId=${user.restaurantId}`);
        setMenuItems(data);
      } catch (e) {
        console.error("Failed to fetch menu", e);
      }
  };

  const handleExportMenu = () => {
    if (menuItems.length === 0) return alert('No data to export');

    const worksheetData = menuItems.map(item => ({
      'ID (Do Not Edit)': item.id,
      'Name': item.name,
      'Category': item.category || 'General',
      'Price (₹)': item.price || 0,
      'Vegetarian': item.veg ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu");
    XLSX.writeFile(wb, "Menu_Export.xlsx");
  };

  const handleImportMenu = (e: React.ChangeEvent<HTMLInputElement>) => {
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
             price: parseFloat(row['Price (₹)'])
           }
        })).filter(u => u.id); // Only update items with an ID
        
        if (updates.length > 0) {
            await apiClient.patch(`/menu/bulk?restaurantId=${user?.restaurantId}`, updates);
            alert(`Successfully updated ${updates.length} menu items from Excel.`);
        }
        
        fetchMenu();
      } catch (err) {
         console.error(err);
         alert('Failed to import menu Excel file.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white p-8 overflow-hidden gap-8 transition-colors duration-300">
      
      {/* Left: Menu Item Selector */}
      <div className="w-1/3 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/50">
          <h2 className="text-lg font-bold">Menu Items</h2>
          <p className="text-zinc-500 text-sm">Select an item to configure its recipe</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedMenuId(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                selectedMenuId === item.id
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/50 flex flex-col gap-2">
           <button 
                onClick={handleExportMenu}
                className="w-full text-xs px-3 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold rounded hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-500/20"
            >
                Export Menu (Excel)
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs px-3 py-2 bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 font-semibold rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors border border-zinc-300 dark:border-zinc-700"
            >
                Import Menu (Excel)
            </button>
            <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={handleImportMenu} />
        </div>
      </div>

      {/* Right: Recipe Builder */}
      <div className="w-2/3 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl relative z-10 transition-colors duration-300">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
          <div>
            <h2 className="text-2xl font-bold text-accent">{activeMenuItem?.name} Recipe</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">These ingredients will automatically deduct from inventory when ordered.</p>
          </div>
          <button 
            onClick={handleSaveRecipe}
            className="bg-accent hover:bg-accent active:bg-accent-dark text-white font-medium px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Recipe
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500 italic">
               Loading Recipe Data...
            </div>
          ) : (
            <>
              {/* Ingredients Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-200">Ingredients (BOM)</h3>
                  <select 
                    onChange={(e) => {
                      handleAddIngredient(e.target.value)
                      e.target.value = "" // reset
                    }}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent text-zinc-900 dark:text-white transition-colors duration-300"
                  >
                    <option value="">+ Add Ingredient...</option>
                    {inventoryItems.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors duration-300">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-6 py-4 font-medium">Inventory Item</th>
                        <th className="px-6 py-4 font-medium">Quantity Deducted</th>
                        <th className="px-6 py-4 font-medium w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {ingredients.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No ingredients added yet.</td>
                        </tr>
                      ) : (
                        ingredients.map(ing => (
                          <tr key={ing.inventoryItemId} className="hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                              {ing.name}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  step="0.001"
                                  value={ing.quantity}
                                  onChange={(e) => handleUpdateIngredient(ing.inventoryItemId, parseFloat(e.target.value))}
                                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 w-24 text-zinc-900 dark:text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-300" 
                                />
                                <span className="text-zinc-500 text-sm font-medium">{ing.unit}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleRemoveIngredient(ing.inventoryItemId)}
                                className="text-zinc-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Instructions Section */}
              <section>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-200 mb-4">Preparation Instructions (Optional)</h3>
                <textarea
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none h-32 transition-colors duration-300"
                  placeholder="e.g. Heat oil in pan. Add ingredients..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </section>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

