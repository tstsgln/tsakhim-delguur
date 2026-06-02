'use server';

import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs/promises';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/session';
import { createReview } from '@/lib/reviews-db';
import { db } from '@/lib/db';
import { validateImageFile, saveImageFile } from '@/lib/uploads';

const MAX_REVIEW_IMAGES = 4;

const ReviewSchema = z.object({
  orderItemId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

interface ReviewErrors {
  rating?: string[];
  comment?: string[];
  images?: string[];
  form?: string[];
  orderItemId?: string[];
}

export type ReviewState =
  | {
      errors?: ReviewErrors;
      success?: boolean;
      orderItemId?: number;
    }
  | undefined;

export async function submitReview(_state: ReviewState, formData: FormData): Promise<ReviewState> {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const parsed = ReviewSchema.safeParse({
    orderItemId: formData.get('orderItemId'),
    rating: formData.get('rating'),
    comment: formData.get('comment') || undefined,
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ReviewErrors };
  }

  const itemRow = db
    .prepare('SELECT product_id, order_id FROM order_items WHERE id = ?')
    .get(parsed.data.orderItemId) as { product_id: number | null; order_id: number } | undefined;

  // Validate uploaded photos before saving anything to disk.
  const files = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_REVIEW_IMAGES);
  for (const f of files) {
    const err = validateImageFile(f);
    if (err) return { errors: { images: [err] } };
  }

  const imagePaths: string[] = [];
  for (const f of files) {
    imagePaths.push(await saveImageFile(f, 'reviews'));
  }

  const result = createReview({
    orderItemId: parsed.data.orderItemId,
    userId: user.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    imagePaths,
  });
  if (!result.ok) {
    // Roll back any photos we just wrote so a rejected review leaves no orphans.
    await Promise.all(
      imagePaths.map(p => fs.unlink(path.join(process.cwd(), 'public', p)).catch(() => {})),
    );
    return { errors: { form: [result.reason ?? 'Үнэлгээ илгээхэд алдаа гарлаа'] } };
  }

  if (itemRow?.product_id) revalidatePath(`/product/${itemRow.product_id}`);
  if (itemRow?.order_id) revalidatePath(`/purchases/${itemRow.order_id}`);
  revalidatePath('/purchases');

  return { success: true, orderItemId: parsed.data.orderItemId };
}
