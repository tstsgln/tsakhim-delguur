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
  seller_id: number;
  store_name: string;
  seller_location: string;
  seller_joined: string;
  images: string;
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
    ) AS images
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
    rating: 0,
    reviewCount: 0,
    tags: [],
    isNew,
    createdAt: row.created_at,
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

export function getCategoryCounts(): Record<string, number> {
  const rows = db
    .prepare('SELECT category, COUNT(*) AS count FROM products GROUP BY category')
    .all() as { category: string; count: number }[];
  const out: Record<string, number> = {};
  for (const r of rows) out[r.category] = r.count;
  return out;
}
