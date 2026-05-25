import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductDetail, getAllProducts } from '@/lib/products-db';
import { categories } from '@/lib/data';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ProductDetail from './ProductDetail';
import ReviewsSection from './ReviewsSection';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const detail = getProductDetail(numericId);
  if (!detail) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">😕</p>
        <h2 className="text-2xl font-bold mb-2">Бүтээгдэхүүн олдсонгүй</h2>
        <Link href="/products" className="text-primary hover:underline">← Бүтээгдэхүүн рүү буцах</Link>
      </div>
    );
  }

  const { product, seller } = detail;
  const categoryName = categories.find(c => c.id === product.category)?.name ?? product.category;

  const user = await getSessionUser();
  let isOwnStore = false;
  if (user) {
    const row = db.prepare('SELECT user_id FROM sellers WHERE id = ?').get(seller.id) as { user_id: number } | undefined;
    isOwnStore = row?.user_id === user.id;
  }

  const related = getAllProducts()
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-primary">Бүтээгдэхүүн</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-primary">{categoryName}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <ProductDetail product={product} seller={seller} canMessage={!isOwnStore} />

      <ReviewsSection productId={numericId} />

      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Төстэй бүтээгдэхүүн</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
