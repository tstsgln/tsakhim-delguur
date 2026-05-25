import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/db';
import { getOrder, getOrderItems, autoReleaseStaleOrders, COMMISSION_RATE_BPS } from '@/lib/orders-db';
import { formatPrice } from '@/lib/data';
import { orderStatusLabel, orderStatusColor, formatOrderDate } from '@/lib/order-format';
import { sellerMarkShipped } from '@/app/actions/orders';
import { getStoreForUser } from '@/lib/seller-stores';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerOrderDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  autoReleaseStaleOrders();
  const order = getOrder(orderId);
  if (!order) notFound();
  const seller = getStoreForUser(user.id, order.seller_id);
  if (!seller) notFound();
  if (order.status === 'pending_payment') notFound();

  const items = getOrderItems(orderId);
  const buyer = db
    .prepare('SELECT name, email FROM users WHERE id = ?')
    .get(order.buyer_user_id) as { name: string; email: string } | undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/seller/orders?store=${seller.id}`} className="text-sm text-muted hover:text-primary mb-3 inline-block">
        ← Захиалгууд
      </Link>

      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <h1 className="text-2xl font-bold">Захиалга #{order.id}</h1>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${orderStatusColor(order.status)}`}>
          {orderStatusLabel(order.status)}
        </span>
      </div>
      <p className="text-sm text-muted mb-6">Үүсгэсэн: {formatOrderDate(order.created_at)}</p>

      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <h2 className="font-bold mb-3">👤 Худалдан авагч</h2>
        <p className="text-sm font-medium">{buyer?.name}</p>
        <a href={`mailto:${buyer?.email}`} className="text-xs text-primary hover:underline">{buyer?.email}</a>
        <p className="text-sm text-muted mt-2">📞 {order.buyer_phone}</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <h2 className="font-bold mb-3">📍 Хүргэлтийн хаяг</h2>
        <p className="text-sm whitespace-pre-wrap">{order.shipping_address}</p>
        {order.buyer_note && (
          <p className="text-sm text-muted mt-2 italic">«{order.buyer_note}»</p>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <h2 className="font-bold mb-3">Бараа</h2>
        <div className="space-y-3">
          {items.map(it => (
            <div key={it.id} className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary-light/20 flex-shrink-0 relative">
                {it.product_image_path ? (
                  <Image src={it.product_image_path} alt={it.product_name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{it.product_name}</p>
                <p className="text-xs text-muted">
                  {formatPrice(it.unit_price)} × {it.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(it.line_total)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-4 pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Барааны нийт</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Сайтын шимтгэл ({(COMMISSION_RATE_BPS / 100).toFixed(0)}%)</span>
            <span>−{formatPrice(order.commission_amount)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-border">
            <span>Танд орох</span>
            <span className="text-primary">{formatPrice(order.seller_amount)}</span>
          </div>
        </div>
      </div>

      {order.status === 'paid' && (
        <form action={sellerMarkShipped}>
          <input type="hidden" name="orderId" value={order.id} />
          <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark">
            🚚 Илгээсэн гэж тэмдэглэх
          </button>
          <p className="text-xs text-muted text-center mt-2">
            Барааг илгээсний дараа дарна уу. 7 хоногийн дотор худалдан авагч баталгаажуулаагүй бол автоматаар дуусна.
          </p>
        </form>
      )}
      {order.status === 'shipped' && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-sm">
          ⏳ Худалдан авагчийн баталгаажуулалт хүлээж байна. Илгээсэн: {formatOrderDate(order.shipped_at)}
        </div>
      )}
      {order.status === 'completed' && (
        <div className="bg-success/10 border border-success/40 text-success rounded-xl p-4 text-sm">
          ✓ Захиалга дууссан. {formatPrice(order.seller_amount)} таны дансанд орлоо.
        </div>
      )}
    </div>
  );
}
