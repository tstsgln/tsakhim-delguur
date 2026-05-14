'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/db';
import {
  findOrCreateConversation,
  getConversationForUser,
  insertMessage,
} from '@/lib/chat-db';

export async function startConversationWithSeller(formData: FormData): Promise<void> {
  const sellerId = Number(formData.get('sellerId'));
  if (!Number.isInteger(sellerId) || sellerId <= 0) redirect('/products');

  const user = await getSessionUser();
  if (!user) redirect('/login');

  const seller = db
    .prepare('SELECT id, user_id FROM sellers WHERE id = ?')
    .get(sellerId) as { id: number; user_id: number } | undefined;
  if (!seller) redirect('/products');

  if (seller.user_id === user.id) {
    redirect('/seller/dashboard');
  }

  const conversationId = findOrCreateConversation(user.id, seller.id);
  redirect(`/messages/${conversationId}`);
}

const MessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export type SendMessageState =
  | {
      message?: string;
    }
  | undefined;

export async function sendMessage(
  conversationId: number,
  _state: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const user = await getSessionUser();
  if (!user) return { message: 'Эхлээд нэвтэрнэ үү' };

  const parsed = MessageSchema.safeParse({ body: formData.get('body') });
  if (!parsed.success) return { message: 'Зурвас хоосон байж болохгүй' };

  const convo = getConversationForUser(conversationId, user.id);
  if (!convo) return { message: 'Зурвасын хэрэглэгч олдсонгүй' };

  insertMessage(conversationId, user.id, parsed.data.body);
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath('/messages');
  return undefined;
}
