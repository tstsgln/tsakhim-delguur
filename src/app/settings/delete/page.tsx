import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import DeleteAccountForm from './DeleteAccountForm';

export default async function DeleteAccountPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Бүртгэлээ устгах</h1>

      <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
        <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Анхааруулга</p>
        <ul className="text-sm text-red-800 list-disc pl-5 space-y-1">
          <li>Таны бүх мэдээлэл — дэлгүүр, бараа, зурвас, хадгалсан зүйлс — буцаашгүй устгагдана.</li>
          <li>Энэхүү үйлдлийг буцаах боломжгүй.</li>
          <li>Үргэлжлүүлэхийн тулд одоогийн нууц үгээ оруулна уу.</li>
        </ul>
      </div>

      <DeleteAccountForm userEmail={user.email} />
    </div>
  );
}
