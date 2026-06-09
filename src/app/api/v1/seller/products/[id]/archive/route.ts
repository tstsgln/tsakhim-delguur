import { z } from 'zod';
import { db } from '@/lib/db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const Schema = z.object({ archived: z.boolean() });

// POST /api/v1/seller/products/:id/archive (Bearer, owner) { archived } -> { ok }
// Archive (soft-delete) or restore one of the seller's own products.
export async function POST(req: Request, ctx: RouteContext<'/api/v1/seller/products/[id]/archive'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) return apiError('Бараа олдсонгүй', 404);

  // Ownership: the product's store must belong to this user.
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

  db.prepare(
    `UPDATE products SET archived_at = ${parsed.data.archived ? "datetime('now')" : 'NULL'} WHERE id = ?`,
  ).run(productId);

  return Response.json({ ok: true, archived: parsed.data.archived });
}
