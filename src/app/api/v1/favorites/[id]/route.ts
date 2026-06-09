import { addFavorite, removeFavorite } from '@/lib/favorites-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// POST   /api/v1/favorites/:id (Bearer) -> { ok } — add to favorites (idempotent)
export async function POST(req: Request, ctx: RouteContext<'/api/v1/favorites/[id]'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const productId = parseId(id);
  if (!productId) return apiError('Бараа олдсонгүй', 404);
  addFavorite(user.id, productId);
  return Response.json({ ok: true, favorited: true });
}

// DELETE /api/v1/favorites/:id (Bearer) -> { ok } — remove from favorites (idempotent)
export async function DELETE(req: Request, ctx: RouteContext<'/api/v1/favorites/[id]'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const productId = parseId(id);
  if (!productId) return apiError('Бараа олдсонгүй', 404);
  removeFavorite(user.id, productId);
  return Response.json({ ok: true, favorited: false });
}
