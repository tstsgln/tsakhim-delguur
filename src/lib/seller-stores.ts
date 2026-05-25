import 'server-only';
import { db } from './db';
import type { SellerRow } from './types';

export function getStoresForUser(userId: number): SellerRow[] {
  return db
    .prepare('SELECT * FROM sellers WHERE user_id = ? ORDER BY created_at ASC, id ASC')
    .all(userId) as SellerRow[];
}

export function getStoreForUser(userId: number, storeId: number): SellerRow | null {
  const row = db
    .prepare('SELECT * FROM sellers WHERE id = ? AND user_id = ?')
    .get(storeId, userId) as SellerRow | undefined;
  return row ?? null;
}

export function resolveActiveStore(
  userId: number,
  requestedStoreId: number | null,
): SellerRow | null {
  if (requestedStoreId != null) {
    const owned = getStoreForUser(userId, requestedStoreId);
    if (owned) return owned;
  }
  const stores = getStoresForUser(userId);
  return stores[0] ?? null;
}

export function parseStoreParam(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}
