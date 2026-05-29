import 'server-only';
import { db } from './db';

export interface FailedEmailRow {
  id: number;
  to_email: string;
  subject: string;
  context: string | null;
  error: string | null;
  resolved_at: string | null;
  created_at: string;
}

// Persist a delivery failure so the admin can see it (and follow up manually).
// Never throws — logging a failure must not break the calling path further.
export function recordFailedEmail(args: {
  to: string;
  subject: string;
  context: string | null;
  error: string;
}): void {
  try {
    db.prepare(
      'INSERT INTO failed_emails (to_email, subject, context, error) VALUES (?, ?, ?, ?)',
    ).run(args.to, args.subject, args.context, args.error.slice(0, 2000));
  } catch (e) {
    console.error('[failed-email-log] could not record failure:', e);
  }
}

export function listFailedEmails(limit = 50): FailedEmailRow[] {
  return db
    .prepare('SELECT * FROM failed_emails WHERE resolved_at IS NULL ORDER BY id DESC LIMIT ?')
    .all(limit) as FailedEmailRow[];
}

export function countUnresolvedFailedEmails(): number {
  return (
    db.prepare('SELECT COUNT(*) AS c FROM failed_emails WHERE resolved_at IS NULL').get() as { c: number }
  ).c;
}

export function markFailedEmailResolved(id: number): void {
  db.prepare("UPDATE failed_emails SET resolved_at = datetime('now') WHERE id = ?").run(id);
}
