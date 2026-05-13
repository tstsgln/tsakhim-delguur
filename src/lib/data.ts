import { Product, Category } from './types';

export const categories: Category[] = [
  { id: 'clothing', name: 'Хувцас', icon: '👘', productCount: 0, subcategories: ['Дээл', 'Малгай', 'Өдөр тутмын'] },
  { id: 'shoes', name: 'Гутал', icon: '👞', productCount: 0, subcategories: [] },
  { id: 'bags', name: 'Цүнх', icon: '👜', productCount: 0, subcategories: [] },
  { id: 'jewelry', name: 'Үнэт эдлэл', icon: '💍', productCount: 0, subcategories: ['Бөгж', 'Зүүлт', 'Гинж', 'Бугуйвч'] },
  { id: 'accessories', name: 'Акксесуар', icon: '👓', productCount: 0, subcategories: [] },
  { id: 'beauty', name: 'Гоо сайхан', icon: '💄', productCount: 0, subcategories: [] },
  { id: 'crafts', name: 'Гар урлал', icon: '🧶', productCount: 0, subcategories: ['Эсгий', 'Нэхмэл', 'Модон эдлэл', 'Арьс ширэн'] },
  { id: 'painting', name: 'Уран зураг', icon: '🖼️', productCount: 0, subcategories: [] },
  { id: 'sculpture', name: 'Уран баримал', icon: '🗿', productCount: 0, subcategories: [] },
  { id: 'home', name: 'Гэр ахуй', icon: '🏠', productCount: 0, subcategories: ['Гэрийн чимэглэл', 'Хивс', 'Аяга таваг', 'Гэрэлтүүлэг'] },
  { id: 'furniture', name: 'Тавилга', icon: '🛋️', productCount: 0, subcategories: [] },
  { id: 'party', name: 'Үдэшлэгийн чимэглэл', icon: '🎉', productCount: 0, subcategories: [] },
  { id: 'instruments', name: 'Хөгжмийн зэмсэг', icon: '🎻', productCount: 0, subcategories: ['Морин хуур', 'Ятга', 'Лимбэ', 'Бусад'] },
  { id: 'toys', name: 'Тоглоом', icon: '🧸', productCount: 0, subcategories: [] },
  { id: 'pets', name: 'Тэжээвэр амьтны хэрэгсэл', icon: '🐾', productCount: 0, subcategories: [] },
  { id: 'food', name: 'Хүнсний бүтээгдэхүүн', icon: '🥩', productCount: 0, subcategories: [] },
  { id: 'gifts', name: 'Бэлэг', icon: '🎁', productCount: 0, subcategories: [] },
];

export const products: Product[] = [];

export function formatPrice(price: number): string {
  return price.toLocaleString('mn-MN') + '₮';
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter(p => p.category === categoryId);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.isFeatured);
}

export function getNewProducts(): Product[] {
  return products.filter(p => p.isNew);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some(t => t.toLowerCase().includes(lower))
  );
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}
