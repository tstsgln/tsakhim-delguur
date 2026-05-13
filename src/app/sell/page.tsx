'use client';

import Link from 'next/link';

export default function SellPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Өөрийн бүтээлээ зараарай</h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Монголын хамгийн том гар урлалын зах зээлд нэгдэж, мянга мянган худалдан авагчдад хүрээрэй.
          </p>
          <button className="bg-white text-primary font-semibold px-10 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg">
            Бүртгүүлэх
          </button>
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
              { icon: '🌍', title: 'Дэлхий даяар хүрэх', desc: 'Та Монгол дотоод болон олон улсын худалдан авагчдад хүрэх боломжтой.' },
              { icon: '💳', title: 'Аюулгүй төлбөр', desc: 'Бид аюулгүй төлбөрийн системтэй. Таны орлого найдвартай хамгаалагдсан.' },
              { icon: '📊', title: 'Борлуулалтын тайлан', desc: 'Дэлгэрэнгүй борлуулалтын тайлан, статистик мэдээллийг харна уу.' },
              { icon: '🤝', title: 'Дэмжлэг', desc: 'Манай баг танд тусалж, зөвлөгөө өгөхөд бэлэн байна.' },
              { icon: '📦', title: 'Хүргэлтийн тусламж', desc: 'Бид хүргэлтийн үйлчилгээтэй хамтран ажилладаг.' },
              { icon: '🏷️', title: 'Бага шимтгэл', desc: 'Зөвхөн борлуулалтаас 5% шимтгэл. Бүртгэл үнэгүй.' },
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
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">Худалдаачийн бүртгэл</h2>
        <form onSubmit={e => e.preventDefault()} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Овог</label>
              <input type="text" placeholder="Овог" className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Нэр</label>
              <input type="text" placeholder="Нэр" className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Дэлгүүрийн нэр</label>
            <input type="text" placeholder="Таны дэлгүүрийн нэр" className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Имэйл</label>
            <input type="email" placeholder="name@example.com" className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Утасны дугаар</label>
            <input type="tel" placeholder="+976 0000-0000" className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Байршил</label>
            <select className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary bg-surface">
              <option>Улаанбаатар</option>
              <option>Дархан</option>
              <option>Эрдэнэт</option>
              <option>Бусад</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Бүтээгдэхүүний төрөл</label>
            <select className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary bg-surface">
              <option>Хувцас</option>
              <option>Үнэт эдлэл</option>
              <option>Урлаг</option>
              <option>Гар урлал</option>
              <option>Гэр ахуй</option>
              <option>Хүнсний бүтээгдэхүүн</option>
              <option>Хөгжмийн зэмсэг</option>
              <option>Ном</option>
              <option>Бусад</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Нэмэлт мэдээлэл</label>
            <textarea
              rows={3}
              placeholder="Өөрийн бүтээгдэхүүний талаар товч тайлбарлана уу..."
              className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="accent-primary mt-1" />
            <span className="text-muted">Үйлчилгээний нөхцөлийг зөвшөөрч байна</span>
          </label>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Бүртгүүлэх
          </button>
        </form>
      </section>
    </div>
  );
}
