import './SkeletonLoader.css';

export function SkeletonLoader({ count = 6 }: { count?: number }) {
    return (
        <div className="skeleton-grid fade-in">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-card">
                    <div className="skeleton-shimmer skeleton-img" />
                    <div className="skeleton-content">
                        <div className="skeleton-shimmer skeleton-title" />
                        <div className="skeleton-shimmer skeleton-desc" />
                        <div className="skeleton-price-row">
                            <div className="skeleton-shimmer skeleton-price" />
                            <div className="skeleton-shimmer skeleton-btn" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
