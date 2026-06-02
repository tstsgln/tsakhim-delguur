import Link from 'next/link';
import type { SellerShopStats } from '@/lib/products-db';

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-sm text-muted mb-1">{icon} {label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function ShopStats({ stats }: { stats: SellerShopStats }) {
  const withViews = stats.products.filter(p => p.views > 0 || p.favorites > 0 || p.sales > 0);

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">📊 Дэлгүүрийн статистик</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard icon="👁️" label="Нийт үзэлт" value={stats.totalViews.toLocaleString('mn-MN')} />
        <StatCard icon="♡" label="Дуртай нэмсэн" value={stats.totalFavorites.toLocaleString('mn-MN')} />
        <StatCard icon="📦" label="Зарагдсан" value={stats.totalSales.toLocaleString('mn-MN')} />
        <StatCard icon="📈" label="Хөрвүүлэлт" value={`${stats.conversionPct.toFixed(1)}%`} />
      </div>

      {withViews.length > 0 ? (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs">
                <th className="text-left font-medium px-4 py-2.5">Бараа</th>
                <th className="text-right font-medium px-3 py-2.5 whitespace-nowrap">👁️ Үзэлт</th>
                <th className="text-right font-medium px-3 py-2.5 whitespace-nowrap">♡ Дуртай</th>
                <th className="text-right font-medium px-4 py-2.5 whitespace-nowrap">📦 Зарагдсан</th>
              </tr>
            </thead>
            <tbody>
              {withViews.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">
                    <Link href={`/product/${p.id}`} className="hover:text-primary">
                      {p.name}
                    </Link>
                    {p.archived && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-border text-muted">Архив</span>
                    )}
                  </td>
                  <td className="text-right px-3 py-2.5 tabular-nums">{p.views.toLocaleString('mn-MN')}</td>
                  <td className="text-right px-3 py-2.5 tabular-nums">{p.favorites.toLocaleString('mn-MN')}</td>
                  <td className="text-right px-4 py-2.5 tabular-nums">{p.sales.toLocaleString('mn-MN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted bg-surface border border-border border-dashed rounded-xl p-4">
          Бараа үзэгдэж эхлэхэд энд статистик харагдана. Дэлгүүрээ сурталчилж эхний зочдоо урьж үзээрэй.
        </p>
      )}
    </section>
  );
}
