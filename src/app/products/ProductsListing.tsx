'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/lib/data';
import type { Product } from '@/lib/types';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';

interface Props {
  products: Product[];
  categoryCounts: Record<string, number>;
}

export default function ProductsListing({ products, categoryCounts }: Props) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';

  const [sort, setSort] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.seller.name.toLowerCase().includes(q),
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, searchQuery, selectedCategory, sort, priceRange]);

  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-6">
        <a href="/" className="hover:text-primary">Нүүр</a>
        <span className="mx-2">/</span>
        {currentCategory ? (
          <>
            <a href="/products" className="hover:text-primary">Бүтээгдэхүүн</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">{currentCategory.name}</span>
          </>
        ) : (
          <span className="text-foreground">
            {searchQuery ? `Хайлтын үр дүн: "${searchQuery}"` : 'Бүх бүтээгдэхүүн'}
          </span>
        )}
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-surface rounded-xl border border-border p-4 sticky top-32">
            <h3 className="font-bold mb-4">Шүүлтүүр</h3>

            {/* Category filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2">Ангилал</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    !selectedCategory ? 'bg-primary text-white' : 'hover:bg-primary-light/20'
                  }`}
                >
                  Бүгд
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      selectedCategory === cat.id ? 'bg-primary text-white' : 'hover:bg-primary-light/20'
                    }`}
                  >
                    {cat.icon} {cat.name} ({categoryCounts[cat.id] ?? 0})
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2">Үнэ (₮)</h4>
              <div className="space-y-2">
                {[
                  { label: 'Бүгд', range: [0, 2000000] as [number, number] },
                  { label: '50,000₮ хүртэл', range: [0, 50000] as [number, number] },
                  { label: '50,000₮ - 200,000₮', range: [50000, 200000] as [number, number] },
                  { label: '200,000₮ - 500,000₮', range: [200000, 500000] as [number, number] },
                  { label: '500,000₮-с дээш', range: [500000, 2000000] as [number, number] },
                ].map(({ label, range }) => (
                  <button
                    key={label}
                    onClick={() => setPriceRange(range)}
                    className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      priceRange[0] === range[0] && priceRange[1] === range[1]
                        ? 'bg-primary text-white'
                        : 'hover:bg-primary-light/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Free shipping */}
            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-primary" />
                Үнэгүй хүргэлт
              </label>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <p className="text-sm text-muted">
              {filteredProducts.length} бүтээгдэхүүн олдлоо
            </p>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
            >
              <option value="newest">Шинэ нь эхэнд</option>
              <option value="price-low">Үнэ: Бага → Их</option>
              <option value="price-high">Үнэ: Их → Бага</option>
              <option value="rating">Үнэлгээ</option>
              <option value="popular">Алдартай</option>
            </select>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-xl font-bold mb-2">Бүтээгдэхүүн олдсонгүй</h3>
              <p className="text-muted">Шүүлтүүрээ өөрчилж дахин хайна уу.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
