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
  isFreeShipping?: boolean;
  createdAt: string;
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
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}
