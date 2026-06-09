import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs/promises';
import { db } from '@/lib/db';
import { getApiUser, getSellerForUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const CreateSchema = z.object({
  storeName: z.string().trim().min(2, 'Дэлгүүрийн нэр доод тал нь 2 тэмдэгт'),
  phone: z.string().trim().min(6, 'Утасны дугаар буруу'),
  location: z.string().trim().min(1, 'Байршил шаардлагатай'),
  pickupAddress: z.string().trim().min(5, 'Очиж авах хаягаа дэлгэрэнгүй бичнэ үү'),
  description: z.string().trim().optional(),
});

// POST /api/v1/seller (Bearer, verified) -> { ok, sellerId } — become a seller (create store)
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  if (!user.emailVerified) return apiError('Эхлээд имэйл хаягаа баталгаажуулна уу', 403);
  if (getSellerForUser(user.id)) return apiError('Та аль хэдийн худалдагч байна', 409);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Мэдээлэл буруу байна', 400, { fields: z.flattenError(parsed.error).fieldErrors });
  }
  const d = parsed.data;
  const result = db
    .prepare(
      `INSERT INTO sellers (user_id, store_name, phone, location, pickup_address, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(user.id, d.storeName, d.phone, d.location, d.pickupAddress, d.description || null);
  return Response.json({ ok: true, sellerId: Number(result.lastInsertRowid) });
}

const UpdateSchema = z.object({
  storeName: z.string().trim().min(2, 'Дэлгүүрийн нэр доод тал нь 2 тэмдэгт'),
  phone: z.string().trim().min(6, 'Утасны дугаар буруу'),
  location: z.string().trim().min(1, 'Байршил шаардлагатай'),
  pickupAddress: z.string().trim().min(5, 'Очиж авах хаягаа дэлгэрэнгүй бичнэ үү'),
  description: z.string().trim().optional(),
  story: z.string().trim().max(4000, 'Түүх хэт урт байна').optional(),
  bannerPath: z.string().optional(), // already-uploaded path (POST /uploads?type=store)
});

// PATCH /api/v1/seller (Bearer, seller) -> { ok } — update the user's store.
export async function PATCH(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const seller = getSellerForUser(user.id);
  if (!seller) return apiError('Та худалдагч биш байна', 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Мэдээлэл буруу байна', 400, { fields: z.flattenError(parsed.error).fieldErrors });
  }
  const d = parsed.data;

  // New banner replaces the old; drop the previous file.
  let bannerPath = seller.banner_path;
  if (d.bannerPath && d.bannerPath.startsWith('/uploads/') && d.bannerPath !== seller.banner_path) {
    const old = seller.banner_path;
    bannerPath = d.bannerPath;
    if (old && old.startsWith('/uploads/')) {
      await fs.unlink(path.join(process.cwd(), 'public', old)).catch(() => {});
    }
  }

  db.prepare(
    `UPDATE sellers SET store_name = ?, phone = ?, location = ?, pickup_address = ?, description = ?, story = ?, banner_path = ? WHERE id = ?`,
  ).run(d.storeName, d.phone, d.location, d.pickupAddress, d.description || null, d.story || null, bannerPath, seller.id);

  return Response.json({ ok: true });
}
