import { Suspense } from 'react';
import { getAllProducts, getCategoryCounts, searchStores } from '@/lib/products-db';
import ProductsListing from './ProductsListing';

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const products = getAllProducts();
  const counts = getCategoryCounts();
  const stores = sp.search ? searchStores(sp.search) : [];

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted">Ачааллаж байна...</div>}>
      <ProductsListing products={products} categoryCounts={counts} matchingStores={stores} />
    </Suspense>
  );
}
