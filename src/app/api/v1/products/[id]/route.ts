import { getProductDetail } from '@/lib/products-db';
import { apiError } from '@/lib/api-auth';

// GET /api/v1/products/:id -> { product, seller }
// Full detail incl. variation options and seller info (getProductDetail).
export async function GET(_req: Request, ctx: RouteContext<'/api/v1/products/[id]'>) {
  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return apiError('Бараа олдсонгүй', 404);
  }
  const detail = getProductDetail(productId);
  if (!detail) return apiError('Бараа олдсонгүй', 404);
  return Response.json(detail);
}
