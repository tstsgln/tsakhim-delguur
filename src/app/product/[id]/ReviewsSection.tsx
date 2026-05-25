import { getProductReviews, getProductRatingStats } from '@/lib/reviews-db';
import { formatOrderDate } from '@/lib/order-format';

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const cls = size === 'lg' ? 'text-2xl' : 'text-sm';
  return (
    <span className={`text-warning ${cls} leading-none`}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      <span className="text-border">{'★'.repeat(5 - full - (half ? 1 : 0))}</span>
    </span>
  );
}

export default function ReviewsSection({ productId }: { productId: number }) {
  const stats = getProductRatingStats(productId);
  const reviews = getProductReviews(productId);

  return (
    <section className="bg-surface border border-border rounded-2xl p-6 mb-12">
      <h2 className="text-xl font-bold mb-4">Хэрэглэгчийн үнэлгээ</h2>

      {stats.review_count === 0 ? (
        <p className="text-sm text-muted">
          Энэ бараанд одоогоор үнэлгээ алга. Худалдан авсан хэрэглэгчид л үнэлгээ өгөх боломжтой.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl font-bold text-primary">{stats.avg_rating.toFixed(1)}</span>
            <div>
              <StarRow rating={stats.avg_rating} size="lg" />
              <p className="text-xs text-muted mt-1">{stats.review_count} үнэлгээ</p>
            </div>
          </div>

          <ul className="space-y-4">
            {reviews.map(r => (
              <li key={r.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{r.user_name}</span>
                  <span className="inline-flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                    ✓ Худалдан авсан
                  </span>
                  <span className="ml-auto text-xs text-muted">{formatOrderDate(r.created_at)}</span>
                </div>
                <StarRow rating={r.rating} />
                {r.comment && <p className="text-sm mt-2 whitespace-pre-wrap">{r.comment}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
