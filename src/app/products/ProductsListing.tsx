'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/lib/data';
import type { Product } from '@/lib/types';
import type { StoreSearchResult } from '@/lib/products-db';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';

const PAGE_SIZE = 24;

// Builds a compact page-number list with gaps, e.g. [1, '…', 4, 5, 6, '…', 12].
function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

interface Props {
  products: Product[];
  categoryCounts: Record<string, number>;
  matchingStores?: StoreSearchResult[];
}

export default function ProductsListing({ products, categoryCounts, matchingStores = [] }: Props) {
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

  const [page, setPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);

  // Reset to the first page whenever the result set changes (filter/sort/search).
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, sort, priceRange]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Scroll the grid back into view on page change (but not on first render).
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

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
          {searchQuery && matchingStores.length > 0 && (
            <section className="mb-6 bg-surface border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">🏪 Олдсон дэлгүүрүүд ({matchingStores.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingStores.map(s => (
                  <Link
                    key={s.id}
                    href={`/store/${s.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-light/20 transition-colors border border-transparent hover:border-border"
                  >
                    <span className="w-10 h-10 rounded-full bg-primary-light/30 flex items-center justify-center text-xl flex-shrink-0">
                      🏪
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{s.storeName}</p>
                      <p className="text-xs text-muted truncate">
                        📍 {s.location} · {s.productCount} бараа
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div ref={gridTopRef} className="scroll-mt-32" />
          {/* Sort bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <p className="text-sm text-muted">
              {filteredProducts.length > 0
                ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} / ${filteredProducts.length} бүтээгдэхүүн`
                : '0 бүтээгдэхүүн олдлоо'}
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
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {pageItems.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Хуудаслалт">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-sm border border-border hover:bg-primary-light/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Өмнөх хуудас"
                  >
                    ←
                  </button>
                  {pageWindow(currentPage, totalPages).map((p, i) =>
                    p === '…' ? (
                      <span key={`gap-${i}`} className="px-2 text-muted">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        aria-current={p === currentPage ? 'page' : undefined}
                        className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm border transition-colors ${
                          p === currentPage
                            ? 'bg-primary text-white border-primary'
                            : 'border-border hover:bg-primary-light/20'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg text-sm border border-border hover:bg-primary-light/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Дараагийн хуудас"
                  >
                    →
                  </button>
                </nav>
              )}
            </>
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
