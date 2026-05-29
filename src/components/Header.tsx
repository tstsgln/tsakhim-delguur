'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useFavorites } from '@/lib/favorites-context';
import { categories, formatPrice } from '@/lib/data';
import type { SessionUser } from '@/lib/types';
import { logout } from '@/app/actions/auth';

const ICON_SVG_PROPS = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function BellIcon() {
  return (
    <svg {...ICON_SVG_PROPS} aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg {...ICON_SVG_PROPS} aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg {...ICON_SVG_PROPS} aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...ICON_SVG_PROPS} aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

interface HeaderProps {
  user: SessionUser | null;
  isSeller: boolean;
  unreadCount: number;
  notificationCount: number;
  isAdmin: boolean;
}

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

const NOTIF_ICON: Record<string, string> = {
  order_placed_seller: '🎉',
  order_paid_buyer: '✓',
  order_paid_seller: '💰',
  order_shipped_buyer: '📦',
  order_received_seller: '🎁',
  order_cancelled_seller: '✕',
};

function formatRelativeTime(iso: string): string {
  const date = new Date(iso + 'Z');
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'дөнгөж сая';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} мин`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} цаг`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} өдөр`;
  return date.toLocaleDateString('mn-MN', { month: '2-digit', day: '2-digit' });
}

export default function Header({
  user,
  isSeller,
  unreadCount: initialUnread,
  notificationCount: initialNotifs,
  isAdmin,
}: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [notificationCount, setNotificationCount] = useState(initialNotifs);
  const router = useRouter();

  useEffect(() => {
    setUnreadCount(initialUnread);
  }, [initialUnread]);

  useEffect(() => {
    setNotificationCount(initialNotifs);
  }, [initialNotifs]);

  useEffect(() => {
    if (!user) return;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    const tick = async () => {
      try {
        const [msgRes, notifRes] = await Promise.all([
          fetch('/api/unread', { cache: 'no-store' }),
          fetch('/api/notifications/unread', { cache: 'no-store' }),
        ]);

        if (msgRes.ok) {
          const data = (await msgRes.json()) as { count: number };
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
        }

        if (notifRes.ok) {
          const data = (await notifRes.json()) as { count: number };
          setNotificationCount(prev => {
            if (data.count > prev) {
              const delta = data.count - prev;
              if (
                typeof window !== 'undefined' &&
                'Notification' in window &&
                Notification.permission === 'granted'
              ) {
                try {
                  new Notification('Шинэ мэдэгдэл', {
                    body: delta > 1 ? `${delta} шинэ мэдэгдэл ирлээ` : 'Танд шинэ мэдэгдэл ирлээ',
                    tag: 'notif-count',
                  });
                } catch {
                  // ignore
                }
              }
              router.refresh();
            }
            return data.count;
          });
        }
      } catch {
        // ignore
      }
    };
    const interval = setInterval(tick, 15000);
    return () => clearInterval(interval);
  }, [user, router]);
  const { totalItems } = useCart();
  const { favorites, unseenCount: favUnseen, markFavoritesSeen } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [favDropdown, setFavDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const favMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!categoryDropdown) return;
    const handler = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [categoryDropdown]);

  useEffect(() => {
    if (!notifDropdown) return;
    const handler = (e: MouseEvent) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifDropdown]);

  useEffect(() => {
    if (!favDropdown) return;
    const handler = (e: MouseEvent) => {
      if (favMenuRef.current && !favMenuRef.current.contains(e.target as Node)) {
        setFavDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [favDropdown]);

  const openNotifDropdown = async () => {
    setNotifDropdown(true);
    setNotifLoading(true);
    try {
      const res = await fetch('/api/notifications/list', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { notifications: NotificationItem[] };
        setNotifications(data.notifications);
      }
      if (notificationCount > 0) {
        await fetch('/api/notifications/mark-read', { method: 'POST' });
        setNotificationCount(0);
      }
    } catch {
      // ignore
    } finally {
      setNotifLoading(false);
    }
  };

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
                aria-label="Хайх"
                className="bg-primary text-white px-5 py-2.5 rounded-r-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
              >
                <SearchIcon />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            {user ? (
              <div ref={userMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => setUserDropdown(v => !v)}
                  aria-label={user.name}
                  className="flex flex-col items-center gap-0.5 px-2 py-1 text-primary hover:text-primary-dark transition-colors"
                >
                  <span className="relative">
                    <UserIcon />
                    {unreadCount + notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold ring-2 ring-surface">
                        {unreadCount + notificationCount > 9 ? '9+' : unreadCount + notificationCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-medium">Профайл</span>
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
              <Link
                href="/login"
                className="hidden md:flex flex-col items-center gap-0.5 px-2 py-1 text-primary hover:text-primary-dark transition-colors"
              >
                <UserIcon />
                <span className="text-[11px] font-medium">Нэвтрэх</span>
              </Link>
            )}
            {user && (
              <div ref={notifMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => (notifDropdown ? setNotifDropdown(false) : openNotifDropdown())}
                  aria-label="Мэдэгдэл"
                  className="flex flex-col items-center gap-0.5 px-2 py-1 text-primary hover:text-primary-dark transition-colors"
                >
                  <span className="relative">
                    <BellIcon />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold ring-2 ring-surface">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-medium">Мэдэгдэл</span>
                </button>
                {notifDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg w-80 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <span className="text-sm font-semibold">Мэдэгдэл</span>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto">
                      {notifLoading && notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted">Уншиж байна...</div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-muted">
                          <div className="text-3xl mb-2">🔕</div>
                          Мэдэгдэл алга байна
                        </div>
                      ) : (
                        notifications.map(n => {
                          const isUnread = n.read_at === null;
                          const inner = (
                            <div
                              className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-primary-light/10 transition-colors ${
                                isUnread ? 'bg-primary-light/5' : ''
                              }`}
                            >
                              <span className="text-xl flex-shrink-0 leading-tight">
                                {NOTIF_ICON[n.type] ?? '🔔'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${isUnread ? 'font-semibold' : 'font-medium text-muted'}`}>
                                  {n.title}
                                </p>
                                {n.body && (
                                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                                )}
                                <p className="text-[11px] text-muted mt-1">{formatRelativeTime(n.created_at)}</p>
                              </div>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" aria-hidden />
                              )}
                            </div>
                          );
                          return n.link ? (
                            <Link key={n.id} href={n.link} onClick={() => setNotifDropdown(false)} className="block">
                              {inner}
                            </Link>
                          ) : (
                            <div key={n.id}>{inner}</div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={favMenuRef} className="relative hidden md:block">
              <button
                onClick={() => {
                  const opening = !favDropdown;
                  setFavDropdown(opening);
                  if (opening) markFavoritesSeen();
                }}
                aria-label="Хадгалсан"
                className="flex flex-col items-center gap-0.5 px-2 py-1 text-primary hover:text-primary-dark transition-colors"
              >
                <span className="relative">
                  <HeartIcon />
                  {favUnseen > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold ring-2 ring-surface">
                      {favUnseen > 9 ? '9+' : favUnseen}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium">Хадгалсан</span>
              </button>
              {favDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg w-80 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-semibold">Хадгалсан бүтээгдэхүүн</span>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    {favorites.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-muted">
                        <div className="text-3xl mb-2">♡</div>
                        Хадгалсан зүйл алга байна
                      </div>
                    ) : (
                      favorites.map(p => (
                        <Link
                          key={p.id}
                          href={`/product/${p.id}`}
                          onClick={() => setFavDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-primary-light/10 transition-colors"
                        >
                          <span className="w-12 h-12 rounded-lg overflow-hidden bg-primary-light/20 flex-shrink-0 relative">
                            {p.images?.[0] ? (
                              <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-lg">📦</span>
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-sm text-primary font-semibold">{formatPrice(p.price)}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <Link
                    href="/favorites"
                    onClick={() => setFavDropdown(false)}
                    className="block px-4 py-3 text-center text-sm font-medium text-primary border-t border-border hover:bg-primary-light/10 transition-colors"
                  >
                    Бүгдийг харах →
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/cart"
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-primary hover:text-primary-dark transition-colors"
            >
              <span className="relative">
                <CartIcon />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold ring-2 ring-surface">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-medium">Сагс</span>
            </Link>
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-primary hover:text-primary-dark hover:bg-primary-light/30 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Цэс"
            >
              {mobileMenuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
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
            <button type="submit" aria-label="Хайх" className="bg-primary text-white px-4 py-2 rounded-r-lg flex items-center justify-center"><SearchIcon /></button>
          </div>
        </form>
      </div>

      {/* Category nav */}
      <nav className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="hidden md:flex items-center gap-1 py-2 text-sm">
            <div ref={categoryMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoryDropdown(v => !v)}
                aria-expanded={categoryDropdown}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-primary-light/30 transition-colors font-medium whitespace-nowrap"
              >
                ☰ Бүх ангилал <span className="text-xs">▾</span>
              </button>
              {categoryDropdown && (
                <div className="absolute left-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg py-2 w-64 max-h-[70vh] overflow-y-auto z-50">
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
