import { markAllNotificationsRead } from '@/lib/notifications-db';
import { getApiUser, UNAUTHORIZED } from '@/lib/api-auth';

// POST /api/v1/notifications/read (Bearer) -> { ok } — mark all as read
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  markAllNotificationsRead(user.id);
  return Response.json({ ok: true });
}
