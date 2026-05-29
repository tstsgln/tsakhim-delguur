import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import {
  COMMISSION_RATE_BPS,
  createOrdersFromCart,
  getOrder,
  markPaid,
  markShipped,
  confirmReceivedByBuyer,
  cancelByBuyer,
  requestPayout,
  completePayout,
  rejectPayout,
  getSellerBalance,
  getPlatformCommissionBalance,
  listLedgerForUser,
} from './orders-db';

// --- helpers -------------------------------------------------------------

function resetDb() {
  db.pragma('foreign_keys = OFF');
  for (const t of [
    'reviews', 'ledger', 'balances', 'payouts', 'order_items', 'orders',
    'product_images', 'products', 'messages', 'conversations', 'sellers',
    'email_verification_tokens', 'notifications', 'feedback', 'users',
  ]) {
    db.exec(`DELETE FROM ${t}`);
  }
  db.exec("DELETE FROM sqlite_sequence");
  db.pragma('foreign_keys = ON');
}

function createUser(name: string, email: string): number {
  const r = db
    .prepare("INSERT INTO users (name, email, password_hash, email_verified_at) VALUES (?, ?, 'x', datetime('now'))")
    .run(name, email);
  return Number(r.lastInsertRowid);
}

function createSeller(name: string, email: string): { userId: number; sellerId: number } {
  const userId = createUser(name, email);
  const r = db
    .prepare("INSERT INTO sellers (user_id, store_name, phone, location) VALUES (?, ?, '99', 'UB')")
    .run(userId, `${name} store`);
  return { userId, sellerId: Number(r.lastInsertRowid) };
}

function createProduct(sellerId: number, price: number, stock: number): number {
  const r = db
    .prepare("INSERT INTO products (seller_id, name, description, price, category, stock_quantity) VALUES (?, 'P', 'd', ?, 'cat', ?)")
    .run(sellerId, price, stock);
  return Number(r.lastInsertRowid);
}

function stockOf(productId: number): number {
  return (db.prepare('SELECT stock_quantity AS s FROM products WHERE id = ?').get(productId) as { s: number }).s;
}

const checkoutMeta = { phone: '99119911', shippingAddress: 'Улаанбаатар, СБД' };

beforeEach(resetDb);

// --- tests ---------------------------------------------------------------

describe('createOrdersFromCart', () => {
  it('computes commission (5%) and seller amount, decrements stock', () => {
    const { sellerId } = createSeller('S', 's@x.mn');
    const productId = createProduct(sellerId, 150_000, 10);
    const buyerId = createUser('B', 'b@x.mn');

    const summaries = createOrdersFromCart({
      buyerUserId: buyerId,
      lines: [{ productId, quantity: 2 }],
      ...checkoutMeta,
    });

    expect(summaries).toHaveLength(1);
    const order = getOrder(summaries[0].orderId)!;
    expect(order.subtotal).toBe(300_000);
    expect(order.commission_rate).toBe(COMMISSION_RATE_BPS);
    expect(order.commission_amount).toBe(15_000); // floor(300000 * 500 / 10000)
    expect(order.seller_amount).toBe(285_000);
    expect(order.status).toBe('pending_payment');
    expect(stockOf(productId)).toBe(8);
  });

  it('floors commission for non-divisible subtotals (integer money math)', () => {
    const { sellerId } = createSeller('S', 's@x.mn');
    const productId = createProduct(sellerId, 99, 5);
    const buyerId = createUser('B', 'b@x.mn');

    const [summary] = createOrdersFromCart({
      buyerUserId: buyerId,
      lines: [{ productId, quantity: 1 }],
      ...checkoutMeta,
    });
    const order = getOrder(summary.orderId)!;
    expect(order.subtotal).toBe(99);
    expect(order.commission_amount).toBe(4); // floor(99 * 500 / 10000) = floor(4.95)
    expect(order.seller_amount).toBe(95);
  });

  it('throws and does not decrement when stock is insufficient', () => {
    const { sellerId } = createSeller('S', 's@x.mn');
    const productId = createProduct(sellerId, 1000, 1);
    const buyerId = createUser('B', 'b@x.mn');

    expect(() =>
      createOrdersFromCart({ buyerUserId: buyerId, lines: [{ productId, quantity: 2 }], ...checkoutMeta }),
    ).toThrow();
    expect(stockOf(productId)).toBe(1); // transaction rolled back
  });

  it('splits a multi-seller cart into one order per seller', () => {
    const a = createSeller('A', 'a@x.mn');
    const b = createSeller('B', 'b@x.mn');
    const pA = createProduct(a.sellerId, 1000, 5);
    const pB = createProduct(b.sellerId, 2000, 5);
    const buyerId = createUser('Buyer', 'buyer@x.mn');

    const summaries = createOrdersFromCart({
      buyerUserId: buyerId,
      lines: [{ productId: pA, quantity: 1 }, { productId: pB, quantity: 1 }],
      ...checkoutMeta,
    });
    expect(summaries).toHaveLength(2);
    expect(summaries.map(s => s.subtotal).sort((x, y) => x - y)).toEqual([1000, 2000]);
  });
});

describe('order lifecycle + escrow release', () => {
  function placedOrder() {
    const seller = createSeller('S', 's@x.mn');
    const productId = createProduct(seller.sellerId, 100_000, 5);
    const buyerId = createUser('B', 'b@x.mn');
    const [summary] = createOrdersFromCart({
      buyerUserId: buyerId,
      lines: [{ productId, quantity: 1 }],
      ...checkoutMeta,
    });
    return { ...seller, buyerId, orderId: summary.orderId };
  }

  it('runs paid -> shipped -> completed and credits balances + ledger', () => {
    const { userId: sellerUserId, buyerId, orderId } = placedOrder();

    expect(markPaid(orderId).ok).toBe(true);
    expect(getOrder(orderId)!.status).toBe('paid');

    expect(markShipped(orderId, sellerUserId).ok).toBe(true);
    expect(getOrder(orderId)!.status).toBe('shipped');

    expect(confirmReceivedByBuyer(orderId, buyerId).ok).toBe(true);
    expect(getOrder(orderId)!.status).toBe('completed');

    // 100000 subtotal -> 5000 commission, 95000 to seller
    expect(getSellerBalance(sellerUserId)).toBe(95_000);
    expect(getPlatformCommissionBalance()).toBe(5_000);

    const ledger = listLedgerForUser(sellerUserId);
    expect(ledger.some(e => e.kind === 'order_release' && e.delta === 95_000)).toBe(true);
  });

  it('rejects markPaid when not pending', () => {
    const { orderId } = placedOrder();
    expect(markPaid(orderId).ok).toBe(true);
    expect(markPaid(orderId).ok).toBe(false); // already paid
  });

  it('rejects markShipped by a non-owner seller and before payment', () => {
    const { userId: sellerUserId, orderId } = placedOrder();
    const other = createSeller('Other', 'o@x.mn');

    expect(markShipped(orderId, sellerUserId).ok).toBe(false); // not paid yet
    markPaid(orderId);
    expect(markShipped(orderId, other.userId).ok).toBe(false); // wrong seller
    expect(markShipped(orderId, sellerUserId).ok).toBe(true);
  });

  it('rejects confirmReceived by a non-buyer', () => {
    const { userId: sellerUserId, orderId } = placedOrder();
    const stranger = createUser('X', 'x@x.mn');
    markPaid(orderId);
    markShipped(orderId, sellerUserId);
    expect(confirmReceivedByBuyer(orderId, stranger).ok).toBe(false);
    expect(getOrder(orderId)!.status).toBe('shipped');
  });
});

describe('cancel restores stock', () => {
  it('cancels a pending order and restores stock; refuses once paid', () => {
    const { sellerId } = createSeller('S', 's@x.mn');
    const productId = createProduct(sellerId, 1000, 5);
    const buyerId = createUser('B', 'b@x.mn');
    const [summary] = createOrdersFromCart({
      buyerUserId: buyerId,
      lines: [{ productId, quantity: 3 }],
      ...checkoutMeta,
    });
    expect(stockOf(productId)).toBe(2);

    expect(cancelByBuyer(summary.orderId, buyerId).ok).toBe(true);
    expect(getOrder(summary.orderId)!.status).toBe('cancelled');
    expect(stockOf(productId)).toBe(5); // restored

    // a fresh, paid order cannot be cancelled
    const [s2] = createOrdersFromCart({ buyerUserId: buyerId, lines: [{ productId, quantity: 1 }], ...checkoutMeta });
    markPaid(s2.orderId);
    expect(cancelByBuyer(s2.orderId, buyerId).ok).toBe(false);
  });
});

describe('payouts', () => {
  function sellerWithBalance(amount: number) {
    const seller = createSeller('S', 's@x.mn');
    const productId = createProduct(seller.sellerId, amount, 5);
    const buyerId = createUser('B', 'b@x.mn');
    const [summary] = createOrdersFromCart({
      buyerUserId: buyerId,
      lines: [{ productId, quantity: 1 }],
      ...checkoutMeta,
    });
    markPaid(summary.orderId);
    markShipped(summary.orderId, seller.userId);
    confirmReceivedByBuyer(summary.orderId, buyerId);
    return seller; // balance = amount - 5% commission
  }

  it('deducts balance on request and refunds on rejection', () => {
    const seller = sellerWithBalance(100_000);
    const balance = getSellerBalance(seller.userId); // 95000
    expect(balance).toBe(95_000);

    const req = requestPayout({
      userId: seller.userId,
      amount: 50_000,
      bankName: 'Khan',
      accountNumber: '1234',
      accountHolder: 'S',
    });
    expect(req.ok).toBe(true);
    expect(getSellerBalance(seller.userId)).toBe(45_000);

    const rej = rejectPayout(req.payoutId!, 'буруу данс');
    expect(rej.ok).toBe(true);
    expect(getSellerBalance(seller.userId)).toBe(95_000); // refunded
  });

  it('refuses a payout larger than the balance', () => {
    const seller = sellerWithBalance(20_000); // balance 19000
    const req = requestPayout({
      userId: seller.userId,
      amount: 1_000_000,
      bankName: 'Khan',
      accountNumber: '1234',
      accountHolder: 'S',
    });
    expect(req.ok).toBe(false);
    expect(getSellerBalance(seller.userId)).toBe(19_000); // unchanged
  });

  it('completes a requested payout and leaves balance reduced', () => {
    const seller = sellerWithBalance(100_000);
    const req = requestPayout({
      userId: seller.userId,
      amount: 95_000,
      bankName: 'Khan',
      accountNumber: '1234',
      accountHolder: 'S',
    });
    expect(req.ok).toBe(true);
    expect(completePayout(req.payoutId!, 'илгээсэн').ok).toBe(true);
    expect(getSellerBalance(seller.userId)).toBe(0);
    // a second completion on the same payout is rejected
    expect(completePayout(req.payoutId!).ok).toBe(false);
  });
});
