import 'server-only';

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Цэцэглэн <no-reply@tsetseglen.mn>';

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('───────── DEV EMAIL ─────────');
    console.log('To:     ', to);
    console.log('Subject:', subject);
    console.log('---');
    console.log(text);
    console.log('─────────────────────────────');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html, text }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend failed (${res.status}): ${detail}`);
  }
}

export function getAppBaseUrl(): string {
  return process.env.APP_BASE_URL ?? 'http://localhost:3000';
}

export function buildVerificationEmail(name: string, verifyUrl: string) {
  const text = `Сайн байна уу, ${name}!

Tsetseglen.mn-д бүртгүүлсэнд баярлалаа. Имэйл хаягаа баталгаажуулахын тулд доорх холбоос дээр дарна уу:

${verifyUrl}

Энэ холбоос 24 цагийн дотор хүчинтэй. Хэрэв та бүртгүүлээгүй бол энэ имэйлийг үл хайхрана уу.

— Цэцэглэн баг`;

  const html = `<!doctype html>
<html lang="mn">
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
    <h2 style="color: #1a1a1a;">Сайн байна уу, ${escapeHtml(name)}!</h2>
    <p>Цэцэглэн-д бүртгүүлсэнд баярлалаа. Имэйл хаягаа баталгаажуулахын тулд доорх товчин дээр дарна уу:</p>
    <p style="margin: 24px 0;">
      <a href="${escapeAttr(verifyUrl)}" style="background: #c2410c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Имэйл баталгаажуулах</a>
    </p>
    <p style="font-size: 13px; color: #666;">Эсвэл энэ холбоосыг хуулж браузер дээрээ нээнэ үү:<br><code style="word-break: break-all;">${escapeHtml(verifyUrl)}</code></p>
    <p style="font-size: 13px; color: #666;">Энэ холбоос 24 цагийн дотор хүчинтэй. Хэрэв та бүртгүүлээгүй бол энэ имэйлийг үл хайхрана уу.</p>
    <p style="font-size: 13px; color: #666;">— Цэцэглэн баг</p>
  </body>
</html>`;

  return { subject: 'Имэйл хаягаа баталгаажуулна уу — Цэцэглэн', text, html };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}
