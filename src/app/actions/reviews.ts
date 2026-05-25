'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/session';
import { createReview } from '@/lib/reviews-db';
import { db } from '@/lib/db';

const ReviewSchema = z.object({
  orderItemId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

interface ReviewErrors {
  rating?: string[];
  comment?: string[];
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

  const result = createReview({
    orderItemId: parsed.data.orderItemId,
    userId: user.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });
  if (!result.ok) {
    return { errors: { form: [result.reason ?? 'Үнэлгээ илгээхэд алдаа гарлаа'] } };
  }

  if (itemRow?.product_id) revalidatePath(`/product/${itemRow.product_id}`);
  if (itemRow?.order_id) revalidatePath(`/purchases/${itemRow.order_id}`);
  revalidatePath('/purchases');

  return { success: true, orderItemId: parsed.data.orderItemId };
}
