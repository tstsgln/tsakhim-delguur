import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getFavoriteProducts } from '@/lib/products-db';

// Returns the logged-in user's favorite products (full objects so the client
// can render them and merge with any guest/localStorage favorites).
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json([]);
  return NextResponse.json(getFavoriteProducts(user.id));
}
