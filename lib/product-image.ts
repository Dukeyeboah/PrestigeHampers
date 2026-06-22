import type { Product } from '@/types';

/**
 * Resolve the best image URL for a product or hamper.
 * Prefers local /public assets (reliable) over Firebase Storage URLs.
 */
export function resolveProductImageUrl(product: Product): string | undefined {
  // Hamper — local path from catalog
  if (product.kind === 'hamper' || product.id.startsWith('hamper-')) {
    if (product.imageUrl?.startsWith('/images/')) {
      return product.imageUrl;
    }
  }

  // Prestige catalog product id → /images/products/N.jpg
  const idMatch = product.id.match(/^prestig-(\d{1,3})$/i);
  if (idMatch) {
    const num = parseInt(idMatch[1], 10);
    if (num >= 1 && num <= 22) {
      return `/images/products/${num}.jpg`;
    }
  }

  const codeMatch = product.code?.match(/^prestig-(\d{1,3})$/i);
  if (codeMatch) {
    const num = parseInt(codeMatch[1], 10);
    if (num >= 1 && num <= 22) {
      return `/images/products/${num}.jpg`;
    }
  }

  // Already a local public path
  if (product.imageUrl?.startsWith('/images/')) {
    return product.imageUrl;
  }

  // Legacy Firebase URL — try to map products/N.jpg to local file
  if (product.imageUrl?.includes('/products/')) {
    const storageMatch = product.imageUrl.match(/products%2F(\d+)\.jpg/i);
    if (storageMatch) {
      return `/images/products/${storageMatch[1]}.jpg`;
    }
    const plainMatch = product.imageUrl.match(/products\/(\d+)\.jpg/i);
    if (plainMatch) {
      return `/images/products/${plainMatch[1]}.jpg`;
    }
  }

  return product.imageUrl;
}

export function withResolvedImage(product: Product): Product {
  const imageUrl = resolveProductImageUrl(product);
  return imageUrl ? { ...product, imageUrl } : product;
}
