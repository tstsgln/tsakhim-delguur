import { Product, Category, Seller } from './types';

export const categories: Category[] = [
  { id: 'clothing', name: 'Хувцас', icon: '👘', productCount: 245, subcategories: ['Дээл', 'Малгай', 'Гутал', 'Өдөр тутмын'] },
  { id: 'jewelry', name: 'Үнэт эдлэл', icon: '💍', productCount: 189, subcategories: ['Бөгж', 'Зүүлт', 'Гинж', 'Бугуйвч'] },
  { id: 'art', name: 'Урлаг', icon: '🎨', productCount: 312, subcategories: ['Зураг', 'Уран баримал', 'Хөрөг', 'Бичээс'] },
  { id: 'crafts', name: 'Гар урлал', icon: '🧶', productCount: 178, subcategories: ['Эсгий', 'Нэхмэл', 'Модон эдлэл', 'Арьс ширэн'] },
  { id: 'home', name: 'Гэр ахуй', icon: '🏠', productCount: 156, subcategories: ['Гэрийн чимэглэл', 'Хивс', 'Аяга таваг', 'Гэрэлтүүлэг'] },
  { id: 'food', name: 'Хүнсний бүтээгдэхүүн', icon: '🥩', productCount: 98, subcategories: ['Бууз', 'Сүүн бүтээгдэхүүн', 'Боорцог', 'Чихэр'] },
  { id: 'instruments', name: 'Хөгжмийн зэмсэг', icon: '🎻', productCount: 67, subcategories: ['Морин хуур', 'Ятга', 'Лимбэ', 'Бусад'] },
  { id: 'books', name: 'Ном', icon: '📚', productCount: 234, subcategories: ['Уран зохиол', 'Түүх', 'Хүүхдийн ном', 'Сурах бичиг'] },
];

const sellers: Seller[] = [
  { id: 's1', name: 'Алтан гар урлал', avatar: '🧑‍🎨', rating: 4.9, salesCount: 1250, location: 'Улаанбаатар', joinedDate: '2020-03-15' },
  { id: 's2', name: 'Монгол дээлийн дэлгүүр', avatar: '👘', rating: 4.8, salesCount: 890, location: 'Дархан', joinedDate: '2019-07-20' },
  { id: 's3', name: 'Эсгий урлал', avatar: '🧶', rating: 4.7, salesCount: 567, location: 'Эрдэнэт', joinedDate: '2021-01-10' },
  { id: 's4', name: 'Монгол зураг', avatar: '🎨', rating: 4.9, salesCount: 2100, location: 'Улаанбаатар', joinedDate: '2018-11-05' },
  { id: 's5', name: 'Хөгжмийн ертөнц', avatar: '🎻', rating: 4.6, salesCount: 345, location: 'Улаанбаатар', joinedDate: '2022-05-01' },
  { id: 's6', name: 'Номын нөхөр', avatar: '📚', rating: 4.8, salesCount: 1560, location: 'Улаанбаатар', joinedDate: '2019-02-14' },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Уламжлалт Монгол дээл - Эрэгтэй',
    description: 'Гар оёдлоор хийсэн уламжлалт Монгол дээл. Өндөр чанарын торгон даавуугаар хийгдсэн. Цээжний хэсэгт Монгол угалзаар чимэглэсэн.',
    price: 450000,
    originalPrice: 550000,
    images: ['/products/deel-1.jpg'],
    category: 'clothing',
    subcategory: 'Дээл',
    seller: sellers[1],
    rating: 4.8,
    reviewCount: 124,
    tags: ['дээл', 'уламжлалт', 'эрэгтэй', 'торго'],
    isFeatured: true,
    isFreeShipping: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'p2',
    name: 'Мөнгөн бүсний бугуйвч',
    description: 'Мөнгөн бугуйвч, Монгол угалзаар сийлсэн. Гар урлалаар хийгдсэн, жинхэнэ мөнгө.',
    price: 185000,
    images: ['/products/bracelet-1.jpg'],
    category: 'jewelry',
    subcategory: 'Бугуйвч',
    seller: sellers[0],
    rating: 4.9,
    reviewCount: 89,
    tags: ['мөнгө', 'бугуйвч', 'гар урлал', 'угалз'],
    isFeatured: true,
    createdAt: '2024-02-20',
  },
  {
    id: 'p3',
    name: 'Монгол зураг - Хустайн тал',
    description: 'Хустайн нурууны байгалийн зураг. Тосон будгаар зурсан. Хэмжээ: 60x90см. Хүрээтэй.',
    price: 780000,
    originalPrice: 900000,
    images: ['/products/painting-1.jpg'],
    category: 'art',
    subcategory: 'Зураг',
    seller: sellers[3],
    rating: 5.0,
    reviewCount: 45,
    tags: ['зураг', 'тосон будаг', 'байгаль', 'хустай'],
    isFeatured: true,
    isNew: true,
    createdAt: '2024-03-10',
  },
  {
    id: 'p4',
    name: 'Эсгий гутал - Эмэгтэй',
    description: 'Монгол эсгий гутал, дулаахан, тохитой. Гар аргаар хийгдсэн жинхэнэ хонины ноосон эсгий.',
    price: 125000,
    images: ['/products/boots-1.jpg'],
    category: 'crafts',
    subcategory: 'Эсгий',
    seller: sellers[2],
    rating: 4.7,
    reviewCount: 67,
    tags: ['эсгий', 'гутал', 'эмэгтэй', 'дулаан'],
    isFreeShipping: true,
    createdAt: '2024-01-25',
  },
  {
    id: 'p5',
    name: 'Морин хуур - Мэргэжлийн',
    description: 'Мэргэжлийн түвшний морин хуур. Бүрэн гар урлалаар хийгдсэн, өндөр чанарын модоор бүтээсэн.',
    price: 1200000,
    images: ['/products/morin-khuur-1.jpg'],
    category: 'instruments',
    subcategory: 'Морин хуур',
    seller: sellers[4],
    rating: 4.9,
    reviewCount: 28,
    tags: ['морин хуур', 'хөгжим', 'мэргэжлийн', 'гар урлал'],
    isFeatured: true,
    isNew: true,
    createdAt: '2024-03-05',
  },
  {
    id: 'p6',
    name: 'Монгол хивс - Уламжлалт угалз',
    description: 'Гар нэхмэлийн Монгол хивс. Хэмжээ: 150x200см. Уламжлалт угалзтай. Байгалийн ноосоор хийгдсэн.',
    price: 650000,
    originalPrice: 750000,
    images: ['/products/carpet-1.jpg'],
    category: 'home',
    subcategory: 'Хивс',
    seller: sellers[2],
    rating: 4.6,
    reviewCount: 52,
    tags: ['хивс', 'гар нэхмэл', 'угалз', 'ноос'],
    isFeatured: true,
    createdAt: '2024-02-10',
  },
  {
    id: 'p7',
    name: '"Монгол нууц товчоо" ном',
    description: 'Монголын эзэнт гүрний түүхэн тэмдэглэл. Хатуу хавтастай, тансаг хэвлэл.',
    price: 45000,
    images: ['/products/book-1.jpg'],
    category: 'books',
    subcategory: 'Түүх',
    seller: sellers[5],
    rating: 4.8,
    reviewCount: 210,
    tags: ['ном', 'түүх', 'нууц товчоо', 'монгол'],
    isFreeShipping: true,
    createdAt: '2024-01-05',
  },
  {
    id: 'p8',
    name: 'Монгол малгай - Лоовуз',
    description: 'Уламжлалт Монгол малгай. Хонины арьсан оройтой, торгон бүрээстэй.',
    price: 95000,
    images: ['/products/hat-1.jpg'],
    category: 'clothing',
    subcategory: 'Малгай',
    seller: sellers[1],
    rating: 4.5,
    reviewCount: 38,
    tags: ['малгай', 'уламжлалт', 'лоовуз'],
    createdAt: '2024-02-28',
  },
  {
    id: 'p9',
    name: 'Мөнгөн зүүлт - Оюу чулуутай',
    description: 'Мөнгөн зүүлт, байгалийн оюу чулуугаар чимэглэсэн. Гар урлалаар хийгдсэн.',
    price: 275000,
    images: ['/products/earring-1.jpg'],
    category: 'jewelry',
    subcategory: 'Зүүлт',
    seller: sellers[0],
    rating: 4.8,
    reviewCount: 56,
    tags: ['зүүлт', 'мөнгө', 'оюу', 'гар урлал'],
    isNew: true,
    createdAt: '2024-03-12',
  },
  {
    id: 'p10',
    name: 'Модон тэрэг - Чимэглэлийн',
    description: 'Бяцхан Монгол тэрэгний загвар. Гар урлалаар модоор бүтээсэн чимэглэл.',
    price: 85000,
    images: ['/products/wooden-cart-1.jpg'],
    category: 'crafts',
    subcategory: 'Модон эдлэл',
    seller: sellers[0],
    rating: 4.4,
    reviewCount: 23,
    tags: ['модон', 'тэрэг', 'чимэглэл', 'гар урлал'],
    createdAt: '2024-02-15',
  },
  {
    id: 'p11',
    name: 'Аарц - Хуурай',
    description: 'Уламжлалт Монгол аарц. Байгалийн сүүнээс хийгдсэн, нэмэлтгүй.',
    price: 15000,
    images: ['/products/aaruul-1.jpg'],
    category: 'food',
    subcategory: 'Сүүн бүтээгдэхүүн',
    seller: sellers[2],
    rating: 4.6,
    reviewCount: 178,
    tags: ['аарц', 'сүүн бүтээгдэхүүн', 'уламжлалт'],
    isFreeShipping: true,
    createdAt: '2024-03-01',
  },
  {
    id: 'p12',
    name: 'Уран бичлэгийн бүтээл - "Эх орон"',
    description: 'Монгол уран бичлэгийн бүтээл. А3 хэмжээтэй, хүрээтэй. Бичлэг: "Эх орон".',
    price: 120000,
    images: ['/products/calligraphy-1.jpg'],
    category: 'art',
    subcategory: 'Бичээс',
    seller: sellers[3],
    rating: 4.9,
    reviewCount: 34,
    tags: ['уран бичлэг', 'бичээс', 'эх орон', 'урлаг'],
    isNew: true,
    createdAt: '2024-03-15',
  },
];

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
