'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useShopCatalog } from '@/hooks/use-shop-catalog';
import { useSavedProducts } from '@/hooks/use-saved-products';
import { useCart } from '@/hooks/use-cart';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { LoginDialog } from '@/components/login-dialog';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const { allItems, loading: inventoryLoading } = useShopCatalog();
  const { savedIds } = useSavedProducts();
  const { addToCart } = useCart();
  const [showLogin, setShowLogin] = useState(false);

  const savedProducts = useMemo(
    () => allItems.filter((p) => savedIds.includes(p.id) && !p.isHidden),
    [allItems, savedIds]
  );

  if (authLoading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='aspect-[3/4] rounded-2xl' />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className='text-center py-24 space-y-4'>
        <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100'>
          <Bookmark className='h-6 w-6 text-neutral-600' />
        </div>
        <h1 className='text-2xl font-semibold tracking-tight'>Saved items</h1>
        <p className='text-muted-foreground max-w-md mx-auto'>
          Sign in to bookmark products and build your wishlist for later.
        </p>
        <Button className='rounded-full' onClick={() => setShowLogin(true)}>
          Sign in to view saved items
        </Button>
        <LoginDialog open={showLogin} onOpenChange={setShowLogin} defaultMode='signup' />
      </div>
    );
  }

  return (
    <div className='space-y-8 text-center'>
      <div className='space-y-1'>
        <h1 className='text-2xl md:text-3xl font-semibold tracking-tight'>Saved items</h1>
        <p className='text-sm text-muted-foreground'>
          Products you&apos;ve bookmarked for later.
        </p>
      </div>

      {inventoryLoading ? (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='aspect-[3/4] rounded-2xl' />
          ))}
        </div>
      ) : savedProducts.length === 0 ? (
        <div className='py-16 space-y-4'>
          <p className='text-muted-foreground'>No saved items yet.</p>
          <Button asChild className='rounded-full'>
            <Link href='/products'>Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 text-left'>
          {savedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(p, qty) => addToCart(p, qty)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
