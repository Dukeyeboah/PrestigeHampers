import type { Product } from '@/types';

/**
 * Resolve the best image URL for a product or hamper.
 * Prefers local /public assets (reliable) over Firebase Storage URLs.
 */
export function resolveProductImageUrl(product: Product): string | undefined {
  const illustrations: Record<string, string> = {'hamper-budget-hamper': 'budget_hamper.webp', 'hamper-family-breakfast': 'family_breakfast.webp', 'hamper-alcohol-free': 'alcohol_free.webp', 'hamper-christmas-tradition': 'christmas_tradition.webp', 'hamper-for-her': 'for_her.webp', 'hamper-perfect-christmas': 'perfect_christmas.webp', 'hamper-spirit-of-christmas': 'spirit_of_christmas.webp', 'hamper-christmas-surprise': 'christmas_surprise.webp', 'hamper-deluxe-hamper': 'deluxe_hamper.webp'};
  if (illustrations[product.id]) return `/images/hampers/illustrations/${illustrations[product.id]}`;

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
  const name = product.id === 'hamper-budget-hamper' ? 'Budget Hamper'
    : product.id === 'hamper-deluxe-hamper' ? 'Deluxe Hamper' : product.name;
  const price = product.id === 'hamper-alcohol-free' ? 1450 : product.id === 'hamper-deluxe-hamper' ? 7000 : product.price;
  return { ...product, name, price, ...(imageUrl ? { imageUrl } : {}) };
}
