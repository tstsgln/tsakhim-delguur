'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/session';
import { addFavorite, removeFavorite } from '@/lib/favorites-db';

// Explicitly set (not toggle) so the client's optimistic state stays the
// source of truth and concurrent calls stay idempotent.
export async function setFavoriteAction(productId: number, favorited: boolean): Promise<{ ok: boolean }> {
  const user = await getSessionUser();
  if (!user) return { ok: false };
  if (!Number.isInteger(productId) || productId <= 0) return { ok: false };

  if (favorited) addFavorite(user.id, productId);
  else removeFavorite(user.id, productId);

  revalidatePath('/favorites');
  revalidatePath(`/product/${productId}`);
  return { ok: true };
}
