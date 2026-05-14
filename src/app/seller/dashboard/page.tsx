import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { categories, formatPrice } from '@/lib/data';
import type { SellerRow, ProductRow } from '@/lib/types';

interface ProductListItem extends ProductRow {
  cover_image: string | null;
}

export default async function SellerDashboard() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const seller = db
    .prepare('SELECT * FROM sellers WHERE user_id = ?')
    .get(user.id) as SellerRow | undefined;
  if (!seller) redirect('/sell');

  const products = db
    .prepare(
      `SELECT p.*, (
         SELECT path FROM product_images
         WHERE product_id = p.id
         ORDER BY position ASC LIMIT 1
       ) AS cover_image
       FROM products p
       WHERE p.seller_id = ?
       ORDER BY p.created_at DESC`,
    )
    .all(seller.id) as ProductListItem[];

  const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{seller.store_name}</h1>
            <p className="text-sm text-muted mt-1">
              📍 {seller.location} · 📞 {seller.phone}
            </p>
            {seller.description && (
              <p className="text-sm text-muted mt-2 max-w-2xl">{seller.description}</p>
            )}
          </div>
          <Link
            href="/seller/products/new"
            className="self-start bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            + Бараа нэмэх
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Миний бүтээгдэхүүнүүд</h2>
        <span className="text-sm text-muted">{products.length} бүтээгдэхүүн</span>
      </div>

      {products.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-muted mb-4">Та одоогоор бараа нэмээгүй байна.</p>
          <Link
            href="/seller/products/new"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Эхний бараагаа нэмэх
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="aspect-square bg-primary-light/20 relative">
                {p.cover_image ? (
                  <Image
                    src={p.cover_image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted truncate mb-1">{categoryName(p.category)}</p>
                <p className="text-sm font-semibold text-primary">{formatPrice(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
