import { getConversationForUser, listMessages, markConversationRead } from '@/lib/chat-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/chat/conversations/:id (Bearer) -> { conversation, messages }
// Validates the user is a participant, marks incoming messages read, returns the thread.
export async function GET(req: Request, ctx: RouteContext<'/api/v1/chat/conversations/[id]'>) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  const { id } = await ctx.params;
  const conversationId = Number(id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return apiError('Харилцаа олдсонгүй', 404);
  }

  const conversation = getConversationForUser(conversationId, user.id);
  if (!conversation) return apiError('Харилцаа олдсонгүй', 404);

  markConversationRead(conversationId, user.id);
  return Response.json({
    conversation,
    messages: listMessages(conversationId, user.id),
  });
}
