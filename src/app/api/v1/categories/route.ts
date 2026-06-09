import { getCategoryCounts } from '@/lib/products-db';

// GET /api/v1/categories -> [{ category, count }]
// Only categories that have products, sorted by count desc (same as the web
// home "Ангилалаар үзэх" tiles).
export async function GET() {
  const counts = getCategoryCounts();
  const categories = Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
  return Response.json({ categories });
}
