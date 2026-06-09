import { z } from 'zod';
import { getConversationForUser, insertMessage } from '@/lib/chat-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const SendSchema = z.object({ body: z.string().trim().min(1, 'Хоосон зурвас илгээх боломжгүй').max(2000) });

// POST /api/v1/chat/conversations/:id/messages (Bearer) { body } -> { ok }
export async function POST(req: Request, ctx: RouteContext<'/api/v1/chat/conversations/[id]/messages'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const conversationId = Number(id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return apiError('Харилцаа олдсонгүй', 404);
  }

  // Must be a participant.
  if (!getConversationForUser(conversationId, user.id)) {
    return apiError('Харилцаа олдсонгүй', 404);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = SendSchema.safeParse(raw);
  if (!parsed.success) return apiError('Зурвас буруу байна', 400);

  insertMessage(conversationId, user.id, parsed.data.body);
  return Response.json({ ok: true });
}
