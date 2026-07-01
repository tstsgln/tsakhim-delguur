import type { NextRequest } from 'next/server';
import { verifyWebhookSignature, parseWireEvent } from '@/lib/wire';
import { confirmWirePayment } from '@/lib/wire-orders';

// POST /api/wire/webhook — Wire event хүлээн авна (production, найдвартай баталгаа).
// WIRE_WEBHOOK_SECRET (whsec_...) шаардлагатай. Гарын үсэг буруу бол 400.
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get('WirePayment-Signature');

  if (!verifyWebhookSignature(raw, signature)) {
    return new Response('invalid signature', { status: 400 });
  }

  let event;
  try {
    event = parseWireEvent(raw);
  } catch {
    return new Response('bad body', { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const object = event.data?.object as { id?: string } | undefined;
    if (object?.id) {
      try {
        await confirmWirePayment(object.id);
      } catch (err) {
        console.error('Webhook confirm алдаа:', err);
        // 500 буцаавал Wire дахин илгээнэ — гэхдээ confirm нь idempotent тул 200 өгье.
      }
    }
  }

  return new Response('ok', { status: 200 });
}
