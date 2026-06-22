/**
 * Product categories for Prestige Hampers
 */

export const PRODUCT_CATEGORIES = [
  'Bath & Body',
  'Biscuits & Treats',
  'Chocolate & Sweets',
  'Wine & Spirits',
  'Tea & Coffee',
  'Snacks & Nuts',
  'Gift Sets',
  'Seasonal Hampers',
  'Personal Care',
  'Home & Lifestyle',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {};
