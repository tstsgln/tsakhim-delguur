import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { db } from '@/lib/db';
import { createSessionToken } from '@/lib/session';
import { apiError } from '@/lib/api-auth';

const Schema = z.object({ idToken: z.string().min(10) });
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

interface UserRow {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
}

// POST /api/v1/auth/google { idToken } -> { token, user }
// Verifies a Google ID token, then finds-or-creates the matching user and
// issues our own session token. Google-verified emails are trusted as verified.
export async function POST(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return apiError('Google нэвтрэлт тохируулагдаагүй байна', 503);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return apiError('Буруу хүсэлт', 400);

  let payload: { email?: string; email_verified?: boolean; name?: string };
  try {
    const res = await jwtVerify(parsed.data.idToken, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    });
    payload = res.payload as typeof payload;
  } catch {
    return apiError('Google нэвтрэлт амжилтгүй боллоо', 401);
  }

  const email = payload.email?.toLowerCase();
  if (!email || payload.email_verified === false) {
    return apiError('Google имэйл баталгаажаагүй байна', 401);
  }
  const name = payload.name?.trim() || email.split('@')[0];

  let user = db
    .prepare('SELECT id, name, email, email_verified_at FROM users WHERE email = ?')
    .get(email) as UserRow | undefined;

  if (!user) {
    // New user — random unusable password (they sign in via Google).
    const hash = await bcrypt.hash(randomBytes(24).toString('hex'), 10);
    const r = db
      .prepare("INSERT INTO users (name, email, password_hash, email_verified_at) VALUES (?, ?, ?, datetime('now'))")
      .run(name, email, hash);
    user = { id: Number(r.lastInsertRowid), name, email, email_verified_at: 'now' };
  } else if (user.email_verified_at === null) {
    db.prepare("UPDATE users SET email_verified_at = datetime('now') WHERE id = ?").run(user.id);
  }

  const sessionUser = { id: user.id, name: user.name, email: user.email, emailVerified: true };
  const token = await createSessionToken(sessionUser);
  return Response.json({ token, user: sessionUser });
}
