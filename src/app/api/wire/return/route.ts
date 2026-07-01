import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { confirmWirePayment } from '@/lib/wire-orders';

// GET /api/wire/return?pi=... — Wire-ийн success_url. Төлбөрийг баталгаажуулж,
// захиалгуудыг paid болгоод /purchases руу буцаана.
export async function GET(request: NextRequest) {
  const pi = request.nextUrl.searchParams.get('pi');
  if (!pi) {
    return NextResponse.redirect(new URL('/purchases', request.url));
  }

  try {
    const result = await confirmWirePayment(pi);
    const flag = result.ok ? 'payment=success' : 'payment=pending';
    return NextResponse.redirect(new URL(`/purchases?${flag}&just_ordered=1`, request.url));
  } catch (err) {
    console.error('Wire return алдаа:', err);
    return NextResponse.redirect(new URL('/purchases?payment=pending', request.url));
  }
}
