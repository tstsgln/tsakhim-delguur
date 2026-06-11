import { getSellerStore, getProductsBySeller } from '@/lib/products-db';
import { apiError } from '@/lib/api-auth';

// GET /api/v1/store/:id -> { store, products }
// Public storefront: seller info (banner, story) + their active products.
export async function GET(_req: Request, ctx: RouteContext<'/api/v1/store/[id]'>) {
  const { id } = await ctx.params;
  const sellerId = Number(id);
  if (!Number.isInteger(sellerId) || sellerId <= 0) return apiError('Дэлгүүр олдсонгүй', 404);

  const store = getSellerStore(sellerId);
  if (!store) return apiError('Дэлгүүр олдсонгүй', 404);

  return Response.json({ store, products: getProductsBySeller(sellerId) });
}
