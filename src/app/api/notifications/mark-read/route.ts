import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { markAllNotificationsRead } from '@/lib/notifications-db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  markAllNotificationsRead(user.id);
  return NextResponse.json({ ok: true });
}
