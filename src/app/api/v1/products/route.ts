import { getAllProducts } from '@/lib/products-db';
import type { Product } from '@/lib/types';

// GET /api/v1/products
//   ?q= &category= &location= &minPrice= &maxPrice= &sort= &page= &pageSize=
// Returns a paginated, filtered product list. Filtering/sorting mirror the web
// /products page exactly (same fields, same sort keys) so the app and site agree.
// Filtering is done in-memory over getAllProducts() — same as the web today;
// can move to SQL when the catalog grows large (see IMPROVEMENTS.md #11).

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';

function intParam(v: string | null, fallback: number): number {
  // Note: Number(null) and Number('') are both 0, so guard explicitly — an
  // absent param must fall back, not silently become 0 (which would e.g. make
  // maxPrice 0 and filter out every product).
  if (v === null || v.trim() === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get('q') ?? '').trim().toLowerCase();
  const category = searchParams.get('category');
  const location = searchParams.get('location');
  const minPrice = intParam(searchParams.get('minPrice'), 0);
  const maxPrice = intParam(searchParams.get('maxPrice'), Number.MAX_SAFE_INTEGER);
  const sort = (searchParams.get('sort') ?? 'newest') as SortOption;
  const page = Math.max(1, intParam(searchParams.get('page'), 1));
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, intParam(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE)));

  let result: Product[] = getAllProducts(); // already newest-first, archived excluded

  if (q) {
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.seller.name.toLowerCase().includes(q),
    );
  }
  if (category) result = result.filter(p => p.category === category);
  if (location) result = result.filter(p => p.seller.location === location);
  result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

  switch (sort) {
    case 'price-low':
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result = [...result].sort((a, b) => b.rating - a.rating);
      break;
    case 'popular':
      result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'newest':
    default:
      break; // getAllProducts() is already newest-first
  }

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = result.slice(start, start + pageSize);

  return Response.json({ items, page, pageSize, total, totalPages });
}
