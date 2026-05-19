import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { isAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { getOrder, getOrderItems, autoReleaseStaleOrders } from '@/lib/orders-db';
import { formatPrice } from '@/lib/data';
import { orderStatusLabel, orderStatusColor, formatOrderDate } from '@/lib/order-format';
import { buyerConfirmReceived, buyerCancel } from '@/app/actions/orders';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  autoReleaseStaleOrders();
  const order = getOrder(orderId);
  if (!order) notFound();
  const isOwner = order.buyer_user_id === user.id;
  if (!isOwner && !isAdmin(user)) notFound();

  const items = getOrderItems(orderId);
  const seller = db
    .prepare('SELECT store_name, phone, location FROM sellers WHERE id = ?')
    .get(order.seller_id) as { store_name: string; phone: string; location: string } | undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/purchases" className="text-sm text-muted hover:text-primary mb-3 inline-block">
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
        <h2 className="font-bold mb-3">Төлөв</h2>
        <ol className="space-y-2 text-sm">
          <Step done label="Захиалга үүссэн" at={order.created_at} />
          <Step done={!!order.paid_at} label="Төлбөр баталгаажсан" at={order.paid_at} />
          <Step done={!!order.shipped_at} label="Илгээгдсэн" at={order.shipped_at} />
          <Step done={!!order.completed_at} label="Хүлээн авсан" at={order.completed_at} />
        </ol>
      </div>

      {order.status === 'pending_payment' && (
        <div className="bg-warning/10 border border-warning/40 rounded-xl p-4 mb-5 text-sm">
          <p className="mb-2">
            ⏳ <b>Төлбөр хүлээж байна.</b> Манай админ таны төлбөрийг гараар шалгаж баталгаажуулна.
          </p>
          <p className="text-muted">
            Хэрэв төлбөр илгээгээгүй бол энэ захиалгыг цуцалж болно.
          </p>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <h2 className="font-bold mb-3">🏪 Дэлгүүр</h2>
        <p className="text-sm">
          <Link href={`/store/${order.seller_id}`} className="font-medium text-primary hover:underline">
            {seller?.store_name}
          </Link>
        </p>
        <p className="text-xs text-muted mt-1">📍 {seller?.location}</p>
        {order.status !== 'pending_payment' && seller?.phone && (
          <a href={`tel:${seller.phone}`} className="text-xs text-primary hover:underline mt-1 inline-block">
            📞 {seller.phone}
          </a>
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
                {it.product_id ? (
                  <Link href={`/product/${it.product_id}`} className="font-medium hover:text-primary truncate block">
                    {it.product_name}
                  </Link>
                ) : (
                  <p className="font-medium truncate">{it.product_name}</p>
                )}
                <p className="text-xs text-muted">
                  {formatPrice(it.unit_price)} × {it.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(it.line_total)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-4 pt-3 flex justify-between font-bold">
          <span>Нийт</span>
          <span className="text-primary">{formatPrice(order.subtotal)}</span>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <h2 className="font-bold mb-3">Хүргэлт</h2>
        <p className="text-sm whitespace-pre-wrap">{order.shipping_address}</p>
        <p className="text-sm text-muted mt-2">📞 {order.buyer_phone}</p>
        {order.buyer_note && (
          <p className="text-sm text-muted mt-2 italic">«{order.buyer_note}»</p>
        )}
      </div>

      {isOwner && (
        <div className="flex gap-3">
          {order.status === 'pending_payment' && (
            <form action={buyerCancel}>
              <input type="hidden" name="orderId" value={order.id} />
              <button className="px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-primary-light/20">
                Цуцлах
              </button>
            </form>
          )}
          {order.status === 'shipped' && (
            <form action={buyerConfirmReceived}>
              <input type="hidden" name="orderId" value={order.id} />
              <button className="flex-1 bg-success text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90">
                ✓ Барааг хүлээж авлаа
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Step({ done, label, at }: { done: boolean; label: string; at: string | null }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
          done ? 'bg-success text-white' : 'bg-border text-muted'
        }`}
      >
        {done ? '✓' : '•'}
      </span>
      <span className={done ? 'font-medium' : 'text-muted'}>{label}</span>
      {at && <span className="text-xs text-muted ml-auto">{formatOrderDate(at)}</span>}
    </li>
  );
}
