import type { SessionUser } from './types';

export const ADMIN_EMAIL = 'tstsegi22@gmail.com';

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return !!user && user.email.toLowerCase() === ADMIN_EMAIL;
}
