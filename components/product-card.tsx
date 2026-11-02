'use client';

import { useState } from 'react';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Bookmark, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoginDialog } from '@/components/login-dialog';
import { AddToCartDialog } from '@/components/add-to-cart-dialog';
import { HamperDetailDialog } from '@/components/hamper-detail-dialog';
import { LazyImage } from '@/components/lazy-image';
import { resolveProductImageUrl } from '@/lib/product-image';
import { useSavedProducts } from '@/hooks/use-saved-products';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { isHamperItem } from '@/lib/admin-inventory';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showHamperDetail, setShowHamperDetail] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedProducts();

  const isOutOfStock = product.stock <= 0;
  const saved = isSaved(product.id);
  const imageSrc = resolveProductImageUrl(product);
  const isHamper = isHamperItem(product);

  const handleSave = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    await toggleSave(product.id);
  };

  const openAddToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowAddDialog(true);
  };

  const imageBlock = (
    <div
      className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm transition-all duration-300 hover:shadow-md ${
        isHamper ? 'cursor-pointer' : ''
      }`}
      onClick={isHamper ? () => setShowHamperDetail(true) : undefined}
      role={isHamper ? 'button' : undefined}
      tabIndex={isHamper ? 0 : undefined}
      onKeyDown={
        isHamper
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowHamperDetail(true);
              }
            }
          : undefined
      }
    >
      {imageSrc && !imageError ? (
        <LazyImage
          src={imageSrc}
          alt={product.name}
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          onError={() => setImageError(true)}
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center'>
          <span className='text-4xl md:text-5xl font-serif text-neutral-300'>
            {product.name.charAt(0)}
          </span>
        </div>
      )}

      {isOutOfStock && (
        <div className='absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center'>
          <span className='text-[10px] md:text-xs font-medium uppercase tracking-wider text-neutral-600 bg-white/90 px-3 py-1.5 rounded-full'>
            Out of stock
          </span>
        </div>
      )}

      <button
        type='button'
        onClick={handleSave}
        className='absolute top-2.5 right-2.5 md:top-3 md:right-3 h-8 w-8 md:h-9 md:w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center transition-all hover:bg-white hover:scale-105 z-10'
        aria-label={saved ? 'Remove from saved' : 'Save for later'}
      >
        <Bookmark
          className={`h-3.5 w-3.5 md:h-4 md:w-4 transition-colors ${
            saved ? 'fill-neutral-900 text-neutral-900' : 'text-neutral-600'
          }`}
        />
      </button>
    </div>
  );

  return (
    <>
      <article className='group flex flex-col h-full'>
        {isHamper ? (
          <Tooltip>
            <TooltipTrigger asChild>{imageBlock}</TooltipTrigger>
            <TooltipContent side='top' className='text-xs'>
              Click for info
            </TooltipContent>
          </Tooltip>
        ) : (
          imageBlock
        )}

        <div className='pt-2.5 md:pt-3 px-0.5 space-y-2 flex-1 flex flex-col'>
          <h3
            className={`font-medium text-xs md:text-sm leading-snug line-clamp-2 text-foreground ${
              isHamper ? 'cursor-pointer hover:underline underline-offset-2' : ''
            }`}
            onClick={isHamper ? () => setShowHamperDetail(true) : undefined}
          >
            {product.name}
          </h3>

          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span className='truncate pr-1'>
              {isOutOfStock ? 'Unavailable' : `${product.stock} left`}
            </span>
            <span className='font-semibold text-sm text-foreground shrink-0'>
              ₵{product.price.toFixed(2)}
            </span>
          </div>

          <Button
            size='sm'
            className='w-full rounded-full h-8 md:h-9 mt-auto text-xs font-medium'
            variant={isOutOfStock ? 'outline' : 'default'}
            disabled={isOutOfStock}
            onClick={openAddToCart}
          >
            {isOutOfStock ? (
              'Notify me'
            ) : (
              <>
                <ShoppingBag className='mr-1.5 h-3.5 w-3.5' />
                Add to cart
              </>
            )}
          </Button>
        </div>
      </article>

      <AddToCartDialog
        product={product}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onConfirm={onAddToCart}
      />

      <HamperDetailDialog
        product={product}
        open={showHamperDetail}
        onOpenChange={setShowHamperDetail}
        onAddToCart={() => setShowAddDialog(true)}
        onRequestLogin={() => setShowLoginDialog(true)}
      />

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        defaultMode='signup'
      />
    </>
  );
}
