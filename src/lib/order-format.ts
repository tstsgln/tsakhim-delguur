import type { OrderStatus } from './orders-db';

export function orderStatusLabel(s: OrderStatus): string {
  switch (s) {
    case 'pending_payment':
      return 'Төлбөр хүлээж байна';
    case 'paid':
      return 'Төлбөр төлөгдсөн';
    case 'shipped':
      return 'Илгээгдсэн';
    case 'completed':
      return 'Дууссан';
    case 'cancelled':
      return 'Цуцлагдсан';
    case 'refunded':
      return 'Буцаагдсан';
  }
}

export function orderStatusColor(s: OrderStatus): string {
  switch (s) {
    case 'pending_payment':
      return 'bg-warning/20 text-warning';
    case 'paid':
      return 'bg-accent/20 text-accent';
    case 'shipped':
      return 'bg-primary/20 text-primary';
    case 'completed':
      return 'bg-success/20 text-success';
    case 'cancelled':
    case 'refunded':
      return 'bg-muted/20 text-muted';
  }
}

export function formatOrderDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso + 'Z').toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
