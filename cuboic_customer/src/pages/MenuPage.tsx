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
    const [searchQuery, setSearchQuery] = useState('');

    const cart = useCart();

    /* load restaurant + categories once */
    useEffect(() => {
        if (!restaurantId) return;
        Promise.all([getRestaurant(restaurantId), getCategories(restaurantId)]).then(([rest, cats]) => {
            setRestaurantName(rest.name);
            const sorted = cats.sort((a, b) => a.display_order - b.display_order);
            setCategories(sorted);
            setActiveCategory(null);
        });
    }, [restaurantId]);

    /* load ALL items once */
    useEffect(() => {
        if (!restaurantId) return;
        setLoading(true);
        getMenuItems(restaurantId, undefined)
            .then(data => setAllItems(data))
            .finally(() => setLoading(false));
    }, [restaurantId]);

    /* search: matches item name, description, or category name */
    const searchLower = searchQuery.trim().toLowerCase();
    const searchedItems = useMemo(() => {
        if (!searchLower) return allItems;
        const matchingCatIds = new Set(
            categories
                .filter(c => c.name.toLowerCase().includes(searchLower))
                .map(c => c.id)
        );
        return allItems.filter(item =>
            item.name.toLowerCase().includes(searchLower) ||
            (item.description ?? '').toLowerCase().includes(searchLower) ||
            matchingCatIds.has(item.categoryId)
        );
    }, [allItems, categories, searchLower]);

    /* filter by active category (only when not searching) */
    const visibleItems = useMemo(() => {
        if (searchLower) return searchedItems; // search overrides category
        if (!activeCategory) return allItems;
        return allItems.filter(item => item.categoryId === activeCategory);
    }, [allItems, searchedItems, activeCategory, searchLower]);

    /* group items by category for the "All" grouped view */
    const grouped = useMemo(() => {
        if (searchLower) return null; // flat results for search
        if (activeCategory) return null;
        const map = new Map<string, MenuItem[]>();
        for (const cat of categories) map.set(cat.id, []);
        for (const item of allItems) {
            if (!map.has(item.categoryId)) map.set(item.categoryId, []);
            map.get(item.categoryId)!.push(item);
        }
        return map;
    }, [allItems, categories, activeCategory, searchLower]);

    const tableLabel = tableId ? `Table ${tableId.slice(-4).toUpperCase()}` : '';

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value) setActiveCategory(null); // reset category when typing
    };

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

            {/* ── Sticky Header ──────────────────────────────────── */}
            <header className="menu-header">
                <div className="menu-header__inner">
                    {/* Brand */}
                    <div className="menu-header__brand">
                        <span className="menu-header__logo">⬡</span>
                        <div>
                            <div className="menu-header__name">{restaurantName}</div>
                            <div className="menu-header__sub">Cuboic · Robot Delivery</div>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="search-wrap">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className="search-input"
                            type="search"
                            placeholder="Search dishes or categories…"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            aria-label="Search menu"
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">✕</button>
                        )}
                    </div>

                    {/* Table tag + cart */}
                    <div className="menu-header__actions">
                        {tableLabel && <div className="table-tag">{tableLabel}</div>}
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
                </div>
            </header>

            {/* ── Category pills ─────────────────────────────────── */}
            {!searchLower && (
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
                            const count = allItems.filter(i => i.categoryId === c.id).length;
                            return (
                                <button
                                    key={c.id}
                                    className={`cat-pill ${activeCategory === c.id ? 'cat-pill--active' : ''}`}
                                    onClick={() => setActiveCategory(c.id)}
                                >
                                    {c.name}
                                    <span className="cat-pill__count">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Search results label ────────────────────────────── */}
            {searchLower && (
                <div className="search-results-bar">
                    {visibleItems.length > 0
                        ? <>{visibleItems.length} result{visibleItems.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"</>
                        : <>No results for "<strong>{searchQuery}</strong>"</>
                    }
                </div>
            )}

            {/* ── Items ──────────────────────────────────────────── */}
            <main className="container menu-body">
                {loading ? (
                    <div className="spinner-center"><div className="spinner" /></div>
                ) : visibleItems.length === 0 && !grouped ? (
                    <div className="menu-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <p>{searchLower ? `No dishes match "${searchQuery}"` : 'No items in this category.'}</p>
                    </div>
                ) : grouped ? (
                    <>
                        {categories.map(cat => {
                            const catItems = grouped.get(cat.id) ?? [];
                            if (catItems.length === 0) return null;
                            return (
                                <section key={cat.id} className="menu-section fade-up">
                                    <div className="section-label">
                                        <span className="section-label__text">{cat.name}</span>
                                    </div>
                                    <div className="item-grid">
                                        {catItems.map(item => (
                                            <ItemCard
                                                key={item.id}
                                                item={item}
                                                cartItem={cart.items.find(c => c.item.id === item.id)}
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
                    <section className="menu-section">
                        <div className="item-grid fade-up">
                            {visibleItems.map(item => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    cartItem={cart.items.find(c => c.item.id === item.id)}
                                    onAdd={cart.add}
                                    onRemove={cart.remove}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer className="menu-footer">
                <div className="menu-footer__inner">
                    <div className="menu-footer__brand">
                        <span className="menu-footer__logo">⬡</span>
                        <span className="menu-footer__wordmark">Cuboic</span>
                    </div>
                    <p className="menu-footer__tagline">
                        Autonomous restaurant delivery, powered by robots.
                    </p>
                    <div className="menu-footer__links">
                        <a href="mailto:hello@cuboic.com">hello@cuboic.com</a>
                        <span className="menu-footer__dot">·</span>
                        <a href="https://cuboic.com" target="_blank" rel="noopener noreferrer">cuboic.com</a>
                        <span className="menu-footer__dot">·</span>
                        <span>Bengaluru, India</span>
                    </div>
                    <p className="menu-footer__copy">© {new Date().getFullYear()} Cuboic Technologies Pvt. Ltd. All rights reserved.</p>
                </div>
            </footer>

            {/* ── Floating cart pill ─────────────────────────────── */}
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

            {/* ── Cart bottom sheet ──────────────────────────────── */}
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
