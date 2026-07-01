import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import type {
  PaymentIntent,
  Charge,
  CheckoutSession,
  WireList,
  WireEvent,
  WireErrorBody,
} from './wire-types';

// Wire (wire.mn) серверийн client. WIRE_SECRET_KEY (sk_live_/sk_test_) клиент рүү гарахгүй.
const WIRE_BASE_URL = process.env.WIRE_BASE_URL ?? 'https://api.wire.mn';

// MNT нь Wire дээр 0-оронтой валют: amount-ийн 1 нэгж = 1₮ (subunit байхгүй).
// Бодит туршилтаар 150000 явуулбал 15,000,000 болсон тул ×100 БУРУУ байсан — хөрвүүлэлт 1:1.
// (docs-ийн "50000 = 500.00₮" тайлбар төөрөгдүүлсэн.)
export const WIRE_UNITS_PER_MNT = 1;
export function toMinorUnits(mnt: number): number {
  return Math.round(mnt * WIRE_UNITS_PER_MNT);
}

export class WireError extends Error {
  readonly status: number;
  readonly type: string;
  readonly code: string;
  readonly requestId?: string;

  constructor(status: number, body: WireErrorBody | null) {
    super(body?.error?.message ?? `Wire API error (HTTP ${status})`);
    this.name = 'WireError';
    this.status = status;
    this.type = body?.error?.type ?? 'api_error';
    this.code = body?.error?.code ?? 'unknown';
    this.requestId = body?.error?.request_id;
  }
}

function secretKey(): string {
  const key = process.env.WIRE_SECRET_KEY;
  if (!key) throw new Error('WIRE_SECRET_KEY тохируулаагүй байна (.env.local)');
  return key;
}

interface WireRequest {
  method?: 'GET' | 'POST';
  body?: unknown;
  idempotencyKey?: string;
}

async function wireFetch<T>(path: string, opts: WireRequest = {}): Promise<T> {
  const { method = 'GET', body, idempotencyKey } = opts;
  const headers: Record<string, string> = { Authorization: `Bearer ${secretKey()}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const res = await fetch(`${WIRE_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new WireError(res.status, json as WireErrorBody | null);
  return json as T;
}

/** POST мутаци бүрт шинэ idempotency key (давхар төлбөрөөс сэргийлнэ). */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function createPaymentIntent(params: {
  amount: number; // minor units
  metadata?: Record<string, string>;
  idempotencyKey: string;
}): Promise<PaymentIntent> {
  return wireFetch<PaymentIntent>('/v1/payment_intents', {
    method: 'POST',
    idempotencyKey: params.idempotencyKey,
    body: {
      amount: params.amount,
      currency: 'MNT',
      automatic_operator: true,
      allowed_operators: [],
      metadata: params.metadata ?? {},
    },
  });
}

export function createCheckoutSession(params: {
  paymentIntentId: string;
  successUrl: string;
  cancelUrl?: string;
  idempotencyKey: string;
}): Promise<CheckoutSession> {
  const body: Record<string, unknown> = {
    payment_intent: params.paymentIntentId,
    success_url: params.successUrl,
  };
  if (params.cancelUrl) body.cancel_url = params.cancelUrl;

  return wireFetch<CheckoutSession>('/v1/checkout/sessions', {
    method: 'POST',
    idempotencyKey: params.idempotencyKey,
    body,
  });
}

export function getPaymentIntent(id: string): Promise<PaymentIntent> {
  return wireFetch<PaymentIntent>(`/v1/payment_intents/${encodeURIComponent(id)}`);
}

/** Webhook-оос хамааралгүй баталгаа: succeeded charge байгаа эсэх. */
export function listChargesForIntent(paymentIntentId: string): Promise<WireList<Charge>> {
  return wireFetch<WireList<Charge>>(
    `/v1/charges?payment_intent=${encodeURIComponent(paymentIntentId)}`,
  );
}

/**
 * Webhook гарын үсэг шалгах. Header формат: `t=<unix>,v1=<hmac_sha256_hex>`.
 * Signed payload = `${t}.${rawBody}`, түлхүүр = WIRE_WEBHOOK_SECRET (whsec_...).
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WIRE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => {
      const [k, v] = kv.split('=');
      return [k?.trim(), v?.trim()];
    }),
  );
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1) return false;

  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(v1, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function parseWireEvent(rawBody: string): WireEvent {
  return JSON.parse(rawBody) as WireEvent;
}
