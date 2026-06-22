'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export function useSavedProducts() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setSavedIds([]);
      return;
    }

    const fetchSaved = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          setSavedIds(userDoc.data().savedProductIds || []);
        }
      } catch (error) {
        console.error('Error fetching saved products:', error);
      }
    };

    fetchSaved();
  }, [user]);

  const isSaved = useCallback(
    (productId: string) => savedIds.includes(productId),
    [savedIds]
  );

  const toggleSave = useCallback(
    async (productId: string) => {
      if (!user || !db) return false;

      setLoading(true);
      try {
        const userRef = doc(db, 'users', user.id);
        const alreadySaved = savedIds.includes(productId);

        if (alreadySaved) {
          await updateDoc(userRef, { savedProductIds: arrayRemove(productId) });
          setSavedIds((prev) => prev.filter((id) => id !== productId));
          toast.success('Removed from saved items');
        } else {
          await updateDoc(userRef, { savedProductIds: arrayUnion(productId) });
          setSavedIds((prev) => [...prev, productId]);
          toast.success('Saved for later');
        }
        return true;
      } catch (error) {
        console.error('Error toggling save:', error);
        toast.error('Could not update saved items');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, savedIds]
  );

  return { savedIds, isSaved, toggleSave, loading };
}
