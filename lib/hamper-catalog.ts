import type { Product } from '@/types';

/** Local hamper images under /public/images/hampers */
const HAMPER_ENTRIES: {
  imagePath: string;
  price: number;
  stock?: number;
}[] = [
  { imagePath: '/images/hampers/Family_Breakfast.jpeg', price: 800 },
  { imagePath: '/images/hampers/Budget_Hamper.jpeg', price: 800 },
  { imagePath: '/images/hampers/Alcohol_Free.jpeg', price: 1000 },
  { imagePath: '/images/hampers/Christmas_Surprise.jpeg', price: 2700 },
  { imagePath: '/images/hampers/Deluxe_Hamper.jpeg', price: 6000 },
  { imagePath: '/images/hampers/Christmas_Tradition.jpeg', price: 1500 },
];

function fileBaseFromPath(imagePath: string): string {
  const file = imagePath.split('/').pop() || '';
  return file.replace(/\.[^.]+$/, '');
}

/** Display name from file name — underscores become spaces */
export function hamperFileNameToName(fileBase: string): string {
  return fileBase
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function hamperIdFromPath(imagePath: string): string {
  const slug = fileBaseFromPath(imagePath).toLowerCase().replace(/_/g, '-');
  return `hamper-${slug}`;
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

/** Curated hampers — images served from /public/images/hampers */
export function buildHamperCatalog(): Product[] {
  const now = Date.now();
  return HAMPER_ENTRIES.map((entry) => {
    const fileBase = fileBaseFromPath(entry.imagePath);
    const name = hamperFileNameToName(fileBase);
    const id = hamperIdFromPath(entry.imagePath);
    return {
      id,
      code: id,
      name,
      category: 'Hampers',
      price: entry.price,
      stock: entry.stock ?? 99,
      unit: 'hamper',
      description: `A thoughtfully curated ${name.toLowerCase()} from Prestige Hampers.`,
      imageUrl: entry.imagePath,
      kind: 'hamper' as const,
      updatedAt: now,
    };
  });
}
