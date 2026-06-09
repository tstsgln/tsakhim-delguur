import { db } from '@/lib/db';
import { generateVerificationToken } from '@/lib/verify-token';
import { sendEmail, buildVerificationEmail, getAppBaseUrl } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

// POST /api/v1/auth/resend-verification (Bearer) -> { ok }
// Re-sends the verification email to the logged-in user's address.
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();

  const ip = await getClientIp();
  const limit = rateLimit(`resend:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.ok) return apiError('Хэт олон удаа оролдлоо. Дараа дахин оролдоно уу.', 429);

  const row = db
    .prepare('SELECT id, name, email, email_verified_at FROM users WHERE id = ?')
    .get(user.id) as { id: number; name: string; email: string; email_verified_at: string | null } | undefined;
  if (!row) return UNAUTHORIZED();
  if (row.email_verified_at) return Response.json({ ok: true, message: 'Имэйл аль хэдийн баталгаажсан байна' });

  const latest = db
    .prepare('SELECT created_at FROM email_verification_tokens WHERE user_id = ? ORDER BY id DESC LIMIT 1')
    .get(row.id) as { created_at: string } | undefined;
  if (latest) {
    const last = new Date(latest.created_at + 'Z').getTime();
    if (Number.isFinite(last) && Date.now() - last < RESEND_COOLDOWN_MS) {
      return apiError('Дөнгөж сая илгээсэн байна. Хэдэн минутын дараа дахин оролдоно уу.', 429);
    }
  }

  const { token, tokenHash, expiresAt } = generateVerificationToken();
  db.prepare(
    'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
  ).run(row.id, tokenHash, expiresAt);

  const verifyUrl = `${getAppBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const { subject, html, text } = buildVerificationEmail(row.name, verifyUrl);
  try {
    await sendEmail({ to: row.email, subject, html, text }, 'resend-verification');
  } catch (err) {
    console.error('Resend verification failed:', err);
    return apiError('Имэйл явуулахад алдаа гарлаа. Дахин оролдоно уу.', 502);
  }

  return Response.json({ ok: true, message: 'Баталгаажуулах холбоос дахин илгээлээ.' });
}
