import { z } from 'zod';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import fs from 'node:fs/promises';
import { db } from '@/lib/db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const Schema = z.object({ password: z.string().min(1, 'Нууц үг шаардлагатай') });

// POST /api/v1/account/delete (Bearer) { password } -> { ok }
// Password-confirmed account deletion. Mirrors the web deleteAccount action:
// removes the user (cascades to their data) and cleans up uploaded image files.
export async function POST(req: Request) {
  const sessionUser = await getApiUser(req);
  if (!sessionUser) return UNAUTHORIZED();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return apiError('Нууц үг шаардлагатай', 400);

  const user = db
    .prepare('SELECT id, password_hash FROM users WHERE id = ?')
    .get(sessionUser.id) as { id: number; password_hash: string } | undefined;
  if (!user) return UNAUTHORIZED();

  if (!(await bcrypt.compare(parsed.data.password, user.password_hash))) {
    return apiError('Нууц үг буруу байна', 401);
  }

  // Collect uploaded files to remove after the row is gone.
  const productImages = db
    .prepare(
      `SELECT pi.path AS p FROM product_images pi
       JOIN products pr ON pr.id = pi.product_id
       JOIN sellers s ON s.id = pr.seller_id
       WHERE s.user_id = ?`,
    )
    .all(user.id) as Array<{ p: string }>;
  const chatImages = db
    .prepare('SELECT image_path AS p FROM messages WHERE sender_user_id = ? AND image_path IS NOT NULL')
    .all(user.id) as Array<{ p: string }>;
  const reviewImages = db
    .prepare(
      `SELECT ri.path AS p FROM review_images ri
       JOIN reviews r ON r.id = ri.review_id
       WHERE r.user_id = ?`,
    )
    .all(user.id) as Array<{ p: string }>;
  const bannerImages = db
    .prepare('SELECT banner_path AS p FROM sellers WHERE user_id = ? AND banner_path IS NOT NULL')
    .all(user.id) as Array<{ p: string }>;

  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);

  const publicDir = path.join(process.cwd(), 'public');
  for (const { p } of [...productImages, ...chatImages, ...reviewImages, ...bannerImages]) {
    if (!p.startsWith('/uploads/')) continue;
    try {
      await fs.unlink(path.join(publicDir, p));
    } catch {
      // best-effort cleanup
    }
  }

  return Response.json({ ok: true });
}
