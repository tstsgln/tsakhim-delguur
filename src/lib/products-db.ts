import 'server-only';
import { db } from './db';
import type { Product } from './types';

interface JoinedRow {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
  stock_quantity: number;
  accept_custom_orders: number;
  seller_id: number;
  store_name: string;
  seller_location: string;
  seller_joined: string;
  seller_phone?: string;
  seller_description?: string | null;
  images: string;
  avg_rating: number;
  review_count: number;
}

export interface ProductDetail {
  product: Product;
  seller: {
    id: number;
    storeName: string;
    location: string;
    phone: string;
    description: string | null;
    joinedDate: string;
  };
}

const NEW_WINDOW_DAYS = 30;

const BASE_QUERY = `
  SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    p.category,
    p.created_at,
    p.stock_quantity,
    p.accept_custom_orders,
    s.id AS seller_id,
    s.store_name,
    s.location AS seller_location,
    s.created_at AS seller_joined,
    COALESCE(
      (SELECT json_group_array(path)
       FROM (
         SELECT path FROM product_images
         WHERE product_id = p.id
         ORDER BY position ASC
       )
      ),
      '[]'
    ) AS images,
    COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) AS avg_rating,
    (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) AS review_count
  FROM products p
  JOIN sellers s ON s.id = p.seller_id
`;

function toProduct(row: JoinedRow): Product {
  const images = JSON.parse(row.images) as string[];
  const createdMs = new Date(row.created_at + 'Z').getTime();
  const isNew = Date.now() - createdMs < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    price: row.price,
    images,
    category: row.category,
    seller: {
      id: String(row.seller_id),
      name: row.store_name,
      avatar: '🏪',
      rating: 5,
      salesCount: 0,
      location: row.seller_location,
      joinedDate: row.seller_joined,
    },
    rating: row.avg_rating,
    reviewCount: row.review_count,
    tags: [],
    isNew,
    createdAt: row.created_at,
    stockQuantity: row.stock_quantity,
    acceptCustomOrders: row.accept_custom_orders === 1,
  };
}

export function getAllProducts(): Product[] {
  const rows = db.prepare(`${BASE_QUERY} ORDER BY p.created_at DESC`).all() as JoinedRow[];
  return rows.map(toProduct);
}

export function getProductById(id: number): Product | null {
  const row = db.prepare(`${BASE_QUERY} WHERE p.id = ?`).get(id) as JoinedRow | undefined;
  return row ? toProduct(row) : null;
}

const DETAIL_QUERY = `
  SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    p.category,
    p.created_at,
    p.stock_quantity,
    p.accept_custom_orders,
    s.id AS seller_id,
    s.store_name,
    s.location AS seller_location,
    s.created_at AS seller_joined,
    s.phone AS seller_phone,
    s.description AS seller_description,
    COALESCE(
      (SELECT json_group_array(path)
       FROM (
         SELECT path FROM product_images
         WHERE product_id = p.id
         ORDER BY position ASC
       )
      ),
      '[]'
    ) AS images,
    COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) AS avg_rating,
    (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) AS review_count
  FROM products p
  JOIN sellers s ON s.id = p.seller_id
  WHERE p.id = ?
`;

export function getProductDetail(id: number): ProductDetail | null {
  const row = db.prepare(DETAIL_QUERY).get(id) as JoinedRow | undefined;
  if (!row) return null;
  return {
    product: toProduct(row),
    seller: {
      id: row.seller_id,
      storeName: row.store_name,
      location: row.seller_location,
      phone: row.seller_phone ?? '',
      description: row.seller_description ?? null,
      joinedDate: row.seller_joined,
    },
  };
}

export interface SellerStore {
  id: number;
  storeName: string;
  location: string;
  phone: string;
  description: string | null;
  joinedDate: string;
}

interface SellerRow {
  id: number;
  store_name: string;
  location: string;
  phone: string;
  description: string | null;
  created_at: string;
}

export function getSellerStore(id: number): SellerStore | null {
  const row = db
    .prepare('SELECT id, store_name, location, phone, description, created_at FROM sellers WHERE id = ?')
    .get(id) as SellerRow | undefined;
  if (!row) return null;
  return {
    id: row.id,
    storeName: row.store_name,
    location: row.location,
    phone: row.phone,
    description: row.description,
    joinedDate: row.created_at,
  };
}

export function getProductsBySeller(sellerId: number): Product[] {
  const rows = db
    .prepare(`${BASE_QUERY} WHERE s.id = ? ORDER BY p.created_at DESC`)
    .all(sellerId) as JoinedRow[];
  return rows.map(toProduct);
}

export interface StoreSearchResult {
  id: number;
  storeName: string;
  location: string;
  productCount: number;
}

export function searchStores(query: string, limit = 12): StoreSearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q}%`;
  return db
    .prepare(
      `SELECT s.id, s.store_name AS storeName, s.location,
              (SELECT COUNT(*) FROM products p WHERE p.seller_id = s.id) AS productCount
       FROM sellers s
       WHERE LOWER(s.store_name) LIKE LOWER(?)
       ORDER BY productCount DESC, s.created_at DESC
       LIMIT ?`,
    )
    .all(like, limit) as StoreSearchResult[];
}

export interface SitemapEntry {
  id: number;
  updatedAt: string;
}

export function getSitemapProducts(): SitemapEntry[] {
  return db
    .prepare('SELECT id, created_at AS updatedAt FROM products ORDER BY id ASC')
    .all() as SitemapEntry[];
}

export function getSitemapStores(): SitemapEntry[] {
  return db
    .prepare('SELECT id, created_at AS updatedAt FROM sellers ORDER BY id ASC')
    .all() as SitemapEntry[];
}

export function getCategoryCounts(): Record<string, number> {
  const rows = db
    .prepare('SELECT category, COUNT(*) AS count FROM products GROUP BY category')
    .all() as { category: string; count: number }[];
  const out: Record<string, number> = {};
  for (const r of rows) out[r.category] = r.count;
  return out;
}
