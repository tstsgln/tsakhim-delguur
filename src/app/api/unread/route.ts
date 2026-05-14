import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getUnreadCount } from '@/lib/chat-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: getUnreadCount(user.id) });
}
