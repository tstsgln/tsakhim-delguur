import 'server-only';
import { headers } from 'next/headers';

// In-memory fixed-window rate limiter. The app runs as a single PM2 process,
// so a process-local Map is sufficient (no shared store needed). If the app is
// ever scaled to multiple instances, swap this for Redis or similar.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

function sweepExpired(now: number): void {
  for (const [key, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (only meaningful when ok === false). */
  retryAfterSec: number;
}

/**
 * Consume one token for `key`. Returns ok=false once `limit` is reached within
 * `windowMs`. The window is fixed: it starts on the first hit and resets after
 * windowMs elapses.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    if (buckets.size > MAX_TRACKED_KEYS) sweepExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }

  existing.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP from the reverse-proxy headers (Nginx sets these). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return h.get('x-real-ip')?.trim() || 'unknown';
}
