import 'server-only';
import crypto from 'node:crypto';

const TOKEN_BYTES = 32;
export const VERIFICATION_TOKEN_TTL_HOURS = 24;

export function generateVerificationToken(): { token: string; tokenHash: string; expiresAt: string } {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();
  return { token, tokenHash, expiresAt };
}

export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
