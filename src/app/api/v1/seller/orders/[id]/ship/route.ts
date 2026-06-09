import { markShipped } from '@/lib/orders-db';
import { notifyOrderShipped } from '@/lib/order-notifications';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// POST /api/v1/seller/orders/:id/ship (Bearer, seller-owner) -> { ok }
// markShipped takes the seller's USER id and checks ownership + state itself.
export async function POST(req: Request, ctx: RouteContext<'/api/v1/seller/orders/[id]/ship'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return apiError('Захиалга олдсонгүй', 404);

  const result = markShipped(orderId, user.id);
  if (!result.ok) return apiError(result.reason ?? 'Үйлдэл амжилтгүй', 409);

  notifyOrderShipped(orderId);
  return Response.json({ ok: true });
}
