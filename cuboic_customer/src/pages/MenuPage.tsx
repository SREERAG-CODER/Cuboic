import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRestaurant, getCategories, getMenuItems, type Category, type MenuItem } from '../api/menu';
import { useCart } from '../hooks/useCart';
import { ItemCard } from '../components/ItemCard';
import { CartDrawer } from '../components/CartDrawer';
import './MenuPage.css';

// Stable session id per tab
const SESSION_ID = crypto.randomUUID();



export function MenuPage() {
    const [params] = useSearchParams();
    const restaurantId = params.get('r') ?? '';
    const tableId = params.get('t') ?? '';

    const [restaurantName, setRestaurantName] = useState('Cuboic Kitchen');
    const [categories, setCategories] = useState<Category[]>([]);
    const [allItems, setAllItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [cartOpen, setCartOpen] = useState(false);

    const cart = useCart();

    /* load restaurant + categories once */
    useEffect(() => {
        if (!restaurantId) return;
        Promise.all([getRestaurant(restaurantId), getCategories(restaurantId)]).then(([rest, cats]) => {
            setRestaurantName(rest.name);
            const sorted = cats.sort((a, b) => a.display_order - b.display_order);
            setCategories(sorted);
            setActiveCategory(null); // show all by default
        });
    }, [restaurantId]);

    /* load ALL items once, filter client-side */
    useEffect(() => {
        if (!restaurantId) return;
        setLoading(true);
        getMenuItems(restaurantId, undefined)
            .then(data => setAllItems(data))
            .finally(() => setLoading(false));
    }, [restaurantId]);

    /* filter items for active category */
    const visibleItems = useMemo(() => {
        if (!activeCategory) return allItems;
        return allItems.filter(item => item.category_id === activeCategory);
    }, [allItems, activeCategory]);

    /* group items by category for "All" view */
    const grouped = useMemo(() => {
        if (activeCategory) return null; // show flat list when filtering
        const map = new Map<string, MenuItem[]>();
        for (const cat of categories) map.set(cat._id, []);
        for (const item of allItems) {
            if (!map.has(item.category_id)) map.set(item.category_id, []);
            map.get(item.category_id)!.push(item);
        }
        return map;
    }, [allItems, categories, activeCategory]);

    const tableLabel = tableId ? `Table ${tableId.slice(-4).toUpperCase()}` : '';

    /* show QR hint if no params */
    if (!restaurantId) {
        return (
            <div className="menu-error fade-in">
                <h1 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Scan a table QR code</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Ask your server for the QR code to view the menu.
                </p>
            </div>
        );
    }

    return (
        <div className="menu-page">
            {/* ── Hero ──────────────────────────────── */}
            <div className="menu-hero">
                {/* Ambient glows */}
                <div className="menu-hero__glow" aria-hidden="true">
                    <div className="glow-orb glow-orb--1" />
                    <div className="glow-orb glow-orb--2" />
                    <div className="glow-orb glow-orb--3" />
                </div>

                {/* Top-right action area */}
                <div className="menu-hero__actions">
                    {tableLabel && (
                        <div className="table-tag">{tableLabel}</div>
                    )}
                    <button
                        className={`cart-btn ${cart.count > 0 ? 'cart-btn--active' : ''}`}
                        onClick={() => setCartOpen(true)}
                        aria-label="Open cart"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                        {cart.count > 0 && (
                            <span className="cart-btn__badge">{cart.count}</span>
                        )}
                    </button>
                </div>

                {/* Hero content */}
                <div className="menu-hero__content">
                    <div className="menu-hero__eyebrow">Cuboic · Robot Delivery</div>
                    <h1 className="menu-hero__title">{restaurantName}</h1>
                    <div className="menu-hero__badge">Robot is ready to serve</div>
                </div>
            </div>

            {/* ── Category pills ──────────────────── */}
            <div className="category-row">
                <div className="category-row__inner">
                    <button
                        className={`cat-pill ${activeCategory === null ? 'cat-pill--active' : ''}`}
                        onClick={() => setActiveCategory(null)}
                    >
                        All
                        <span className="cat-pill__count">{allItems.length}</span>
                    </button>
                    {categories.map(c => {
                        const count = allItems.filter(i => i.category_id === c._id).length;
                        return (
                            <button
                                key={c._id}
                                className={`cat-pill ${activeCategory === c._id ? 'cat-pill--active' : ''}`}
                                onClick={() => setActiveCategory(c._id)}
                            >
                                {c.name}
                                <span className="cat-pill__count">{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Items ───────────────────────────── */}
            <main className="container menu-body">
                {loading ? (
                    <div className="spinner-center"><div className="spinner" /></div>
                ) : visibleItems.length === 0 && !grouped ? (
                    <p className="menu-empty">No items in this category.</p>

                ) : grouped ? (
                    /* Grouped "All" view */
                    <>
                        {categories.map(cat => {
                            const catItems = grouped.get(cat._id) ?? [];
                            if (catItems.length === 0) return null;
                            return (
                                <section key={cat._id} className="menu-section fade-up">
                                    <div className="section-label">
                                        <span className="section-label__text">
                                            {cat.name}
                                        </span>
                                    </div>
                                    <div className="item-grid">
                                        {catItems.map(item => (
                                            <ItemCard
                                                key={item._id}
                                                item={item}
                                                cartItem={cart.items.find(c => c.item._id === item._id)}
                                                onAdd={cart.add}
                                                onRemove={cart.remove}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </>
                ) : (
                    /* Filtered single-category view */
                    <section className="menu-section">
                        <div className="item-grid fade-up">
                            {visibleItems.map(item => (
                                <ItemCard
                                    key={item._id}
                                    item={item}
                                    cartItem={cart.items.find(c => c.item._id === item._id)}
                                    onAdd={cart.add}
                                    onRemove={cart.remove}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* ── Floating cart pill ──────────────── */}
            {cart.count > 0 && !cartOpen && (
                <div className="cart-float">
                    <button className="cart-float__btn" onClick={() => setCartOpen(true)}>
                        <div className="cart-float__left">
                            <span className="cart-float__count">{cart.count}</span>
                            <span className="cart-float__label">View Order</span>
                        </div>
                        <div className="cart-float__total">
                            ₹{(cart.total * 1.05).toFixed(2)}
                            <span className="cart-float__arrow">→</span>
                        </div>
                    </button>
                </div>
            )}

            {/* ── Cart bottom sheet ────────────────── */}
            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                items={cart.items}
                total={cart.total}
                restaurantId={restaurantId}
                tableId={tableId}
                sessionId={SESSION_ID}
                onAdd={cart.add}
                onRemove={cart.remove}
                onClear={cart.clear}
            />
        </div>
    );
}
