'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/data';
import PlaceholderImage from '@/components/PlaceholderImage';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold mb-2">Таны сагс хоосон байна</h2>
        <p className="text-muted mb-6">Бүтээгдэхүүн нэмж эхлээрэй!</p>
        <Link href="/products" className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Бүтээгдэхүүн үзэх
        </Link>
      </div>
    );
  }

  const shippingCost = totalPrice >= 100000 ? 0 : 5000;
  const grandTotal = totalPrice + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🛒 Миний сагс ({items.length} бараа)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-surface border border-border rounded-xl p-4 flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <PlaceholderImage category={product.category} name={product.name} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${product.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-xs text-muted mt-1">{product.seller.name}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-sm hover:bg-primary-light/20 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x border-border text-sm">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-sm hover:bg-primary-light/20 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-primary">{formatPrice(product.price * quantity)}</span>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(product.id)}
                className="text-muted hover:text-primary transition-colors self-start text-lg"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            🗑️ Сагсыг хоослох
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-xl p-6 sticky top-32">
            <h3 className="font-bold text-lg mb-4">Захиалгын дүн</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Бараа ({items.length})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Хүргэлт</span>
                <span className={shippingCost === 0 ? 'text-success' : ''}>
                  {shippingCost === 0 ? 'Үнэгүй' : formatPrice(shippingCost)}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-accent">
                  💡 {formatPrice(100000 - totalPrice)}-г нэмбэл хүргэлт үнэгүй!
                </p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>Нийт</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold mt-6 hover:bg-primary-dark transition-colors active:scale-95">
              Захиалга өгөх
            </button>

            <Link href="/products" className="block text-center text-sm text-primary mt-3 hover:underline">
              ← Дэлгүүр үргэлжлүүлэх
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
