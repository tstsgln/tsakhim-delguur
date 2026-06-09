import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateVerificationToken } from '@/lib/verify-token';
import { sendEmail, buildVerificationEmail, getAppBaseUrl } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { apiError } from '@/lib/api-auth';

const HOUR = 60 * 60_000;

const SignupSchema = z.object({
  name: z.string().trim().min(2, 'Нэр доод тал нь 2 тэмдэгт байна'),
  email: z.string().trim().toLowerCase().email('Имэйл буруу байна'),
  password: z.string().min(6, 'Нууц үг доод тал нь 6 тэмдэгт байна'),
});

// POST /api/v1/auth/signup  { name, email, password } -> { ok: true }
// Mirrors the web signup action: creates the user, emails a verification link,
// and does NOT log in automatically (the client then calls /login).
export async function POST(req: Request) {
  const ip = await getClientIp();
  const limit = rateLimit(`signup:${ip}`, 6, HOUR);
  if (!limit.ok) {
    return apiError(`Хэт олон удаа оролдлоо. ${Math.ceil(limit.retryAfterSec / 60)} минутын дараа дахин оролдоно уу.`, 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Мэдээлэл буруу байна', 400, {
      fields: z.flattenError(parsed.error).fieldErrors,
    });
  }

  const { name, email, password } = parsed.data;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return apiError('Энэ имэйл бүртгэлтэй байна', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, passwordHash);
  const userId = Number(result.lastInsertRowid);

  const { token, tokenHash, expiresAt } = generateVerificationToken();
  db.prepare(
    'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
  ).run(userId, tokenHash, expiresAt);

  const verifyUrl = `${getAppBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const { subject, html, text } = buildVerificationEmail(name, verifyUrl);
  try {
    await sendEmail({ to: email, subject, html, text }, 'signup-verification');
  } catch (err) {
    console.error('Verification email failed to send:', err);
    return apiError('Имэйл явуулахад алдаа гарлаа. Дахин оролдоно уу.', 502);
  }

  return Response.json({ ok: true, message: 'Баталгаажуулах имэйл илгээлээ. Имэйлээ шалгана уу.' });
}
