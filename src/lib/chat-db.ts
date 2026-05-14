import 'server-only';
import { db } from './db';

export interface ConversationListItem {
  id: number;
  store_id: number;
  store_name: string;
  partner_name: string;
  last_message: string | null;
  last_at: string | null;
  unread_count: number;
  role: 'buyer' | 'seller';
}

export interface MessageRow {
  id: number;
  sender_user_id: number;
  body: string;
  created_at: string;
}

export interface ConversationInfo {
  id: number;
  buyer_user_id: number;
  seller_id: number;
  seller_user_id: number;
  store_name: string;
  buyer_name: string;
}

export function findOrCreateConversation(buyerUserId: number, sellerId: number): number {
  const existing = db
    .prepare('SELECT id FROM conversations WHERE buyer_user_id = ? AND seller_id = ?')
    .get(buyerUserId, sellerId) as { id: number } | undefined;
  if (existing) return existing.id;

  const result = db
    .prepare('INSERT INTO conversations (buyer_user_id, seller_id) VALUES (?, ?)')
    .run(buyerUserId, sellerId);
  return Number(result.lastInsertRowid);
}

export function getConversationForUser(
  conversationId: number,
  userId: number,
): ConversationInfo | null {
  const row = db
    .prepare(
      `SELECT
         c.id,
         c.buyer_user_id,
         c.seller_id,
         s.user_id AS seller_user_id,
         s.store_name,
         u.name AS buyer_name
       FROM conversations c
       JOIN sellers s ON s.id = c.seller_id
       JOIN users u ON u.id = c.buyer_user_id
       WHERE c.id = ?
         AND (c.buyer_user_id = ? OR s.user_id = ?)`,
    )
    .get(conversationId, userId, userId) as ConversationInfo | undefined;
  return row ?? null;
}

export function listMessages(conversationId: number): MessageRow[] {
  return db
    .prepare(
      'SELECT id, sender_user_id, body, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC',
    )
    .all(conversationId) as MessageRow[];
}

export function insertMessage(conversationId: number, senderUserId: number, body: string): void {
  const tx = db.transaction(() => {
    db.prepare(
      'INSERT INTO messages (conversation_id, sender_user_id, body) VALUES (?, ?, ?)',
    ).run(conversationId, senderUserId, body);
    db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(
      conversationId,
    );
  });
  tx();
}

export function listConversationsForUser(userId: number): ConversationListItem[] {
  return db
    .prepare(
      `SELECT
         c.id,
         c.seller_id AS store_id,
         s.store_name,
         CASE WHEN c.buyer_user_id = ? THEN s.store_name ELSE bu.name END AS partner_name,
         (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_message,
         (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_at,
         (SELECT COUNT(*) FROM messages
            WHERE conversation_id = c.id
              AND sender_user_id != ?
              AND read_at IS NULL) AS unread_count,
         CASE WHEN c.buyer_user_id = ? THEN 'buyer' ELSE 'seller' END AS role
       FROM conversations c
       JOIN sellers s ON s.id = c.seller_id
       JOIN users bu ON bu.id = c.buyer_user_id
       WHERE c.buyer_user_id = ? OR s.user_id = ?
       ORDER BY COALESCE(last_at, c.created_at) DESC`,
    )
    .all(userId, userId, userId, userId, userId) as ConversationListItem[];
}

export function markConversationRead(conversationId: number, userId: number): void {
  db.prepare(
    `UPDATE messages
     SET read_at = datetime('now')
     WHERE conversation_id = ?
       AND sender_user_id != ?
       AND read_at IS NULL`,
  ).run(conversationId, userId);
}

export function getUnreadCount(userId: number): number {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       JOIN sellers s ON s.id = c.seller_id
       WHERE m.sender_user_id != ?
         AND m.read_at IS NULL
         AND (c.buyer_user_id = ? OR s.user_id = ?)`,
    )
    .get(userId, userId, userId) as { n: number };
  return row.n;
}
