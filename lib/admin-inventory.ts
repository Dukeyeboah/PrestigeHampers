import type { Product } from '@/types';
import { buildHamperCatalog } from '@/lib/hamper-catalog';

export type InventoryCatalogFilter = 'hampers' | 'products';

export function isHamperItem(product: Product): boolean {
  return (
    product.kind === 'hamper' ||
    product.category === 'Hampers' ||
    product.id.startsWith('hamper-')
  );
}

/** Merge catalog hampers with Firestore inventory for admin views */
export function mergeAdminInventory(firestoreProducts: Product[]): Product[] {
  const hampers = buildHamperCatalog();
  const byId = new Map(firestoreProducts.map((p) => [p.id, p]));

  const mergedHampers = hampers.map((h) => ({
    ...h,
    ...byId.get(h.id),
    kind: 'hamper' as const,
    category: 'Hampers',
    imageUrl: byId.get(h.id)?.imageUrl || h.imageUrl,
  }));

  const productsOnly = firestoreProducts.filter((p) => !isHamperItem(p));
  return [...mergedHampers, ...productsOnly];
}

export function filterInventoryByCatalog(
  items: Product[],
  filter: InventoryCatalogFilter
): Product[] {
  if (filter === 'hampers') {
    return items.filter(isHamperItem);
  }
  return items.filter((p) => !isHamperItem(p));
}
