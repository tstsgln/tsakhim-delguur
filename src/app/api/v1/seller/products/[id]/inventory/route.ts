import { z } from 'zod';
import { db } from '@/lib/db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const Schema = z.object({
  stockQuantity: z.number().int().min(0, 'Үлдэгдэл сөрөг байж болохгүй'),
});

// POST /api/v1/seller/products/:id/inventory (Bearer, owner) { stockQuantity } -> { ok }
export async function POST(req: Request, ctx: RouteContext<'/api/v1/seller/products/[id]/inventory'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) return apiError('Бараа олдсонгүй', 404);

  const owned = db
    .prepare(
      `SELECT 1 FROM products p JOIN sellers s ON s.id = p.seller_id
       WHERE p.id = ? AND s.user_id = ?`,
    )
    .get(productId, user.id);
  if (!owned) return apiError('Бараа олдсонгүй', 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return apiError('Буруу хүсэлт', 400);

  db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(parsed.data.stockQuantity, productId);
  return Response.json({ ok: true });
}
