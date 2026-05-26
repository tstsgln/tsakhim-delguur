'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/db';
import {
  createOrdersFromCart,
  markPaid,
  markShipped,
  confirmReceivedByBuyer,
  cancelByBuyer,
  requestPayout,
  completePayout,
  rejectPayout,
  type CartLine,
} from '@/lib/orders-db';
import { isAdmin } from '@/lib/admin';
import {
  notifyNewOrder,
  notifyOrderPaid,
  notifyOrderShipped,
  notifyOrderReceived,
} from '@/lib/order-notifications';

const CheckoutSchema = z.object({
  phone: z.string().trim().min(6, 'Утасны дугаар буруу'),
  shippingAddress: z.string().trim().min(5, 'Хаягаа дэлгэрэнгүй бичнэ үү'),
  note: z.string().trim().optional(),
});

const CartLineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export type CheckoutState =
  | {
      errors?: {
        phone?: string[];
        shippingAddress?: string[];
        cart?: string[];
      };
      message?: string;
      success?: boolean;
      orderIds?: number[];
    }
  | undefined;

export async function checkout(_state: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }
  if (!user.emailVerified) {
    return { message: 'Эхлээд имэйл хаягаа баталгаажуулна уу' };
  }

  const cartJson = String(formData.get('cart') ?? '[]');
  let parsedCart: CartLine[];
  try {
    const raw = JSON.parse(cartJson);
    parsedCart = z.array(CartLineSchema).parse(raw);
  } catch {
    return { errors: { cart: ['Сагсны мэдээлэл буруу байна'] } };
  }

  if (parsedCart.length === 0) {
    return { errors: { cart: ['Сагс хоосон байна'] } };
  }

  const parsed = CheckoutSchema.safeParse({
    phone: formData.get('phone'),
    shippingAddress: formData.get('shippingAddress'),
    note: formData.get('note') ?? '',
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  let orderIds: number[];
  try {
    const summaries = createOrdersFromCart({
      buyerUserId: user.id,
      lines: parsedCart,
      phone: parsed.data.phone,
      shippingAddress: parsed.data.shippingAddress,
      note: parsed.data.note,
    });
    orderIds = summaries.map(s => s.orderId);
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Захиалга үүсгэхэд алдаа гарлаа' };
  }

  for (const orderId of orderIds) {
    notifyNewOrder(orderId);
  }

  revalidatePath('/purchases');
  return { success: true, orderIds };
}

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!isAdmin(user)) throw new Error('Зөвшөөрөлгүй');
  return user;
}

export async function adminMarkPaid(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get('orderId'));
  if (!Number.isInteger(orderId) || orderId <= 0) return;
  const result = markPaid(orderId);
  if (result.ok) notifyOrderPaid(orderId);
  revalidatePath('/admin/orders');
  revalidatePath('/purchases');
  revalidatePath(`/purchases/${orderId}`);
  revalidatePath('/seller/orders');
}

export async function sellerMarkShipped(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const orderId = Number(formData.get('orderId'));
  if (!Number.isInteger(orderId) || orderId <= 0) return;
  const result = markShipped(orderId, user.id);
  if (result.ok) notifyOrderShipped(orderId);
  revalidatePath('/seller/orders');
  revalidatePath(`/seller/orders/${orderId}`);
  revalidatePath('/purchases');
  revalidatePath(`/purchases/${orderId}`);
}

export async function buyerConfirmReceived(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const orderId = Number(formData.get('orderId'));
  if (!Number.isInteger(orderId) || orderId <= 0) return;
  const result = confirmReceivedByBuyer(orderId, user.id);
  if (result.ok) notifyOrderReceived(orderId);
  revalidatePath('/purchases');
  revalidatePath(`/purchases/${orderId}`);
  revalidatePath('/seller/orders');
  revalidatePath('/balance');
}

export async function buyerCancel(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const orderId = Number(formData.get('orderId'));
  if (!Number.isInteger(orderId) || orderId <= 0) return;
  cancelByBuyer(orderId, user.id);
  revalidatePath('/purchases');
  revalidatePath(`/purchases/${orderId}`);
  revalidatePath('/admin/orders');
}

const PayoutSchema = z.object({
  amount: z.coerce.number().int().positive('Дүн зөв байх ёстой'),
  bankName: z.string().trim().min(2, 'Банкны нэр шаардлагатай'),
  accountNumber: z.string().trim().min(4, 'Дансны дугаар шаардлагатай'),
  accountHolder: z.string().trim().min(2, 'Эзэмшигчийн нэр шаардлагатай'),
});

export type PayoutState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof PayoutSchema>, string[]>>;
      message?: string;
      success?: boolean;
    }
  | undefined;

export async function requestPayoutAction(_state: PayoutState, formData: FormData): Promise<PayoutState> {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(user.id);
  if (!seller) return { message: 'Зөвхөн борлуулагч татан авах боломжтой' };

  const parsed = PayoutSchema.safeParse({
    amount: formData.get('amount'),
    bankName: formData.get('bankName'),
    accountNumber: formData.get('accountNumber'),
    accountHolder: formData.get('accountHolder'),
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const result = requestPayout({
    userId: user.id,
    amount: parsed.data.amount,
    bankName: parsed.data.bankName,
    accountNumber: parsed.data.accountNumber,
    accountHolder: parsed.data.accountHolder,
  });
  if (!result.ok) {
    return { message: result.reason };
  }
  revalidatePath('/balance');
  revalidatePath('/admin/payouts');
  return { success: true };
}

export async function adminCompletePayout(formData: FormData) {
  await requireAdmin();
  const payoutId = Number(formData.get('payoutId'));
  const note = String(formData.get('note') ?? '');
  if (!Number.isInteger(payoutId) || payoutId <= 0) return;
  completePayout(payoutId, note);
  revalidatePath('/admin/payouts');
  revalidatePath('/balance');
}

export async function adminRejectPayout(formData: FormData) {
  await requireAdmin();
  const payoutId = Number(formData.get('payoutId'));
  const note = String(formData.get('note') ?? '');
  if (!Number.isInteger(payoutId) || payoutId <= 0) return;
  if (!note.trim()) return;
  rejectPayout(payoutId, note);
  revalidatePath('/admin/payouts');
  revalidatePath('/balance');
}
