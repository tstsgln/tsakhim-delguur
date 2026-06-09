import Link from 'next/link';

export const metadata = {
  title: 'Нууцлалын бодлого — Цэцэглэн',
  description: 'Цэцэглэн (tsetseglen.mn) платформын хувийн мэдээлэл цуглуулах, ашиглах, хадгалах бодлого.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Нууцлалын бодлого</h1>
      <p className="text-sm text-muted mb-8">Сүүлд шинэчилсэн: 2026-06-09</p>

      <Section title="1. Ерөнхий зүйл">
        <p>
          Цэцэглэн (tsetseglen.mn, цаашид «Платформ» гэх) нь хэрэглэгчийн хувийн мэдээллийг
          хамгаалахыг чухалчилдаг. Энэхүү бодлого нь бид ямар мэдээлэл цуглуулж, хэрхэн
          ашиглаж, хадгалдаг талаар тайлбарлана. Платформ болон Цэцэглэн гар утасны
          аппликэйшнийг ашигласнаар та энэхүү бодлогыг зөвшөөрсөнд тооцно.
        </p>
      </Section>

      <Section title="2. Бидний цуглуулдаг мэдээлэл">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Бүртгэлийн мэдээлэл:</b> нэр, имэйл хаяг, нууц үг (шифрлэгдсэн хэлбэрээр).</li>
          <li><b>Захиалгын мэдээлэл:</b> утасны дугаар, хүргэлтийн хаяг, захиалсан бараа.</li>
          <li><b>Борлуулагчийн мэдээлэл:</b> дэлгүүрийн нэр, байршил, банкны данс (татан авалтад).</li>
          <li><b>Контент:</b> таны байршуулсан зураг, үнэлгээ, сэтгэгдэл, чат бичвэр.</li>
        </ul>
      </Section>

      <Section title="3. Мэдээллийг хэрхэн ашигладаг">
        <ul className="list-disc pl-5 space-y-1">
          <li>Захиалга боловсруулах, хүргэлт зохион байгуулах.</li>
          <li>Худалдан авагч–борлуулагч хооронд холбоо тогтоох.</li>
          <li>Акаунт, аюулгүй байдлыг хангах, мэдэгдэл илгээх.</li>
          <li>Үйлчилгээгээ сайжруулах.</li>
        </ul>
        <p className="mt-2">
          Бид таны мэдээллийг зар сурталчилгааны зорилгоор гуравдагч этгээдэд <b>зардаггүй</b>.
        </p>
      </Section>

      <Section title="4. Мэдээлэл хадгалах ба хамгаалалт">
        <p>
          Мэдээллийг найдвартай сервер дээр хадгална. Нууц үгийг шифрлэж (bcrypt) хадгалдаг.
          Төлбөрийн мэдээллийг (банкны данс) зөвхөн татан авах хүсэлтэд ашиглана.
        </p>
      </Section>

      <Section title="5. Таны эрх">
        <ul className="list-disc pl-5 space-y-1">
          <li>Та өөрийн мэдээллээ үзэх, засах эрхтэй.</li>
          <li>Та акаунтаа болон холбогдох бүх мэдээллээ хүссэн үедээ устгаж болно
            (Тохиргоо → Акаунт устгах). Устгасан мэдээллийг сэргээх боломжгүй.</li>
        </ul>
      </Section>

      <Section title="6. Хүүхдийн нууцлал">
        <p>Платформ нь насанд хүрэгчдэд зориулагдсан бөгөөд 18-аас доош насныханд зориулаагүй.</p>
      </Section>

      <Section title="7. Холбоо барих">
        <p>
          Нууцлалтай холбоотой асуудлаар бидэнтэй холбогдоно уу:{' '}
          <a href="mailto:tstsegi22@gmail.com" className="text-primary hover:underline">
            tstsegi22@gmail.com
          </a>
        </p>
      </Section>

      <div className="mt-10">
        <Link href="/" className="text-primary hover:underline">← Нүүр хуудас</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="text-foreground/90 leading-relaxed">{children}</div>
    </section>
  );
}
