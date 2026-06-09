import { getApiUser, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/auth/me  (Bearer) -> { user }
// Returns the current user decoded from the token. The client uses this to
// confirm a stored token is still valid on app launch.
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  return Response.json({ user });
}
