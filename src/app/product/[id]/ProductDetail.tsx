'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import PlaceholderImage from '@/components/PlaceholderImage';
import { startConversationWithSeller } from '@/app/actions/chat';
import type { Product } from '@/lib/types';

interface Seller {
  id: number;
  storeName: string;
  location: string;
  phone: string;
  description: string | null;
  joinedDate: string;
}

interface Props {
  product: Product;
  seller: Seller;
  canMessage: boolean;
}

export default function ProductDetail({ product, seller, canMessage }: Props) {
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const cover = product.images?.[activeImage];
  const joinedYear = seller.joinedDate ? new Date(seller.joinedDate).getFullYear() : '';

  const inCartQty = items.find(it => it.product.id === product.id)?.quantity ?? 0;
  const remainingStock = Math.max(0, product.stockQuantity - inCartQty);
  const soldOut = product.stockQuantity <= 0;
  const cartWouldExceed = quantity > remainingStock;

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="rounded-xl overflow-hidden aspect-square relative bg-primary-light/10">
            {cover ? (
              <Image src={cover} alt={product.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
            ) : (
              <PlaceholderImage category={product.category} name={product.name} size="lg" />
            )}
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-accent text-white text-sm px-3 py-1 rounded-full font-medium z-10">
                Шинэ
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? 'border-primary' : 'border-border'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

          <p className="text-muted leading-relaxed whitespace-pre-wrap mb-6">{product.description}</p>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
          </div>

          <div className="mb-6">
            {soldOut ? (
              <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                Дууссан
              </span>
            ) : (
              <span className="text-sm text-muted">
                Үлдэгдэл: <span className="font-semibold text-foreground">{product.stockQuantity} ширхэг</span>
                {inCartQty > 0 && (
                  <span className="ml-2 text-xs">(сагсанд {inCartQty} нэмсэн)</span>
                )}
              </span>
            )}
          </div>

          {!soldOut && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Тоо:</span>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-primary-light/20 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-border min-w-[3rem] text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(remainingStock || 1, quantity + 1))}
                  disabled={quantity >= remainingStock}
                  className="px-3 py-2 hover:bg-primary-light/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {remainingStock <= 5 && remainingStock > 0 && (
                <span className="text-xs text-warning">Үлдэгдэл бага</span>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {soldOut ? (
              product.acceptCustomOrders ? (
                <form action={startConversationWithSeller} className="flex-1">
                  <input type="hidden" name="sellerId" value={seller.id} />
                  <button
                    type="submit"
                    className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity active:scale-95"
                  >
                    📝 Захиалга өгөх (борлуулагчтай ярилцах)
                  </button>
                </form>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-surface border border-border text-muted py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Дууссан
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (cartWouldExceed) return;
                  addToCart(product, quantity);
                }}
                disabled={cartWouldExceed || remainingStock <= 0}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                🛒 Сагсанд нэмэх
              </button>
            )}
            <button type="button" className="px-4 py-3 border border-border rounded-lg hover:bg-primary-light/20 transition-colors text-xl">
              ♡
            </button>
          </div>
          {cartWouldExceed && !soldOut && (
            <p className="text-xs text-red-600 mt-2">Үлдэгдэлээс илүү тоо сонгох боломжгүй.</p>
          )}
        </div>
      </div>

      {/* Seller info at bottom */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-12">
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Made by</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link
            href={`/store/${seller.id}`}
            className="flex items-center gap-4 flex-1 group min-w-0"
          >
            <span className="w-14 h-14 rounded-2xl bg-primary-light/30 flex items-center justify-center text-3xl flex-shrink-0">
              🏪
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold text-primary group-hover:underline truncate">
                {seller.storeName}
              </p>
              <p className="text-xs text-muted">
                📍 {seller.location}
                {joinedYear ? ` · ${joinedYear} оноос` : ''}
              </p>
            </div>
          </Link>
          <div className="flex gap-2 flex-wrap">
            {canMessage && (
              <form action={startConversationWithSeller}>
                <input type="hidden" name="sellerId" value={seller.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  💬 Зурвас илгээх
                </button>
              </form>
            )}
            {seller.phone && (
              <a
                href={`tel:${seller.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-surface border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light/20 transition-colors"
              >
                📞 {seller.phone}
              </a>
            )}
          </div>
        </div>
        {seller.description && (
          <p className="text-sm text-muted mt-4 leading-relaxed">{seller.description}</p>
        )}
      </div>
    </>
  );
}
