import { cancelByBuyer } from '@/lib/orders-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// POST /api/v1/orders/:id/cancel (Bearer) -> { ok }
// Buyer cancels an order (db layer enforces ownership + cancellable state, e.g.
// only before it ships, and restores stock).
export async function POST(req: Request, ctx: RouteContext<'/api/v1/orders/[id]/cancel'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return apiError('Захиалга олдсонгүй', 404);

  const result = cancelByBuyer(orderId, user.id);
  if (!result.ok) return apiError(result.reason ?? 'Цуцлах боломжгүй', 409);

  return Response.json({ ok: true });
}
