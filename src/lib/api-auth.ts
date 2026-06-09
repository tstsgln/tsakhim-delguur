import 'server-only';
import { NextResponse } from 'next/server';
import { verifySessionToken } from './session';
import { db } from './db';
import type { SessionUser } from './types';

export interface SellerRecord {
  id: number;
  store_name: string;
  location: string;
  phone: string;
  pickup_address: string | null;
  description: string | null;
  story: string | null;
  banner_path: string | null;
}

/** The seller (store) row for a user, or null if they don't have a store. */
export function getSellerForUser(userId: number): SellerRecord | null {
  return (
    (db
      .prepare(
        `SELECT id, store_name, location, phone, pickup_address, description, story, banner_path
         FROM sellers WHERE user_id = ?`,
      )
      .get(userId) as SellerRecord | undefined) ?? null
  );
}

/**
 * Shared helpers for the mobile API (`/api/v1/*`).
 *
 * Auth is stateless JWT: the client sends `Authorization: Bearer <token>` where
 * the token is the same signed session JWT the web app stores in a cookie. We
 * verify it here instead of reading cookies, so the same user model is reused.
 */

/** Resolve the authenticated user from the Bearer token, or null if absent/invalid. */
export async function getApiUser(req: Request): Promise<SessionUser | null> {
  const header = req.headers.get('authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  return verifySessionToken(match[1]!.trim());
}

/** JSON error body with the given status, e.g. `apiError('Нэвтрэх шаардлагатай', 401)`. */
export function apiError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** 401 helper for endpoints that require a logged-in user. */
export const UNAUTHORIZED = () => apiError('Нэвтрэх шаардлагатай', 401);
