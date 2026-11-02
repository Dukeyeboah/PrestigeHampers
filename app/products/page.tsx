'use client';

import { useState, useMemo } from 'react';
import { useShopCatalog } from '@/hooks/use-shop-catalog';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';

const PAGE_SIZE = 16;

export default function ProductsPage() {
  const { hampers, loading } = useShopCatalog();
  const { addToCart } = useCart();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleHampers = useMemo(
    () => hampers.filter((product) => !product.isHidden),
    [hampers]
  );

  const productsToShow = visibleHampers.slice(0, visibleCount);
  const hasMore = visibleCount < visibleHampers.length;

  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  return (
    <div className='space-y-5 md:space-y-6'>
      <div className='space-y-1 text-center'>
        <h1 className='text-2xl md:text-3xl font-semibold tracking-tight text-foreground'>
          Hampers
        </h1>
        <p className='text-sm text-muted-foreground max-w-lg mx-auto'>
          Curated gift hampers for every occasion. Click a hamper for what’s
          inside.
        </p>
      </div>

      {loading ? (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-8'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='aspect-[3/4] w-full rounded-2xl' />
          ))}
        </div>
      ) : visibleHampers.length === 0 ? (
        <div className='text-center py-16 md:py-24 space-y-3 px-4'>
          <p className='text-lg font-medium text-foreground'>
            No hampers available
          </p>
        </div>
      ) : (
        <div className='space-y-10'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-10'>
            {productsToShow.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {hasMore && (
            <div className='flex flex-col items-center gap-2 pt-4'>
              <p className='text-xs text-muted-foreground'>
                Showing {productsToShow.length} of {visibleHampers.length}
              </p>
              <Button
                variant='outline'
                className='rounded-full px-8 h-11'
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
