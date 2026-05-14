'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/session';
import { isAdmin } from '@/lib/admin';
import {
  insertFeedback,
  setFeedbackStatus,
  type FeedbackStatus,
} from '@/lib/feedback-db';

const FeedbackSchema = z.object({
  kind: z.enum(['suggestion', 'complaint']),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(5, 'Дор хаяж 5 тэмдэгт бичнэ үү').max(4000),
});

export type FeedbackState =
  | {
      errors?: Partial<Record<'subject' | 'body' | 'kind', string[]>>;
      message?: string;
      success?: boolean;
    }
  | undefined;

export async function submitFeedback(
  _state: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const user = await getSessionUser();
  if (!user) return { message: 'Эхлээд нэвтэрнэ үү' };

  const parsed = FeedbackSchema.safeParse({
    kind: formData.get('kind') ?? 'suggestion',
    subject: (formData.get('subject') as string) || undefined,
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  insertFeedback(user.id, parsed.data.kind, parsed.data.subject ?? null, parsed.data.body);
  revalidatePath('/admin');
  return { success: true };
}

export async function updateFeedbackStatus(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!isAdmin(user)) return;
  const id = Number(formData.get('id'));
  const status = String(formData.get('status')) as FeedbackStatus;
  if (!Number.isInteger(id) || id <= 0) return;
  if (!['new', 'read', 'resolved'].includes(status)) return;
  setFeedbackStatus(id, status);
  revalidatePath('/admin');
}
