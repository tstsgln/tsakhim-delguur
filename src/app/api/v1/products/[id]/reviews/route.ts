import { getProductReviews, getProductRatingStats } from '@/lib/reviews-db';
import { apiError } from '@/lib/api-auth';

// GET /api/v1/products/:id/reviews -> { stats, reviews }
// Public — anyone can read a product's reviews + average rating.
export async function GET(_req: Request, ctx: RouteContext<'/api/v1/products/[id]/reviews'>) {
  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return apiError('Бараа олдсонгүй', 404);
  }
  return Response.json({
    stats: getProductRatingStats(productId),
    reviews: getProductReviews(productId),
  });
}
