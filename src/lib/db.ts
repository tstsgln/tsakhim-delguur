import 'server-only';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'app.db');

declare global {
  // eslint-disable-next-line no-var
  var __sqliteDb: Database.Database | undefined;
}

export const db = global.__sqliteDb ?? new Database(dbPath);
if (!global.__sqliteDb) {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  global.__sqliteDb = db;
}

const SCHEMA_VERSION = 6;
const currentVersion = (db.pragma('user_version', { simple: true }) as number) ?? 0;
if (currentVersion < SCHEMA_VERSION) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      store_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      path TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(buyer_user_id, seller_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      image_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      read_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_conv_buyer ON conversations(buyer_user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_conv_seller ON conversations(seller_id, updated_at DESC);

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL DEFAULT 'suggestion',
      subject TEXT,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_feedback_status_created ON feedback(status, created_at DESC);
  `);

  const sellerCols = db.prepare("PRAGMA table_info(sellers)").all() as Array<{ name: string }>;
  if (sellerCols.some(c => c.name === 'category')) {
    db.exec('ALTER TABLE sellers DROP COLUMN category');
  }

  const messageCols = db.prepare("PRAGMA table_info(messages)").all() as Array<{ name: string }>;
  if (messageCols.length > 0 && !messageCols.some(c => c.name === 'read_at')) {
    db.exec('ALTER TABLE messages ADD COLUMN read_at TEXT');
  }
  if (messageCols.length > 0 && !messageCols.some(c => c.name === 'image_path')) {
    db.exec('ALTER TABLE messages ADD COLUMN image_path TEXT');
  }

  db.pragma(`user_version = ${SCHEMA_VERSION}`);
}
