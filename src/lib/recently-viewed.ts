import type { Product } from './types';

// Recently-viewed products are kept client-side only (like guest favorites): we
// store a full Product snapshot per item so the list renders without a server
// round-trip. Most-recent first, capped, de-duplicated by id.
const STORAGE_KEY = 'tsetseglen.recentlyViewed.v1';
const MAX = 12;

export function getRecentlyViewed(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product: Product): Product[] {
  if (typeof window === 'undefined') return [];
  const next = [product, ...getRecentlyViewed().filter(p => p.id !== product.id)].slice(0, MAX);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / disabled storage
  }
  return next;
}
