import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { createReview, getProductReviews } from './reviews-db';

function resetDb() {
  db.pragma('foreign_keys = OFF');
  for (const t of [
    'review_images', 'reviews', 'order_items', 'orders',
    'product_images', 'products', 'sellers', 'users',
  ]) {
    db.exec(`DELETE FROM ${t}`);
  }
  db.exec('DELETE FROM sqlite_sequence');
  db.pragma('foreign_keys = ON');
}

// Builds a completed order with one item, ready to be reviewed by the buyer.
function seedCompletedPurchase(): { buyerId: number; productId: number; orderItemId: number } {
  const buyerId = Number(
    db.prepare("INSERT INTO users (name, email, password_hash, email_verified_at) VALUES ('Buyer', 'b@x.mn', 'x', datetime('now'))").run().lastInsertRowid,
  );
  const sellerUserId = Number(
    db.prepare("INSERT INTO users (name, email, password_hash, email_verified_at) VALUES ('Seller', 's@x.mn', 'x', datetime('now'))").run().lastInsertRowid,
  );
  const sellerId = Number(
    db.prepare("INSERT INTO sellers (user_id, store_name, phone, location) VALUES (?, 'Store', '99', 'UB')").run(sellerUserId).lastInsertRowid,
  );
  const productId = Number(
    db.prepare("INSERT INTO products (seller_id, name, description, price, category, stock_quantity) VALUES (?, 'P', 'd', 1000, 'cat', 5)").run(sellerId).lastInsertRowid,
  );
  const orderId = Number(
    db.prepare(
      `INSERT INTO orders (buyer_user_id, seller_id, status, subtotal, commission_rate, commission_amount, seller_amount, buyer_phone, shipping_address)
       VALUES (?, ?, 'completed', 1000, 500, 50, 950, '99', 'UB')`,
    ).run(buyerId, sellerId).lastInsertRowid,
  );
  const orderItemId = Number(
    db.prepare(
      "INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total) VALUES (?, ?, 'P', 1000, 1, 1000)",
    ).run(orderId, productId).lastInsertRowid,
  );
  return { buyerId, productId, orderItemId };
}

describe('createReview with photos', () => {
  beforeEach(resetDb);

  it('stores attached photos and returns them in getProductReviews', () => {
    const { buyerId, productId, orderItemId } = seedCompletedPurchase();
    const res = createReview({
      orderItemId,
      userId: buyerId,
      rating: 5,
      comment: 'Гоё',
      imagePaths: ['/uploads/reviews/a.jpg', '/uploads/reviews/b.png'],
    });
    expect(res.ok).toBe(true);

    const [review] = getProductReviews(productId);
    expect(review.images).toEqual(['/uploads/reviews/a.jpg', '/uploads/reviews/b.png']);
  });

  it('ignores non-upload paths and caps at 4 images', () => {
    const { buyerId, productId, orderItemId } = seedCompletedPurchase();
    createReview({
      orderItemId,
      userId: buyerId,
      rating: 4,
      imagePaths: [
        'https://evil.example/x.jpg', // rejected: not an /uploads path
        '/uploads/reviews/1.jpg',
        '/uploads/reviews/2.jpg',
        '/uploads/reviews/3.jpg',
        '/uploads/reviews/4.jpg',
        '/uploads/reviews/5.jpg', // dropped: over the cap of 4
      ],
    });
    const [review] = getProductReviews(productId);
    expect(review.images).toEqual([
      '/uploads/reviews/1.jpg',
      '/uploads/reviews/2.jpg',
      '/uploads/reviews/3.jpg',
      '/uploads/reviews/4.jpg',
    ]);
  });

  it('returns an empty array when a review has no photos', () => {
    const { buyerId, productId, orderItemId } = seedCompletedPurchase();
    createReview({ orderItemId, userId: buyerId, rating: 3 });
    const [review] = getProductReviews(productId);
    expect(review.images).toEqual([]);
  });
});
