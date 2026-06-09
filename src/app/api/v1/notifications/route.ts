import { listNotificationsForUser, getUnreadNotificationCount } from '@/lib/notifications-db';
import { getApiUser, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/notifications (Bearer) -> { notifications, unread }
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  return Response.json({
    notifications: listNotificationsForUser(user.id, 50),
    unread: getUnreadNotificationCount(user.id),
  });
}
