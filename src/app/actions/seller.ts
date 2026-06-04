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
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTS,
  EXT_TO_MIME,
  MAX_IMAGE_BYTES,
  validateImageFile,
  saveImageFile,
} from '@/lib/uploads';

const SellerSchema = z.object({
  storeName: z.string().trim().min(2, 'Дэлгүүрийн нэр доод тал нь 2 тэмдэгт'),
  phone: z.string().trim().min(6, 'Утасны дугаар буруу'),
  location: z.string().trim().min(1, 'Байршил шаардлагатай'),
  pickupAddress: z.string().trim().min(5, 'Очиж авах хаягаа дэлгэрэнгүй бичнэ үү'),
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
  if (!user.emailVerified) {
    return { message: 'Эхлээд имэйл хаягаа баталгаажуулна уу' };
  }

  const parsed = SellerSchema.safeParse({
    storeName: formData.get('storeName'),
    phone: formData.get('phone'),
    location: formData.get('location'),
    pickupAddress: formData.get('pickupAddress'),
    description: formData.get('description') ?? '',
    agreed: formData.get('agreed'),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;

  const result = db.prepare(
    `INSERT INTO sellers (user_id, store_name, phone, location, pickup_address, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    user.id,
    data.storeName,
    data.phone,
    data.location,
    data.pickupAddress,
    data.description || null,
  );
  const newStoreId = Number(result.lastInsertRowid);

  revalidatePath('/sell');
  redirect(`/seller/dashboard?store=${newStoreId}`);
}

const UpdateSellerSchema = z.object({
  storeId: z.coerce.number().int().positive(),
  storeName: z.string().trim().min(2, 'Дэлгүүрийн нэр доод тал нь 2 тэмдэгт'),
  phone: z.string().trim().min(6, 'Утасны дугаар буруу'),
  location: z.string().trim().min(1, 'Байршил шаардлагатай'),
  pickupAddress: z.string().trim().min(5, 'Очиж авах хаягаа дэлгэрэнгүй бичнэ үү'),
  description: z.string().trim().optional(),
  story: z.string().trim().max(4000, 'Түүх хэт урт байна').optional(),
});

export type UpdateSellerState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof UpdateSellerSchema> | 'banner', string[]>>;
      message?: string;
      success?: boolean;
    }
  | undefined;

export async function updateSeller(_state: UpdateSellerState, formData: FormData): Promise<UpdateSellerState> {
  const user = await getSessionUser();
  if (!user) return { message: 'Эхлээд нэвтэрнэ үү' };

  const parsed = UpdateSellerSchema.safeParse({
    storeId: formData.get('storeId'),
    storeName: formData.get('storeName'),
    phone: formData.get('phone'),
    location: formData.get('location'),
    pickupAddress: formData.get('pickupAddress'),
    description: formData.get('description') ?? '',
    story: formData.get('story') ?? '',
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;
  const owned = db
    .prepare('SELECT banner_path FROM sellers WHERE id = ? AND user_id = ?')
    .get(data.storeId, user.id) as { banner_path: string | null } | undefined;
  if (!owned) return { message: 'Энэ дэлгүүр таных биш байна' };

  // Optional new banner image — validate, save, then drop the previous one.
  let bannerPath = owned.banner_path;
  const bannerFile = formData.get('banner');
  if (bannerFile instanceof File && bannerFile.size > 0) {
    const err = validateImageFile(bannerFile);
    if (err) return { errors: { banner: [err] } };
    const saved = await saveImageFile(bannerFile, 'banners');
    const old = owned.banner_path;
    bannerPath = saved;
    if (old && old.startsWith('/uploads/')) {
      await fs.unlink(path.join(process.cwd(), 'public', old)).catch(() => {});
    }
  }

  db.prepare(
    `UPDATE sellers SET store_name = ?, phone = ?, location = ?, pickup_address = ?, description = ?, story = ?, banner_path = ? WHERE id = ?`,
  ).run(
    data.storeName,
    data.phone,
    data.location,
    data.pickupAddress,
    data.description || null,
    data.story || null,
    bannerPath,
    data.storeId,
  );

  revalidatePath('/seller/dashboard');
  revalidatePath(`/store/${data.storeId}`);
  return { success: true };
}

const ProductSchema = z.object({
  name: z.string().trim().min(2, 'Бүтээгдэхүүний нэр доод тал нь 2 тэмдэгт'),
  description: z.string().trim().min(10, 'Тайлбар доод тал нь 10 тэмдэгт'),
  price: z.coerce.number().int().positive('Үнэ зөв байх ёстой'),
  category: z.string().trim().min(1, 'Ангилал шаардлагатай'),
  stockQuantity: z.coerce.number().int().min(0, 'Үлдэгдэл сөрөг байж болохгүй'),
  acceptCustomOrders: z.preprocess(v => v === 'on', z.boolean()),
  personalizationPrompt: z.string().trim().max(100, 'Хэт урт байна').optional(),
});

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: string;
  acceptCustomOrders: boolean;
  personalizationPrompt: string;
}

// Parses up to MAX_OPTIONS option groups from the form: optionName{i} + optionValues{i}
// (comma-separated). Skips groups with a blank name or no values.
const MAX_OPTIONS = 3;
function parseOptionsFromForm(formData: FormData): Array<{ name: string; values: string[] }> {
  const out: Array<{ name: string; values: string[] }> = [];
  for (let i = 1; i <= MAX_OPTIONS; i++) {
    const name = String(formData.get(`optionName${i}`) ?? '').trim();
    const raw = String(formData.get(`optionValues${i}`) ?? '');
    const values = [...new Set(raw.split(',').map(v => v.trim()).filter(Boolean))];
    if (name && values.length > 0) out.push({ name, values });
  }
  return out;
}

export type ProductState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof ProductSchema> | 'images', string[]>>;
      message?: string;
      values?: ProductFormValues;
      submitId?: number;
      success?: boolean;
      createdProductName?: string;
      createdProductId?: number;
    }
  | undefined;


export async function updateProductInventory(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return;

  const productId = Number(formData.get('productId'));
  if (!Number.isInteger(productId) || productId <= 0) return;

  const owned = db
    .prepare(
      `SELECT 1 FROM products p
       JOIN sellers s ON s.id = p.seller_id
       WHERE p.id = ? AND s.user_id = ?`,
    )
    .get(productId, user.id);
  if (!owned) return;

  const stockRaw = formData.get('stockQuantity');
  const acceptRaw = formData.get('acceptCustomOrders');

  if (stockRaw !== null) {
    const stock = Number(stockRaw);
    if (Number.isInteger(stock) && stock >= 0) {
      db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(stock, productId);
    }
  }
  if (acceptRaw !== null) {
    const accept = acceptRaw === 'on' ? 1 : 0;
    db.prepare('UPDATE products SET accept_custom_orders = ? WHERE id = ?').run(accept, productId);
  }

  revalidatePath('/seller/dashboard');
  revalidatePath(`/product/${productId}`);
}

// Soft-delete: archive hides a product from listings/search/detail but keeps it
// for order history (order_items hold their own name/price/image snapshot).
export async function setProductArchived(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return;

  const productId = Number(formData.get('productId'));
  if (!Number.isInteger(productId) || productId <= 0) return;

  const owned = db
    .prepare(
      `SELECT 1 FROM products p
       JOIN sellers s ON s.id = p.seller_id
       WHERE p.id = ? AND s.user_id = ?`,
    )
    .get(productId, user.id);
  if (!owned) return;

  const archive = formData.get('archived') === 'on';
  db.prepare(
    `UPDATE products SET archived_at = ${archive ? "datetime('now')" : 'NULL'} WHERE id = ?`,
  ).run(productId);

  revalidatePath('/seller/dashboard');
  revalidatePath(`/product/${productId}`);
}

export async function createProduct(_state: ProductState, formData: FormData): Promise<ProductState> {
  const submittedValues: ProductFormValues = {
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    price: String(formData.get('price') ?? ''),
    category: String(formData.get('category') ?? ''),
    stockQuantity: String(formData.get('stockQuantity') ?? ''),
    acceptCustomOrders: formData.get('acceptCustomOrders') === 'on',
    personalizationPrompt: String(formData.get('personalizationPrompt') ?? ''),
  };

  const user = await getSessionUser();
  if (!user) return { message: 'Эхлээд нэвтэрнэ үү', values: submittedValues, submitId: Date.now() };
  if (!user.emailVerified) return { message: 'Эхлээд имэйл хаягаа баталгаажуулна уу', values: submittedValues, submitId: Date.now() };

  const storeId = Number(formData.get('storeId'));
  const seller = Number.isInteger(storeId) && storeId > 0
    ? (db.prepare('SELECT id FROM sellers WHERE id = ? AND user_id = ?').get(storeId, user.id) as Pick<SellerRow, 'id'> | undefined)
    : (db.prepare('SELECT id FROM sellers WHERE user_id = ? ORDER BY created_at ASC LIMIT 1').get(user.id) as Pick<SellerRow, 'id'> | undefined);
  if (!seller) return { message: 'Та борлуулагч биш байна', values: submittedValues, submitId: Date.now() };

  const parsed = ProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
    stockQuantity: formData.get('stockQuantity'),
    acceptCustomOrders: formData.get('acceptCustomOrders'),
    personalizationPrompt: formData.get('personalizationPrompt') ?? '',
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values: submittedValues, submitId: Date.now() };
  }

  const rawFiles = formData.getAll('images');
  const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { errors: { images: ['Доод тал нь нэг зураг шаардлагатай'] }, values: submittedValues, submitId: Date.now() };
  }

  for (const f of files) {
    const ext = path.extname(f.name).toLowerCase();
    const typeOk = f.type && ALLOWED_IMAGE_TYPES.has(f.type);
    const extOk = ALLOWED_IMAGE_EXTS.has(ext);
    if (!typeOk && !extOk) {
      return { errors: { images: [`Зургийн төрөл буруу: ${f.name}`] }, values: submittedValues, submitId: Date.now() };
    }
    if (f.size > MAX_IMAGE_BYTES) {
      return { errors: { images: [`Зураг ${f.name} 5MB-аас их байна`] }, values: submittedValues, submitId: Date.now() };
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

  const options = parseOptionsFromForm(formData);

  const insertProduct = db.prepare(
    `INSERT INTO products (seller_id, name, description, price, category, stock_quantity, accept_custom_orders, personalization_prompt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertImage = db.prepare(
    'INSERT INTO product_images (product_id, path, position) VALUES (?, ?, ?)',
  );
  const insertOption = db.prepare(
    'INSERT INTO product_options (product_id, name, position) VALUES (?, ?, ?)',
  );
  const insertOptionValue = db.prepare(
    'INSERT INTO product_option_values (option_id, value, position) VALUES (?, ?, ?)',
  );

  let newProductId = 0;
  const tx = db.transaction((productData: typeof parsed.data, imagePaths: string[]) => {
    const result = insertProduct.run(
      seller.id,
      productData.name,
      productData.description,
      productData.price,
      productData.category,
      productData.stockQuantity,
      productData.acceptCustomOrders ? 1 : 0,
      productData.personalizationPrompt?.trim() || null,
    );
    newProductId = Number(result.lastInsertRowid);
    imagePaths.forEach((p, i) => insertImage.run(newProductId, p, i));
    options.forEach((opt, oi) => {
      const optId = Number(insertOption.run(newProductId, opt.name, oi).lastInsertRowid);
      opt.values.forEach((v, vi) => insertOptionValue.run(optId, v, vi));
    });
  });
  tx(parsed.data, savedPaths);

  if (!newProductId) {
    return { message: 'Хадгалахад алдаа гарлаа', values: submittedValues, submitId: Date.now() };
  }

  revalidatePath('/seller/dashboard');
  revalidatePath('/products');
  revalidatePath(`/product/${newProductId}`);
  return {
    success: true,
    createdProductName: parsed.data.name,
    createdProductId: newProductId,
    submitId: Date.now(),
  };
}

