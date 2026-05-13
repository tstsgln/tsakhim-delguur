import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { categories } from '@/lib/data';
import NewProductForm from './NewProductForm';

export default async function NewProductPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(user.id);
  if (!seller) redirect('/sell');

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Шинэ бараа нэмэх</h1>
      <NewProductForm categories={categories.map(c => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
