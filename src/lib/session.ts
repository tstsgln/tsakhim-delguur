import 'server-only';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import type { SessionUser } from './types';

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error('SESSION_SECRET is not set');
const encodedKey = new TextEncoder().encode(secretKey);

const COOKIE_NAME = 'session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface SessionPayload extends JWTPayload {
  user: SessionUser;
}

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

async function decrypt(session: string | undefined): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser) {
  const expiresAt = new Date(Date.now() + MAX_AGE_MS);
  const token = await encrypt({ user });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const payload = await decrypt(token);
  if (!payload?.user) return null;
  // Grandfather sessions issued before email_verified was tracked: treat as verified.
  const user = payload.user;
  if (typeof user.emailVerified !== 'boolean') {
    return { ...user, emailVerified: true };
  }
  return user;
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
