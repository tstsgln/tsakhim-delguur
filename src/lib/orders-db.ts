import 'server-only';
import { db } from './db';

export const COMMISSION_RATE_BPS = 500;
export const AUTO_RELEASE_DAYS = 7;
export const PLATFORM_ACCOUNT = 'platform_commission';
export const SELLER_ACCOUNT = 'seller_earnings';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface OrderRow {
  id: number;
  buyer_user_id: number;
  seller_id: number;
  status: OrderStatus;
  subtotal: number;
  commission_rate: number;
  commission_amount: number;
  seller_amount: number;
  payment_method: string;
  payment_ref: string | null;
  buyer_phone: string;
  shipping_address: string;
  buyer_note: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
  created_at: string;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_image_path: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface CartLine {
  productId: number;
  quantity: number;
}

interface ProductSnapshot {
  id: number;
  seller_id: number;
  name: string;
  price: number;
  image_path: string | null;
}

function commissionFor(subtotal: number, rateBps = COMMISSION_RATE_BPS): number {
  return Math.floor((subtotal * rateBps) / 10000);
}

function fetchProductSnapshots(productIds: number[]): Map<number, ProductSnapshot> {
  if (productIds.length === 0) return new Map();
  const placeholders = productIds.map(() => '?').join(',');
  const rows = db
    .prepare(
      `SELECT p.id, p.seller_id, p.name, p.price,
              (SELECT path FROM product_images WHERE product_id = p.id ORDER BY position ASC LIMIT 1) AS image_path
       FROM products p
       WHERE p.id IN (${placeholders})`,
    )
    .all(...productIds) as ProductSnapshot[];
  return new Map(rows.map(r => [r.id, r]));
}

export interface CheckoutInput {
  buyerUserId: number;
  lines: CartLine[];
  phone: string;
  shippingAddress: string;
  note?: string;
}

export interface CreatedOrderSummary {
  orderId: number;
  sellerId: number;
  subtotal: number;
}

export function createOrdersFromCart(input: CheckoutInput): CreatedOrderSummary[] {
  const validLines = input.lines.filter(l => l.quantity > 0 && Number.isInteger(l.productId));
  if (validLines.length === 0) {
    throw new Error('Сагс хоосон байна');
  }

  const productIds = [...new Set(validLines.map(l => l.productId))];
  const snapshots = fetchProductSnapshots(productIds);

  const bySeller = new Map<number, { product: ProductSnapshot; quantity: number }[]>();
  for (const line of validLines) {
    const snap = snapshots.get(line.productId);
    if (!snap) throw new Error('Зарим бараа олдсонгүй');
    const group = bySeller.get(snap.seller_id) ?? [];
    group.push({ product: snap, quantity: line.quantity });
    bySeller.set(snap.seller_id, group);
  }

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      buyer_user_id, seller_id, status, subtotal,
      commission_rate, commission_amount, seller_amount,
      payment_method, buyer_phone, shipping_address, buyer_note
    ) VALUES (?, ?, 'pending_payment', ?, ?, ?, ?, 'mock', ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (
      order_id, product_id, product_name, product_image_path,
      unit_price, quantity, line_total
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction((): CreatedOrderSummary[] => {
    const summaries: CreatedOrderSummary[] = [];
    for (const [sellerId, items] of bySeller) {
      const subtotal = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
      const commission = commissionFor(subtotal);
      const sellerAmount = subtotal - commission;
      const result = insertOrder.run(
        input.buyerUserId,
        sellerId,
        subtotal,
        COMMISSION_RATE_BPS,
        commission,
        sellerAmount,
        input.phone.trim(),
        input.shippingAddress.trim(),
        input.note?.trim() || null,
      );
      const orderId = Number(result.lastInsertRowid);
      for (const { product, quantity } of items) {
        insertItem.run(
          orderId,
          product.id,
          product.name,
          product.image_path,
          product.price,
          quantity,
          product.price * quantity,
        );
      }
      summaries.push({ orderId, sellerId, subtotal });
    }
    return summaries;
  });

  return tx();
}

export function getOrder(id: number): OrderRow | null {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined;
  return row ?? null;
}

export function getOrderItems(orderId: number): OrderItemRow[] {
  return db
    .prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC')
    .all(orderId) as OrderItemRow[];
}

export interface OrderListItem extends OrderRow {
  item_count: number;
  cover_image: string | null;
  first_product_name: string;
  store_name: string | null;
  buyer_name: string | null;
}

export function listOrdersForBuyer(buyerUserId: number): OrderListItem[] {
  return db
    .prepare(
      `SELECT o.*,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count,
              (SELECT product_image_path FROM order_items WHERE order_id = o.id ORDER BY id ASC LIMIT 1) AS cover_image,
              (SELECT product_name FROM order_items WHERE order_id = o.id ORDER BY id ASC LIMIT 1) AS first_product_name,
              s.store_name,
              NULL AS buyer_name
       FROM orders o
       JOIN sellers s ON s.id = o.seller_id
       WHERE o.buyer_user_id = ?
       ORDER BY o.created_at DESC`,
    )
    .all(buyerUserId) as OrderListItem[];
}

export function listOrdersForSeller(sellerId: number): OrderListItem[] {
  return db
    .prepare(
      `SELECT o.*,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count,
              (SELECT product_image_path FROM order_items WHERE order_id = o.id ORDER BY id ASC LIMIT 1) AS cover_image,
              (SELECT product_name FROM order_items WHERE order_id = o.id ORDER BY id ASC LIMIT 1) AS first_product_name,
              NULL AS store_name,
              u.name AS buyer_name
       FROM orders o
       JOIN users u ON u.id = o.buyer_user_id
       WHERE o.seller_id = ?
         AND o.status != 'pending_payment'
       ORDER BY o.created_at DESC`,
    )
    .all(sellerId) as OrderListItem[];
}

export function listPendingPaymentOrders(): OrderListItem[] {
  return db
    .prepare(
      `SELECT o.*,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count,
              (SELECT product_image_path FROM order_items WHERE order_id = o.id ORDER BY id ASC LIMIT 1) AS cover_image,
              (SELECT product_name FROM order_items WHERE order_id = o.id ORDER BY id ASC LIMIT 1) AS first_product_name,
              s.store_name,
              u.name AS buyer_name
       FROM orders o
       JOIN sellers s ON s.id = o.seller_id
       JOIN users u ON u.id = o.buyer_user_id
       WHERE o.status = 'pending_payment'
       ORDER BY o.created_at ASC`,
    )
    .all() as OrderListItem[];
}

export function markPaid(orderId: number): { ok: boolean; reason?: string } {
  const order = getOrder(orderId);
  if (!order) return { ok: false, reason: 'Захиалга олдсонгүй' };
  if (order.status !== 'pending_payment') return { ok: false, reason: 'Энэ захиалга төлбөр хүлээж байгаа төлөвт байхгүй' };
  db.prepare(`UPDATE orders SET status = 'paid', paid_at = datetime('now') WHERE id = ?`).run(orderId);
  return { ok: true };
}

export function markShipped(orderId: number, sellerUserId: number): { ok: boolean; reason?: string } {
  const order = getOrder(orderId);
  if (!order) return { ok: false, reason: 'Захиалга олдсонгүй' };
  const seller = db.prepare('SELECT user_id FROM sellers WHERE id = ?').get(order.seller_id) as { user_id: number } | undefined;
  if (!seller || seller.user_id !== sellerUserId) return { ok: false, reason: 'Зөвшөөрөлгүй үйлдэл' };
  if (order.status !== 'paid') return { ok: false, reason: 'Захиалгыг илгээх боломжгүй төлөвт байна' };
  db.prepare(`UPDATE orders SET status = 'shipped', shipped_at = datetime('now') WHERE id = ?`).run(orderId);
  return { ok: true };
}

function releaseInternal(orderId: number): { ok: boolean; reason?: string } {
  const order = getOrder(orderId);
  if (!order) return { ok: false, reason: 'Захиалга олдсонгүй' };
  if (order.status !== 'shipped') return { ok: false, reason: 'Хүлээн авах боломжгүй төлөвт байна' };

  const seller = db
    .prepare('SELECT user_id FROM sellers WHERE id = ?')
    .get(order.seller_id) as { user_id: number } | undefined;
  if (!seller) return { ok: false, reason: 'Борлуулагч олдсонгүй' };

  const tx = db.transaction(() => {
    db.prepare(`UPDATE orders SET status = 'completed', completed_at = datetime('now') WHERE id = ?`).run(orderId);

    db.prepare(`
      INSERT INTO balances (user_id, account, amount) VALUES (?, ?, ?)
      ON CONFLICT(user_id, account) DO UPDATE SET amount = amount + excluded.amount, updated_at = datetime('now')
    `).run(seller.user_id, SELLER_ACCOUNT, order.seller_amount);
    db.prepare(`
      INSERT INTO ledger (user_id, account, delta, kind, order_id, note)
      VALUES (?, ?, ?, 'order_release', ?, ?)
    `).run(seller.user_id, SELLER_ACCOUNT, order.seller_amount, orderId, `#${orderId} орлого`);

    db.prepare(`
      INSERT INTO balances (user_id, account, amount) VALUES (NULL, ?, ?)
      ON CONFLICT(user_id, account) DO UPDATE SET amount = amount + excluded.amount, updated_at = datetime('now')
    `).run(PLATFORM_ACCOUNT, order.commission_amount);
    db.prepare(`
      INSERT INTO ledger (user_id, account, delta, kind, order_id, note)
      VALUES (NULL, ?, ?, 'commission_collect', ?, ?)
    `).run(PLATFORM_ACCOUNT, order.commission_amount, orderId, `#${orderId} шимтгэл`);
  });
  tx();
  return { ok: true };
}

export function confirmReceivedByBuyer(orderId: number, buyerUserId: number): { ok: boolean; reason?: string } {
  const order = getOrder(orderId);
  if (!order) return { ok: false, reason: 'Захиалга олдсонгүй' };
  if (order.buyer_user_id !== buyerUserId) return { ok: false, reason: 'Зөвшөөрөлгүй үйлдэл' };
  return releaseInternal(orderId);
}

export function autoReleaseStaleOrders(): number {
  const stale = db
    .prepare(
      `SELECT id FROM orders
       WHERE status = 'shipped'
         AND shipped_at IS NOT NULL
         AND datetime(shipped_at, '+${AUTO_RELEASE_DAYS} days') < datetime('now')`,
    )
    .all() as Array<{ id: number }>;
  for (const { id } of stale) {
    releaseInternal(id);
  }
  return stale.length;
}

export function cancelByBuyer(orderId: number, buyerUserId: number): { ok: boolean; reason?: string } {
  const order = getOrder(orderId);
  if (!order) return { ok: false, reason: 'Захиалга олдсонгүй' };
  if (order.buyer_user_id !== buyerUserId) return { ok: false, reason: 'Зөвшөөрөлгүй үйлдэл' };
  if (order.status !== 'pending_payment') return { ok: false, reason: 'Цуцлах боломжгүй төлөвт байна' };
  db.prepare(`UPDATE orders SET status = 'cancelled', cancelled_at = datetime('now') WHERE id = ?`).run(orderId);
  return { ok: true };
}

export interface BalanceRow {
  user_id: number | null;
  account: string;
  amount: number;
  updated_at: string;
}

export function getSellerBalance(userId: number): number {
  const row = db
    .prepare('SELECT amount FROM balances WHERE user_id = ? AND account = ?')
    .get(userId, SELLER_ACCOUNT) as { amount: number } | undefined;
  return row?.amount ?? 0;
}

export function getPlatformCommissionBalance(): number {
  const row = db
    .prepare('SELECT amount FROM balances WHERE user_id IS NULL AND account = ?')
    .get(PLATFORM_ACCOUNT) as { amount: number } | undefined;
  return row?.amount ?? 0;
}

export interface LedgerEntry {
  id: number;
  user_id: number | null;
  account: string;
  delta: number;
  kind: string;
  order_id: number | null;
  payout_id: number | null;
  note: string | null;
  created_at: string;
}

export function listLedgerForUser(userId: number, limit = 50): LedgerEntry[] {
  return db
    .prepare(
      'SELECT * FROM ledger WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?',
    )
    .all(userId, limit) as LedgerEntry[];
}

export interface PayoutRow {
  id: number;
  user_id: number;
  amount: number;
  status: 'requested' | 'completed' | 'rejected';
  bank_name: string;
  account_number: string;
  account_holder: string;
  admin_note: string | null;
  requested_at: string;
  completed_at: string | null;
}

export function requestPayout(args: {
  userId: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}): { ok: boolean; reason?: string; payoutId?: number } {
  if (args.amount <= 0) return { ok: false, reason: 'Дүн зөв байх ёстой' };

  const tx = db.transaction(() => {
    const balance = getSellerBalance(args.userId);
    if (balance < args.amount) {
      return { ok: false, reason: 'Үлдэгдэл хүрэлцэхгүй байна' };
    }
    const result = db
      .prepare(
        `INSERT INTO payouts (user_id, amount, status, bank_name, account_number, account_holder)
         VALUES (?, ?, 'requested', ?, ?, ?)`,
      )
      .run(args.userId, args.amount, args.bankName.trim(), args.accountNumber.trim(), args.accountHolder.trim());
    const payoutId = Number(result.lastInsertRowid);

    db.prepare(`
      UPDATE balances SET amount = amount - ?, updated_at = datetime('now')
      WHERE user_id = ? AND account = ?
    `).run(args.amount, args.userId, SELLER_ACCOUNT);
    db.prepare(`
      INSERT INTO ledger (user_id, account, delta, kind, payout_id, note)
      VALUES (?, ?, ?, 'withdraw_request', ?, ?)
    `).run(args.userId, SELLER_ACCOUNT, -args.amount, payoutId, 'Татан авах хүсэлт');

    return { ok: true as const, payoutId };
  });

  return tx();
}

export function listPayoutsForUser(userId: number): PayoutRow[] {
  return db
    .prepare('SELECT * FROM payouts WHERE user_id = ? ORDER BY requested_at DESC')
    .all(userId) as PayoutRow[];
}

export interface PayoutWithUser extends PayoutRow {
  user_name: string;
  user_email: string;
}

export function listPayouts(status?: 'requested' | 'completed' | 'rejected'): PayoutWithUser[] {
  const sql = `
    SELECT p.*, u.name AS user_name, u.email AS user_email
    FROM payouts p
    JOIN users u ON u.id = p.user_id
    ${status ? 'WHERE p.status = ?' : ''}
    ORDER BY p.requested_at DESC
  `;
  if (status) return db.prepare(sql).all(status) as PayoutWithUser[];
  return db.prepare(sql).all() as PayoutWithUser[];
}

export function completePayout(payoutId: number, adminNote?: string): { ok: boolean; reason?: string } {
  const payout = db.prepare('SELECT * FROM payouts WHERE id = ?').get(payoutId) as PayoutRow | undefined;
  if (!payout) return { ok: false, reason: 'Олдсонгүй' };
  if (payout.status !== 'requested') return { ok: false, reason: 'Аль хэдийн боловсруулсан' };
  db.prepare(
    `UPDATE payouts SET status = 'completed', completed_at = datetime('now'), admin_note = ? WHERE id = ?`,
  ).run(adminNote?.trim() || null, payoutId);
  return { ok: true };
}

export function rejectPayout(payoutId: number, adminNote: string): { ok: boolean; reason?: string } {
  const payout = db.prepare('SELECT * FROM payouts WHERE id = ?').get(payoutId) as PayoutRow | undefined;
  if (!payout) return { ok: false, reason: 'Олдсонгүй' };
  if (payout.status !== 'requested') return { ok: false, reason: 'Аль хэдийн боловсруулсан' };

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE payouts SET status = 'rejected', completed_at = datetime('now'), admin_note = ? WHERE id = ?`,
    ).run(adminNote.trim() || null, payoutId);
    db.prepare(`
      INSERT INTO balances (user_id, account, amount) VALUES (?, ?, ?)
      ON CONFLICT(user_id, account) DO UPDATE SET amount = amount + excluded.amount, updated_at = datetime('now')
    `).run(payout.user_id, SELLER_ACCOUNT, payout.amount);
    db.prepare(`
      INSERT INTO ledger (user_id, account, delta, kind, payout_id, note)
      VALUES (?, ?, ?, 'withdraw_reject', ?, ?)
    `).run(payout.user_id, SELLER_ACCOUNT, payout.amount, payoutId, `Татан авах татгалзав: ${adminNote}`);
  });
  tx();
  return { ok: true };
}
