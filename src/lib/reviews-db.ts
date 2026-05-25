import 'server-only';
import { db } from './db';

export interface ReviewRow {
  id: number;
  order_id: number;
  order_item_id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewWithUser extends ReviewRow {
  user_name: string;
}

export interface ProductRatingStats {
  avg_rating: number;
  review_count: number;
}

export interface PendingReviewItem {
  order_id: number;
  order_item_id: number;
  product_id: number;
  product_name: string;
  product_image_path: string | null;
  completed_at: string;
}

export function createReview(args: {
  orderItemId: number;
  userId: number;
  rating: number;
  comment?: string;
}): { ok: boolean; reason?: string; reviewId?: number } {
  if (!Number.isInteger(args.rating) || args.rating < 1 || args.rating > 5) {
    return { ok: false, reason: 'Үнэлгээ 1-5 хооронд байх ёстой' };
  }

  const item = db
    .prepare(
      `SELECT oi.id AS order_item_id, oi.order_id, oi.product_id, o.buyer_user_id, o.status
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.id = ?`,
    )
    .get(args.orderItemId) as
    | { order_item_id: number; order_id: number; product_id: number | null; buyer_user_id: number; status: string }
    | undefined;

  if (!item) return { ok: false, reason: 'Захиалга олдсонгүй' };
  if (item.buyer_user_id !== args.userId) return { ok: false, reason: 'Зөвшөөрөлгүй үйлдэл' };
  if (item.status !== 'completed') {
    return { ok: false, reason: 'Зөвхөн хүлээн авсан барааг үнэлэх боломжтой' };
  }
  if (item.product_id == null) {
    return { ok: false, reason: 'Энэ бараа устсан тул үнэлэх боломжгүй' };
  }

  const existing = db
    .prepare('SELECT id FROM reviews WHERE order_item_id = ?')
    .get(args.orderItemId) as { id: number } | undefined;
  if (existing) return { ok: false, reason: 'Энэ бараанд аль хэдийн үнэлгээ өгсөн байна' };

  const result = db
    .prepare(
      `INSERT INTO reviews (order_id, order_item_id, product_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      item.order_id,
      args.orderItemId,
      item.product_id,
      args.userId,
      args.rating,
      args.comment?.trim() || null,
    );

  return { ok: true, reviewId: Number(result.lastInsertRowid) };
}

export function getReviewByOrderItem(orderItemId: number): ReviewRow | null {
  const row = db
    .prepare('SELECT * FROM reviews WHERE order_item_id = ?')
    .get(orderItemId) as ReviewRow | undefined;
  return row ?? null;
}

export function getReviewsForOrder(orderId: number): Map<number, ReviewRow> {
  const rows = db
    .prepare('SELECT * FROM reviews WHERE order_id = ?')
    .all(orderId) as ReviewRow[];
  return new Map(rows.map(r => [r.order_item_id, r]));
}

export function getProductReviews(productId: number, limit = 50): ReviewWithUser[] {
  return db
    .prepare(
      `SELECT r.*, u.name AS user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT ?`,
    )
    .all(productId, limit) as ReviewWithUser[];
}

export function getProductRatingStats(productId: number): ProductRatingStats {
  const row = db
    .prepare(
      `SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS review_count
       FROM reviews WHERE product_id = ?`,
    )
    .get(productId) as { avg_rating: number; review_count: number };
  return { avg_rating: row.avg_rating, review_count: row.review_count };
}
