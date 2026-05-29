import 'server-only';
import { db } from './db';
import { createNotification } from './notifications-db';
import { sendEmail, buildNewOrderEmailForSeller, getAppBaseUrl, type SendArgs } from './email';

interface OrderContext {
  orderId: number;
  buyerUserId: number;
  sellerUserId: number;
  sellerStoreName: string;
  sellerEmail: string;
  itemCount: number;
  firstProductName: string;
  subtotal: number;
}

function loadContext(orderId: number): OrderContext | null {
  const row = db
    .prepare(
      `SELECT
         o.id AS orderId,
         o.buyer_user_id AS buyerUserId,
         o.subtotal AS subtotal,
         s.user_id AS sellerUserId,
         s.store_name AS sellerStoreName,
         u.email AS sellerEmail,
         (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS itemCount,
         (SELECT product_name FROM order_items WHERE order_id = o.id ORDER BY id ASC LIMIT 1) AS firstProductName
       FROM orders o
       JOIN sellers s ON s.id = o.seller_id
       JOIN users u ON u.id = s.user_id
       WHERE o.id = ?`,
    )
    .get(orderId) as OrderContext | undefined;
  return row ?? null;
}

// Fire-and-forget: sendEmail persists failures to failed_emails on its own,
// so here we only need to keep the rejection from going unhandled.
function fireEmail(args: SendArgs, context: string): void {
  sendEmail(args, context).catch(err => {
    console.error(`[email-fail:${context}]`, err instanceof Error ? err.message : err);
  });
}

export function notifyNewOrder(orderId: number): void {
  const ctx = loadContext(orderId);
  if (!ctx) return;

  createNotification({
    userId: ctx.sellerUserId,
    type: 'order_placed_seller',
    title: `Шинэ захиалга #${ctx.orderId} ирлээ`,
    body: `${ctx.firstProductName}${ctx.itemCount > 1 ? ` +${ctx.itemCount - 1}` : ''} · ${ctx.subtotal.toLocaleString('mn-MN')}₮`,
    link: `/seller/orders/${ctx.orderId}`,
  });

  const orderUrl = `${getAppBaseUrl()}/seller/orders/${ctx.orderId}`;
  const email = buildNewOrderEmailForSeller({
    storeName: ctx.sellerStoreName,
    orderId: ctx.orderId,
    itemCount: ctx.itemCount,
    firstProductName: ctx.firstProductName,
    subtotal: ctx.subtotal,
    orderUrl,
  });
  fireEmail(
    { to: ctx.sellerEmail, subject: email.subject, html: email.html, text: email.text },
    `new-order-${ctx.orderId}`,
  );
}

export function notifyOrderPaid(orderId: number): void {
  const ctx = loadContext(orderId);
  if (!ctx) return;

  createNotification({
    userId: ctx.buyerUserId,
    type: 'order_paid_buyer',
    title: `Захиалга #${ctx.orderId} — төлбөр баталгаажлаа`,
    body: `Зарагч барааг бэлдэж эхэлнэ.`,
    link: `/purchases/${ctx.orderId}`,
  });

  createNotification({
    userId: ctx.sellerUserId,
    type: 'order_paid_seller',
    title: `Захиалга #${ctx.orderId} — төлбөр орлоо`,
    body: `Барааг бэлдэж "Илгээсэн" гэж тэмдэглэнэ үү.`,
    link: `/seller/orders/${ctx.orderId}`,
  });
}

export function notifyOrderShipped(orderId: number): void {
  const ctx = loadContext(orderId);
  if (!ctx) return;

  createNotification({
    userId: ctx.buyerUserId,
    type: 'order_shipped_buyer',
    title: `Захиалга #${ctx.orderId} илгээгдлээ`,
    body: `Барааг хүлээж аваад "Хүлээж авлаа" гэж баталгаажуулна уу.`,
    link: `/purchases/${ctx.orderId}`,
  });
}

export function notifyOrderReceived(orderId: number): void {
  const ctx = loadContext(orderId);
  if (!ctx) return;

  createNotification({
    userId: ctx.sellerUserId,
    type: 'order_received_seller',
    title: `Захиалга #${ctx.orderId} — худалдан авагч хүлээн авлаа`,
    body: `Орлого таны балансад орлоо.`,
    link: `/seller/orders/${ctx.orderId}`,
  });
}
