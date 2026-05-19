'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/data';
import { checkout, type CheckoutState } from '@/app/actions/orders';

export default function CheckoutForm({ emailVerified }: { emailVerified: boolean }) {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(checkout, undefined);
  const [mounted, setMounted] = useState(false);
  const successHandled = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (state?.success && !successHandled.current) {
      successHandled.current = true;
      clearCart();
      router.push('/purchases?just_ordered=1');
    }
  }, [state?.success, clearCart, router]);

  const groups = useMemo(() => {
    const map = new Map<string, { sellerName: string; items: typeof items }>();
    for (const it of items) {
      const key = it.product.seller.id;
      const existing = map.get(key);
      if (existing) existing.items.push(it);
      else map.set(key, { sellerName: it.product.seller.name, items: [it] });
    }
    return Array.from(map.values());
  }, [items]);

  const total = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
  const cartJson = JSON.stringify(
    items.map(it => ({ productId: Number(it.product.id), quantity: it.quantity })),
  );

  if (mounted && items.length === 0 && !state?.success) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🛒</p>
        <p className="text-muted mb-4">Сагс хоосон байна.</p>
        <Link href="/products" className="text-primary hover:underline">
          Бүтээгдэхүүн үзэх
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-bold mb-4">Хүргэлтийн мэдээлэл</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Утасны дугаар</label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="9999-9999"
                className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
              />
              {state?.errors?.phone?.[0] && (
                <p className="text-xs text-red-600 mt-1">{state.errors.phone[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Хүргэлтийн хаяг</label>
              <textarea
                name="shippingAddress"
                rows={3}
                required
                placeholder="Хот/Аймаг, дүүрэг, баг/хороо, гудамж, байр, тоот..."
                className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary resize-none"
              />
              {state?.errors?.shippingAddress?.[0] && (
                <p className="text-xs text-red-600 mt-1">{state.errors.shippingAddress[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Нэмэлт тэмдэглэл (заавал биш)</label>
              <textarea
                name="note"
                rows={2}
                placeholder="Борлуулагчид өгөх тэмдэглэл"
                className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-bold mb-4">Бараа ({items.length})</h2>
          {groups.length > 1 && (
            <p className="text-xs text-muted mb-3">
              Танай сагсанд {groups.length} дэлгүүрийн бараа байна — {groups.length} захиалга үүснэ.
            </p>
          )}
          <div className="space-y-4">
            {groups.map((g, idx) => (
              <div key={idx} className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted mb-2">🏪 {g.sellerName}</p>
                <div className="space-y-2">
                  {g.items.map(it => (
                    <div key={it.product.id} className="flex justify-between text-sm">
                      <span className="truncate">
                        {it.product.name} × {it.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(it.product.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-surface border border-border rounded-xl p-5 sticky top-32">
          <h3 className="font-bold mb-4">Дүн</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Барааны нийт</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="border-t border-border my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span>Төлөх</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>

          <input type="hidden" name="cart" value={cartJson} />

          {state?.message && <p className="text-sm text-red-600 text-center mt-3">{state.message}</p>}
          {state?.errors?.cart?.[0] && (
            <p className="text-sm text-red-600 text-center mt-3">{state.errors.cart[0]}</p>
          )}

          <button
            type="submit"
            disabled={pending || !emailVerified || !mounted || items.length === 0}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold mt-4 hover:bg-primary-dark transition-colors active:scale-95 disabled:opacity-60"
          >
            {pending ? 'Илгээж байна...' : 'Захиалга баталгаажуулах'}
          </button>

          <p className="text-xs text-muted text-center mt-3">
            Төлбөрийг сайтын админ шалгаж баталгаажуулна.
          </p>

          <Link href="/cart" className="block text-center text-sm text-primary mt-3 hover:underline">
            ← Сагс руу буцах
          </Link>
        </div>
      </div>
    </form>
  );
}
