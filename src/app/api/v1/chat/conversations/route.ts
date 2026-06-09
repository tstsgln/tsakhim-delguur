import { z } from 'zod';
import { listConversationsForUser, getUnreadCount, findOrCreateConversation } from '@/lib/chat-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/chat/conversations (Bearer) -> { conversations, unread }
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  return Response.json({
    conversations: listConversationsForUser(user.id),
    unread: getUnreadCount(user.id),
  });
}

const CreateSchema = z.object({ sellerId: z.number().int().positive() });

// POST /api/v1/chat/conversations (Bearer) { sellerId } -> { conversationId }
// Starts (or reuses) a buyer↔seller conversation.
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return apiError('Дэлгүүр буруу байна', 400);
  const conversationId = findOrCreateConversation(user.id, parsed.data.sellerId);
  return Response.json({ conversationId });
}
