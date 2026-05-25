import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { categories } from '@/lib/data';
import { getStoresForUser, resolveActiveStore, parseStoreParam } from '@/lib/seller-stores';
import NewProductForm from './NewProductForm';
import StoreSwitcher from '../../StoreSwitcher';

interface PageProps {
  searchParams: Promise<{ store?: string }>;
}

export default async function NewProductPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const sp = await searchParams;
  const stores = getStoresForUser(user.id);
  if (stores.length === 0) redirect('/sell');

  const active = resolveActiveStore(user.id, parseStoreParam(sp.store));
  if (!active) redirect('/sell');

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {stores.length > 1 && (
        <StoreSwitcher
          stores={stores.map(s => ({ id: s.id, storeName: s.store_name }))}
          activeId={active.id}
        />
      )}
      <h1 className="text-2xl font-bold mb-6">Шинэ бараа нэмэх</h1>
      <p className="text-sm text-muted mb-4">🏪 {active.store_name}</p>
      <NewProductForm categories={categories.map(c => ({ id: c.id, name: c.name }))} storeId={active.id} />
    </div>
  );
}
