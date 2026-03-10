import { useEffect, useRef } from 'react';
import { ItemCard } from './ItemCard';
import type { MenuItem } from '../api/menu';
import type { CartItem } from '../hooks/useCart';
import './SearchOverlay.css';

interface SearchOverlayProps {
    open: boolean;
    onClose: () => void;
    query: string;
    onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    results: MenuItem[];
    cartItems: CartItem[];
    onAdd: (item: MenuItem) => void;
    onRemove: (itemId: string) => void;
}

const TRENDING = ['Biryani', 'Momos', 'Ice cream', 'Fried chicken', 'Dosa'];

// Example cuisine shorts. Ideally driven by backend or static constants.
const CUISINES = [
    { label: 'South', icon: '🥥' },
    { label: 'North', icon: '🥘' },
    { label: 'Chinese', icon: '🥢' },
    { label: 'Dessert', icon: '🍨' },
    { label: 'Drinks', icon: '🥤' }
];

export function SearchOverlay({
    open,
    onClose,
    query,
    onQueryChange,
    onClear,
    results,
    cartItems,
    onAdd,
    onRemove
}: SearchOverlayProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the input when opened
    useEffect(() => {
        if (open && inputRef.current) {
            // small delay for transition
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    if (!open) return null;

    const handleChipClick = (val: string) => {
        onQueryChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>);
        inputRef.current?.focus();
    };

    return (
        <div className="search-overlay">
            {/* Header */}
            <div className="search-overlay__header">
                <div className="search-overlay__header-inner">
                    <button className="search-overlay__back" onClick={onClose} aria-label="Go back">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <div className="search-overlay__input-wrap">
                        <input
                            ref={inputRef}
                            className="search-overlay__input"
                            type="search"
                            placeholder="Search for restaurants or dishes"
                            value={query}
                            onChange={onQueryChange}
                        />
                        {query && (
                            <button className="search-overlay__clear" onClick={onClear} aria-label="Clear search">✕</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="search-overlay__body">
                <div className="search-overlay__body-inner">
                    {!query ? (
                        <div className="search-overlay__suggestions fade-in">
                            {/* Trending */}
                            <section className="search-sug-section">
                                <h3 className="search-sug-title">Trending Searches</h3>
                                <div className="search-chips">
                                    {TRENDING.map(t => (
                                        <button
                                            key={t}
                                            className="search-chip"
                                            onClick={() => handleChipClick(t)}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Cuisine shortcuts */}
                            <section className="search-sug-section">
                                <h3 className="search-sug-title">Popular Cuisines</h3>
                                <div className="cuisine-grid">
                                    {CUISINES.map(c => (
                                        <button
                                            key={c.label}
                                            className="cuisine-card"
                                            onClick={() => handleChipClick(c.label)}
                                        >
                                            <span className="cuisine-card__icon">{c.icon}</span>
                                            <span className="cuisine-card__label">{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="search-overlay__results fade-in">
                            {results.length > 0 ? (
                                <div className="item-grid">
                                    {results.map(item => (
                                        <ItemCard
                                            key={item.id}
                                            item={item}
                                            cartItem={cartItems.find(c => c.item.id === item.id)}
                                            onAdd={onAdd}
                                            onRemove={onRemove}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="search-empty">
                                    <p>No dishes found for "<strong>{query}</strong>"</p>
                                    <p className="search-empty__sub">Try searching for something else.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
