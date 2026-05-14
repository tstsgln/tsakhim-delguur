import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { listConversationsForUser } from '@/lib/chat-db';

export const dynamic = 'force-dynamic';

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso + 'Z');
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) return d.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
}

export default async function MessagesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const conversations = listConversationsForUser(user.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">💬 Зурвасууд</h1>

      {conversations.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">💌</p>
          <p className="text-muted mb-4">Та одоогоор ямар нэгэн ярианд оролцоогүй байна.</p>
          <Link href="/products" className="text-primary hover:underline text-sm">
            Бүтээгдэхүүн үзэх →
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
          {conversations.map(c => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center gap-3 p-4 hover:bg-primary-light/10 transition-colors"
            >
              <span className="w-12 h-12 rounded-full bg-primary-light/30 flex items-center justify-center text-2xl flex-shrink-0">
                {c.role === 'buyer' ? '🏪' : '👤'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{c.partner_name}</p>
                  <span className="text-xs text-muted flex-shrink-0">{formatTime(c.last_at)}</span>
                </div>
                <p className="text-sm text-muted truncate">
                  {c.last_message ?? <span className="italic">Шинэ яриа</span>}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
