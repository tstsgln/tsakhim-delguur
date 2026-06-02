import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from './types';
import { addRecentlyViewed, getRecentlyViewed } from './recently-viewed';

// Minimal localStorage stub so the (otherwise browser-only) helper runs under node.
function installLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('window', {}); // satisfy the helper's `typeof window === 'undefined'` guard
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
}

function product(id: number): Product {
  return {
    id: String(id),
    name: `P${id}`,
    description: '',
    price: 1000,
    images: [],
    category: 'cat',
    seller: { id: '1', name: 'S', avatar: '🏪', rating: 5, salesCount: 0, location: 'UB', joinedDate: '' },
    rating: 0,
    reviewCount: 0,
    tags: [],
    createdAt: '',
    stockQuantity: 5,
    acceptCustomOrders: false,
  };
}

describe('recently-viewed', () => {
  beforeEach(() => installLocalStorage());

  it('puts the most recently viewed product first', () => {
    addRecentlyViewed(product(1));
    addRecentlyViewed(product(2));
    expect(getRecentlyViewed().map(p => p.id)).toEqual(['2', '1']);
  });

  it('de-duplicates by id, moving a re-viewed product to the front', () => {
    addRecentlyViewed(product(1));
    addRecentlyViewed(product(2));
    addRecentlyViewed(product(1));
    expect(getRecentlyViewed().map(p => p.id)).toEqual(['1', '2']);
  });

  it('caps the list at 12 most-recent items', () => {
    for (let i = 1; i <= 15; i++) addRecentlyViewed(product(i));
    const ids = getRecentlyViewed().map(p => p.id);
    expect(ids).toHaveLength(12);
    expect(ids[0]).toBe('15');
    expect(ids).not.toContain('3'); // oldest three dropped
  });

  it('returns an empty array when storage is malformed', () => {
    localStorage.setItem('tsetseglen.recentlyViewed.v1', 'not json');
    expect(getRecentlyViewed()).toEqual([]);
  });
});
