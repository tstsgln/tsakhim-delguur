'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { setFavoriteAction } from '@/app/actions/favorites';
import { Product } from './types';

interface FavoritesContextType {
  favorites: Product[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => void;
  count: number;
  /** Newly-saved items not yet viewed in the dropdown (drives the header badge). */
  unseenCount: number;
  /** Call when the user opens the favorites dropdown to clear the badge. */
  markFavoritesSeen: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'tsetseglen.favorites.v1';
const SEEN_KEY = 'tsetseglen.favorites.seen.v1';

export function FavoritesProvider({
  children,
  isLoggedIn,
}: {
  children: ReactNode;
  isLoggedIn: boolean;
}) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [seenCount, setSeenCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const favoritesRef = useRef<Product[]>([]);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  // 1. Load guest favorites + last-seen count from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw) as Product[]);
      const seenRaw = localStorage.getItem(SEEN_KEY);
      if (seenRaw) setSeenCount(Number(seenRaw) || 0);
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  // 2. Persist to localStorage on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites, hydrated]);

  // Keep the seen baseline persisted, and never let it exceed the current
  // count (so removing items doesn't leave a stale "unseen" number).
  useEffect(() => {
    setSeenCount(s => Math.min(s, favorites.length));
  }, [favorites.length]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SEEN_KEY, String(seenCount));
    } catch {
      // ignore
    }
  }, [seenCount, hydrated]);

  // 3. Once logged in, merge DB favorites with any guest favorites and push
  //    local-only ones up so they sync across devices from then on.
  useEffect(() => {
    if (!hydrated || !isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/favorites');
        if (!res.ok || cancelled) return;
        const dbFavs = (await res.json()) as Product[];
        const byId = new Map(dbFavs.map(p => [p.id, p]));
        const localOnly = favoritesRef.current.filter(p => !byId.has(p.id));
        localOnly.forEach(p => setFavoriteAction(Number(p.id), true));
        if (!cancelled) setFavorites([...dbFavs, ...localOnly]);
      } catch {
        // offline / fetch error — keep local favorites as-is
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, isLoggedIn]);

  const isFavorite = useCallback(
    (productId: string) => favorites.some(p => p.id === productId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (product: Product) => {
      setFavorites(prev => {
        const exists = prev.some(p => p.id === product.id);
        const next = exists ? prev.filter(p => p.id !== product.id) : [product, ...prev];
        if (isLoggedIn) setFavoriteAction(Number(product.id), !exists);
        return next;
      });
    },
    [isLoggedIn],
  );

  const markFavoritesSeen = useCallback(() => {
    setSeenCount(favoritesRef.current.length);
  }, []);

  const unseenCount = Math.max(0, favorites.length - seenCount);

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, count: favorites.length, unseenCount, markFavoritesSeen }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}
