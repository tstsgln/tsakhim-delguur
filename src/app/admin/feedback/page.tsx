import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { isAdmin } from '@/lib/admin';
import { listFeedback, countFeedbackByStatus, type FeedbackStatus } from '@/lib/feedback-db';
import { updateFeedbackStatus } from '@/app/actions/feedback';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

function statusLabel(s: FeedbackStatus): string {
  return s === 'new' ? 'Шинэ' : s === 'read' ? 'Уншсан' : 'Шийдвэрлэсэн';
}

function statusColor(s: FeedbackStatus): string {
  return s === 'new'
    ? 'bg-primary text-white'
    : s === 'read'
      ? 'bg-warning/20 text-warning'
      : 'bg-success/20 text-success';
}

function kindLabel(k: string): string {
  return k === 'complaint' ? '⚠️ Гомдол' : '💡 Санал';
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'Z');
  return d.toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!isAdmin(user)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🚫</p>
        <h1 className="text-2xl font-bold mb-2">Хандах эрх алга</h1>
        <p className="text-muted">Энэ хуудас зөвхөн админд зориулагдсан.</p>
        <Link href="/" className="text-primary hover:underline text-sm mt-4 inline-block">
          ← Нүүр хуудас
        </Link>
      </div>
    );
  }

  const sp = await searchParams;
  const validStatuses = ['new', 'read', 'resolved', 'all'] as const;
  type FilterValue = (typeof validStatuses)[number];
  const filter: FilterValue = (validStatuses as readonly string[]).includes(sp.status ?? '')
    ? (sp.status as FilterValue)
    : 'all';
  const items = listFeedback(filter);
  const counts = countFeedbackByStatus();
  const total = counts.new + counts.read + counts.resolved;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🛠️ Админ — Санал, гомдол</h1>
        <p className="text-sm text-muted mt-1">{total} нийт мэдэгдэл</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { v: 'all', label: `Бүгд (${total})` },
          { v: 'new', label: `Шинэ (${counts.new})` },
          { v: 'read', label: `Уншсан (${counts.read})` },
          { v: 'resolved', label: `Шийдвэрлэсэн (${counts.resolved})` },
        ] as const).map(t => (
          <Link
            key={t.v}
            href={t.v === 'all' ? '/admin/feedback' : `/admin/feedback?status=${t.v}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === t.v
                ? 'bg-primary text-white'
                : 'bg-surface border border-border hover:bg-primary-light/10'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-muted">Энэ ангилалд одоогоор мэдэгдэл алга.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                  <span className="text-xs bg-primary-light/30 text-primary px-2 py-1 rounded-full">
                    {kindLabel(item.kind)}
                  </span>
                  {item.is_seller === 1 ? (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                      🏪 Дэлгүүр: {item.store_name}
                    </span>
                  ) : (
                    <span className="text-xs bg-muted/20 text-muted px-2 py-1 rounded-full">
                      👤 Худалдан авагч
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">{formatDate(item.created_at)}</span>
              </div>

              {item.subject && (
                <h3 className="font-bold mb-1">{item.subject}</h3>
              )}
              <p className="text-sm whitespace-pre-wrap break-words mb-3">{item.body}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
                <div className="text-xs text-muted">
                  <span className="font-medium text-foreground">{item.user_name}</span>{' '}
                  <a href={`mailto:${item.user_email}`} className="hover:text-primary">{item.user_email}</a>
                </div>
                <div className="flex gap-2">
                  {item.status !== 'read' && item.status !== 'resolved' && (
                    <form action={updateFeedbackStatus}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="read" />
                      <button className="text-xs bg-surface border border-border px-3 py-1.5 rounded-md hover:bg-primary-light/20">
                        Уншсан гэж тэмдэглэх
                      </button>
                    </form>
                  )}
                  {item.status !== 'resolved' && (
                    <form action={updateFeedbackStatus}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="resolved" />
                      <button className="text-xs bg-success text-white px-3 py-1.5 rounded-md hover:opacity-90">
                        Шийдвэрлэсэн
                      </button>
                    </form>
                  )}
                  {item.status === 'resolved' && (
                    <form action={updateFeedbackStatus}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="new" />
                      <button className="text-xs text-muted hover:text-primary">
                        Шинэ болгох
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
