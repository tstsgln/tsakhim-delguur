import 'server-only';
import {
  createPaymentIntent,
  createCheckoutSession,
  getPaymentIntent,
  listChargesForIntent,
  newIdempotencyKey,
  toMinorUnits,
} from './wire';
import { getOrder, markPaid, attachPaymentIntent } from './orders-db';
import { notifyOrderPaid } from './order-notifications';

/**
 * Үүсгэсэн захиалгууд (нэг сагс = seller бүрээр нэг захиалга)-д нэг Wire
 * PaymentIntent + hosted Checkout Session үүсгэнэ. Буцаад төлбөрийн хуудасны URL.
 */
export async function createWireCheckoutForOrders(params: {
  orderIds: number[];
  buyerUserId: number;
  origin: string;
}): Promise<{ url: string; paymentIntentId: string }> {
  const { orderIds, buyerUserId, origin } = params;

  // Нийт төлөх дүнг захиалгуудын subtotal-аас (эх сурвалж = DB, клиентээс биш) тооцно.
  let totalMnt = 0;
  for (const id of orderIds) {
    const order = getOrder(id);
    if (!order) throw new Error(`Захиалга #${id} олдсонгүй`);
    totalMnt += order.subtotal;
  }
  if (totalMnt <= 0) throw new Error('Төлбөрийн дүн буруу байна');

  const intent = await createPaymentIntent({
    amount: toMinorUnits(totalMnt),
    idempotencyKey: newIdempotencyKey(),
    metadata: {
      order_ids: orderIds.join(','),
      buyer_user_id: String(buyerUserId),
    },
  });

  const session = await createCheckoutSession({
    paymentIntentId: intent.id,
    successUrl: `${origin}/api/wire/return?pi=${intent.id}`,
    cancelUrl: `${origin}/purchases?payment=canceled`,
    idempotencyKey: newIdempotencyKey(),
  });

  attachPaymentIntent(orderIds, intent.id);

  return { url: session.url, paymentIntentId: intent.id };
}

function parseOrderIds(metadata: Record<string, string> | null): number[] {
  const raw = metadata?.order_ids;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

/**
 * PaymentIntent-ийг Wire-аас татаж succeeded эсэхийг шалгаад, түүнд хамаарах
 * захиалгуудыг `paid` болгоно. Return route БОЛОН webhook хоёулаа дуудна (idempotent).
 */
export async function confirmWirePayment(
  paymentIntentId: string,
): Promise<{ ok: boolean; paidOrderIds: number[]; reason?: string }> {
  const intent = await getPaymentIntent(paymentIntentId);
  const orderIds = parseOrderIds(intent.metadata);
  if (orderIds.length === 0) {
    return { ok: false, paidOrderIds: [], reason: 'Захиалгын мэдээлэл олдсонгүй' };
  }

  // Succeeded PaymentIntent эсвэл succeeded charge аль нэг нь байвал төлсөнд тооцно.
  let paid = intent.status === 'succeeded';
  if (!paid) {
    try {
      const charges = await listChargesForIntent(paymentIntentId);
      paid = charges.data.some((c) => c.status === 'succeeded');
    } catch {
      /* charges татаж чадсангүй — доор pending гэж үзнэ */
    }
  }
  if (!paid) return { ok: false, paidOrderIds: [], reason: 'Төлбөр хараахан баталгаажаагүй' };

  // Хамгаалалт: дүн ба payment_ref таарч байгаа эсэх.
  let expectedMnt = 0;
  for (const id of orderIds) {
    const order = getOrder(id);
    if (!order) return { ok: false, paidOrderIds: [], reason: `Захиалга #${id} олдсонгүй` };
    if (order.payment_ref && order.payment_ref !== paymentIntentId) {
      return { ok: false, paidOrderIds: [], reason: `Захиалга #${id} өөр төлбөртэй холбоотой` };
    }
    expectedMnt += order.subtotal;
  }
  if (toMinorUnits(expectedMnt) !== intent.amount) {
    return { ok: false, paidOrderIds: [], reason: 'Төлбөрийн дүн захиалгатай таарахгүй байна' };
  }

  const paidOrderIds: number[] = [];
  for (const id of orderIds) {
    const result = markPaid(id);
    if (result.ok) {
      paidOrderIds.push(id);
      notifyOrderPaid(id);
    }
  }
  return { ok: true, paidOrderIds };
}
