'use client';

import { useMemo } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import { buildHamperCatalog } from '@/lib/hamper-catalog';
import { withResolvedImage } from '@/lib/product-image';
import type { Product } from '@/types';

function isHamperProduct(p: Product): boolean {
  return p.kind === 'hamper' || p.category === 'Hampers';
}

/** Hampers (Storage catalog) + individual products (Firestore inventory) */
export function useShopCatalog() {
  const { products: inventoryItems, loading, offline } = useInventory();

  const hampers = useMemo(() => buildHamperCatalog(), []);

  const products = useMemo(
    () =>
      inventoryItems
        .filter((p) => !p.isHidden && !isHamperProduct(p))
        .map(withResolvedImage),
    [inventoryItems]
  );

  const allItems = useMemo(
    () => [...hampers, ...products],
    [hampers, products]
  );

  return { hampers, products, allItems, loading, offline };
}
