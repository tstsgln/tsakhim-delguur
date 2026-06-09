import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSessionToken } from '@/lib/session';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { apiError } from '@/lib/api-auth';

const MINUTE = 60_000;

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Имэйл буруу байна'),
  password: z.string().min(1, 'Нууц үг шаардлагатай'),
});

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  email_verified_at: string | null;
}

// POST /api/v1/auth/login  { email, password } -> { token, user }
// Mirrors the web login action: same rate limit, same "wrong email or password"
// behaviour, and unverified users are still allowed in (client shows a banner).
export async function POST(req: Request) {
  const ip = await getClientIp();
  const limit = rateLimit(`login:${ip}`, 15, 15 * MINUTE);
  if (!limit.ok) {
    return apiError(`Хэт олон удаа оролдлоо. ${Math.ceil(limit.retryAfterSec / 60)} минутын дараа дахин оролдоно уу.`, 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Имэйл эсвэл нууц үг буруу байна', 400, {
      fields: z.flattenError(parsed.error).fieldErrors,
    });
  }

  const { email, password } = parsed.data;
  const user = db
    .prepare('SELECT id, name, email, password_hash, email_verified_at FROM users WHERE email = ?')
    .get(email) as UserRow | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return apiError('Имэйл эсвэл нууц үг буруу байна', 401);
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.email_verified_at !== null,
  };
  const token = await createSessionToken(sessionUser);
  return Response.json({ token, user: sessionUser });
}
