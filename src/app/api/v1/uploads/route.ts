import { validateImageFile, saveImageFile } from '@/lib/uploads';
import { getApiUser, apiError, UNAUTHORIZED } from '@/lib/api-auth';

const ALLOWED_SUBDIRS = new Set(['products', 'reviews', 'store']);

// POST /api/v1/uploads?type=products  (Bearer, multipart, field "file") -> { path }
// Generic single-image upload. The client uploads images first, then sends the
// returned path(s) in the create-product / review / store-banner request.
export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();

  const url = new URL(req.url);
  const type = url.searchParams.get('type') ?? 'products';
  const subdir = ALLOWED_SUBDIRS.has(type) ? type : 'products';

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return apiError('Буруу хүсэлт', 400);
  }
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return apiError('Зураг алга байна', 400);
  }
  const err = validateImageFile(file);
  if (err) return apiError(err, 400);

  const path = await saveImageFile(file, subdir);
  return Response.json({ path });
}
