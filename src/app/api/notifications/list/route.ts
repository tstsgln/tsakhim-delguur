import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { listNotificationsForUser } from '@/lib/notifications-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ notifications: [] });
  return NextResponse.json({ notifications: listNotificationsForUser(user.id, 15) });
}
