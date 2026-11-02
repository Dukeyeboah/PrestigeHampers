'use client';

import { useState, useEffect, useMemo } from 'react';
import { useShopCatalog } from '@/hooks/use-shop-catalog';
import { useCart } from '@/hooks/use-cart';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';

const PAGE_SIZE = 16;

export default function ProductsPage() {
  // Hampers / Products toggle temporarily disabled — hampers only
  const { hampers, loading } = useShopCatalog();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return hampers.filter((product) => {
      if (product.isHidden) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.contents?.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [hampers, searchQuery]);

  const productsToShow = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  return (
    <div className='space-y-6 md:space-y-8'>
      <div className='space-y-1 text-center'>
        <h1 className='text-2xl md:text-3xl font-semibold tracking-tight text-foreground'>
          Hampers
        </h1>
        <p className='text-sm text-muted-foreground max-w-lg mx-auto'>
          Curated gift hampers for every occasion. Click a hamper for what’s
          inside.
        </p>
      </div>

      {/* Hampers / Products toggle — re-enable when individual products return
      <div className='flex justify-center'>…</div>
      */}

      <div className='relative max-w-xl mx-auto w-full'>
        <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search hampers...'
          className='pl-11 h-12 rounded-full bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-300'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-8'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='aspect-[3/4] w-full rounded-2xl' />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className='text-center py-16 md:py-24 space-y-3 px-4'>
          <p className='text-lg font-medium text-foreground'>
            {hampers.length === 0 && !searchQuery
              ? 'No hampers available'
              : 'No results found'}
          </p>
          <p className='text-sm text-muted-foreground max-w-md mx-auto'>
            Try a different search term.
          </p>
          {searchQuery && (
            <Button
              variant='link'
              className='mt-3'
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </Button>
          )}
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
                Showing {productsToShow.length} of {filteredProducts.length}
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
