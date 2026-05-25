'use server';

import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/db';
import {
  findOrCreateConversation,
  getConversationForUser,
  insertMessage,
  insertProductReferenceIfNew,
} from '@/lib/chat-db';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function startConversationWithSeller(formData: FormData): Promise<void> {
  const sellerId = Number(formData.get('sellerId'));
  if (!Number.isInteger(sellerId) || sellerId <= 0) redirect('/products');

  const rawProductId = Number(formData.get('productId'));
  const productId = Number.isInteger(rawProductId) && rawProductId > 0 ? rawProductId : null;

  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!user.emailVerified) redirect('/signup/check-email?email=' + encodeURIComponent(user.email));

  const seller = db
    .prepare('SELECT id, user_id FROM sellers WHERE id = ?')
    .get(sellerId) as { id: number; user_id: number } | undefined;
  if (!seller) redirect('/products');

  if (seller.user_id === user.id) {
    redirect('/seller/dashboard');
  }

  const conversationId = findOrCreateConversation(user.id, seller.id);

  if (productId != null) {
    const product = db
      .prepare('SELECT seller_id FROM products WHERE id = ?')
      .get(productId) as { seller_id: number } | undefined;
    if (product && product.seller_id === seller.id) {
      insertProductReferenceIfNew(conversationId, user.id, productId);
    }
  }

  redirect(`/messages/${conversationId}`);
}

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
  if (!user.emailVerified) return { message: 'Эхлээд имэйл хаягаа баталгаажуулна уу' };

  const convo = getConversationForUser(conversationId, user.id);
  if (!convo) return { message: 'Зурвасын хэрэглэгч олдсонгүй' };

  const rawBody = formData.get('body');
  const body = typeof rawBody === 'string' ? rawBody.trim() : '';
  if (body.length > 2000) return { message: 'Зурвас 2000 тэмдэгтээс хэтэрсэн байна' };

  const rawImage = formData.get('image');
  const file = rawImage instanceof File && rawImage.size > 0 ? rawImage : null;

  if (!body && !file) return { message: 'Зурвас эсвэл зураг оруулна уу' };

  let imagePath: string | null = null;
  if (file) {
    const ext = path.extname(file.name).toLowerCase();
    const typeOk = file.type && ALLOWED_IMAGE_TYPES.has(file.type);
    const extOk = ALLOWED_IMAGE_EXTS.has(ext);
    if (!typeOk && !extOk) return { message: 'Зургийн төрөл буруу байна' };
    if (file.size > MAX_IMAGE_BYTES) return { message: 'Зураг 8MB-аас их байна' };

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'chat');
    await fs.mkdir(uploadsDir, { recursive: true });
    const safeExt = ALLOWED_IMAGE_EXTS.has(ext) ? ext : '.jpg';
    const filename = `${crypto.randomUUID()}${safeExt}`;
    const fullPath = path.join(uploadsDir, filename);
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, bytes);
    imagePath = `/uploads/chat/${filename}`;
  }

  insertMessage(conversationId, user.id, body, imagePath);
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath('/messages');
  return undefined;
}
