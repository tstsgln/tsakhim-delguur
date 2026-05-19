import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { categories, formatPrice } from '@/lib/data';
import type { SellerRow, ProductRow } from '@/lib/types';
import SellerInfoCard from './SellerInfoCard';
import ProductInventoryRow from './ProductInventoryRow';

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
      <SellerInfoCard
        seller={{
          store_name: seller.store_name,
          phone: seller.phone,
          location: seller.location,
          description: seller.description,
        }}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href="/seller/orders"
          className="flex-1 min-w-[180px] bg-surface border border-border rounded-xl p-4 hover:border-primary transition-colors"
        >
          <p className="text-sm text-muted mb-1">📦 Захиалга</p>
          <p className="font-semibold">Ирсэн захиалгууд</p>
        </Link>
        <Link
          href="/balance"
          className="flex-1 min-w-[180px] bg-surface border border-border rounded-xl p-4 hover:border-primary transition-colors"
        >
          <p className="text-sm text-muted mb-1">💳 Орлого</p>
          <p className="font-semibold">Дансны үлдэгдэл</p>
        </Link>
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
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-surface border border-border rounded-xl p-3 flex flex-col sm:flex-row gap-4">
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-primary-light/20 flex-shrink-0 relative">
                  {p.cover_image ? (
                    <Image
                      src={p.cover_image}
                      alt={p.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${p.id}`} className="font-medium text-sm hover:text-primary truncate block">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted truncate mb-1">{categoryName(p.category)}</p>
                  <p className="text-sm font-semibold text-primary">{formatPrice(p.price)}</p>
                </div>
              </div>
              <ProductInventoryRow
                productId={p.id}
                stockQuantity={p.stock_quantity}
                acceptCustomOrders={p.accept_custom_orders === 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
