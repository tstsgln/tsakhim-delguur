import Link from 'next/link';
import VerifyForm from './VerifyForm';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Холбоос буруу байна</h1>
        <p className="text-muted mb-6">Имэйлээ дахин шалгана уу, эсвэл шинээр илгээлт хүсэх товчийг дарна уу.</p>
        <Link href="/login" className="text-primary hover:underline">Нэвтрэх</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Имэйл хаягаа баталгаажуулах</h1>
        <p className="text-muted text-sm mt-2">Доорх товчин дээр дарж үргэлжлүүлнэ үү.</p>
      </div>
      <div className="bg-surface border border-border rounded-xl p-6">
        <VerifyForm token={token} />
      </div>
    </div>
  );
}
