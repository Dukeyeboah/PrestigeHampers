import { doc, setDoc, type Firestore } from 'firebase/firestore';
import { buildPrestigeCatalog } from './prestige-catalog';

/**
 * Write all Prestige catalog products to Firestore `inventory`.
 * Requires admin permissions (or temporary open write rules).
 */
export async function seedPrestigeInventory(
  db: Firestore,
  bucket?: string
): Promise<{ success: number; failed: number }> {
  const products = buildPrestigeCatalog();
  let success = 0;
  let failed = 0;

  for (const product of products) {
    try {
      await setDoc(doc(db, 'inventory', product.id), product, { merge: true });
      success++;
    } catch (error) {
      console.error(`Failed to seed ${product.id}:`, error);
      failed++;
    }
  }

  return { success, failed };
}
