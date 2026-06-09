import { categories } from '@/lib/data';

// GET /api/v1/categories/all -> { categories: [{ id, name, icon }] }
// The full canonical category list (for the seller's add-product form),
// independent of which categories currently have products.
export async function GET() {
  return Response.json({
    categories: categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
  });
}
