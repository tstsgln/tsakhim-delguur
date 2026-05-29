import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import {
  getAllProducts,
  getProductById,
  getProductDetail,
  getProductsBySeller,
  getCategoryCounts,
  getSitemapProducts,
} from './products-db';

function reset() {
  db.pragma('foreign_keys = OFF');
  for (const t of ['product_images', 'products', 'sellers', 'users']) db.exec(`DELETE FROM ${t}`);
  db.exec('DELETE FROM sqlite_sequence');
  db.pragma('foreign_keys = ON');
}

function seedProduct(): { sellerId: number; productId: number } {
  const u = db
    .prepare("INSERT INTO users (name, email, password_hash, email_verified_at) VALUES ('S','s@x.mn','x',datetime('now'))")
    .run();
  const sellerId = Number(
    db.prepare("INSERT INTO sellers (user_id, store_name, phone, location) VALUES (?, 'Store', '99', 'UB')").run(Number(u.lastInsertRowid)).lastInsertRowid,
  );
  const productId = Number(
    db.prepare("INSERT INTO products (seller_id, name, description, price, category, stock_quantity) VALUES (?, 'Vase', 'd', 1000, 'cat', 5)").run(sellerId).lastInsertRowid,
  );
  return { sellerId, productId };
}

function archive(productId: number) {
  db.prepare("UPDATE products SET archived_at = datetime('now') WHERE id = ?").run(productId);
}

beforeEach(reset);

describe('archived products are hidden from buyer-facing reads', () => {
  it('appears everywhere while active', () => {
    const { sellerId, productId } = seedProduct();
    expect(getAllProducts()).toHaveLength(1);
    expect(getProductById(productId)).not.toBeNull();
    expect(getProductDetail(productId)).not.toBeNull();
    expect(getProductsBySeller(sellerId)).toHaveLength(1);
    expect(getCategoryCounts().cat).toBe(1);
    expect(getSitemapProducts()).toHaveLength(1);
  });

  it('disappears from every buyer-facing query once archived', () => {
    const { sellerId, productId } = seedProduct();
    archive(productId);
    expect(getAllProducts()).toHaveLength(0);
    expect(getProductById(productId)).toBeNull();
    expect(getProductDetail(productId)).toBeNull();
    expect(getProductsBySeller(sellerId)).toHaveLength(0);
    expect(getCategoryCounts().cat ?? 0).toBe(0);
    expect(getSitemapProducts()).toHaveLength(0);
  });

  it('reappears after un-archiving', () => {
    const { productId } = seedProduct();
    archive(productId);
    expect(getAllProducts()).toHaveLength(0);
    db.prepare('UPDATE products SET archived_at = NULL WHERE id = ?').run(productId);
    expect(getAllProducts()).toHaveLength(1);
    expect(getProductById(productId)).not.toBeNull();
  });
});
