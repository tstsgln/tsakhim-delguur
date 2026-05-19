import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { isAdmin } from '@/lib/admin';
import { listPayouts } from '@/lib/orders-db';
import { formatPrice } from '@/lib/data';
import { formatOrderDate } from '@/lib/order-format';
import { adminCompletePayout, adminRejectPayout } from '@/app/actions/orders';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPayoutsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!isAdmin(user)) redirect('/');

  const sp = await searchParams;
  const valid = ['requested', 'completed', 'rejected'] as const;
  type Filter = (typeof valid)[number] | 'all';
  const filter: Filter = (valid as readonly string[]).includes(sp.status ?? '')
    ? (sp.status as Filter)
    : 'requested';

  const payouts = listPayouts(filter === 'all' ? undefined : filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-sm text-muted hover:text-primary mb-3 inline-block">
        ← Админ
      </Link>
      <h1 className="text-2xl font-bold mb-2">🏦 Татан авах хүсэлтүүд</h1>
      <p className="text-sm text-muted mb-6">
        Хүсэлтийн дагуу мөнгө шилжүүлсний дараа «Шилжүүлсэн» гэж тэмдэглэнэ.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            { v: 'requested', label: 'Хүлээгдэж буй' },
            { v: 'completed', label: 'Дууссан' },
            { v: 'rejected', label: 'Татгалзсан' },
            { v: 'all', label: 'Бүгд' },
          ] as const
        ).map(t => (
          <Link
            key={t.v}
            href={`/admin/payouts?status=${t.v}`}
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

      {payouts.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-muted">Энэ ангилалд хүсэлт алга.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map(p => (
            <div key={p.id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div>
                  <p className="text-xs text-muted">#{p.id} · {formatOrderDate(p.requested_at)}</p>
                  <p className="font-bold text-lg">{formatPrice(p.amount)}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.status === 'requested'
                      ? 'bg-warning/20 text-warning'
                      : p.status === 'completed'
                        ? 'bg-success/20 text-success'
                        : 'bg-muted/20 text-muted'
                  }`}
                >
                  {p.status === 'requested' ? 'Хүлээгдэж буй' : p.status === 'completed' ? 'Дууссан' : 'Татгалзсан'}
                </span>
              </div>

              <div className="text-sm space-y-1 mb-3">
                <p>
                  <span className="text-muted">Хэрэглэгч:</span> <b>{p.user_name}</b>{' '}
                  <a href={`mailto:${p.user_email}`} className="text-xs text-primary hover:underline">
                    {p.user_email}
                  </a>
                </p>
                <p>
                  <span className="text-muted">Банк:</span> {p.bank_name}
                </p>
                <p>
                  <span className="text-muted">Данс:</span> <span className="font-mono">{p.account_number}</span>
                </p>
                <p>
                  <span className="text-muted">Эзэмшигч:</span> {p.account_holder}
                </p>
                {p.admin_note && (
                  <p className="text-xs text-muted italic mt-2">«{p.admin_note}»</p>
                )}
                {p.completed_at && (
                  <p className="text-xs text-muted">Боловсруулсан: {formatOrderDate(p.completed_at)}</p>
                )}
              </div>

              {p.status === 'requested' && (
                <div className="border-t border-border pt-3 grid sm:grid-cols-2 gap-3">
                  <form action={adminCompletePayout}>
                    <input type="hidden" name="payoutId" value={p.id} />
                    <input
                      name="note"
                      type="text"
                      placeholder="Тэмдэглэл (заавал биш)"
                      className="w-full text-sm border border-border rounded-lg px-3 py-1.5 mb-2"
                    />
                    <button className="w-full bg-success text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
                      ✓ Шилжүүлсэн гэж тэмдэглэх
                    </button>
                  </form>
                  <form action={adminRejectPayout}>
                    <input type="hidden" name="payoutId" value={p.id} />
                    <input
                      name="note"
                      type="text"
                      required
                      placeholder="Татгалзах шалтгаан *"
                      className="w-full text-sm border border-border rounded-lg px-3 py-1.5 mb-2"
                    />
                    <button className="w-full bg-surface border border-border text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50">
                      ✕ Татгалзах
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
