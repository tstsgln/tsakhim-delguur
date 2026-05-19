import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { listOrdersForBuyer, autoReleaseStaleOrders } from '@/lib/orders-db';
import { formatPrice } from '@/lib/data';
import { orderStatusLabel, orderStatusColor, formatOrderDate } from '@/lib/order-format';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ just_ordered?: string }>;
}

export default async function PurchasesPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  autoReleaseStaleOrders();
  const orders = listOrdersForBuyer(user.id);
  const sp = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🛍️ Миний захиалгууд</h1>

      {sp.just_ordered === '1' && orders.length > 0 && (
        <div className="bg-success/10 border border-success/40 text-success rounded-xl p-4 mb-5 text-sm">
          ✓ Захиалга амжилттай үүслээ. Манай админ таны төлбөрийг шалгаад баталгаажуулна.
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-muted mb-4">Та одоогоор захиалга өгөөгүй байна.</p>
          <Link
            href="/products"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark"
          >
            Бүтээгдэхүүн үзэх
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <Link
              key={o.id}
              href={`/purchases/${o.id}`}
              className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-primary transition-colors"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary-light/20 flex-shrink-0 relative">
                {o.cover_image ? (
                  <Image src={o.cover_image} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusColor(o.status)}`}>
                    {orderStatusLabel(o.status)}
                  </span>
                  <span className="text-xs text-muted">#{o.id}</span>
                </div>
                <p className="font-medium truncate">
                  {o.first_product_name}
                  {o.item_count > 1 && (
                    <span className="text-muted text-sm"> +{o.item_count - 1}</span>
                  )}
                </p>
                <p className="text-xs text-muted truncate">🏪 {o.store_name} · {formatOrderDate(o.created_at)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-primary">{formatPrice(o.subtotal)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
