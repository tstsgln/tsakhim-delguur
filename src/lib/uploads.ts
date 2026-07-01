import 'server-only';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';

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
// Хадгалахын өмнө зургийн дээд тал (px). Утасны том зургийг вэбэд тохируулж жижигрүүлнэ.
export const MAX_IMAGE_DIMENSION = 1600;

// Returns an error message if the file is not an acceptable image, or null if it is OK.
export function validateImageFile(f: File): string | null {
  const ext = path.extname(f.name).toLowerCase();
  const typeOk = !!f.type && ALLOWED_IMAGE_TYPES.has(f.type);
  const extOk = ALLOWED_IMAGE_EXTS.has(ext);
  if (!typeOk && !extOk) return `Зургийн төрөл буруу: ${f.name}`;
  if (f.size > MAX_IMAGE_BYTES) return `Зураг ${f.name} 5MB-аас их байна`;
  return null;
}

// sharp-аар: EXIF эргэлтийг засаж, MAX_IMAGE_DIMENSION дотор багтаан жижигрүүлж (томруулахгүй),
// ижил форматаар шахна. GIF-ийг хөндөхгүй (анимацийг хадгалахын тулд). Алдаа гарвал эх файлыг буцаана.
async function processImage(input: Buffer, ext: string): Promise<Buffer> {
  if (ext === '.gif') return input;
  try {
    const pipeline = sharp(input, { failOn: 'none' })
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      });
    if (ext === '.png') return await pipeline.png({ compressionLevel: 9 }).toBuffer();
    if (ext === '.webp') return await pipeline.webp({ quality: 80 }).toBuffer();
    return await pipeline.jpeg({ quality: 82 }).toBuffer();
  } catch {
    return input;
  }
}

// Writes the file under public/uploads/<subdir> (resized+compressed) and returns its public path.
export async function saveImageFile(f: File, subdir: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subdir);
  await fs.mkdir(uploadsDir, { recursive: true });

  let ext = path.extname(f.name).toLowerCase();
  if (!ALLOWED_IMAGE_EXTS.has(ext)) {
    ext = Object.entries(EXT_TO_MIME).find(([, m]) => m === f.type)?.[0] ?? '.jpg';
  }

  const input = Buffer.from(await f.arrayBuffer());
  const output = await processImage(input, ext);

  const filename = `${crypto.randomUUID()}${ext}`;
  await fs.writeFile(path.join(uploadsDir, filename), output);
  return `/uploads/${subdir}/${filename}`;
}
