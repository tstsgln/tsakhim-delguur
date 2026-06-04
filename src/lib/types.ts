export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  seller: Seller;
  rating: number;
  reviewCount: number;
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt: string;
  stockQuantity: number;
  acceptCustomOrders: boolean;
  /** Optional buyer-entered text prompt (e.g. "Сийлүүлэх нэр"); null/empty = no personalization. */
  personalizationPrompt?: string | null;
  /** Variation option groups (e.g. Өнгө → [Улаан, Хөх]). Only populated on the product detail page. */
  options?: ProductOption[];
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  salesCount: number;
  location: string;
  joinedDate: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  subcategories?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  /** Human-readable variant selection, e.g. "Өнгө: Улаан / Хэмжээ: M". */
  variant?: string;
  /** Buyer-entered personalization text. */
  personalization?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface SellerRow {
  id: number;
  user_id: number;
  store_name: string;
  phone: string;
  location: string;
  pickup_address: string | null;
  description: string | null;
  story: string | null;
  banner_path: string | null;
  created_at: string;
}

export interface ProductRow {
  id: number;
  seller_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  accept_custom_orders: number;
  created_at: string;
}

export interface ProductImageRow {
  id: number;
  product_id: number;
  path: string;
  position: number;
}

export interface ProductWithImages extends ProductRow {
  images: string[];
}
