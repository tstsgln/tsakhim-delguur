import { getSellerShopStats } from '@/lib/products-db';
import { getApiUser, getSellerForUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/seller/stats (Bearer, seller) -> SellerShopStats
// Totals + per-product views/favorites/sales/archived. Doubles as the product
// management list (each product has an `archived` flag).
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const seller = getSellerForUser(user.id);
  if (!seller) return apiError('Та худалдагч биш байна', 403);
  return Response.json(getSellerShopStats(seller.id));
}
