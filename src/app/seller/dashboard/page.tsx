import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { categories, formatPrice } from '@/lib/data';
import type { ProductRow } from '@/lib/types';
import { getStoresForUser, resolveActiveStore, parseStoreParam } from '@/lib/seller-stores';
import SellerInfoCard from './SellerInfoCard';
import ProductInventoryRow from './ProductInventoryRow';
import StoreSwitcher from '../StoreSwitcher';

interface ProductListItem extends ProductRow {
  cover_image: string | null;
  archived_at: string | null;
}

interface PageProps {
  searchParams: Promise<{ store?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function SellerDashboard({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const sp = await searchParams;
  const stores = getStoresForUser(user.id);
  if (stores.length === 0) redirect('/sell');

  const active = resolveActiveStore(user.id, parseStoreParam(sp.store));
  if (!active) redirect('/sell');

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
    .all(active.id) as ProductListItem[];

  const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id;
  const qs = `?store=${active.id}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {stores.length > 1 && (
        <StoreSwitcher
          stores={stores.map(s => ({ id: s.id, storeName: s.store_name }))}
          activeId={active.id}
        />
      )}
      {stores.length === 1 && (
        <div className="text-right mb-3">
          <Link href="/sell" className="text-xs text-primary hover:underline">
            + Шинэ дэлгүүр нээх
          </Link>
        </div>
      )}

      <SellerInfoCard
        storeId={active.id}
        seller={{
          store_name: active.store_name,
          phone: active.phone,
          location: active.location,
          description: active.description,
        }}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href={`/seller/orders${qs}`}
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
        <Link
          href={`/seller/products/new${qs}`}
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-primary-dark"
        >
          + Шинэ бараа
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-muted mb-4">Та одоогоор бараа нэмээгүй байна.</p>
          <Link
            href={`/seller/products/new${qs}`}
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Эхний бараагаа нэмэх
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => {
            const isArchived = p.archived_at !== null;
            return (
            <div
              key={p.id}
              className={`bg-surface border rounded-xl p-3 flex flex-col sm:flex-row gap-4 ${
                isArchived ? 'border-dashed border-border opacity-70' : 'border-border'
              }`}
            >
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
                  <div className="flex items-center gap-2">
                    <Link href={`/product/${p.id}`} className="font-medium text-sm hover:text-primary truncate">
                      {p.name}
                    </Link>
                    {isArchived && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-border text-muted whitespace-nowrap">
                        Архивласан
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate mb-1">{categoryName(p.category)}</p>
                  <p className="text-sm font-semibold text-primary">{formatPrice(p.price)}</p>
                </div>
              </div>
              <ProductInventoryRow
                productId={p.id}
                stockQuantity={p.stock_quantity}
                acceptCustomOrders={p.accept_custom_orders === 1}
                archived={isArchived}
              />
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
