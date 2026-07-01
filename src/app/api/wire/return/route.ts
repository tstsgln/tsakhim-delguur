import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { confirmWirePayment } from '@/lib/wire-orders';

// GET /api/wire/return?pi=... — Wire-ийн success_url. Төлбөрийг баталгаажуулж,
// захиалгуудыг paid болгоод /purchases руу буцаана.
export async function GET(request: NextRequest) {
  // Production дээр request.url нь дотоод хаяг (localhost:3000)-г буцаадаг тул
  // redirect-ийн суурийг APP_BASE_URL-ээс авна (checkout-ийн origin-тэй ижил).
  const base = process.env.APP_BASE_URL ?? request.nextUrl.origin;
  const to = (path: string) => NextResponse.redirect(new URL(path, base));

  const pi = request.nextUrl.searchParams.get('pi');
  if (!pi) {
    return to('/purchases');
  }

  try {
    const result = await confirmWirePayment(pi);
    const flag = result.ok ? 'payment=success' : 'payment=pending';
    return to(`/purchases?${flag}&just_ordered=1`);
  } catch (err) {
    console.error('Wire return алдаа:', err);
    return to('/purchases?payment=pending');
  }
}
