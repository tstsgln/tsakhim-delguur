import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  type NotificationType,
} from '@/lib/notifications-db';
import { formatOrderDate } from '@/lib/order-format';

export const dynamic = 'force-dynamic';

const ICON: Record<NotificationType, string> = {
  order_placed_seller: '🎉',
  order_paid_buyer: '✓',
  order_paid_seller: '💰',
  order_shipped_buyer: '📦',
  order_received_seller: '🎁',
  order_cancelled_seller: '✕',
};

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const notifications = listNotificationsForUser(user.id);
  markAllNotificationsRead(user.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🔔 Мэдэгдлүүд</h1>

      {notifications.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🔕</p>
          <p className="text-muted">Танд одоогоор мэдэгдэл алга байна.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const wasUnread = n.read_at === null;
            const content = (
              <div
                className={`flex items-start gap-3 bg-surface border rounded-xl p-4 transition-colors ${
                  wasUnread
                    ? 'border-primary/40 bg-primary-light/10 hover:bg-primary-light/20'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{ICON[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${wasUnread ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                  {n.body && <p className="text-sm text-muted mt-1">{n.body}</p>}
                  <p className="text-xs text-muted mt-2">{formatOrderDate(n.created_at)}</p>
                </div>
                {wasUnread && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" aria-label="Шинэ"></span>
                )}
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
