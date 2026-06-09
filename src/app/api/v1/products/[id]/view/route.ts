import { incrementProductView } from '@/lib/products-db';
import { apiError } from '@/lib/api-auth';

// POST /api/v1/products/:id/view -> { ok: true }
// Records a product view (for seller Shop Stats). The web excludes the owner's
// own views at the call site; the app should do the same (only POST when the
// viewer is not the seller). TODO: optionally enforce owner-exclusion here.
export async function POST(_req: Request, ctx: RouteContext<'/api/v1/products/[id]/view'>) {
  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return apiError('Бараа олдсонгүй', 404);
  }
  incrementProductView(productId);
  return Response.json({ ok: true });
}
