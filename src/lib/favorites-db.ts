import 'server-only';
import { db } from './db';

export function isFavorite(userId: number, productId: number): boolean {
  return !!db
    .prepare('SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?')
    .get(userId, productId);
}

export function addFavorite(userId: number, productId: number): void {
  db.prepare(
    'INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
  ).run(userId, productId);
}

export function removeFavorite(userId: number, productId: number): void {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(userId, productId);
}

// Toggles and returns the new state (true = now favorited).
export function toggleFavorite(userId: number, productId: number): boolean {
  if (isFavorite(userId, productId)) {
    removeFavorite(userId, productId);
    return false;
  }
  addFavorite(userId, productId);
  return true;
}

export function countFavorites(userId: number): number {
  return (
    db.prepare('SELECT COUNT(*) AS c FROM favorites WHERE user_id = ?').get(userId) as { c: number }
  ).c;
}
