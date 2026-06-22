'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { offlineDB } from '@/lib/db';
import type { Product } from '@/types';
import { toast } from 'sonner';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      setOffline(true);
      return;
    }

    const q = collection(db, 'inventory');

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Product
        );
        items.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(items);
        setOffline(false);
        setLoading(false);
        items.forEach((product) => {
          offlineDB.put('inventory', product);
        });
      },
      (error) => {
        console.error('Firestore inventory error:', error);
        setOffline(true);
        setLoading(false);
        offlineDB.getAll<Product>('inventory').then((cached) => {
          if (cached.length > 0) setProducts(cached);
        });
      }
    );

    const handleOffline = () => {
      setOffline(true);
      toast.warning('You are offline. Showing cached products.');
    };
    const handleOnline = () => setOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return { products, loading, offline };
}
