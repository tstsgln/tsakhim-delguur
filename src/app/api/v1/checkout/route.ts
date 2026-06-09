import { z } from 'zod';
import { createOrdersFromCart } from '@/lib/orders-db';
import { notifyNewOrder } from '@/lib/order-notifications';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// Mirrors the web checkout action: same validation, same email-verified gate,
// same per-seller order split + new-order notifications.
const CartLineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  variant: z.string().trim().max(300).optional(),
  personalization: z.string().trim().max(300).optional(),
});

const CheckoutSchema = z
  .object({
    lines: z.array(CartLineSchema).min(1, 'Сагс хоосон байна'),
    phone: z.string().trim().min(6, 'Утасны дугаар буруу'),
    deliveryMethod: z.enum(['delivery', 'pickup']).default('delivery'),
    shippingAddress: z.string().trim().default(''),
    note: z.string().trim().optional(),
    isGift: z.boolean().optional(),
    giftMessage: z.string().trim().max(500, 'Захидал хэт урт байна').optional(),
  })
  .superRefine((val, ctx) => {
    // Address only required for delivery; pickup uses the seller's address.
    if (val.deliveryMethod === 'delivery' && val.shippingAddress.length < 5) {
      ctx.addIssue({ code: 'custom', path: ['shippingAddress'], message: 'Хаягаа дэлгэрэнгүй бичнэ үү' });
    }
  });

// POST /api/v1/checkout (Bearer) -> { orderIds }
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  if (!user.emailVerified) {
    return apiError('Эхлээд имэйл хаягаа баталгаажуулна уу', 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Мэдээлэл буруу байна', 400, {
      fields: z.flattenError(parsed.error).fieldErrors,
    });
  }

  let orderIds: number[];
  try {
    const summaries = createOrdersFromCart({
      buyerUserId: user.id,
      lines: parsed.data.lines,
      phone: parsed.data.phone,
      shippingAddress: parsed.data.shippingAddress,
      deliveryMethod: parsed.data.deliveryMethod,
      note: parsed.data.note,
      isGift: parsed.data.isGift,
      giftMessage: parsed.data.giftMessage,
    });
    orderIds = summaries.map(s => s.orderId);
  } catch (err) {
    // e.g. out of stock, product not found, empty cart
    return apiError(err instanceof Error ? err.message : 'Захиалга үүсгэхэд алдаа гарлаа', 409);
  }

  for (const orderId of orderIds) notifyNewOrder(orderId);

  return Response.json({ orderIds });
}
