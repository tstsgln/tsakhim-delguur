import 'server-only';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dbDir = path.join(process.cwd(), 'data');

// Allow tests (or alternate environments) to point at an isolated database.
// In production SQLITE_DB_PATH is unset, so the default file path is used.
const dbPath = process.env.SQLITE_DB_PATH ?? path.join(dbDir, 'app.db');

if (dbPath !== ':memory:' && !fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

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

const SCHEMA_VERSION = 17;
const currentVersion = (db.pragma('user_version', { simple: true }) as number) ?? 0;
if (currentVersion < SCHEMA_VERSION) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email_verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_evt_user ON email_verification_tokens(user_id);

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

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      subtotal INTEGER NOT NULL,
      commission_rate INTEGER NOT NULL,
      commission_amount INTEGER NOT NULL,
      seller_amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'mock',
      payment_ref TEXT,
      buyer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      buyer_note TEXT,
      paid_at TEXT,
      shipped_at TEXT,
      completed_at TEXT,
      cancelled_at TEXT,
      refunded_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at DESC);

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      product_image_path TEXT,
      unit_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      line_total INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

    CREATE TABLE IF NOT EXISTS balances (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      account TEXT NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, account)
    );

    CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      account TEXT NOT NULL,
      delta INTEGER NOT NULL,
      kind TEXT NOT NULL,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      payout_id INTEGER,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ledger_order ON ledger(order_id);

    CREATE TABLE IF NOT EXISTS payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested',
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      account_holder TEXT NOT NULL,
      admin_note TEXT,
      requested_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_payouts_user ON payouts(user_id, requested_at DESC);
    CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status, requested_at DESC);

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      order_item_id INTEGER NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      link TEXT,
      read_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at);

    CREATE TABLE IF NOT EXISTS failed_emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      context TEXT,
      error TEXT,
      resolved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_failed_emails_unresolved ON failed_emails(resolved_at, created_at DESC);
  `);

  const sellerCols = db.prepare("PRAGMA table_info(sellers)").all() as Array<{ name: string }>;
  if (sellerCols.some(c => c.name === 'category')) {
    db.exec('ALTER TABLE sellers DROP COLUMN category');
  }

  const sellerIndexes = db.prepare("PRAGMA index_list(sellers)").all() as Array<{ name: string; unique: number; origin: string }>;
  const hasUniqueUserId = sellerIndexes.some(idx => {
    if (idx.unique !== 1) return false;
    const info = db.prepare(`PRAGMA index_info('${idx.name}')`).all() as Array<{ name: string }>;
    return info.length === 1 && info[0].name === 'user_id';
  });
  if (hasUniqueUserId) {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      BEGIN;
      CREATE TABLE sellers_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO sellers_new (id, user_id, store_name, phone, location, description, created_at)
        SELECT id, user_id, store_name, phone, location, description, created_at FROM sellers;
      DROP TABLE sellers;
      ALTER TABLE sellers_new RENAME TO sellers;
      CREATE INDEX IF NOT EXISTS idx_sellers_user ON sellers(user_id);
      COMMIT;
    `);
    db.pragma('foreign_keys = ON');
  } else {
    db.exec('CREATE INDEX IF NOT EXISTS idx_sellers_user ON sellers(user_id)');
  }

  const userCols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  if (userCols.length > 0 && !userCols.some(c => c.name === 'email_verified_at')) {
    db.exec("ALTER TABLE users ADD COLUMN email_verified_at TEXT");
    db.exec("UPDATE users SET email_verified_at = COALESCE(created_at, datetime('now')) WHERE email_verified_at IS NULL");
  }

  const messageCols = db.prepare("PRAGMA table_info(messages)").all() as Array<{ name: string }>;
  if (messageCols.length > 0 && !messageCols.some(c => c.name === 'read_at')) {
    db.exec('ALTER TABLE messages ADD COLUMN read_at TEXT');
  }
  if (messageCols.length > 0 && !messageCols.some(c => c.name === 'image_path')) {
    db.exec('ALTER TABLE messages ADD COLUMN image_path TEXT');
  }
  if (messageCols.length > 0 && !messageCols.some(c => c.name === 'product_id')) {
    db.exec('ALTER TABLE messages ADD COLUMN product_id INTEGER REFERENCES products(id) ON DELETE SET NULL');
  }

  const productCols = db.prepare("PRAGMA table_info(products)").all() as Array<{ name: string }>;
  if (productCols.length > 0 && !productCols.some(c => c.name === 'stock_quantity')) {
    db.exec('ALTER TABLE products ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0');
    db.exec('UPDATE products SET stock_quantity = 10 WHERE stock_quantity = 0');
  }
  if (productCols.length > 0 && !productCols.some(c => c.name === 'accept_custom_orders')) {
    db.exec('ALTER TABLE products ADD COLUMN accept_custom_orders INTEGER NOT NULL DEFAULT 0');
  }

  db.pragma(`user_version = ${SCHEMA_VERSION}`);
}
