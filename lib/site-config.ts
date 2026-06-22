/** Site-wide copy and URLs for metadata, Open Graph, and sharing */
export const SITE_NAME = 'Prestige Hampers';
export const SITE_SHORT_NAME = 'Prestige Shop';

export const SITE_DESCRIPTION =
  'Shop curated gift hampers and premium treats from Prestige Hampers. Browse signature hampers, order individual products, pay with cash or MoMo, and track your orders online.';

export const SITE_TAGLINE =
  'Thoughtfully curated hampers and premium gifts — delivered with quiet luxury.';

/** Path to share preview image (Deluxe Hamper) — must live under /public */
export const OG_IMAGE_PATH = '/images/hampers/Deluxe_Hamper.jpeg';
export const OG_IMAGE_ALT =
  'Prestige Hampers Deluxe Hamper — premium curated gift collection';

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
