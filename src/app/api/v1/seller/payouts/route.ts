import { z } from 'zod';
import { getSellerBalance, listPayoutsForUser, requestPayout } from '@/lib/orders-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/seller/payouts (Bearer) -> { balance, payouts }
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  return Response.json({
    balance: getSellerBalance(user.id),
    payouts: listPayoutsForUser(user.id),
  });
}

const PayoutSchema = z.object({
  amount: z.number().int().positive('Дүн зөв байх ёстой'),
  bankName: z.string().trim().min(2, 'Банкны нэр шаардлагатай'),
  accountNumber: z.string().trim().min(4, 'Дансны дугаар шаардлагатай'),
  accountHolder: z.string().trim().min(2, 'Эзэмшигчийн нэр шаардлагатай'),
});

// POST /api/v1/seller/payouts (Bearer) { amount, bankName, accountNumber, accountHolder } -> { ok, payoutId }
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = PayoutSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Мэдээлэл буруу байна', 400, { fields: z.flattenError(parsed.error).fieldErrors });
  }
  const result = requestPayout({ userId: user.id, ...parsed.data });
  if (!result.ok) return apiError(result.reason ?? 'Хүсэлт амжилтгүй', 409);
  return Response.json({ ok: true, payoutId: result.payoutId });
}
