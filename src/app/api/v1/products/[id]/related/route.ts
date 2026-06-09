import { getProductById, getRelatedProducts, getMoreFromSeller } from '@/lib/products-db';
import { apiError } from '@/lib/api-auth';

// GET /api/v1/products/:id/related -> { related, moreFromSeller }
// Same two carousels the web product page shows under a product.
export async function GET(_req: Request, ctx: RouteContext<'/api/v1/products/[id]/related'>) {
  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return apiError('Бараа олдсонгүй', 404);
  }
  const product = getProductById(productId);
  if (!product) return apiError('Бараа олдсонгүй', 404);

  const related = getRelatedProducts(productId, product.category);
  const moreFromSeller = getMoreFromSeller(Number(product.seller.id), productId);
  return Response.json({ related, moreFromSeller });
}
