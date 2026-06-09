import { z } from 'zod';
import { insertFeedback } from '@/lib/feedback-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const Schema = z.object({
  kind: z.enum(['suggestion', 'complaint']).default('suggestion'),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(5, 'Дор хаяж 5 тэмдэгт бичнэ үү').max(4000),
});

// POST /api/v1/feedback (Bearer) { kind, subject?, body } -> { ok }
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return apiError('Мэдээлэл буруу байна', 400, { fields: z.flattenError(parsed.error).fieldErrors });
  }
  insertFeedback(user.id, parsed.data.kind, parsed.data.subject ?? null, parsed.data.body);
  return Response.json({ ok: true });
}
