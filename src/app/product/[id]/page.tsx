'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { getProductById, formatPrice, products } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import ProductCard from '@/components/ProductCard';
import PlaceholderImage from '@/components/PlaceholderImage';

const sampleReviews = [
  { id: '1', userName: 'Болд', rating: 5, comment: 'Маш сайхан бүтээгдэхүүн! Чанар өндөр, хурдан хүргэсэн.', date: '2024-03-10' },
  { id: '2', userName: 'Сарангэрэл', rating: 4, comment: 'Гоё байна, найзуудадаа санал болгоно.', date: '2024-03-08' },
  { id: '3', userName: 'Бат-Эрдэнэ', rating: 5, comment: 'Гар урлалын маш өндөр түвшний бүтээл. Баярлалаа!', date: '2024-02-25' },
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = getProductById(id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">😕</p>
        <h2 className="text-2xl font-bold mb-2">Бүтээгдэхүүн олдсонгүй</h2>
        <Link href="/products" className="text-primary hover:underline">← Буцах</Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-6">
        <a href="/" className="hover:text-primary">Нүүр</a>
        <span className="mx-2">/</span>
        <a href="/products" className="hover:text-primary">Бүтээгдэхүүн</a>
        <span className="mx-2">/</span>
        <a href={`/products?category=${product.category}`} className="hover:text-primary">
          {product.category}
        </a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product detail */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="rounded-xl overflow-hidden aspect-square relative">
          <PlaceholderImage category={product.category} name={product.name} size="lg" />
          {product.isNew && (
            <span className="absolute top-4 left-4 bg-accent text-white text-sm px-3 py-1 rounded-full font-medium z-10">
              Шинэ
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-4 right-4 bg-primary text-white text-sm px-3 py-1 rounded-full font-medium z-10">
              -{discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

          {/* Seller */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{product.seller.avatar}</span>
            <div>
              <p className="text-sm font-medium">{product.seller.name}</p>
              <p className="text-xs text-muted">{product.seller.location} · {product.seller.salesCount} борлуулалт</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-warning">
              {'★'.repeat(Math.floor(product.rating))}
            </div>
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted text-sm">({product.reviewCount} сэтгэгдэл)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {product.isFreeShipping && (
            <div className="bg-success/10 text-success rounded-lg px-4 py-2 text-sm mb-4 inline-block">
              🚚 Үнэгүй хүргэлт
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Тоо:</span>
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-primary-light/20 transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-border min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-primary-light/20 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => addToCart(product, quantity)}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors active:scale-95"
            >
              🛒 Сагсанд нэмэх
            </button>
            <button className="px-4 py-3 border border-border rounded-lg hover:bg-primary-light/20 transition-colors text-xl">
              ♡
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map(tag => (
              <span key={tag} className="bg-primary-light/20 text-primary text-xs px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          {[
            { key: 'description' as const, label: 'Дэлгэрэнгүй' },
            { key: 'reviews' as const, label: `Сэтгэгдэл (${product.reviewCount})` },
            { key: 'shipping' as const, label: 'Хүргэлт' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-12">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <p className="text-muted leading-relaxed">{product.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
              <div className="bg-surface border border-border rounded-lg p-3">
                <p className="text-xs text-muted">Ангилал</p>
                <p className="text-sm font-medium">{product.subcategory || product.category}</p>
              </div>
              <div className="bg-surface border border-border rounded-lg p-3">
                <p className="text-xs text-muted">Худалдаач</p>
                <p className="text-sm font-medium">{product.seller.name}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {sampleReviews.map(review => (
              <div key={review.id} className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {review.userName[0]}
                    </span>
                    <span className="font-medium text-sm">{review.userName}</span>
                  </div>
                  <span className="text-xs text-muted">{review.date}</span>
                </div>
                <div className="flex text-warning text-sm mb-2">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p className="text-sm text-muted">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">🚚 Хүргэлтийн мэдээлэл</h4>
              <ul className="text-sm text-muted space-y-2">
                <li>• Улаанбаатар хот: 1-2 өдөр</li>
                <li>• Орон нутаг: 3-7 өдөр</li>
                <li>• 100,000₮-с дээш захиалга: Үнэгүй хүргэлт</li>
                <li>• Хүргэлтийн төлбөр: 5,000₮ - 15,000₮</li>
              </ul>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">🔄 Буцаалт</h4>
              <p className="text-sm text-muted">Бүтээгдэхүүнийг хүлээн авснаас хойш 14 хоногийн дотор буцаах боломжтой.</p>
            </div>
          </div>
        )}
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Төстэй бүтээгдэхүүн</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
