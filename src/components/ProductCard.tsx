'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { useFavorites } from '@/lib/favorites-context';
import PlaceholderImage from './PlaceholderImage';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const cover = product.images?.[0];
  const inCartQty = items.find(it => it.product.id === product.id)?.quantity ?? 0;
  const soldOut = product.stockQuantity <= 0;
  const canAddMore = product.stockQuantity - inCartQty > 0;

  return (
    <div className="group bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <PlaceholderImage category={product.category} name={product.name} size="md" />
          )}
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-medium z-10">
              Шинэ
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium z-10">
              -{discount}%
            </span>
          )}
          {product.isFreeShipping && (
            <span className="absolute bottom-2 left-2 bg-success text-white text-xs px-2 py-1 rounded-full z-10">
              🚚 Үнэгүй хүргэлт
            </span>
          )}
          {soldOut && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
              <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                Дууссан
              </span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product);
          }}
          aria-pressed={favorite}
          aria-label={favorite ? 'Хадгалснаас хасах' : 'Хадгалах'}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform text-lg leading-none"
        >
          <span className={favorite ? 'text-primary' : 'text-muted'}>{favorite ? '♥' : '♡'}</span>
        </button>
      </div>

      <div className="p-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Seller */}
        <p className="text-xs text-muted mt-1 flex items-center gap-1">
          <span>{product.seller.avatar}</span>
          {product.seller.name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex text-xs text-warning">
            {'★'.repeat(Math.floor(product.rating))}
            {product.rating % 1 >= 0.5 ? '½' : ''}
          </div>
          <span className="text-xs text-muted">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-lg text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Add to cart */}
        {soldOut ? (
          product.acceptCustomOrders ? (
            <Link
              href={`/product/${product.id}`}
              className="block text-center w-full mt-3 bg-accent text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              📝 Захиалга өгөх
            </Link>
          ) : (
            <button
              disabled
              className="w-full mt-3 bg-surface border border-border text-muted py-2 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              Дууссан
            </button>
          )
        ) : (
          <button
            onClick={() => addToCart(product)}
            disabled={!canAddMore}
            className="w-full mt-3 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🛒 {canAddMore ? 'Сагсанд нэмэх' : 'Сагсанд бүгдийг нэмсэн'}
          </button>
        )}
      </div>
    </div>
  );
}
