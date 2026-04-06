import { useState, useEffect } from 'react'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'

type MenuItem = { id: string; name: string }
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

  return (
    <div className="flex h-full bg-zinc-950 text-white p-8 overflow-hidden gap-8">
      
      {/* Left: Menu Item Selector */}
      <div className="w-1/3 flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
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
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Recipe Builder */}
      <div className="w-2/3 flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl relative z-10">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div>
            <h2 className="text-2xl font-bold text-accent">{activeMenuItem?.name} Recipe</h2>
            <p className="text-zinc-400 text-sm mt-1">These ingredients will automatically deduct from inventory when ordered.</p>
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
                  <h3 className="text-lg font-bold text-zinc-200">Ingredients (BOM)</h3>
                  <select 
                    onChange={(e) => {
                      handleAddIngredient(e.target.value)
                      e.target.value = "" // reset
                    }}
                    className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                  >
                    <option value="">+ Add Ingredient...</option>
                    {inventoryItems.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-900 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-6 py-4 font-medium">Inventory Item</th>
                        <th className="px-6 py-4 font-medium">Quantity Deducted</th>
                        <th className="px-6 py-4 font-medium w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {ingredients.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No ingredients added yet.</td>
                        </tr>
                      ) : (
                        ingredients.map(ing => (
                          <tr key={ing.inventoryItemId} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">
                              {ing.name}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  step="0.001"
                                  value={ing.quantity}
                                  onChange={(e) => handleUpdateIngredient(ing.inventoryItemId, parseFloat(e.target.value))}
                                  className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 w-24 text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                                />
                                <span className="text-zinc-500 text-sm font-medium">{ing.unit}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleRemoveIngredient(ing.inventoryItemId)}
                                className="text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
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
                <h3 className="text-lg font-bold text-zinc-200 mb-4">Preparation Instructions (Optional)</h3>
                <textarea
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none h-32"
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

