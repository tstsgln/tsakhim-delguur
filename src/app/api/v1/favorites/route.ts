import { getFavoriteProducts } from '@/lib/products-db';
import { getApiUser, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/favorites (Bearer) -> { items }
// The logged-in user's favorited products (full objects, newest-first).
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  return Response.json({ items: getFavoriteProducts(user.id) });
}
