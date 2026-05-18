import Link from 'next/link';
import ResendForm from './ResendForm';

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-light/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          📧
        </div>
        <h1 className="text-2xl font-bold">Имэйлээ шалгана уу</h1>
        <p className="text-muted text-sm mt-3">
          {email ? (
            <>
              Бид <span className="font-medium text-foreground">{email}</span> хаяг руу
              баталгаажуулах холбоос явууллаа. Имэйл хайрцагаа нээж холбоосыг дарна уу.
            </>
          ) : (
            <>Бид таны имэйл хаяг руу баталгаажуулах холбоос явууллаа.</>
          )}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <p className="text-sm text-muted">
          Имэйл ирэхгүй байна уу? Спам фолдероо шалгах эсвэл доорхоос дахин илгээж болно.
        </p>
        <ResendForm defaultEmail={email ?? ''} />
        <div className="text-center text-sm pt-2 border-t border-border">
          <Link href="/login" className="text-primary hover:underline">Нэвтрэх хуудас руу буцах</Link>
        </div>
      </div>
    </div>
  );
}
