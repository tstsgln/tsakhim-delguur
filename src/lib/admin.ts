import type { SessionUser } from './types';

// Admin emails are configured via the ADMIN_EMAILS env var (comma-separated).
// Falls back to the original hardcoded address so existing deploys keep working
// until the env var is set on the VPS.
const FALLBACK_ADMIN_EMAIL = 'tstsegi22@gmail.com';

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? FALLBACK_ADMIN_EMAIL)
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return !!user && ADMIN_EMAILS.has(user.email.toLowerCase());
}
