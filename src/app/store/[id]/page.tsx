import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getSellerStore, getProductsBySeller } from '@/lib/products-db';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/db';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { startConversationWithSeller } from '@/app/actions/chat';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getStore = cache((id: number) => getSellerStore(id));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return { title: 'Дэлгүүр олдсонгүй' };

  const seller = getStore(numericId);
  if (!seller) return { title: 'Дэлгүүр олдсонгүй' };

  const description = seller.description
    ? seller.description.slice(0, 160)
    : `${seller.storeName} — ${seller.location} дахь гар урлалын дэлгүүр. ${SITE_NAME}.`;

  return {
    title: seller.storeName,
    description,
    alternates: { canonical: `/store/${numericId}` },
    openGraph: {
      type: 'website',
      title: seller.storeName,
      description,
      url: `${SITE_URL}/store/${numericId}`,
    },
  };
}

export default async function StorePage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const seller = getStore(numericId);
  if (!seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🏚️</p>
        <h2 className="text-2xl font-bold mb-2">Дэлгүүр олдсонгүй</h2>
        <Link href="/products" className="text-primary hover:underline">← Буцах</Link>
      </div>
    );
  }

  const products = getProductsBySeller(numericId);
  const joinedYear = seller.joinedDate ? new Date(seller.joinedDate).getFullYear() : '';

  const user = await getSessionUser();
  let isOwnStore = false;
  if (user) {
    const row = db.prepare('SELECT user_id FROM sellers WHERE id = ?').get(seller.id) as { user_id: number } | undefined;
    isOwnStore = row?.user_id === user.id;
  }
  const canMessage = !isOwnStore;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-primary">Бүтээгдэхүүн</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{seller.storeName}</span>
      </nav>

      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-primary-light/30 flex items-center justify-center text-5xl flex-shrink-0">
            🏪
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{seller.storeName}</h1>
            <p className="text-sm text-muted mt-1">
              📍 {seller.location}
              {joinedYear ? ` · ${joinedYear} оноос нэгдсэн` : ''}
            </p>
            {seller.description && (
              <p className="text-sm text-muted mt-3 leading-relaxed max-w-3xl">{seller.description}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-4 text-sm items-center">
              {canMessage && (
                <form action={startConversationWithSeller}>
                  <input type="hidden" name="sellerId" value={seller.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    💬 Зурвас илгээх
                  </button>
                </form>
              )}
              {seller.phone && (
                <a href={`tel:${seller.phone}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  <span>📞</span> {seller.phone}
                </a>
              )}
              <span className="inline-flex items-center gap-1.5 text-muted">
                <span>📦</span> {products.length} бүтээгдэхүүн
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Бүтээгдэхүүнүүд</h2>
      </div>

      {products.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-muted">Энэ дэлгүүр одоогоор бараа байршуулаагүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
