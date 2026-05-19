'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { categories } from '@/lib/data';
import type { SessionUser } from '@/lib/types';
import { logout } from '@/app/actions/auth';

interface HeaderProps {
  user: SessionUser | null;
  isSeller: boolean;
  unreadCount: number;
  isAdmin: boolean;
}

export default function Header({ user, isSeller, unreadCount: initialUnread, isAdmin }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const router = useRouter();

  useEffect(() => {
    setUnreadCount(initialUnread);
  }, [initialUnread]);

  useEffect(() => {
    if (!user) return;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    const tick = async () => {
      try {
        const res = await fetch('/api/unread', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        setUnreadCount(prev => {
          if (data.count > prev) {
            const delta = data.count - prev;
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                new Notification('Шинэ зурвас', {
                  body: delta > 1 ? `${delta} шинэ зурвас ирлээ` : 'Танд шинэ зурвас ирлээ',
                  tag: 'unread-count',
                });
              } catch {
                // ignore
              }
            }
            router.refresh();
          }
          return data.count;
        });
      } catch {
        // ignore
      }
    };
    const interval = setInterval(tick, 15000);
    return () => clearInterval(interval);
  }, [user, router]);
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userDropdown) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userDropdown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface shadow-sm">
      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">
              <span>🌸</span> Цэцэглэн
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
            {user ? (
              <div ref={userMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => setUserDropdown(v => !v)}
                  className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors relative"
                >
                  <span className="text-xl">👤</span>
                  <span>{user.name}</span>
                  <span className="text-xs">▾</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {userDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg py-2 w-60 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <Link href="/messages" onClick={() => setUserDropdown(false)} className="flex items-center justify-between gap-2 px-4 py-2 text-sm hover:bg-primary-light/20">
                      <span className="flex items-center gap-2"><span>💬</span> Зурвасууд</span>
                      {unreadCount > 0 && (
                        <span className="bg-primary text-white text-[10px] leading-none rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/balance" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-light/20">
                      <span>💳</span> Дансны үлдэгдэл
                    </Link>
                    <Link href="/purchases" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-light/20">
                      <span>🛍️</span> Худалдан авалт
                    </Link>
                    <Link href="/favorites" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-light/20">
                      <span>♡</span> Хадгалсан
                    </Link>
                    <div className="border-t border-border my-1" />
                    {isSeller ? (
                      <Link href="/seller/dashboard" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-light/20">
                        <span>🏪</span> Миний дэлгүүр
                      </Link>
                    ) : (
                      <Link href="/sell" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-light/20">
                        <span>🏪</span> Борлуулагч болох
                      </Link>
                    )}
                    <Link href="/settings/delete" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-light/20">
                      <span>🗑️</span> Бүртгэлээ устгах
                    </Link>
                    <Link href="/help" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-light/20">
                      <span>❓</span> Тусламжийн төв
                    </Link>
                    <Link href="/feedback" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-light/20">
                      <span>💌</span> Санал, гомдол
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-light/20 text-primary font-medium">
                        <span>🛠️</span> Админ
                      </Link>
                    )}
                    <div className="border-t border-border my-1" />
                    <form action={logout}>
                      <button
                        type="submit"
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-primary-light/20 text-red-600"
                      >
                        <span>⎋</span> Гарах
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
                <span className="text-xl">👤</span>
                <span>Нэвтрэх</span>
              </Link>
            )}
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
            <div
              className="relative"
              onMouseEnter={() => setCategoryDropdown(true)}
              onMouseLeave={() => setCategoryDropdown(false)}
            >
              <button
                onClick={() => setCategoryDropdown(v => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-primary-light/30 transition-colors font-medium whitespace-nowrap"
              >
                ☰ Бүх ангилал
              </button>
              {categoryDropdown && (
                <div className="absolute left-0 top-full pt-1 z-50">
                  <div className="bg-surface border border-border rounded-lg shadow-lg py-2 w-64 max-h-[70vh] overflow-y-auto">
                    {categories.map(cat => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.id}`}
                        onClick={() => setCategoryDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-primary-light/20 transition-colors"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-md hover:bg-primary-light/30 transition-colors whitespace-nowrap"
            >
              Бидний тухай
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <div className="py-2 text-sm">
                  <p className="font-medium">👤 {user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
                <form action={logout}>
                  <button type="submit" className="block py-2 text-sm text-red-600">
                    ⎋ Гарах
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="block py-2 text-sm">👤 Нэвтрэх</Link>
            )}
            {isSeller ? (
              <Link href="/seller/dashboard" className="block py-2 text-sm">🏪 Миний дэлгүүр</Link>
            ) : (
              <Link href="/sell" className="block py-2 text-sm">🏪 Борлуулагч болох</Link>
            )}
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
