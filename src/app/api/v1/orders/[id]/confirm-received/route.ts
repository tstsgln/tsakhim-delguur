import { confirmReceivedByBuyer } from '@/lib/orders-db';
import { notifyOrderReceived } from '@/lib/order-notifications';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// POST /api/v1/orders/:id/confirm-received (Bearer) -> { ok }
// Buyer confirms delivery → releases escrow to the seller (db layer checks that
// the order belongs to this buyer and is in a confirmable state).
export async function POST(req: Request, ctx: RouteContext<'/api/v1/orders/[id]/confirm-received'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return apiError('Захиалга олдсонгүй', 404);

  const result = confirmReceivedByBuyer(orderId, user.id);
  if (!result.ok) return apiError(result.reason ?? 'Үйлдэл амжилтгүй', 409);

  notifyOrderReceived(orderId);
  return Response.json({ ok: true });
}
