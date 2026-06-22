import type { Product } from '@/types';
import { buildHamperCatalog } from '@/lib/hamper-catalog';

export type InventoryCatalogFilter = 'hampers' | 'products';

export function isHamperItem(product: Product): boolean {
  if (product.kind === 'hamper') return true;
  if (product.kind === 'product') return false;
  return product.category === 'Hampers' || product.id.startsWith('hamper-');
}

export type CatalogKind = 'hamper' | 'product';

export function catalogKindFromProduct(product: Product): CatalogKind {
  return isHamperItem(product) ? 'hamper' : 'product';
}

/** Catalog hampers merged with Firestore overrides + admin-added hampers */
export function mergeHamperCatalogWithFirestore(
  firestoreProducts: Product[]
): Product[] {
  const hampers = buildHamperCatalog();
  const byId = new Map(firestoreProducts.map((p) => [p.id, p]));

  const merged = hampers
    .map((h) => {
      const override = byId.get(h.id);
      const item = { ...h, ...override };
      if (item.kind === 'product') return null;
      return {
        ...item,
        kind: 'hamper' as const,
        category: 'Hampers',
        imageUrl: override?.imageUrl || h.imageUrl,
      };
    })
    .filter((h): h is Product => h !== null);

  const catalogIds = new Set(hampers.map((h) => h.id));
  const extra = firestoreProducts.filter(
    (p) => !p.isHidden && isHamperItem(p) && !catalogIds.has(p.id)
  );

  return [...merged, ...extra].filter((p) => !p.isHidden);
}

/** Merge catalog hampers with Firestore inventory for admin views */
export function mergeAdminInventory(firestoreProducts: Product[]): Product[] {
  const hampers = buildHamperCatalog();
  const byId = new Map(firestoreProducts.map((p) => [p.id, p]));

  const mergedHampers = hampers
    .map((h) => {
      const override = byId.get(h.id);
      const item = { ...h, ...override };
      if (item.kind === 'product') return null;
      return {
        ...item,
        kind: 'hamper' as const,
        category: 'Hampers',
        imageUrl: override?.imageUrl || h.imageUrl,
      };
    })
    .filter((h): h is Product => h !== null);

  const catalogHamperIds = new Set(hampers.map((h) => h.id));
  const productsOnly = firestoreProducts.filter(
    (p) => !isHamperItem(p) || (p.kind === 'product' && catalogHamperIds.has(p.id))
  );
  const extraHampers = firestoreProducts.filter(
    (p) => isHamperItem(p) && !catalogHamperIds.has(p.id)
  );
  return [...mergedHampers, ...extraHampers, ...productsOnly];
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
