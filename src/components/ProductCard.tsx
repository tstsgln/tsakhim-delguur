'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import PlaceholderImage from './PlaceholderImage';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square">
          <PlaceholderImage category={product.category} name={product.name} size="md" />
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-medium z-10">
              Шинэ
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium z-10">
              -{discount}%
            </span>
          )}
          {product.isFreeShipping && (
            <span className="absolute bottom-2 left-2 bg-success text-white text-xs px-2 py-1 rounded-full z-10">
              🚚 Үнэгүй хүргэлт
            </span>
          )}
        </div>
      </Link>

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
        <button
          onClick={() => addToCart(product)}
          className="w-full mt-3 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors active:scale-95"
        >
          🛒 Сагсанд нэмэх
        </button>
      </div>
    </div>
  );
}
