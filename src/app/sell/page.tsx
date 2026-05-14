import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import SellerForm from './SellerForm';

export default async function SellPage() {
  const user = await getSessionUser();
  if (user) {
    const existing = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(user.id);
    if (existing) redirect('/seller/dashboard');
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Өөрийн бүтээлээ зараарай</h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Монголын хамгийн том гар урлалын зах зээлд нэгдэж, мянга мянган худалдан авагчдад хүрээрэй.
          </p>
          <a
            href="#register"
            className="inline-block bg-white text-primary font-semibold px-10 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            Бүртгүүлэх
          </a>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Хэрхэн эхлэх вэ?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', icon: '📝', title: 'Бүртгүүлэх', desc: 'Үнэгүй бүртгэл үүсгэж, өөрийн дэлгүүрээ нээнэ үү.' },
            { step: '2', icon: '📸', title: 'Бараа нэмэх', desc: 'Бүтээгдэхүүнийхээ зураг, тайлбар, үнийг оруулна уу.' },
            { step: '3', icon: '💰', title: 'Борлуулах', desc: 'Захиалга хүлээн авч, орлогоо татна уу.' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-primary-light/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                {item.icon}
              </div>
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                {item.step}
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-muted text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-surface border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Яагаад биднийг сонгох вэ?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🏔️', title: 'Дотоодын зах зээл', desc: 'Та өөрийн бүтээлийг Монгол даяар худалдан авагчдад хүргэх боломжтой.' },
              { icon: '💳', title: 'Аюулгүй төлбөр', desc: 'Бид аюулгүй төлбөрийн системтэй. Таны орлого найдвартай хамгаалагдсан.' },
              { icon: '📊', title: 'Борлуулалтын тайлан', desc: 'Дэлгэрэнгүй борлуулалтын тайлан, статистик мэдээллийг харна уу.' },
              { icon: '🤝', title: 'Дэмжлэг', desc: 'Манай баг танд тусалж, зөвлөгөө өгөхөд бэлэн байна.' },
              { icon: '📦', title: 'Хүргэлтийн тусламж', desc: 'Бид хүргэлтийн үйлчилгээтэй хамтран ажилладаг.' },
              { icon: '🏷️', title: 'Үнэгүй бүртгэл', desc: 'Дэлгүүр нээх, бараа байршуулах нь үнэгүй.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-4 rounded-xl border border-border bg-background">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller form */}
      <section id="register" className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">Борлуулагчийн бүртгэл</h2>
        {user ? (
          <SellerForm />
        ) : (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-muted mb-4">Борлуулагч болохын тулд эхлээд нэвтэрнэ үү.</p>
            <Link
              href="/login"
              className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Нэвтрэх
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
