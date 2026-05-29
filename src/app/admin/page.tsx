import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { isAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { countFeedbackByStatus } from '@/lib/feedback-db';
import { getPlatformCommissionBalance, autoReleaseStaleOrders } from '@/lib/orders-db';
import { listFailedEmails } from '@/lib/email-log';
import { resolveFailedEmail } from '@/app/actions/admin';
import { formatPrice } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminHubPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!isAdmin(user)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🚫</p>
        <h1 className="text-2xl font-bold mb-2">Хандах эрх алга</h1>
        <Link href="/" className="text-primary hover:underline text-sm mt-4 inline-block">
          ← Нүүр хуудас
        </Link>
      </div>
    );
  }

  autoReleaseStaleOrders();

  const pendingOrdersCount = (
    db.prepare(`SELECT COUNT(*) AS c FROM orders WHERE status = 'pending_payment'`).get() as { c: number }
  ).c;
  const pendingPayoutsCount = (
    db.prepare(`SELECT COUNT(*) AS c FROM payouts WHERE status = 'requested'`).get() as { c: number }
  ).c;
  const feedbackCounts = countFeedbackByStatus();
  const failedEmails = listFailedEmails(20);
  const totalCommission = getPlatformCommissionBalance();
  const totalCompletedOrders = (
    db.prepare(`SELECT COUNT(*) AS c FROM orders WHERE status = 'completed'`).get() as { c: number }
  ).c;

  const tiles = [
    {
      href: '/admin/orders',
      icon: '💳',
      title: 'Төлбөр баталгаажуулах',
      desc: 'Худалдан авагч төлбөр илгээсэн захиалгуудыг шалгаад баталгаажуулна',
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} хүлээгдэж буй` : null,
      badgeColor: 'bg-warning/20 text-warning',
    },
    {
      href: '/admin/payouts',
      icon: '🏦',
      title: 'Татан авах хүсэлт',
      desc: 'Борлуулагчдын татан авах хүсэлтийг шилжүүлсний дараа дуусгана',
      badge: pendingPayoutsCount > 0 ? `${pendingPayoutsCount} хүлээгдэж буй` : null,
      badgeColor: 'bg-warning/20 text-warning',
    },
    {
      href: '/admin/feedback',
      icon: '💌',
      title: 'Санал, гомдол',
      desc: 'Хэрэглэгчдийн санал, гомдол',
      badge: feedbackCounts.new > 0 ? `${feedbackCounts.new} шинэ` : null,
      badgeColor: 'bg-primary/20 text-primary',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">🛠️ Админ</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl p-5">
          <p className="text-sm opacity-90">Нийт цуглуулсан шимтгэл</p>
          <p className="text-3xl font-bold mt-1">{formatPrice(totalCommission)}</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-sm text-muted">Дууссан захиалга</p>
          <p className="text-3xl font-bold mt-1">{totalCompletedOrders}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className="bg-surface border border-border rounded-2xl p-5 hover:border-primary transition-colors"
          >
            <div className="text-3xl mb-2">{t.icon}</div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-bold">{t.title}</p>
              {t.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.badgeColor}`}>
                  {t.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-muted">{t.desc}</p>
          </Link>
        ))}
      </div>

      {failedEmails.length > 0 && (
        <section className="mt-8">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <span>⚠️</span> Илгээгдээгүй имэйл ({failedEmails.length})
          </h2>
          <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {failedEmails.map(f => (
              <div key={f.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{f.subject}</p>
                  <p className="text-xs text-muted truncate">
                    → {f.to_email}
                    {f.context ? ` · ${f.context}` : ''} · {f.created_at}
                  </p>
                  {f.error && <p className="text-xs text-red-600 mt-1 break-all line-clamp-2">{f.error}</p>}
                </div>
                <form action={resolveFailedEmail} className="flex-shrink-0">
                  <input type="hidden" name="id" value={f.id} />
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-primary-light/20 whitespace-nowrap"
                  >
                    Шийдсэн
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
