'use client';

import { useMemo } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import {
  isHamperItem,
  mergeHamperCatalogWithFirestore,
} from '@/lib/admin-inventory';
import { withResolvedImage } from '@/lib/product-image';
import type { Product } from '@/types';

/** Hampers (Storage catalog) + individual products (Firestore inventory) */
export function useShopCatalog() {
  const { products: inventoryItems, loading, offline } = useInventory();

  const hampers = useMemo(
    () => mergeHamperCatalogWithFirestore(inventoryItems).map(withResolvedImage),
    [inventoryItems]
  );

  const products = useMemo(
    () =>
      inventoryItems
        .filter((p) => !p.isHidden && !isHamperItem(p))
        .map(withResolvedImage),
    [inventoryItems]
  );

  const allItems = useMemo(
    () => [...hampers, ...products],
    [hampers, products]
  );

  return { hampers, products, allItems, loading, offline };
}
