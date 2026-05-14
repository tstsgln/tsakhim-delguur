import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-foreground text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-3">
              <span>🌸</span> Цэцэглэн
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Манай дотоодын урчуудыг дэмжих онлайн платформ.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-3">Холбоосууд</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white transition-colors">Бүх бүтээгдэхүүн</Link></li>
              <li><Link href="/products?category=clothing" className="hover:text-white transition-colors">Хувцас</Link></li>
              <li><Link href="/products?category=jewelry" className="hover:text-white transition-colors">Үнэт эдлэл</Link></li>
              <li><Link href="/products?category=crafts" className="hover:text-white transition-colors">Гар урлал</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-3">Тусламж</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">Бидний тухай</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Хүргэлтийн мэдээлэл</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Буцаалтын бодлого</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Холбоо барих</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Холбоо барих</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 tstsegi22@gmail.com</li>
              <li>📞 +976 89040207</li>
              <li>📍 Улаанбаатар, Монгол</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2024 Цэцэглэн. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="/about" className="hover:text-white transition-colors">Нууцлалын бодлого</Link>
            <Link href="/about" className="hover:text-white transition-colors">Үйлчилгээний нөхцөл</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
