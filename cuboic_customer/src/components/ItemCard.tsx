import type { MenuItem } from '../api/menu';
import type { CartItem } from '../hooks/useCart';
import './ItemCard.css';

interface Props {
    item: MenuItem;
    cartItem?: CartItem;
    onAdd: (item: MenuItem) => void;
    onRemove: (id: string) => void;
}

const FALLBACK =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=320&fit=crop&auto=format&q=80';

export function ItemCard({ item, cartItem, onAdd, onRemove }: Props) {
    const qty = cartItem?.quantity ?? 0;

    return (
        <div className={`item-card ${!item.is_available ? 'item-card--oos' : ''}`}>
            {/* Image */}
            <div className="item-card__img-wrap">
                <img
                    className="item-card__img"
                    src={item.image_url || FALLBACK}
                    alt={item.name}
                    loading="lazy"
                    onError={e => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK;
                    }}
                />
                {!item.is_available && (
                    <div className="item-card__oos-overlay">Out of Stock</div>
                )}
                {/* Price badge on image */}
                <div className="item-card__price-badge">₹{item.price.toFixed(2)}</div>
            </div>

            {/* Body */}
            <div className="item-card__body">
                <p className="item-card__name">{item.name}</p>
                {item.description && (
                    <p className="item-card__desc">{item.description}</p>
                )}

                {/* Action */}
                <div className="item-card__footer">
                    {item.is_available ? (
                        qty === 0 ? (
                            <button className="add-btn" onClick={() => onAdd(item)}>
                                + Add
                            </button>
                        ) : (
                            <div className="qty-control">
                                <button className="qty-btn" onClick={() => onRemove(item.id)}>−</button>
                                <span className="qty-value">{qty}</span>
                                <button className="qty-btn" onClick={() => onAdd(item)}>+</button>
                            </div>
                        )
                    ) : null}
                </div>
            </div>
        </div>
    );
}
