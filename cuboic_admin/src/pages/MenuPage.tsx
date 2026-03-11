import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { menuApi, type AdminMenuItem, type Category } from '../api/menu'
import { showToast } from '../components/Toast'
import './MenuPage.css'

const EMPTY_FORM = {
    name: '',
    description: '',
    price: '',
    image_url: '',
    categoryId: '',
    is_available: true,
}

type FormState = typeof EMPTY_FORM

export default function MenuPage() {
    const { user } = useAuth()
    const restaurantId = user?.restaurantId ?? ''

    const [items, setItems] = useState<AdminMenuItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [filterCat, setFilterCat] = useState<string>('all')

    // Modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    const load = useCallback(async () => {
        if (!restaurantId) return
        try {
            const [itemsRes, catsRes] = await Promise.all([
                menuApi.getAll(restaurantId),
                menuApi.getCategories(restaurantId),
            ])
            setItems(itemsRes.data)
            setCategories(catsRes.data)
        } catch {
            showToast('Error', 'Failed to load menu items', 'warning')
        } finally {
            setLoading(false)
        }
    }, [restaurantId])

    useEffect(() => { load() }, [load])

    // Toggle availability inline (no modal needed)
    const toggleAvailability = async (item: AdminMenuItem) => {
        try {
            await menuApi.updateItem(item.id, { is_available: !item.is_available })
            setItems(prev =>
                prev.map(i => i.id === item.id ? { ...i, is_available: !item.is_available } : i)
            )
            showToast(
                item.is_available ? 'Marked Unavailable' : 'Marked Available',
                item.name,
                'info',
            )
        } catch {
            showToast('Error', 'Could not update availability', 'warning')
        }
    }

    // Open modal for new item
    const openAddModal = () => {
        setEditingId(null)
        setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? '' })
        setModalOpen(true)
    }

    // Open modal to edit existing item
    const openEditModal = (item: AdminMenuItem) => {
        setEditingId(item.id)
        setForm({
            name: item.name,
            description: item.description ?? '',
            price: String(item.price),
            image_url: item.image_url ?? '',
            categoryId: item.categoryId,
            is_available: item.is_available,
        })
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditingId(null)
    }

    const handleSave = async () => {
        if (!form.name.trim()) { showToast('Validation', 'Name is required', 'warning'); return }
        const price = parseFloat(form.price)
        if (isNaN(price) || price < 0) { showToast('Validation', 'Enter a valid price', 'warning'); return }
        if (!form.categoryId) { showToast('Validation', 'Select a category', 'warning'); return }

        setSaving(true)
        try {
            if (editingId) {
                const res = await menuApi.updateItem(editingId, {
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    price,
                    image_url: form.image_url.trim() || undefined,
                    categoryId: form.categoryId,
                    is_available: form.is_available,
                })
                setItems(prev => prev.map(i => i.id === editingId ? res.data : i))
                showToast('Saved', `"${res.data.name}" updated`, 'success')
            } else {
                const res = await menuApi.createItem({
                    restaurantId: restaurantId,
                    categoryId: form.categoryId,
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    price,
                    image_url: form.image_url.trim() || undefined,
                    is_available: form.is_available,
                })
                setItems(prev => [...prev, res.data])
                showToast('Created', `"${res.data.name}" added to menu`, 'success')
            }
            closeModal()
        } catch {
            showToast('Error', 'Failed to save item', 'warning')
        } finally {
            setSaving(false)
        }
    }

    const visibleItems = filterCat === 'all'
        ? items
        : items.filter(i => i.categoryId === filterCat || String(i.categoryId) === filterCat)

    const getCategoryName = (id: string) =>
        categories.find(c => c.id === id || String(c.id) === id)?.name ?? '—'

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2>Menu</h2>
                    <p className="page-sub">{items.length} items · {items.filter(i => !i.is_available).length} unavailable</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>+ Add Item</button>
            </div>

            {/* Category filter tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filterCat === 'all' ? 'tab-active' : ''}`}
                    onClick={() => setFilterCat('all')}
                >
                    All ({items.length})
                </button>
                {categories.map(cat => {
                    const count = items.filter(i => i.categoryId === cat.id || String(i.categoryId) === cat.id).length
                    return (
                        <button
                            key={cat.id}
                            className={`filter-tab ${filterCat === cat.id ? 'tab-active' : ''}`}
                            onClick={() => setFilterCat(cat.id)}
                        >
                            {cat.name} ({count})
                        </button>
                    )
                })}
            </div>

            {loading ? (
                <div className="loading-msg">Loading menu…</div>
            ) : visibleItems.length === 0 ? (
                <div className="empty-state"><p>No items found.</p></div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Available</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleItems.map(item => (
                                <tr key={item.id} className={!item.is_available ? 'row-unavailable' : ''}>
                                    <td>
                                        <div className="menu-item-cell">
                                            {item.image_url && (
                                                <img
                                                    className="menu-item-thumb"
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                                                />
                                            )}
                                            <div>
                                                <div className="menu-item-name">{item.name}</div>
                                                {item.description && (
                                                    <div className="menu-item-desc">{item.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{getCategoryName(item.categoryId)}</td>
                                    <td className="cell-mono">₹{item.price.toFixed(2)}</td>
                                    <td>
                                        <button
                                            className={`avail-toggle ${item.is_available ? 'avail-on' : 'avail-off'}`}
                                            onClick={() => toggleAvailability(item)}
                                            title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                                        >
                                            <span className="avail-knob" />
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => openEditModal(item)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit / Add Modal */}
            {modalOpen && (
                <>
                    <div className="modal-overlay" onClick={closeModal} />
                    <div className="modal" role="dialog" aria-label={editingId ? 'Edit item' : 'Add item'}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Item Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Paneer Tikka"
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Short description (optional)"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={form.categoryId}
                                        onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                                    >
                                        <option value="">— Select —</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    value={form.image_url}
                                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                                    placeholder="https://…"
                                />
                            </div>

                            <div className="form-group form-inline">
                                <label>Available</label>
                                <button
                                    type="button"
                                    className={`avail-toggle ${form.is_available ? 'avail-on' : 'avail-off'}`}
                                    onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
                                >
                                    <span className="avail-knob" />
                                </button>
                                <span style={{ fontSize: 13, color: 'var(--c-text-2)' }}>
                                    {form.is_available ? 'Yes — visible to customers' : 'No — hidden from menu'}
                                </span>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
