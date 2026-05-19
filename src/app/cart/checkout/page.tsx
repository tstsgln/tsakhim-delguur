import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import CheckoutForm from './CheckoutForm';

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Захиалга баталгаажуулах</h1>
      {!user.emailVerified && (
        <div className="bg-warning/10 border border-warning/40 text-warning-foreground rounded-xl p-4 mb-6 text-sm">
          Захиалга өгөхийн тулд эхлээд имэйл хаягаа баталгаажуулна уу.
        </div>
      )}
      <CheckoutForm emailVerified={user.emailVerified} />
    </div>
  );
}
