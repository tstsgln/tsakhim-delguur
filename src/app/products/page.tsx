import { Suspense } from 'react';
import { getAllProducts, getCategoryCounts } from '@/lib/products-db';
import ProductsListing from './ProductsListing';

export default async function ProductsPage() {
  const products = getAllProducts();
  const counts = getCategoryCounts();

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted">Ачааллаж байна...</div>}>
      <ProductsListing products={products} categoryCounts={counts} />
    </Suspense>
  );
}
