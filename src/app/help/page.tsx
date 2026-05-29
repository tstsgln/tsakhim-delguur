import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Тусламжийн төв',
  description: 'Цэцэглэн зах зээлийг хэрхэн ашиглах вэ — худалдан авах, төлбөр, хүргэлт, борлуулагч болох, үнэлгээ зэрэг түгээмэл асуултууд.',
  alternates: { canonical: '/help' },
};

interface Faq {
  q: string;
  a: React.ReactNode;
}

const SECTIONS: { title: string; icon: string; items: Faq[] }[] = [
  {
    title: 'Худалдан авалт',
    icon: '🛒',
    items: [
      {
        q: 'Хэрхэн захиалга өгөх вэ?',
        a: (
          <>
            Таалагдсан бараагаа <strong>Сагсанд нэмэх</strong> дарж, дараа нь{' '}
            <Link href="/cart" className="text-primary hover:underline">сагс</Link>-аа нээж{' '}
            <strong>Худалдан авах</strong> товчоор үргэлжлүүлнэ. Утасны дугаар, хүргэлтийн хаягаа
            оруулсны дараа захиалга үүснэ.
          </>
        ),
      },
      {
        q: 'Захиалга өгсний дараа юу болох вэ?',
        a: (
          <>
            Захиалга эхэндээ <em>төлбөр хүлээгдэж буй</em> төлөвтэй үүснэ. Төлбөр баталгаажсаны
            дараа борлуулагч бараагаа илгээж, та хүлээж авсан үедээ{' '}
            <Link href="/purchases" className="text-primary hover:underline">Миний захиалга</Link>{' '}
            хэсгээс <strong>Хүлээн авсан</strong> гэж баталгаажуулна.
          </>
        ),
      },
      {
        q: 'Захиалгынхаа явцыг хаанаас харах вэ?',
        a: (
          <>
            <Link href="/purchases" className="text-primary hover:underline">Миний захиалга</Link>{' '}
            хуудаснаас захиалга бүрийн төлөв (төлбөр хүлээгдэж буй → илгээгдсэн → дууссан) харагдана.
          </>
        ),
      },
    ],
  },
  {
    title: 'Төлбөр',
    icon: '💳',
    items: [
      {
        q: 'Хэрхэн төлбөр төлөх вэ?',
        a: (
          <>
            Захиалга үүсгэсний дараа төлбөрөө шилжүүлж, манай баг гүйлгээг шалгаж баталгаажуулна.
            Баталгаажсаны дараа борлуулагч бараагаа бэлтгэж эхэлнэ.
          </>
        ),
      },
      {
        q: 'Төлбөр баталгаажихад хэр хугацаа шаардагдах вэ?',
        a: <>Ихэвчлэн ажлын цагаар богино хугацаанд шалгагдана. Асуудал гарвал бидэнтэй холбогдоно уу.</>,
      },
    ],
  },
  {
    title: 'Хүргэлт ба буцаалт',
    icon: '📦',
    items: [
      {
        q: 'Хүргэлт хэрхэн хийгддэг вэ?',
        a: <>Хүргэлтийг борлуулагч тус бүр зохион байгуулна. Дэлгэрэнгүйг борлуулагчтай чатаар тодруулж болно.</>,
      },
      {
        q: 'Бараагаа буцаах боломжтой юу?',
        a: (
          <>
            Буцаалт, нөхөн төлбөрийн нөхцөлийг манай{' '}
            <Link href="/terms" className="text-primary hover:underline">үйлчилгээний нөхцөл</Link>{' '}
            хуудаснаас үзнэ үү.
          </>
        ),
      },
    ],
  },
  {
    title: 'Борлуулагч болох',
    icon: '🏪',
    items: [
      {
        q: 'Би хэрхэн бараагаа зарах вэ?',
        a: (
          <>
            <Link href="/sell" className="text-primary hover:underline">Борлуулагч болох</Link>{' '}
            хуудсаар дэлгүүрээ нээж, бараагаа байршуулна. Захиалга ирэхэд танд мэдэгдэл очно.
          </>
        ),
      },
      {
        q: 'Орлогоо хэрхэн авах вэ?',
        a: (
          <>
            Захиалга амжилттай дууссаны дараа орлого таны{' '}
            <Link href="/balance" className="text-primary hover:underline">үлдэгдэл</Link>-д нэмэгдэж,
            тэндээс татан авах хүсэлт гаргаж болно.
          </>
        ),
      },
    ],
  },
  {
    title: 'Үнэлгээ ба бүртгэл',
    icon: '⭐',
    items: [
      {
        q: 'Хэрхэн үнэлгээ өгөх вэ?',
        a: <>Захиалга дууссаны дараа худалдан авсан бараандаа од болон сэтгэгдэл үлдээж болно.</>,
      },
      {
        q: 'Бүртгэлээ устгах боломжтой юу?',
        a: (
          <>
            Тийм.{' '}
            <Link href="/settings/delete" className="text-primary hover:underline">Бүртгэл устгах</Link>{' '}
            хуудсаар бүртгэлээ устгана.
          </>
        ),
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <nav className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Тусламжийн төв</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Тусламжийн төв</h1>
        <p className="text-muted">Түгээмэл асуултууд. Хариултаа олохгүй бол доорх холбоо барих хэсгийг ашиглана уу.</p>
      </header>

      <div className="space-y-8">
        {SECTIONS.map(section => (
          <section key={section.title}>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span>{section.icon}</span> {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map(item => (
                <details key={item.q} className="group bg-surface border border-border rounded-xl px-4 py-3">
                  <summary className="cursor-pointer font-medium list-none flex items-center justify-between gap-2">
                    <span>{item.q}</span>
                    <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="text-sm text-muted leading-relaxed mt-3">{item.a}</div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 bg-primary-light/20 border border-border rounded-2xl p-6 text-center">
        <h2 className="text-lg font-bold mb-2">Хариултаа олсонгүй юу?</h2>
        <p className="text-sm text-muted mb-4">Бидэнтэй шууд холбогдоно уу — баяртайгаар туслах болно.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/about" className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Холбоо барих
          </Link>
          <Link href="/feedback" className="bg-surface border border-border px-5 py-2.5 rounded-lg font-medium hover:bg-primary-light/20 transition-colors">
            Санал, гомдол
          </Link>
        </div>
      </section>
    </div>
  );
}
