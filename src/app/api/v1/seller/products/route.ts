import { z } from 'zod';
import { db } from '@/lib/db';
import { getApiUser, getSellerForUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const Schema = z.object({
  name: z.string().trim().min(2, 'Нэр доод тал нь 2 тэмдэгт байна'),
  description: z.string().trim().min(1, 'Тайлбар шаардлагатай'),
  price: z.number().int().positive('Үнэ зөв байх ёстой'),
  category: z.string().trim().min(1, 'Ангилал сонгоно уу'),
  stockQuantity: z.number().int().min(0).default(0),
  acceptCustomOrders: z.boolean().default(false),
  personalizationPrompt: z.string().trim().optional(),
  imagePaths: z.array(z.string()).min(1, 'Доод тал нь нэг зураг шаардлагатай'),
  options: z
    .array(z.object({ name: z.string().trim().min(1), values: z.array(z.string().trim().min(1)).min(1) }))
    .max(3)
    .optional(),
});

// POST /api/v1/seller/products (Bearer, verified seller) -> { ok, productId }
// Creates a product from already-uploaded image paths (see POST /uploads).
// Options/variations are not supported from the app yet (web-only for now).
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  if (!user.emailVerified) return apiError('Эхлээд имэйл хаягаа баталгаажуулна уу', 403);
  const seller = getSellerForUser(user.id);
  if (!seller) return apiError('Та худалдагч биш байна', 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return apiError('Мэдээлэл буруу байна', 400, { fields: z.flattenError(parsed.error).fieldErrors });
  }
  const d = parsed.data;
  const images = d.imagePaths.filter((p) => p.startsWith('/uploads/')).slice(0, 8);
  if (images.length === 0) return apiError('Зураг буруу байна', 400);

  const insertProduct = db.prepare(
    `INSERT INTO products (seller_id, name, description, price, category, stock_quantity, accept_custom_orders, personalization_prompt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertImage = db.prepare('INSERT INTO product_images (product_id, path, position) VALUES (?, ?, ?)');
  const insertOption = db.prepare('INSERT INTO product_options (product_id, name, position) VALUES (?, ?, ?)');
  const insertOptionValue = db.prepare('INSERT INTO product_option_values (option_id, value, position) VALUES (?, ?, ?)');

  const tx = db.transaction(() => {
    const result = insertProduct.run(
      seller.id,
      d.name,
      d.description,
      d.price,
      d.category,
      d.stockQuantity,
      d.acceptCustomOrders ? 1 : 0,
      d.personalizationPrompt?.trim() || null,
    );
    const productId = Number(result.lastInsertRowid);
    images.forEach((p, i) => insertImage.run(productId, p, i));
    (d.options ?? []).forEach((opt, oi) => {
      const optId = Number(insertOption.run(productId, opt.name, oi).lastInsertRowid);
      opt.values.forEach((v, vi) => insertOptionValue.run(optId, v, vi));
    });
    return productId;
  });

  return Response.json({ ok: true, productId: tx() });
}
