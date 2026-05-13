'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { categories } from '@/lib/data';

export default function Header() {
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-white text-sm py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>🇲🇳 Монгол гар урлалын шилдэг бүтээлүүд</span>
          <div className="hidden md:flex gap-4">
            <Link href="/sell" className="hover:underline">Худалдаач болох</Link>
            <Link href="/about" className="hover:underline">Бидний тухай</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">
              <span className="text-accent">✦</span> Цахим Дэлгүүр
            </h1>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Бүтээгдэхүүн хайх..."
                className="flex-1 border border-border rounded-l-lg px-4 py-2.5 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2.5 rounded-r-lg hover:bg-primary-dark transition-colors"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/login" className="hidden md:flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
              <span className="text-xl">👤</span>
              <span>Нэвтрэх</span>
            </Link>
            <Link href="/favorites" className="hidden md:flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
              <span className="text-xl">♡</span>
            </Link>
            <Link href="/cart" className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors relative">
              <span className="text-xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="hidden md:inline">Сагс</span>
            </Link>
            <button
              className="md:hidden text-2xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Бүтээгдэхүүн хайх..."
              className="flex-1 border border-border rounded-l-lg px-3 py-2 focus:outline-none focus:border-primary text-sm"
            />
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-r-lg">🔍</button>
          </div>
        </form>
      </div>

      {/* Category nav */}
      <nav className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="hidden md:flex items-center gap-1 py-2 text-sm overflow-x-auto">
            <div className="relative">
              <button
                onMouseEnter={() => setCategoryDropdown(true)}
                onMouseLeave={() => setCategoryDropdown(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-primary-light/30 transition-colors font-medium"
              >
                ☰ Бүх ангилал
              </button>
              {categoryDropdown && (
                <div
                  onMouseEnter={() => setCategoryDropdown(true)}
                  onMouseLeave={() => setCategoryDropdown(false)}
                  className="absolute left-0 top-full bg-surface border border-border rounded-lg shadow-lg py-2 w-56 z-50"
                >
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-primary-light/20 transition-colors"
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                      <span className="ml-auto text-xs text-muted">({cat.productCount})</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {categories.slice(0, 6).map(cat => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="px-3 py-1.5 rounded-md hover:bg-primary-light/30 transition-colors whitespace-nowrap"
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-3 space-y-2">
            <Link href="/login" className="block py-2 text-sm">👤 Нэвтрэх</Link>
            <Link href="/sell" className="block py-2 text-sm">🏪 Худалдаач болох</Link>
            <div className="border-t border-border pt-2 mt-2">
              <p className="text-xs text-muted mb-2">Ангилал</p>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="block py-1.5 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
