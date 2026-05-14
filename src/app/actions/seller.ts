'use server';

import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import type { SellerRow } from '@/lib/types';

const SellerSchema = z.object({
  lastName: z.string().trim().min(1, 'Овог шаардлагатай'),
  firstName: z.string().trim().min(1, 'Нэр шаардлагатай'),
  storeName: z.string().trim().min(2, 'Дэлгүүрийн нэр доод тал нь 2 тэмдэгт'),
  phone: z.string().trim().min(6, 'Утасны дугаар буруу'),
  location: z.string().trim().min(1, 'Байршил шаардлагатай'),
  description: z.string().trim().optional(),
  agreed: z.literal('on', { error: 'Үйлчилгээний нөхцөлийг зөвшөөрөх шаардлагатай' }),
});

export type SellerState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof SellerSchema>, string[]>>;
      message?: string;
    }
  | undefined;

export async function becomeSeller(_state: SellerState, formData: FormData): Promise<SellerState> {
  const user = await getSessionUser();
  if (!user) {
    return { message: 'Эхлээд нэвтэрнэ үү' };
  }

  const parsed = SellerSchema.safeParse({
    lastName: formData.get('lastName'),
    firstName: formData.get('firstName'),
    storeName: formData.get('storeName'),
    phone: formData.get('phone'),
    location: formData.get('location'),
    description: formData.get('description') ?? '',
    agreed: formData.get('agreed'),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;
  const existing = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(user.id);
  if (existing) {
    return { message: 'Та аль хэдийн борлуулагч байна' };
  }

  db.prepare(
    `INSERT INTO sellers (user_id, store_name, phone, location, description)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(
    user.id,
    data.storeName,
    data.phone,
    data.location,
    data.description || null,
  );

  revalidatePath('/sell');
  redirect('/seller/dashboard');
}

const ProductSchema = z.object({
  name: z.string().trim().min(2, 'Бүтээгдэхүүний нэр доод тал нь 2 тэмдэгт'),
  description: z.string().trim().min(10, 'Тайлбар доод тал нь 10 тэмдэгт'),
  price: z.coerce.number().int().positive('Үнэ зөв байх ёстой'),
  category: z.string().trim().min(1, 'Ангилал шаардлагатай'),
});

export type ProductState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof ProductSchema> | 'images', string[]>>;
      message?: string;
    }
  | undefined;

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function createProduct(_state: ProductState, formData: FormData): Promise<ProductState> {
  const user = await getSessionUser();
  if (!user) return { message: 'Эхлээд нэвтэрнэ үү' };

  const seller = db
    .prepare('SELECT id FROM sellers WHERE user_id = ?')
    .get(user.id) as Pick<SellerRow, 'id'> | undefined;
  if (!seller) return { message: 'Та борлуулагч биш байна' };

  const parsed = ProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const rawFiles = formData.getAll('images');
  const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { errors: { images: ['Доод тал нь нэг зураг шаардлагатай'] } };
  }

  for (const f of files) {
    const ext = path.extname(f.name).toLowerCase();
    const typeOk = f.type && ALLOWED_IMAGE_TYPES.has(f.type);
    const extOk = ALLOWED_IMAGE_EXTS.has(ext);
    if (!typeOk && !extOk) {
      return { errors: { images: [`Зургийн төрөл буруу: ${f.name}`] } };
    }
    if (f.size > MAX_IMAGE_BYTES) {
      return { errors: { images: [`Зураг ${f.name} 5MB-аас их байна`] } };
    }
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  await fs.mkdir(uploadsDir, { recursive: true });

  const savedPaths: string[] = [];
  for (const f of files) {
    let ext = path.extname(f.name).toLowerCase();
    if (!ALLOWED_IMAGE_EXTS.has(ext)) {
      ext = Object.entries(EXT_TO_MIME).find(([, m]) => m === f.type)?.[0] ?? '.jpg';
    }
    const filename = `${crypto.randomUUID()}${ext}`;
    const fullPath = path.join(uploadsDir, filename);
    const bytes = Buffer.from(await f.arrayBuffer());
    await fs.writeFile(fullPath, bytes);
    savedPaths.push(`/uploads/products/${filename}`);
  }

  const insertProduct = db.prepare(
    `INSERT INTO products (seller_id, name, description, price, category)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const insertImage = db.prepare(
    'INSERT INTO product_images (product_id, path, position) VALUES (?, ?, ?)',
  );

  const tx = db.transaction((productData: typeof parsed.data, imagePaths: string[]) => {
    const result = insertProduct.run(
      seller.id,
      productData.name,
      productData.description,
      productData.price,
      productData.category,
    );
    const productId = Number(result.lastInsertRowid);
    imagePaths.forEach((p, i) => insertImage.run(productId, p, i));
    return productId;
  });

  tx(parsed.data, savedPaths);

  revalidatePath('/seller/dashboard');
  redirect('/seller/dashboard');
}
