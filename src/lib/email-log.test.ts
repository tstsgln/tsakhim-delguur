import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import {
  recordFailedEmail,
  listFailedEmails,
  countUnresolvedFailedEmails,
  markFailedEmailResolved,
} from './email-log';

beforeEach(() => {
  db.exec('DELETE FROM failed_emails');
});

describe('email-log', () => {
  it('records a failure and lists it as unresolved', () => {
    recordFailedEmail({ to: 'a@x.mn', subject: 'Hi', context: 'signup', error: 'boom' });
    const rows = listFailedEmails();
    expect(rows).toHaveLength(1);
    expect(rows[0].to_email).toBe('a@x.mn');
    expect(rows[0].context).toBe('signup');
    expect(rows[0].resolved_at).toBeNull();
    expect(countUnresolvedFailedEmails()).toBe(1);
  });

  it('hides resolved failures from the list and count', () => {
    recordFailedEmail({ to: 'a@x.mn', subject: 'Hi', context: null, error: 'boom' });
    const [row] = listFailedEmails();
    markFailedEmailResolved(row.id);
    expect(listFailedEmails()).toHaveLength(0);
    expect(countUnresolvedFailedEmails()).toBe(0);
  });

  it('truncates very long error strings to keep rows bounded', () => {
    recordFailedEmail({ to: 'a@x.mn', subject: 'Hi', context: null, error: 'x'.repeat(5000) });
    const [row] = listFailedEmails();
    expect(row.error!.length).toBe(2000);
  });

  it('orders most-recent first', () => {
    recordFailedEmail({ to: 'first@x.mn', subject: 'A', context: null, error: 'e' });
    recordFailedEmail({ to: 'second@x.mn', subject: 'B', context: null, error: 'e' });
    const rows = listFailedEmails();
    expect(rows[0].to_email).toBe('second@x.mn');
  });
});
