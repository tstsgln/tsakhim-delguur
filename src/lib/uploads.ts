import 'server-only';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
export const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Returns an error message if the file is not an acceptable image, or null if it is OK.
export function validateImageFile(f: File): string | null {
  const ext = path.extname(f.name).toLowerCase();
  const typeOk = !!f.type && ALLOWED_IMAGE_TYPES.has(f.type);
  const extOk = ALLOWED_IMAGE_EXTS.has(ext);
  if (!typeOk && !extOk) return `Зургийн төрөл буруу: ${f.name}`;
  if (f.size > MAX_IMAGE_BYTES) return `Зураг ${f.name} 5MB-аас их байна`;
  return null;
}

// Writes the file under public/uploads/<subdir> and returns its public path (/uploads/<subdir>/<uuid>.<ext>).
export async function saveImageFile(f: File, subdir: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subdir);
  await fs.mkdir(uploadsDir, { recursive: true });
  let ext = path.extname(f.name).toLowerCase();
  if (!ALLOWED_IMAGE_EXTS.has(ext)) {
    ext = Object.entries(EXT_TO_MIME).find(([, m]) => m === f.type)?.[0] ?? '.jpg';
  }
  const filename = `${crypto.randomUUID()}${ext}`;
  const fullPath = path.join(uploadsDir, filename);
  await fs.writeFile(fullPath, Buffer.from(await f.arrayBuffer()));
  return `/uploads/${subdir}/${filename}`;
}
