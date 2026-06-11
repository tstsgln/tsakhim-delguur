import { z } from 'zod';
import { upsertDeviceToken } from '@/lib/push-db';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const Schema = z.object({
  token: z.string().min(10),
  platform: z.string().default('android'),
});

// POST /api/v1/devices/register (Bearer) { token, platform } -> { ok }
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
  if (!parsed.success) return apiError('Мэдээлэл буруу байна', 400);
  upsertDeviceToken(user.id, parsed.data.token, parsed.data.platform);
  return Response.json({ ok: true });
}
