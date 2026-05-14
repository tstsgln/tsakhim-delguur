import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import FeedbackForm from './FeedbackForm';

export default async function FeedbackPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">💌 Санал, гомдол</h1>
        <p className="text-sm text-muted mt-1">
          Манай үйлчилгээ, сайтын талаар санал, гомдлоо бичээрэй. Бид хариулж, шаардлагатай өөрчлөлтийг хийхийг хичээх болно.
        </p>
      </div>

      <FeedbackForm />

      <p className="text-xs text-muted text-center mt-6">
        <Link href="/" className="hover:text-primary">← Нүүр хуудас руу буцах</Link>
      </p>
    </div>
  );
}
