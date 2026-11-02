/** Site-wide copy and URLs for metadata, Open Graph, and sharing */
export const SITE_NAME = 'Prestige Hampers';
export const SITE_SHORT_NAME = 'Prestige Shop';

export const SITE_DESCRIPTION =
  'Shop curated gift hampers and premium treats from Prestige Hampers. Browse signature hampers, order individual products, pay with cash or MoMo, and track your orders online.';

export const SITE_TAGLINE =
  'Thoughtfully curated hampers and premium gifts — delivered with quiet luxury.';

/**
 * Path to link-preview / Open Graph image (Family Breakfast, full-bleed 1200×630).
 * Use a JPEG under /public for WhatsApp, iMessage, Slack, etc.
 */
export const OG_IMAGE_PATH = '/images/og-share.jpg';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT =
  'Prestige Hampers Family Breakfast hamper — curated gift collection';

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
