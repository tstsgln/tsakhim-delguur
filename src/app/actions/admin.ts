'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/session';
import { isAdmin } from '@/lib/admin';
import { markFailedEmailResolved } from '@/lib/email-log';

export async function resolveFailedEmail(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!isAdmin(user)) return;
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;
  markFailedEmailResolved(id);
  revalidatePath('/admin');
}
