'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useShopCatalog } from '@/hooks/use-shop-catalog';
import { useCart } from '@/hooks/use-cart';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, WifiOff, Gift, Package } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';
import { Badge } from '@/components/ui/badge';

const PAGE_SIZE = 16;

type CatalogTab = 'hampers' | 'products';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get('tab') === 'products' ? 'products' : 'hampers';

  const { hampers, products, loading, offline } = useShopCatalog();
  const { addToCart } = useCart();
  const [catalogTab, setCatalogTab] = useState<CatalogTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setCatalogTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, catalogTab]);

  const sourceItems = catalogTab === 'hampers' ? hampers : products;

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sourceItems.filter((product) => {
      if (product.isHidden) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q)
      );
    });
  }, [sourceItems, searchQuery]);

  const productsToShow = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  return (
    <div className='space-y-6 md:space-y-8'>
      <div className='space-y-1 text-center'>
        <h1 className='text-2xl md:text-3xl font-semibold tracking-tight text-foreground'>
          {catalogTab === 'hampers' ? 'Hampers' : 'Products'}
        </h1>
        <p className='text-sm text-muted-foreground max-w-lg mx-auto'>
          {catalogTab === 'hampers'
            ? 'Curated gift hampers for every occasion.'
            : 'Premium individual gifts and treats from our collection.'}
        </p>
      </div>

      <div className='flex justify-center'>
        <div className='inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1'>
          <button
            type='button'
            onClick={() => setCatalogTab('hampers')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full transition-colors ${
              catalogTab === 'hampers'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Gift className='h-3.5 w-3.5' />
            Hampers
          </button>
          <button
            type='button'
            onClick={() => setCatalogTab('products')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full transition-colors ${
              catalogTab === 'products'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Package className='h-3.5 w-3.5' />
            Products
          </button>
        </div>
      </div>

      <div className='relative max-w-xl mx-auto w-full'>
        <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder={
            catalogTab === 'hampers'
              ? 'Search hampers...'
              : 'Search products...'
          }
          className='pl-11 h-12 rounded-full bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-300'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {offline && products.length === 0 && catalogTab === 'products' && (
        <div className='flex justify-center'>
          <Badge
            variant='outline'
            className='bg-yellow-50/50 text-yellow-700 border-yellow-200 flex gap-1.5 items-center px-3 py-1'
          >
            <WifiOff className='h-3 w-3' />
            Offline Mode
          </Badge>
        </div>
      )}

      {loading && catalogTab === 'products' ? (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-8'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='aspect-[3/4] w-full rounded-2xl' />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className='text-center py-16 md:py-24 space-y-3 px-4'>
          <p className='text-lg font-medium text-foreground'>
            {sourceItems.length === 0 && !searchQuery
              ? catalogTab === 'hampers'
                ? 'No hampers available'
                : 'No products in the shop yet'
              : 'No results found'}
          </p>
          <p className='text-sm text-muted-foreground max-w-md mx-auto'>
            {catalogTab === 'products' &&
            sourceItems.length === 0 &&
            !searchQuery
              ? 'Products are loaded from Firestore. An admin can import the catalog from the Admin dashboard.'
              : 'Try a different search term or switch categories.'}
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
