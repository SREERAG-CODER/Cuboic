import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getRestaurant, getCategories, getMenuItems, type Category, type MenuItem } from '../api/menu';
import { updateOrderTable } from '../api/orders';
import { useCart } from '../hooks/useCart';
import { ItemCard } from '../components/ItemCard';
import { CartDrawer } from '../components/CartDrawer';
import { OrdersDrawer, type ActiveOrderSession } from '../components/OrdersDrawer';
import { TableSelectorModal } from '../components/TableSelectorModal';
import { ConfirmTableMoveModal } from '../components/ConfirmTableMoveModal';
import { CustomerAuthModal } from '../components/CustomerAuthModal';
import { OrderTypeModal } from '../components/OrderTypeModal';
import { type Customer } from '../api/customers';
import { getCustomer, setCustomer as setCustomerSession } from '../utils/auth';
import { SearchOverlay } from '../components/SearchOverlay';
import { SkeletonLoader } from '../components/SkeletonLoader';
import './MenuPage.css';

// Stable session id per tab
const SESSION_ID = crypto.randomUUID();

export function MenuPage() {
    const [params, setParams] = useSearchParams();
    const restaurantId = params.get('r') ?? '';
    const tableId = params.get('t') ?? '';

    const [restaurantName, setRestaurantName] = useState('Restaurant');
    const [categories, setCategories] = useState<Category[]>([]);
    const [allItems, setAllItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [cartOpen, setCartOpen] = useState(false);
    const [ordersOpen, setOrdersOpen] = useState(false);
    const [tablesOpen, setTablesOpen] = useState(false);
    const [pendingTableMove, setPendingTableMove] = useState<{ id: string; number: string } | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [tableLabel, setTableLabel] = useState<string>('');
    const [availableTables, setAvailableTables] = useState<any[]>([]);
    const [activeOrders, setActiveOrders] = useState<ActiveOrderSession[]>([]);

    const [authOpen, setAuthOpen] = useState(false);
    const [orderTypeOpen, setOrderTypeOpen] = useState(false);

    // Auth State
    const [customer, setCustomer] = useState<Customer | null>(null);

    const cart = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const c = getCustomer();
        if (c) setCustomer(c);

        try {
            const o = localStorage.getItem('cuboic_active_orders');
            if (o) {
                const parsed = JSON.parse(o);
                const TWO_HOURS = 2 * 60 * 60 * 1000;
                const now = Date.now();
                const validOrders = parsed.filter((order: any) => {
                    return (now - (order.time || 0)) < TWO_HOURS;
                });

                setActiveOrders(validOrders);

                if (validOrders.length !== parsed.length) {
                    if (validOrders.length === 0) {
                        localStorage.removeItem('cuboic_active_orders');
                    } else {
                        localStorage.setItem('cuboic_active_orders', JSON.stringify(validOrders));
                    }
                }
            }
        } catch (e) {
            console.error('Failed to parse active orders', e);
        }
    }, []);

    const handleTableSelect = (newTableId: string) => {
        if (activeOrders.length > 0) {
            const tbl = availableTables.find(t => t.id === newTableId);
            if (tbl) {
                setPendingTableMove({ id: tbl.id, number: tbl.table_number.toString() });
            }
            setTablesOpen(false);
        } else {
            proceedWithTableMove(newTableId, false);
        }
    };

    const proceedWithTableMove = async (newTableId: string, moveOrders: boolean) => {
        if (moveOrders && activeOrders.length > 0) {
            try {
                await Promise.all(activeOrders.map(o => updateOrderTable(o.id, newTableId)));
            } catch (err) {
                console.error("Failed to move active orders to new table", err);
            }
        }
        setParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('t', newTableId);
            return next;
        });
        // Clear cart if swapping table
        cart.clear();
        setPendingTableMove(null);
        setTablesOpen(false);
    };

    const handleCheckoutInit = () => {
        const cust = getCustomer();
        if (!cust) {
            setCartOpen(false);
            setAuthOpen(true);
            return;
        }
        proceedWithAuth(cust);
    };

    const proceedWithAuth = (customer: Customer) => {
        if (!tableId) {
            setCartOpen(false);
            setOrderTypeOpen(true);
            return;
        }
        goToCheckout(tableId, tableLabel, customer);
    };

    const handleOrderTypeSelect = (type: 'Dine-in' | 'Takeaway') => {
        setOrderTypeOpen(false);
        if (type === 'Dine-in') {
            setTablesOpen(true);
        } else {
            const takeawayTbl = availableTables.find(t => String(t.table_number).toLowerCase() === 'takeaway');
            const tId = takeawayTbl ? takeawayTbl.id : 'takeaway_virtual';
            const cust = getCustomer();
            if (cust) goToCheckout(tId, 'Takeaway', cust);
        }
    };

    const goToCheckout = (tId: string, tLabel: string, customer: Customer) => {
        navigate('/checkout', {
            state: {
                items: cart.items,
                total: cart.total,
                restaurantId,
                tableId: tId,
                tableLabel: tLabel,
                sessionId: SESSION_ID,
                customerId: customer.id
            },
        });
    };

    const handleAuthSuccess = (c: Customer) => {
        setCustomerSession(c);
        setCustomer(c);
        setAuthOpen(false);
        proceedWithAuth(c);
    };

    interface FlyingItem {
        id: number;
        x: number;
        y: number;
        image: string;
    }
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

    const handleAdd = (item: MenuItem, e?: React.MouseEvent) => {
        cart.add(item);
        if (e) {
            const { clientX, clientY } = e;
            const flyId = Date.now() + Math.random();
            setFlyingItems(prev => [...prev, {
                id: flyId,
                x: clientX,
                y: clientY,
                image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=320&fit=crop&auto=format&q=80'
            }]);
            setTimeout(() => {
                setFlyingItems(prev => prev.filter(f => f.id !== flyId));
            }, 800);
        }
    };
    /* load restaurant + categories once */
    useEffect(() => {
        if (!restaurantId) return;
        Promise.all([getRestaurant(restaurantId), getCategories(restaurantId)]).then(([rest, cats]) => {
            setRestaurantName(rest.name);
            const sorted = cats.sort((a, b) => a.display_order - b.display_order);
            setCategories(sorted);
            setActiveCategory(null);

            if (rest.tables) {
                const sortedTables = [...rest.tables].sort((a, b) => {
                    const numA = parseInt(a.table_number);
                    const numB = parseInt(b.table_number);

                    if (!isNaN(numA) && !isNaN(numB)) {
                        return numA - numB;
                    }
                    // Fallback to string comparison for mixed or non-numeric types
                    return String(a.table_number).localeCompare(String(b.table_number), undefined, { numeric: true });
                });
                setAvailableTables(sortedTables);
            }

            if (tableId) {
                const tbl = rest.tables ? rest.tables.find(t => t.id === tableId) : undefined;
                if (tableId === 'takeaway_virtual' || tbl?.table_number.toLowerCase() === 'takeaway') {
                    setTableLabel('Takeaway');
                } else if (tbl) {
                    setTableLabel(`Table ${tbl.table_number}`);
                } else {
                    setTableLabel(`Table ${tableId.slice(-4).toUpperCase()}`);
                }
            }
        });
    }, [restaurantId, tableId]);

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
        if (activeCategory) return null; // flat results for specific category
        const map = new Map<string, MenuItem[]>();
        for (const cat of categories) map.set(cat.id, []);
        for (const item of allItems) {
            if (!map.has(item.categoryId)) map.set(item.categoryId, []);
            map.get(item.categoryId)!.push(item);
        }
        return map;
    }, [allItems, categories, searchLower, activeCategory]);

    const scrollToCategory = (catId: string | null) => {
        setActiveCategory(catId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value) setActiveCategory(null); // reset category when typing
    };

    const handleSearchOpen = () => {
        setSearchOpen(true);
    };

    const handleSearchClose = () => {
        setSearchOpen(false);
        setSearchQuery('');
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

    if (!tableId && !loading && restaurantName) {
        return (
            <div className="menu-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)' }}>
                <header className="menu-header">
                    <div className="menu-header__inner">
                        <div className="menu-header__brand">
                            <img src="/pic1.png" className="menu-header__logo" alt="Thambi" />
                            <div>
                                <div className="menu-header__name">{restaurantName}</div>
                                <div className="menu-header__sub">Thambi</div>
                            </div>
                        </div>
                    </div>
                </header>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
                    <div className="fade-up" style={{ width: '100%', maxWidth: '340px', backgroundColor: 'var(--surface)', padding: '32px 24px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--surface2)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <span style={{ fontSize: '28px' }}>👋</span>
                        </div>
                        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text)' }}>Welcome!</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '32px', lineHeight: 1.5 }}>
                            Are you dining in with us or taking your order to go?
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    const takeawayTbl = availableTables.find(t => String(t.table_number).toLowerCase() === 'takeaway');
                                    const tId = takeawayTbl ? takeawayTbl.id : 'takeaway_virtual';
                                    setParams(prev => {
                                        const next = new URLSearchParams(prev);
                                        next.set('t', tId);
                                        return next;
                                    });
                                }}
                                style={{ padding: '16px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '14px' }}
                            >
                                🥡 Order Takeaway
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setTablesOpen(true)}
                                style={{ padding: '16px', fontSize: '1.05rem', fontWeight: 600, backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '14px' }}
                            >
                                🍽 Dine-in (Select Table)
                            </button>
                        </div>
                    </div>
                </div>

                <TableSelectorModal
                    open={tablesOpen}
                    onClose={() => setTablesOpen(false)}
                    tables={availableTables.filter(t => String(t.table_number).toLowerCase() !== 'takeaway')}
                    currentTableId={tableId}
                    onSelect={handleTableSelect}
                />
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
                        <img src="/pic1.png" className="menu-header__logo" alt="Thambi" />
                        <div>
                            <div className="menu-header__name">{restaurantName}</div>
                            <div className="menu-header__sub">Thambi</div>
                        </div>
                    </div>

                    {/* Search bar button toggle */}
                    <div className="search-trigger" onClick={handleSearchOpen}>
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <div className="search-placeholder">
                            <span className="desktop-search-text">Search for restaurants or dishes</span>
                            <span className="mobile-search-text">Search...</span>
                        </div>
                    </div>

                    {/* Table tag */}
                    <div className="menu-header__actions">
                        {tableLabel && (
                            <button
                                className="table-tag"
                                onClick={() => setTablesOpen(true)}
                                style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
                            >
                                {tableLabel}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Category pills ─────────────────────────────────── */}
            {!searchLower && (
                <div className="category-row">
                    <div className="category-row__inner">
                        <button
                            className={`cat-pill ${activeCategory === null ? 'cat-pill--active' : ''}`}
                            onClick={() => scrollToCategory(null)}
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
                                    onClick={() => scrollToCategory(c.id)}
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
            {searchLower && !searchOpen && (
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
                    <SkeletonLoader count={8} />
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
                                <section key={cat.id} id={`cat-${cat.id}`} className="menu-section fade-up">
                                    <div className="section-label">
                                        <span className="section-label__text">{cat.name}</span>
                                    </div>
                                    <div className="item-grid">
                                        {catItems.map(item => (
                                            <ItemCard
                                                key={item.id}
                                                item={item}
                                                cartItem={cart.items.find(c => c.item.id === item.id)}
                                                onAdd={handleAdd}
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
                                    onAdd={handleAdd}
                                    onRemove={cart.remove}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* ── Full-screen search ─────────────────────────────── */}
            <SearchOverlay
                open={searchOpen}
                onClose={handleSearchClose}
                query={searchQuery}
                onQueryChange={handleSearchChange}
                onClear={() => setSearchQuery('')}
                results={visibleItems}
                cartItems={cart.items}
                onAdd={cart.add}
                onRemove={cart.remove}
            />

            {/* ── Flying Ghost Items ─────────────────────────────── */}
            {flyingItems.map(f => (
                <img
                    key={f.id}
                    src={f.image}
                    className="flying-ghost"
                    style={{ '--start-x': `${f.x}px`, '--start-y': `${f.y}px` } as React.CSSProperties}
                    alt=""
                />
            ))}

            {/* ── Flying Ghost Items ─────────────────────────────── */}
            {flyingItems.map(f => (
                <img
                    key={f.id}
                    src={f.image}
                    className="flying-ghost"
                    style={{ '--start-x': `${f.x}px`, '--start-y': `${f.y}px` } as React.CSSProperties}
                    alt=""
                />
            ))}

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer className="menu-footer">
                <div className="menu-footer__inner">
                    <div className="menu-footer__brand">
                        <img src="/pic1.png" className="menu-footer__logo" alt="Thambi Logo" />
                        <span className="menu-footer__wordmark">Thambi</span>
                    </div>
                    <p className="menu-footer__tagline">
                        Autonomous restaurant delivery, powered by robots.
                    </p>
                    <div className="menu-footer__links">
                        <a href="mailto:hello@thambi.com">placeholder@thambi.com</a>
                        <span className="menu-footer__dot">·</span>
                        <a href="https://thambi.com" target="_blank" rel="noopener noreferrer">thambi.com</a>
                        <span className="menu-footer__dot">·</span>
                        <span>Kerala, India</span>
                    </div>
                    <p className="menu-footer__copy">© {new Date().getFullYear()} Thambi Networks Pvt. Ltd. All rights reserved.</p>
                </div>
            </footer>

            {/* ── Active Orders pill ──────────────────────────────── */}
            {activeOrders.length > 0 && !cartOpen && !ordersOpen && (
                <div className="track-float" style={{ bottom: cart.count > 0 ? '88px' : '24px' }}>
                    <button className="track-float__btn" onClick={() => setOrdersOpen(true)}>
                        <span className="track-float__icon" style={{ display: 'flex', alignItems: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m11.5 7.5 5 2.5-1.5 1.5-2.5 5-1.5-1.5-.5-5z" />
                            </svg>
                        </span>
                        <span>Track {activeOrders.length} Order{activeOrders.length > 1 ? 's' : ''}</span>
                    </button>
                </div>
            )}

            {/* ── Floating cart pill ─────────────────────────────── */}
            {cart.count > 0 && !cartOpen && !ordersOpen && (
                <div className="cart-float">
                    <button className="cart-float__btn" onClick={() => setCartOpen(true)}>
                        <div className="cart-float__left">
                            <span className="cart-float__count">{cart.count}</span>
                            <span className="cart-float__label">View Order</span>
                        </div>
                        <div className="cart-float__total">
                            ₹{cart.total.toFixed(2)}
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
                tableLabel={tableLabel}
                sessionId={SESSION_ID}
                onAdd={cart.add}
                onRemove={cart.remove}
                onClear={cart.clear}
                onCheckout={handleCheckoutInit}
                customerName={customer?.name}
            />

            <CustomerAuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                onSuccess={handleAuthSuccess}
            />

            <OrderTypeModal
                open={orderTypeOpen}
                onClose={() => setOrderTypeOpen(false)}
                onSelect={handleOrderTypeSelect}
            />

            {/* ── Orders bottom sheet ────────────────────────────── */}
            <OrdersDrawer
                open={ordersOpen}
                onClose={() => setOrdersOpen(false)}
                orders={activeOrders}
                restaurantId={restaurantId}
                tableId={tableId}
            />

            {/* ── Table selector modal ───────────────────────────── */}
            <TableSelectorModal
                open={tablesOpen}
                onClose={() => setTablesOpen(false)}
                tables={availableTables.filter(t => String(t.table_number).toLowerCase() !== 'takeaway')}
                currentTableId={tableId}
                onSelect={handleTableSelect}
            />

            {/* ── Confirm table move modal ───────────────────────── */}
            <ConfirmTableMoveModal
                open={!!pendingTableMove}
                orderCount={activeOrders.length}
                newTableNumber={pendingTableMove?.number || ''}
                onCancel={() => setPendingTableMove(null)}
                onConfirm={(moveOrders) => {
                    if (pendingTableMove) {
                        proceedWithTableMove(pendingTableMove.id, moveOrders);
                    }
                }}
            />
        </div>
    );
}
