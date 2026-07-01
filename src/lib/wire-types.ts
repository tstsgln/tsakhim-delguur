// Wire (wire.mn) API объектын type-ууд. Дүн бүр MNT minor unit (1₮ = 100), цаг unix (UTC).

export type PaymentIntentStatus =
  | 'new'
  | 'requires_payment_method'
  | 'requires_action'
  | 'requires_capture'
  | 'processing'
  | 'succeeded'
  | 'canceled';

export interface PaymentIntent {
  id: string;
  object: 'payment_intent';
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  client_secret: string;
  automatic_operator: boolean;
  allowed_operators: string[];
  selected_operator: string | null;
  next_action: Record<string, unknown> | null;
  metadata: Record<string, string> | null;
  livemode: boolean;
  created: number;
  expires_at: number | null;
}

export type ChargeStatus = 'pending' | 'succeeded' | 'failed';

export interface Charge {
  id: string;
  object: 'charge';
  payment_intent: string;
  operator: string;
  operator_charge_id: string | null;
  status: ChargeStatus;
  amount: number;
  fee: number;
  amount_refunded: number;
  failure_code: string | null;
  failure_message: string | null;
  livemode: boolean;
  created: number;
}

export interface CheckoutSession {
  id: string;
  object: 'checkout_session';
  url: string; // hosted төлбөрийн хуудас: https://pay.wire.mn/c/...
  payment_intent: string;
  status?: string;
  success_url?: string;
  cancel_url?: string;
  created?: number;
}

export interface WireList<T> {
  object: 'list';
  url: string;
  has_more: boolean;
  data: T[];
}

export interface WireEvent {
  id: string;
  object: 'event';
  type: string;
  api_version: string;
  data: { object?: PaymentIntent | Charge } & Record<string, unknown>;
  livemode: boolean;
  created: number;
}

export interface WireErrorBody {
  error: {
    type: string;
    code: string;
    message: string;
    param?: string;
    request_id?: string;
  };
}
