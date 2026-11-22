/** Site-wide copy and URLs for metadata, Open Graph, and sharing */
export const SITE_NAME = 'Prestige Hampers';
export const SITE_SHORT_NAME = 'Prestige Hampers';

export const SITE_DESCRIPTION =
  'Explore our collection of thoughtfully selected hampers. Choose a set, arrange pickup or delivery, and submit your order via WhatsApp.';

export const SITE_TAGLINE =
  'Thoughtfully curated hampers, delivered with quiet luxury.';

/**
 * Path to link-preview / Open Graph image (hero photograph, full-bleed 1200×630).
 * Use a JPEG under /public for WhatsApp, iMessage, Slack, etc.
 */
export const OG_IMAGE_PATH = '/images/hero-share-2026.jpg';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT =
  'Prestige Hampers — thoughtfully prepared hamper in a wooden gift box';

/**
 * Canonical public site URL for Open Graph / link previews.
 *
 * Important: never use VERCEL_URL alone for OG tags — that is a per-deploy
 * hostname and is often behind Vercel SSO, so iMessage/WhatsApp cannot load
 * og:image and fall back to the favicon.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  // Stable production hostname on Vercel (not the unique deploy URL)
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(
    /\/$/,
    ''
  );
  if (productionHost) {
    return productionHost.startsWith('http')
      ? productionHost
      : `https://${productionHost}`;
  }

  // Known production alias — keeps link previews working even if env is unset
  if (process.env.VERCEL) {
    return 'https://prestige-hampers.vercel.app';
  }

  return 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
