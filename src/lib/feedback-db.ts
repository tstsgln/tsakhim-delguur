import 'server-only';
import { db } from './db';

export type FeedbackKind = 'suggestion' | 'complaint';
export type FeedbackStatus = 'new' | 'read' | 'resolved';

export interface FeedbackListItem {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  is_seller: number;
  store_name: string | null;
  kind: FeedbackKind;
  subject: string | null;
  body: string;
  status: FeedbackStatus;
  created_at: string;
}

export function insertFeedback(
  userId: number,
  kind: FeedbackKind,
  subject: string | null,
  body: string,
): number {
  const result = db
    .prepare('INSERT INTO feedback (user_id, kind, subject, body) VALUES (?, ?, ?, ?)')
    .run(userId, kind, subject, body);
  return Number(result.lastInsertRowid);
}

export function listFeedback(filter?: FeedbackStatus | 'all'): FeedbackListItem[] {
  const where = !filter || filter === 'all' ? '' : 'WHERE f.status = ?';
  const params = !filter || filter === 'all' ? [] : [filter];
  return db
    .prepare(
      `SELECT
         f.id, f.user_id, f.kind, f.subject, f.body, f.status, f.created_at,
         u.name AS user_name, u.email AS user_email,
         CASE WHEN s.id IS NULL THEN 0 ELSE 1 END AS is_seller,
         s.store_name AS store_name
       FROM feedback f
       JOIN users u ON u.id = f.user_id
       LEFT JOIN sellers s ON s.user_id = u.id
       ${where}
       ORDER BY f.created_at DESC`,
    )
    .all(...params) as FeedbackListItem[];
}

export function countFeedbackByStatus(): Record<FeedbackStatus, number> {
  const rows = db
    .prepare('SELECT status, COUNT(*) AS n FROM feedback GROUP BY status')
    .all() as { status: FeedbackStatus; n: number }[];
  const out: Record<FeedbackStatus, number> = { new: 0, read: 0, resolved: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}

export function setFeedbackStatus(id: number, status: FeedbackStatus): void {
  db.prepare('UPDATE feedback SET status = ? WHERE id = ?').run(status, id);
}
