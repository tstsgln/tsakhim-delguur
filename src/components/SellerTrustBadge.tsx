import type { SellerStats } from '@/lib/products-db';

const TOP_RATED_MIN_REVIEWS = 5;
const TOP_RATED_MIN_RATING = 4.5;

interface Props {
  stats: SellerStats;
  className?: string;
}

// Compact, presentational trust signals for a seller. Usable from both server
// and client components (no hooks).
export default function SellerTrustBadge({ stats, className = '' }: Props) {
  const { rating, reviewCount, salesCount } = stats;
  const topRated = reviewCount >= TOP_RATED_MIN_REVIEWS && rating >= TOP_RATED_MIN_RATING;
  const isNew = reviewCount === 0 && salesCount === 0;

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      {topRated && (
        <span className="inline-flex items-center gap-1 bg-accent/15 text-accent font-medium px-2 py-0.5 rounded-full">
          ⭐ Шилдэг борлуулагч
        </span>
      )}
      {reviewCount > 0 && (
        <span className="inline-flex items-center gap-1 text-foreground">
          <span className="text-warning">★</span>
          {rating.toFixed(1)}
          <span className="text-muted">({reviewCount} үнэлгээ)</span>
        </span>
      )}
      {salesCount > 0 && (
        <span className="inline-flex items-center gap-1 text-muted">📦 {salesCount} борлуулалт</span>
      )}
      {isNew && (
        <span className="inline-flex items-center gap-1 bg-primary-light/30 text-primary px-2 py-0.5 rounded-full">
          🌱 Шинэ дэлгүүр
        </span>
      )}
    </div>
  );
}
