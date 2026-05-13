'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Бидний тухай</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Монгол гар урлал, уламжлалт бүтээгдэхүүнийг дэлхий даяар түгээх зорилготой.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Манай зорилго</h2>
            <p className="text-muted leading-relaxed mb-4">
              Цэцэглэн нь Монголын гар урлалчид, жижиг үйлдвэрлэгчдийг дэмжих зорилготой онлайн зах зээл юм.
              Бид Монголын уламжлалт урлаг, соёлыг дэлхийд таниулах, урчуудад шударга орлого олох боломж бүрдүүлэхийг зорьж байна.
            </p>
            <p className="text-muted leading-relaxed">
              2020 оноос хойш бид 1,200 гаруй борлуулагчидтай хамтран ажиллаж, 50,000 гаруй амжилттай борлуулалт хийсэн.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: '🎯', title: 'Алсын хараа', desc: 'Монгол гар урлалыг дэлхийн зах зээлд гаргах' },
              { icon: '🤝', title: 'Үнэт зүйлс', desc: 'Шударга худалдаа, чанар, уламжлал' },
              { icon: '🌱', title: 'Тогтвортой байдал', desc: 'Байгальд ээлтэй үйлдвэрлэлийг дэмжих' },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-4 bg-surface border border-border rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-surface border-y border-border py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Манай баг</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Б. Батбаяр', role: 'Үүсгэн байгуулагч', avatar: '👨‍💼' },
              { name: 'Д. Сарантуяа', role: 'Маркетинг', avatar: '👩‍💻' },
              { name: 'Г. Эрдэнэ', role: 'Технологи', avatar: '👨‍💻' },
              { name: 'О. Номин', role: 'Харилцагчийн үйлчилгээ', avatar: '👩‍🔧' },
            ].map(member => (
              <div key={member.name} className="text-center">
                <div className="w-20 h-20 bg-primary-light/30 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                  {member.avatar}
                </div>
                <h3 className="font-medium text-sm">{member.name}</h3>
                <p className="text-xs text-muted">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">Холбоо барих</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <span className="text-xl">📍</span>
              <div>
                <h3 className="font-medium">Хаяг</h3>
                <p className="text-sm text-muted">Улаанбаатар хот, Сүхбаатар дүүрэг, Энхтайвны өргөн чөлөө 5</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-xl">📞</span>
              <div>
                <h3 className="font-medium">Утас</h3>
                <p className="text-sm text-muted">+976 7700-0000</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-xl">📧</span>
              <div>
                <h3 className="font-medium">Имэйл</h3>
                <p className="text-sm text-muted">info@tsetseglen.mn</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-xl">🕐</span>
              <div>
                <h3 className="font-medium">Ажлын цаг</h3>
                <p className="text-sm text-muted">Даваа - Баасан: 09:00 - 18:00</p>
              </div>
            </div>
          </div>

          <form onSubmit={e => e.preventDefault()} className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Нэр</label>
              <input type="text" placeholder="Таны нэр" className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Имэйл</label>
              <input type="email" placeholder="name@example.com" className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Мессеж</label>
              <textarea rows={4} placeholder="Таны мессеж..." className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary resize-none" />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Илгээх
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
