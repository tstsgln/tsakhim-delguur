'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import {
  generateVerificationToken,
  hashVerificationToken,
} from '@/lib/verify-token';
import { sendEmail, buildVerificationEmail, getAppBaseUrl } from '@/lib/email';

export type VerifyState = { message?: string } | undefined;

interface TokenRow {
  id: number;
  user_id: number;
  expires_at: string;
  used_at: string | null;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
}

export async function verifyEmail(_state: VerifyState, formData: FormData): Promise<VerifyState> {
  const token = String(formData.get('token') ?? '').trim();
  if (!token) return { message: 'Холбоос буруу байна' };

  const tokenHash = hashVerificationToken(token);

  const row = db
    .prepare(
      'SELECT id, user_id, expires_at, used_at FROM email_verification_tokens WHERE token_hash = ?',
    )
    .get(tokenHash) as TokenRow | undefined;

  if (!row) return { message: 'Холбоос буруу эсвэл аль хэдийн ашиглагдсан байна' };
  if (row.used_at) return { message: 'Энэ холбоос аль хэдийн ашиглагдсан байна' };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { message: 'Холбоос хүчингүй болсон байна. Шинээр илгээлт хүсэх товчийг дарна уу.' };
  }

  const user = db
    .prepare('SELECT id, name, email, email_verified_at FROM users WHERE id = ?')
    .get(row.user_id) as UserRow | undefined;
  if (!user) return { message: 'Хэрэглэгч олдсонгүй' };

  const tx = db.transaction(() => {
    db.prepare("UPDATE email_verification_tokens SET used_at = datetime('now') WHERE id = ?").run(row.id);
    if (!user.email_verified_at) {
      db.prepare("UPDATE users SET email_verified_at = datetime('now') WHERE id = ?").run(user.id);
    }
  });
  tx();

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: true,
  });
  redirect('/');
}

const ResendSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

export type ResendState = { message?: string; success?: boolean } | undefined;

interface LatestTokenRow {
  created_at: string;
}

export async function resendVerification(_state: ResendState, formData: FormData): Promise<ResendState> {
  const parsed = ResendSchema.safeParse({ email: formData.get('email') });
  // Generic response regardless of input to avoid leaking which emails exist.
  const generic: ResendState = { success: true, message: 'Хэрэв энэ имэйл бүртгэлтэй бол баталгаажуулах холбоос явууллаа.' };
  if (!parsed.success) return generic;

  const { email } = parsed.data;
  const user = db
    .prepare('SELECT id, name, email_verified_at FROM users WHERE email = ?')
    .get(email) as { id: number; name: string; email_verified_at: string | null } | undefined;

  if (!user) return generic;
  if (user.email_verified_at) return generic; // already verified — silent

  const latest = db
    .prepare(
      'SELECT created_at FROM email_verification_tokens WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    )
    .get(user.id) as LatestTokenRow | undefined;
  if (latest) {
    const last = new Date(latest.created_at + 'Z').getTime(); // sqlite datetime() is UTC
    if (Number.isFinite(last) && Date.now() - last < RESEND_COOLDOWN_MS) {
      return { message: 'Дөнгөж сая илгээсэн байна. Хэдэн минутын дараа дахин оролдоно уу.' };
    }
  }

  const { token, tokenHash, expiresAt } = generateVerificationToken();
  db.prepare(
    'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
  ).run(user.id, tokenHash, expiresAt);

  const verifyUrl = `${getAppBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const { subject, html, text } = buildVerificationEmail(user.name, verifyUrl);
  try {
    await sendEmail({ to: email, subject, html, text });
  } catch (err) {
    console.error('Resend verification failed:', err);
    return { message: 'Имэйл явуулахад алдаа гарлаа. Дахин оролдоно уу.' };
  }

  return generic;
}
