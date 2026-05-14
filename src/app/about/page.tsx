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
            Манай дотоодын урчуудыг дэмжих платформ.
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
              Бид манай дотоодын урчуудаа дэмжиж, тэдэнд шударга орлого олох боломж бүрдүүлэхийг зорьж байна.
            </p>
            <p className="text-muted leading-relaxed">
              2020 оноос хойш бид 1,200 гаруй борлуулагчидтай хамтран ажиллаж, 50,000 гаруй амжилттай борлуулалт хийсэн.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: '🎯', title: 'Алсын хараа', desc: 'Дотоодын урчуудаа дэмжих платформ болох' },
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
                <p className="text-sm text-muted">+976 89040207</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-xl">📧</span>
              <div>
                <h3 className="font-medium">Имэйл</h3>
                <p className="text-sm text-muted">tstsegi22@gmail.com</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-xl">🕐</span>
              <div>
                <h3 className="font-medium">Ажлын цаг</h3>
                <p className="text-sm text-muted">Даваа - Баасан: 09:00 - 18:00</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex items-center justify-center hover:opacity-90 transition-opacity overflow-hidden"
                style={{ width: '40px', height: '40px', borderRadius: '9999px' }}
              >
                <svg viewBox="0 0 24 24" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center hover:opacity-90 transition-opacity overflow-hidden"
                style={{ width: '40px', height: '40px', borderRadius: '9999px' }}
              >
                <svg viewBox="0 0 24 24" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f9ce34" />
                      <stop offset="50%" stopColor="#ee2a7b" />
                      <stop offset="100%" stopColor="#6228d7" />
                    </linearGradient>
                  </defs>
                  <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
                  <rect x="4.5" y="4.5" width="15" height="15" rx="4.25" fill="none" stroke="#fff" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="3.7" fill="none" stroke="#fff" strokeWidth="1.6" />
                  <circle cx="16.5" cy="7.5" r="1" fill="#fff" />
                </svg>
              </a>
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
