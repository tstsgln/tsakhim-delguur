import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductDetail, getAllProducts, getSellerStats } from '@/lib/products-db';
import { categories } from '@/lib/data';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/db';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import ProductCard from '@/components/ProductCard';
import ProductDetail from './ProductDetail';
import ReviewsSection from './ReviewsSection';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Memoized per-request so generateMetadata and the page share one DB read.
const getDetail = cache((id: number) => getProductDetail(id));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return { title: 'Бүтээгдэхүүн олдсонгүй' };

  const detail = getDetail(numericId);
  if (!detail) return { title: 'Бүтээгдэхүүн олдсонгүй' };

  const { product } = detail;
  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} — ${SITE_NAME} дээрх гар урлалын бүтээгдэхүүн.`;
  const image = product.images?.[0];

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${numericId}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: `${SITE_URL}/product/${numericId}`,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const detail = getDetail(numericId);
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: product.images?.map(img => (img.startsWith('http') ? img : `${SITE_URL}${img}`)),
    category: categoryName,
    brand: { '@type': 'Brand', name: seller.storeName },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(product.rating.toFixed(1)),
        reviewCount: product.reviewCount,
      },
    }),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'MNT',
      availability:
        product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/product/${numericId}`,
    },
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-primary">Бүтээгдэхүүн</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-primary">{categoryName}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <ProductDetail
        product={product}
        seller={seller}
        sellerStats={getSellerStats(seller.id)}
        canMessage={!isOwnStore}
      />

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
