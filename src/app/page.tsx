import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/lib/data';
import { getAllProducts } from '@/lib/products-db';

export default async function HomePage() {
  const products = getAllProducts();
  const latestProducts = products.slice(0, 8);
  const totalProducts = products.length;

  return (
    <div className="bg-background">
      {/* Ad space placeholder */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary-light/40 via-primary/5 to-primary-light/40 p-10 md:p-20 lg:p-24 text-center min-h-[320px] md:min-h-[420px] flex items-center justify-center">
          <div className="absolute -top-16 -right-10 text-[16rem] opacity-15 leading-none select-none pointer-events-none">🌸</div>
          <div className="absolute -bottom-20 -left-12 text-[14rem] opacity-15 leading-none select-none pointer-events-none">✨</div>
          <div className="relative">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-dark mb-4 md:mb-6">
              Таны рекламны орон зай
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted max-w-2xl mx-auto">
              Удахгүй та энэ хэсэгт өөрийн брэнд, бүтээгдэхүүнээ төлбөртэйгөөр байршуулж сурталчлах боломжтой болно.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-16">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <div className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold mb-2">
              ✨ ШИНЭ НЭМЭГДСЭН
            </div>
            <h2 className="text-3xl font-bold">Сүүлд нэмэгдсэн бүтээгдэхүүн</h2>
          </div>
          <Link href="/products" className="text-primary hover:underline text-sm font-semibold">
            Бүгдийг үзэх →
          </Link>
        </div>

          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {latestProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <p className="text-5xl mb-4">🎨</p>
              <h3 className="text-xl font-bold mb-2">Тун удахгүй...</h3>
              <p className="text-muted mb-6">
                Эхний бүтээгдэхүүнүүд удахгүй нэмэгдэх болно. Та өөрөө бүтээгээ зарж эхлэх үү?
              </p>
              <Link
                href="/sell"
                className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Бараа нэмэх
              </Link>
            </div>
          )}
      </section>

      {/* Why us */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Яагаад Цэцэглэн?</h2>
          <p className="text-muted">Бид манай дотоодын урчуудаа дэмжих платформ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🇲🇳', title: 'Жинхэнэ Монгол', desc: 'Монголын урчуудын гар хийцийн бүтээлүүд' },
            { icon: '🤝', title: 'Шударга үнэ', desc: 'Урчуудаас шууд авах боломж, нэмэлт зардалгүй' },
            { icon: '🚚', title: 'Найдвартай хүргэлт', desc: 'Монгол улсын бүх аймагт хүргэх боломжтой' },
            { icon: '🔒', title: 'Аюулгүй худалдаа', desc: 'Хамгаалагдсан төлбөр, зөвлөгөө 24/7' },
          ].map(item => (
            <div key={item.title} className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-light/30 rounded-xl flex items-center justify-center text-2xl mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      {totalProducts > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-foreground to-foreground/90 text-white rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-accent">{totalProducts}</div>
                <div className="text-sm text-white/70 mt-1">Бүтээгдэхүүн</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-accent">{categories.length}</div>
                <div className="text-sm text-white/70 mt-1">Ангилал</div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-3xl md:text-4xl font-bold text-accent">21</div>
                <div className="text-sm text-white/70 mt-1">Аймагт хүргэнэ</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seller CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-primary-light/20 to-primary/10 rounded-3xl p-8 md:p-16 border border-border">
          <div className="absolute top-0 right-0 text-[12rem] opacity-10 leading-none">🎨</div>
          <div className="relative max-w-2xl">
            <p className="text-accent font-semibold text-sm mb-3">УРЧУУДАД ЗОРИУЛАВ</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Бүтээлээ дотоодын<br />зах зээлд танилцуулаарай
            </h2>
            <p className="text-muted mb-8 text-lg">
              Үнэгүй бүртгүүлж, өөрийн дэлгүүрээ нээ.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sell"
                className="bg-primary text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Борлуулагч болох →
              </Link>
              <Link
                href="/about"
                className="bg-white text-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-50 transition-colors border border-border"
              >
                Дэлгэрэнгүй
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
