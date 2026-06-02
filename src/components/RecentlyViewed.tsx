'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { addRecentlyViewed, getRecentlyViewed } from '@/lib/recently-viewed';
import ProductCard from './ProductCard';

interface Props {
  /** If set, record this product as viewed on mount before reading the list. */
  record?: Product;
  /** Hide this product from the list (usually the one currently being viewed). */
  excludeId?: string;
  title?: string;
  limit?: number;
}

export default function RecentlyViewed({ record, excludeId, title = 'Сүүлд үзсэн', limit = 8 }: Props) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (record) addRecentlyViewed(record);
    setItems(getRecentlyViewed());
    // Keyed off the viewed product's id; record/setItems are stable enough here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  const shown = items.filter(p => p.id !== excludeId).slice(0, limit);
  if (shown.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {shown.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
