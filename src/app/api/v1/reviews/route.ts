import { z } from 'zod';
import { createReview } from '@/lib/reviews-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const Schema = z.object({
  orderItemId: z.number().int().positive(),
  rating: z.number().int().min(1, 'Үнэлгээ 1-5 хооронд').max(5, 'Үнэлгээ 1-5 хооронд'),
  comment: z.string().trim().max(2000).optional(),
  imagePaths: z.array(z.string()).optional(),
});

// POST /api/v1/reviews (Bearer) { orderItemId, rating, comment?, imagePaths? } -> { ok, reviewId }
// createReview enforces: the order item belongs to this buyer, the order is
// 'completed', and it hasn't been reviewed yet.
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();

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

  const result = createReview({
    orderItemId: parsed.data.orderItemId,
    userId: user.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    imagePaths: parsed.data.imagePaths,
  });
  if (!result.ok) return apiError(result.reason ?? 'Үнэлгээ хадгалж чадсангүй', 409);

  return Response.json({ ok: true, reviewId: result.reviewId });
}
