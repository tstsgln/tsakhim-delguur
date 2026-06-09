import { getOrder, getOrderItems } from '@/lib/orders-db';
import { getReviewsForOrder } from '@/lib/reviews-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/orders/:id (Bearer) -> { order, items, reviewedItemIds }
// Only the buyer who placed the order may read it (404 otherwise — don't reveal
// that someone else's order exists). `reviewedItemIds` lists order_item ids that
// already have a review, so the app can hide the "rate" button for them.
export async function GET(req: Request, ctx: RouteContext<'/api/v1/orders/[id]'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return apiError('Захиалга олдсонгүй', 404);

  const order = getOrder(orderId);
  if (!order || order.buyer_user_id !== user.id) return apiError('Захиалга олдсонгүй', 404);

  return Response.json({
    order,
    items: getOrderItems(orderId),
    reviewedItemIds: Array.from(getReviewsForOrder(orderId).keys()),
  });
}
