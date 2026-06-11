import 'server-only';
import { db } from './db';

/** Save (or re-own) an FCM device token for a user. */
export function upsertDeviceToken(userId: number, token: string, platform = 'android'): void {
  db.prepare(
    `INSERT INTO device_tokens (user_id, token, platform) VALUES (?, ?, ?)
     ON CONFLICT(token) DO UPDATE SET user_id = excluded.user_id, platform = excluded.platform`,
  ).run(userId, token, platform);
}

export function getTokensForUser(userId: number): string[] {
  return (db.prepare('SELECT token FROM device_tokens WHERE user_id = ?').all(userId) as Array<{ token: string }>)
    .map((r) => r.token);
}

export function deleteDeviceToken(token: string): void {
  db.prepare('DELETE FROM device_tokens WHERE token = ?').run(token);
}
