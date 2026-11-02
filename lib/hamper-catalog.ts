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

/** Prestige Hampers catalog — prices in GHS */
export const HAMPER_CATALOG: HamperCatalogEntry[] = [
  {
    id: 'hamper-budget-hamper',
    name: 'Budget Hamper',
    price: 950,
    imageUrl: '/images/hampers/optimized/budget_hamper.webp',
    imageJpg: '/images/hampers/optimized/budget_hamper.jpg',
    description: 'A cheerful everyday gift crate with wine, treats, and glassware.',
    contents: [
      'Wine',
      'Biscuits',
      'Chocolates',
      'Nuts',
      'Kitchen towel',
      'Jam',
      'Boxes of fruit juice',
      'Three-piece glass set',
    ],
  },
  {
    id: 'hamper-family-breakfast',
    name: 'Family Breakfast',
    price: 1000,
    imageUrl: '/images/hampers/optimized/family_breakfast.webp',
    imageJpg: '/images/hampers/optimized/family_breakfast.jpg',
    description: 'A wholesome breakfast tray for sharing mornings together.',
    contents: [
      'Oats or cereal',
      'Tea or coffee',
      'Jam',
      'Nuts or hot dogs',
      'Tea towel',
      'Crackers',
      'Boxes of juice',
      'Baked beans',
      'Creamer',
      'Tea pot set',
    ],
  },
  {
    id: 'hamper-alcohol-free',
    name: 'Alcohol Free',
    price: 1300,
    imageUrl: '/images/hampers/optimized/alcohol_free.webp',
    imageJpg: '/images/hampers/optimized/alcohol_free.jpg',
    description: 'A festive alcohol-free celebration crate with sparkling grape juices.',
    contents: [
      'Two bottles of sparkling wine',
      'Boxes of fruit juice',
      'Assorted biscuits',
      'Chocolate',
      'Coffee or tea or hot chocolate',
      'Creamer',
      'Tea towel',
      'Jam',
      'Nuts',
      'Three-piece glass set',
    ],
  },
  {
    id: 'hamper-christmas-tradition',
    name: 'Christmas Tradition',
    price: 1300,
    imageUrl: '/images/hampers/optimized/christmas_tradition.webp',
    imageJpg: '/images/hampers/optimized/christmas_tradition.jpg',
    description: 'Classic Christmas cheer with Baileys, sparkling wine, and festive tableware.',
    contents: [
      'Baileys Irish Cream',
      'Boxes of fruit juice',
      'Season’s biscuit or chocolate',
      'Sparkling wine & nuts',
      'Half piece cloth',
      'Set of kitchen bowls',
      'Kitchen towel & nuts',
      'Ice bucket',
    ],
  },
  {
    id: 'hamper-for-her',
    name: 'For Her',
    price: 1500,
    imageUrl: '/images/hampers/optimized/for_her.webp',
    imageJpg: '/images/hampers/optimized/for_her.jpg',
    description: 'An elegant pamper hamper with wine, wellness, and gourmet treats.',
    contents: [
      'Cloth',
      'Bath set',
      'Coffee / tea',
      'Candle',
      'Foot mask',
      'Chocolates',
      'Kitchen towel',
      'Red wine',
      'Branded mug',
    ],
  },
  {
    id: 'hamper-for-him',
    name: 'For Him',
    price: 1500,
    imageUrl: '/images/hampers/optimized/for_him.webp',
    imageJpg: '/images/hampers/optimized/for_him.jpg',
    description: 'A refined hamper for him — whisky, wine, glassware, and essentials.',
    contents: [
      'Towel',
      'Shoe care',
      'Whiskey glass set',
      'Chocolate',
      'Whiskey',
      'Nuts',
      'Red wine',
    ],
  },
  {
    id: 'hamper-perfect-christmas',
    name: 'Perfect Christmas',
    price: 1500,
    imageUrl: '/images/hampers/optimized/perfect_christmas.webp',
    imageJpg: '/images/hampers/optimized/perfect_christmas.jpg',
    description: 'A complete Christmas gift crate with spirits, wine, and home textiles.',
    contents: [
      'Brandy or whisky',
      'Red / white wine',
      'Bath towel or cloth',
      'Crackers',
      'Nuts',
      'Jam',
      'Kitchen towel',
      'Bed sheet',
    ],
  },
  {
    id: 'hamper-spirit-of-christmas',
    name: 'Spirit of Christmas',
    price: 2500,
    imageUrl: '/images/hampers/optimized/spirit_of_christmas.webp',
    imageJpg: '/images/hampers/optimized/spirit_of_christmas.jpg',
    description: 'A premium holiday hamper featuring cognac or whiskey and fine wines.',
    contents: [
      'Cognac or whiskey',
      'Red & white wine',
      'Chocolate',
      'Biscuits',
      'Olives & nuts',
      'Tea towel',
      'Boxes of fruit juice',
      'Bed sheets',
    ],
  },
  {
    id: 'hamper-christmas-surprise',
    name: 'Christmas Surprise',
    price: 3700,
    imageUrl: '/images/hampers/optimized/christmas_surprise.webp',
    imageJpg: '/images/hampers/optimized/christmas_surprise.jpg',
    description: 'A generous Christmas surprise with premium spirits, wine, and home comforts.',
    contents: [
      'Hennessy or Courvoisier',
      'Premium wine',
      'Assorted biscuits',
      'Chocolates',
      'Olives & nuts',
      'Jam',
      'Kitchen towel',
      'Boxes of juice',
      'Whiskey glass set',
      'Bed sheets',
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
      'Champagne',
      'Cognac',
      'Glenfiddich whiskey',
      'Premium red wine',
      'Assorted chocolates & biscuits',
      'Olives & nuts',
      'Set of kitchen towels',
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
