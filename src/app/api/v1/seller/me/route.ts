import { getApiUser, getSellerForUser, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/seller/me (Bearer) -> { seller }  (seller is null if not a seller)
// The app uses this to decide whether to show the seller dashboard.
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  return Response.json({ seller: getSellerForUser(user.id) });
}
