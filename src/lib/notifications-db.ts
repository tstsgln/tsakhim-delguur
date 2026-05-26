import 'server-only';
import { db } from './db';

export type NotificationType =
  | 'order_placed_seller'
  | 'order_paid_buyer'
  | 'order_paid_seller'
  | 'order_shipped_buyer'
  | 'order_received_seller'
  | 'order_cancelled_seller';

export interface NotificationRow {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

interface CreateArgs {
  userId: number;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

export function createNotification(args: CreateArgs): number {
  const result = db
    .prepare(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(args.userId, args.type, args.title, args.body ?? null, args.link ?? null);
  return Number(result.lastInsertRowid);
}

export function listNotificationsForUser(userId: number, limit = 50): NotificationRow[] {
  return db
    .prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?',
    )
    .all(userId, limit) as NotificationRow[];
}

export function getUnreadNotificationCount(userId: number): number {
  const row = db
    .prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL')
    .get(userId) as { n: number };
  return row.n;
}

export function markAllNotificationsRead(userId: number): void {
  db.prepare(
    "UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL",
  ).run(userId);
}

export function markNotificationRead(notificationId: number, userId: number): void {
  db.prepare(
    "UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ? AND read_at IS NULL",
  ).run(notificationId, userId);
}
