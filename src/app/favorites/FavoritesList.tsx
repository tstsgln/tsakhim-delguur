'use client';

import Link from 'next/link';
import { useFavorites } from '@/lib/favorites-context';
import ProductCard from '@/components/ProductCard';

export default function FavoritesList() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">♡</p>
        <h2 className="text-2xl font-bold mb-2">Хадгалсан бүтээгдэхүүн</h2>
        <p className="text-muted mb-6">Та одоогоор ямар ч бүтээгдэхүүн хадгалаагүй байна.</p>
        <Link href="/products" className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Бүтээгдэхүүн үзэх
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">♥ Хадгалсан бүтээгдэхүүн ({favorites.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
