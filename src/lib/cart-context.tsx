'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, Product } from './types';

interface AddToCartOptions {
  variant?: string;
  personalization?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, options?: AddToCartOptions) => void;
  removeFromCart: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'tsetseglen.cart.v1';

// A cart line is identified by product + chosen variant + personalization, so the
// same product bought with different options stays on separate lines.
export function cartLineKey(item: Pick<CartItem, 'product' | 'variant' | 'personalization'>): string {
  return [item.product.id, item.variant ?? '', item.personalization ?? ''].join(' ');
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const addToCart = useCallback((product: Product, quantity = 1, options: AddToCartOptions = {}) => {
    const line: CartItem = {
      product,
      quantity,
      variant: options.variant,
      personalization: options.personalization,
    };
    const key = cartLineKey(line);
    setItems(prev => {
      const existing = prev.find(item => cartLineKey(item) === key);
      if (existing) {
        return prev.map(item =>
          cartLineKey(item) === key ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...prev, line];
    });
  }, []);

  const removeFromCart = useCallback((lineKey: string) => {
    setItems(prev => prev.filter(item => cartLineKey(item) !== lineKey));
  }, []);

  const updateQuantity = useCallback((lineKey: string, quantity: number) => {
    setItems(prev => {
      if (quantity <= 0) return prev.filter(item => cartLineKey(item) !== lineKey);
      return prev.map(item =>
        cartLineKey(item) === lineKey ? { ...item, quantity } : item,
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
