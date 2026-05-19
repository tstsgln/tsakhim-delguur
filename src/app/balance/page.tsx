import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/db';
import {
  getSellerBalance,
  listLedgerForUser,
  listPayoutsForUser,
  autoReleaseStaleOrders,
} from '@/lib/orders-db';
import { formatPrice } from '@/lib/data';
import { formatOrderDate } from '@/lib/order-format';
import PayoutForm from './PayoutForm';

export const dynamic = 'force-dynamic';

function ledgerKindLabel(kind: string): string {
  switch (kind) {
    case 'order_release':
      return 'Захиалгын орлого';
    case 'commission_collect':
      return 'Шимтгэл';
    case 'withdraw_request':
      return 'Татан авах хүсэлт';
    case 'withdraw_reject':
      return 'Татан авахаас татгалзав';
    case 'refund':
      return 'Буцаалт';
    case 'adjustment':
      return 'Тохируулга';
    default:
      return kind;
  }
}

function payoutStatusLabel(s: string): string {
  return s === 'requested' ? 'Хүлээгдэж буй' : s === 'completed' ? 'Дууссан' : 'Татгалзав';
}

function payoutStatusColor(s: string): string {
  return s === 'requested'
    ? 'bg-warning/20 text-warning'
    : s === 'completed'
      ? 'bg-success/20 text-success'
      : 'bg-muted/20 text-muted';
}

export default async function BalancePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(user.id);
  if (!seller) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-4xl mb-3">💳</p>
        <h1 className="text-2xl font-bold mb-2">Дансны үлдэгдэл</h1>
        <p className="text-muted mb-4">
          Орлого хүлээж авахын тулд та эхлээд борлуулагч болох хэрэгтэй.
        </p>
        <Link href="/sell" className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-semibold">
          Борлуулагч болох
        </Link>
      </div>
    );
  }

  autoReleaseStaleOrders();
  const balance = getSellerBalance(user.id);
  const ledger = listLedgerForUser(user.id, 50);
  const payouts = listPayoutsForUser(user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">💳 Дансны үлдэгдэл</h1>

      <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl p-6 mb-6">
        <p className="text-sm opacity-90 mb-1">Татан авах боломжтой</p>
        <p className="text-4xl font-bold">{formatPrice(balance)}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-bold mb-3">Татан авах</h2>
          {balance <= 0 ? (
            <p className="text-sm text-muted">Татан авах боломжтой үлдэгдэл байхгүй байна.</p>
          ) : (
            <PayoutForm maxAmount={balance} userName={user.name} />
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-bold mb-3">Татан авалтын түүх</h2>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted">Одоогоор татан авалт байхгүй.</p>
          ) : (
            <div className="space-y-3">
              {payouts.map(p => (
                <div key={p.id} className="border-b border-border pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{formatPrice(p.amount)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${payoutStatusColor(p.status)}`}>
                      {payoutStatusLabel(p.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {p.bank_name} · {p.account_number} · {formatOrderDate(p.requested_at)}
                  </p>
                  {p.admin_note && (
                    <p className="text-xs text-muted mt-1 italic">«{p.admin_note}»</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="font-bold mb-3">Гүйлгээний түүх</h2>
        {ledger.length === 0 ? (
          <p className="text-sm text-muted">Одоогоор гүйлгээ байхгүй.</p>
        ) : (
          <div className="space-y-2">
            {ledger.map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {ledgerKindLabel(l.kind)}
                    {l.order_id && (
                      <Link href={`/seller/orders/${l.order_id}`} className="text-xs text-primary ml-2 hover:underline">
                        #{l.order_id}
                      </Link>
                    )}
                  </p>
                  <p className="text-xs text-muted">{formatOrderDate(l.created_at)}{l.note ? ` · ${l.note}` : ''}</p>
                </div>
                <p
                  className={`font-semibold text-sm whitespace-nowrap ${
                    l.delta > 0 ? 'text-success' : 'text-red-600'
                  }`}
                >
                  {l.delta > 0 ? '+' : ''}
                  {formatPrice(l.delta)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
