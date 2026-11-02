import type { Product } from '@/types';

export type HamperCatalogEntry = {
  id: string;
  name: string;
  price: number;
  /** Optimized web image under /public */
  imageUrl: string;
  /** JPEG fallback */
  imageJpg?: string;
  stock?: number;
  description?: string;
  contents: string[];
};

/**
 * Prestige Hampers catalog — prices in GHS.
 * Images: optimized webp (+ jpg fallback) generated from public/images/hampers/Updated.
 *
 * Note: price list wasn’t pasted in chat for the 4 new hampers; matching names reuse
 * prior Prestige prices. For Him / For Her / Perfect Christmas / Spirit of Christmas
 * use tiered estimates — reply with exact prices to update.
 */
export const HAMPER_CATALOG: HamperCatalogEntry[] = [
  {
    id: 'hamper-budget-hamper',
    name: 'Budget Hamper',
    price: 800,
    imageUrl: '/images/hampers/optimized/budget_hamper.webp',
    imageJpg: '/images/hampers/optimized/budget_hamper.jpg',
    description: 'A cheerful everyday gift crate with wine, treats, and glassware.',
    contents: [
      'Jacob’s Creek Classic Shiraz (red wine)',
      'McVitie’s Digestive Original biscuits',
      'Lindt Lindor Assorted chocolates',
      'Ceres 100% Orange Juice',
      'Ceres 100% Apple Juice',
      'St. Dalfour Strawberry Fruit Spread',
      'Roasted & salted mixed nuts',
      '3-piece glass set',
      'Kitchen towel',
    ],
  },
  {
    id: 'hamper-family-breakfast',
    name: 'Family Breakfast',
    price: 800,
    imageUrl: '/images/hampers/optimized/family_breakfast.webp',
    imageJpg: '/images/hampers/optimized/family_breakfast.jpg',
    description: 'A wholesome breakfast tray for sharing mornings together.',
    contents: [
      '100% natural whole grain oats',
      'English Breakfast tea (25 bags)',
      'Classic original water crackers',
      '100% pure orange juice',
      '100% pure apple juice',
      'Roasted & salted mixed nuts',
      'Coffee creamer',
      'Baked beans in tomato sauce',
      'Strawberry jam',
      'Ceramic teapot, 2 cups & 2 saucers',
      'Kitchen linen',
    ],
  },
  {
    id: 'hamper-alcohol-free',
    name: 'Alcohol Free',
    price: 1000,
    imageUrl: '/images/hampers/optimized/alcohol_free.webp',
    imageJpg: '/images/hampers/optimized/alcohol_free.jpg',
    description: 'A festive alcohol-free celebration crate with sparkling grape juices.',
    contents: [
      'Bella Vista Sparkling White Grape',
      'Bella Vista Sparkling Red Grape',
      'Ceres 100% Orange Juice',
      'Ceres 100% Apple Juice',
      'Premium coffee',
      'Coffee creamer',
      'McVitie’s Digestive Original biscuits',
      'Lindt Lindor Assorted chocolates',
      'Mixed nuts (roasted & salted)',
      'St. Dalfour Strawberry Jam',
      '3-piece glass set',
      'Kitchen towel',
    ],
  },
  {
    id: 'hamper-christmas-tradition',
    name: 'Christmas Tradition',
    price: 1500,
    imageUrl: '/images/hampers/optimized/christmas_tradition.webp',
    imageJpg: '/images/hampers/optimized/christmas_tradition.jpg',
    description: 'Classic Christmas cheer with Baileys, sparkling wine, and festive tableware.',
    contents: [
      'Baileys Original Irish Cream (70cl)',
      'Sparkling wine / champagne',
      'Orange juice',
      'Apple juice',
      'Assorted chocolates & biscuits',
      'Mixed nuts medley',
      'Festive ceramic bowls (set of 3)',
      'Stainless steel ice bucket',
      'Kitchen towel',
    ],
  },
  {
    id: 'hamper-for-her',
    name: 'For Her',
    price: 1600,
    imageUrl: '/images/hampers/optimized/for_her.webp',
    imageJpg: '/images/hampers/optimized/for_her.jpg',
    description: 'An elegant pamper hamper with wine, wellness, and gourmet treats.',
    contents: [
      'Jacob’s Creek Classic Shiraz',
      'Premium coffee',
      'Premium English Breakfast tea',
      'Ceramic mug',
      'Bath & Body shower gel',
      'Bath & Body body lotion',
      'Bath salt — relaxing blend',
      'Foot mask',
      'Scented candle — lavender & vanilla',
      'Lindt Lindor Assorted chocolates',
      'Gift box (African print wrap)',
      'Hand towel',
    ],
  },
  {
    id: 'hamper-for-him',
    name: 'For Him',
    price: 1800,
    imageUrl: '/images/hampers/optimized/for_him.webp',
    imageJpg: '/images/hampers/optimized/for_him.jpg',
    description: 'A refined hamper for him — whisky, wine, glassware, and essentials.',
    contents: [
      'Johnnie Walker Black Label Scotch Whisky',
      'Jacob’s Creek Classic Shiraz',
      'Crystal-style rocks glasses (pair)',
      'Lindt Lindor Assorted chocolates',
      'Mixed nuts (roasted & salted)',
      'Shoe care kit',
      'Plush towel / blanket',
    ],
  },
  {
    id: 'hamper-perfect-christmas',
    name: 'Perfect Christmas',
    price: 2200,
    imageUrl: '/images/hampers/optimized/perfect_christmas.webp',
    imageJpg: '/images/hampers/optimized/perfect_christmas.jpg',
    description: 'A complete Christmas gift crate with cognac, wine, and home textiles.',
    contents: [
      'Hennessy V.S Cognac (70cl)',
      'Jacob’s Creek Classic Shiraz',
      'Carr’s Table Water Crackers',
      'Planters mixed nuts (roasted & salted)',
      'Bonne Maman Strawberry Preserve',
      'Premium bed sheet set',
      'Plush blanket / towel',
      'Striped kitchen towels',
    ],
  },
  {
    id: 'hamper-christmas-surprise',
    name: 'Christmas Surprise',
    price: 2700,
    imageUrl: '/images/hampers/optimized/christmas_surprise.webp',
    imageJpg: '/images/hampers/optimized/christmas_surprise.jpg',
    description: 'A generous Christmas surprise with cognac, Bordeaux, and home comforts.',
    contents: [
      'Hennessy Very Special Cognac (70cl)',
      'Château Saint-Pierre Bordeaux red wine',
      'Ceres 100% Orange Juice',
      'Ceres 100% Apple Juice',
      'Gourmet sea salt crackers',
      'Assorted biscuits',
      'Pitted green olives',
      'Mixed nuts',
      'Strawberry jam',
      'Assorted chocolate truffles',
      'Bed sheet set',
      'Whiskey glass set (2)',
      'Kitchen towel',
    ],
  },
  {
    id: 'hamper-spirit-of-christmas',
    name: 'Spirit of Christmas',
    price: 3500,
    imageUrl: '/images/hampers/optimized/spirit_of_christmas.webp',
    imageJpg: '/images/hampers/optimized/spirit_of_christmas.jpg',
    description: 'A premium holiday hamper featuring Hennessy XO and fine wines.',
    contents: [
      'Hennessy XO Cognac',
      'Château Laroche Bordeaux (2020)',
      'Cloudvale Sauvignon Blanc',
      'Premium bed sheet set (Queen, 500 TC)',
      'Colavita pitted green olives',
      'Gourmet mixed nuts',
      'Lindt Lindor Assorted chocolates',
      'Miller’s gourmet crackers',
      '100% pure orange juice',
      '100% pure apple juice',
      'Kitchen textile',
    ],
  },
  {
    id: 'hamper-deluxe-hamper',
    name: 'Deluxe Hamper',
    price: 6000,
    imageUrl: '/images/hampers/optimized/deluxe_hamper.webp',
    imageJpg: '/images/hampers/optimized/deluxe_hamper.jpg',
    description: 'Our signature luxury crate — champagne, cognac, whisky, and gourmet extras.',
    contents: [
      'Brut Champagne',
      'Hennessy V.S.O.P Cognac (70cl)',
      'Glenfiddich 12 Year Old Single Malt Scotch',
      'Château Margaux Bordeaux',
      'Luxury chocolate truffle box',
      'Assorted biscuits',
      'Gourmet butter cookies tin',
      'Premium chocolate bar',
      'Green olives',
      'Mixed nuts',
    ],
  },
];

/** Curated hampers for shop + admin merge */
export function buildHamperCatalog(): Product[] {
  const now = Date.now();
  return HAMPER_CATALOG.map((entry) => ({
    id: entry.id,
    code: entry.id,
    name: entry.name,
    category: 'Hampers',
    price: entry.price,
    stock: entry.stock ?? 99,
    unit: 'hamper',
    description: entry.description,
    imageUrl: entry.imageUrl,
    contents: entry.contents,
    kind: 'hamper' as const,
    updatedAt: now,
  }));
}

export function getHamperById(id: string): HamperCatalogEntry | undefined {
  return HAMPER_CATALOG.find((h) => h.id === id);
}

/** Firebase Storage URL — use when images are hosted in Storage instead of /public */
export function getHamperStorageUrl(fileName: string, bucket?: string): string {
  const storageBucket =
    bucket ||
    (typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      : '') ||
    '';
  const storagePath = `hampers/${fileName}`;
  const encoded = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encoded}?alt=media`;
}
