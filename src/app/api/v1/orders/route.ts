import { listOrdersForBuyer } from '@/lib/orders-db';
import { getApiUser, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/orders (Bearer) -> { items }
// The buyer's own orders (newest-first), with cover image + item count.
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  return Response.json({ items: listOrdersForBuyer(user.id) });
}
