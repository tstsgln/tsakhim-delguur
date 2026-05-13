'use client';

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { categories, products, getFeaturedProducts, getNewProducts } from '@/lib/data';

export default function HomePage() {
  const featured = getFeaturedProducts();
  const newProducts = getNewProducts();

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Монгол гар урлалын<br />
              <span className="text-accent">шилдэг бүтээлүүд</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Монгол урчуудын гар бүтээлийг олж, захиалаарай. Уламжлалт урлагаас орчин үеийн дизайн хүртэл.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Бүтээгдэхүүн үзэх
              </Link>
              <Link
                href="/sell"
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                Худалдаач болох
              </Link>
            </div>
          </div>
          <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 text-9xl opacity-20">
            🏔️
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-muted">Бүтээгдэхүүн</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">1,200+</div>
              <div className="text-sm text-muted">Худалдаачид</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">50,000+</div>
              <div className="text-sm text-muted">Сэтгэгдэл</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">21</div>
              <div className="text-sm text-muted">Аймагт хүргэнэ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ангилалууд</h2>
          <Link href="/products" className="text-primary hover:underline text-sm font-medium">
            Бүгдийг үзэх →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 bg-surface rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-sm font-medium text-center">{cat.name}</span>
              <span className="text-xs text-muted">{cat.productCount} бараа</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Онцлох бүтээгдэхүүн</h2>
            <Link href="/products" className="text-primary hover:underline text-sm font-medium">
              Бүгдийг үзэх →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-8 border border-accent/20">
            <h3 className="text-xl font-bold mb-2">Урчуудын цуглуулга</h3>
            <p className="text-muted text-sm mb-4">Монголын шилдэг урчуудын бүтээлүүдтэй танилцаарай</p>
            <Link href="/products?category=art" className="inline-block bg-accent text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Үзэх
            </Link>
          </div>
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-8 border border-secondary/20">
            <h3 className="text-xl font-bold mb-2">Үнэгүй хүргэлт</h3>
            <p className="text-muted text-sm mb-4">100,000₮-с дээш захиалгад үнэгүй хүргэлт</p>
            <Link href="/products" className="inline-block bg-secondary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Дэлгэрэнгүй
            </Link>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Шинэ бүтээгдэхүүн</h2>
          <Link href="/products" className="text-primary hover:underline text-sm font-medium">
            Бүгдийг үзэх →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* All Products */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Бүх бүтээгдэхүүн</h2>
            <Link href="/products" className="text-primary hover:underline text-sm font-medium">
              Бүгдийг үзэх →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Та өөрийн бүтээлээ зарахыг хүсч байна уу?</h2>
          <p className="text-muted mb-8">
            Монголын хамгийн том гар урлалын зах зээлд нэгдэж, мянга мянган худалдан авагчдад хүрээрэй.
          </p>
          <Link
            href="/sell"
            className="inline-block bg-primary text-white font-semibold px-10 py-4 rounded-lg hover:bg-primary-dark transition-colors text-lg"
          >
            Худалдаач болох →
          </Link>
        </div>
      </section>
    </div>
  );
}
