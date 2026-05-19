import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { isAdmin } from '@/lib/admin';
import { listPendingPaymentOrders } from '@/lib/orders-db';
import { formatPrice } from '@/lib/data';
import { formatOrderDate } from '@/lib/order-format';
import { adminMarkPaid } from '@/app/actions/orders';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!isAdmin(user)) redirect('/');

  const pending = listPendingPaymentOrders();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-sm text-muted hover:text-primary mb-3 inline-block">
        ← Админ
      </Link>
      <h1 className="text-2xl font-bold mb-2">💳 Төлбөр хүлээж буй захиалгууд</h1>
      <p className="text-sm text-muted mb-6">
        Худалдан авагч тантай холбогдож төлбөр шилжүүлэх / QR-аар төлөх. Та төлбөрийг хүлээж авсаны
        дараа «Төлбөрийг хүлээж авлаа» гэж тэмдэглэнэ.
      </p>

      {pending.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-muted">Төлбөр хүлээж буй захиалга байхгүй.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(o => (
            <div key={o.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary-light/20 flex-shrink-0 relative">
                  {o.cover_image ? (
                    <Image src={o.cover_image} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-muted">#{o.id}</span>
                    <span className="text-xs text-muted">{formatOrderDate(o.created_at)}</span>
                  </div>
                  <p className="font-medium truncate">
                    {o.first_product_name}
                    {o.item_count > 1 && <span className="text-muted text-sm"> +{o.item_count - 1}</span>}
                  </p>
                  <p className="text-xs text-muted">
                    👤 {o.buyer_name} · 📞 {o.buyer_phone} · 🏪 {o.store_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatPrice(o.subtotal)}</p>
                </div>
              </div>

              <div className="border-t border-border mt-3 pt-3 flex items-center gap-3 flex-wrap">
                <Link
                  href={`/purchases/${o.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  Дэлгэрэнгүй харах →
                </Link>
                <form action={adminMarkPaid} className="ml-auto">
                  <input type="hidden" name="orderId" value={o.id} />
                  <button className="bg-success text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
                    ✓ Төлбөрийг хүлээж авлаа
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
