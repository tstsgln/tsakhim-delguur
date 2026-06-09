import { listOrdersForSeller } from '@/lib/orders-db';
import { getApiUser, getSellerForUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/seller/orders (Bearer, seller) -> { items }
// Orders placed against this seller's store (newest-first, with buyer name).
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const seller = getSellerForUser(user.id);
  if (!seller) return apiError('Та худалдагч биш байна', 403);
  return Response.json({ items: listOrdersForSeller(seller.id) });
}
