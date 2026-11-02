'use client';

import type { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bookmark, ShoppingBag } from 'lucide-react';
import { LazyImage } from '@/components/lazy-image';
import { resolveProductImageUrl } from '@/lib/product-image';
import { useAuth } from '@/lib/auth-context';
import { useSavedProducts } from '@/hooks/use-saved-products';

interface HamperDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: () => void;
  onRequestLogin: () => void;
}

export function HamperDetailDialog({
  product,
  open,
  onOpenChange,
  onAddToCart,
  onRequestLogin,
}: HamperDetailDialogProps) {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedProducts();

  if (!product) return null;

  const imageSrc = resolveProductImageUrl(product);
  const contents = product.contents ?? [];
  const saved = isSaved(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleSave = async () => {
    if (!user) {
      onRequestLogin();
      return;
    }
    await toggleSave(product.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl p-0 overflow-hidden rounded-2xl max-h-[90vh] gap-0'>
        <div className='grid md:grid-cols-2 max-h-[90vh] md:max-h-[min(90vh,640px)]'>
          <div className='relative aspect-square md:aspect-auto md:min-h-[420px] bg-neutral-100'>
            {imageSrc ? (
              <LazyImage
                src={imageSrc}
                alt={product.name}
                className='absolute inset-0 w-full h-full object-cover'
              />
            ) : (
              <div className='absolute inset-0 flex items-center justify-center text-5xl font-serif text-neutral-300'>
                {product.name.charAt(0)}
              </div>
            )}
          </div>

          <div className='flex flex-col min-h-0 overflow-hidden'>
            <DialogHeader className='px-5 pt-5 pb-3 text-left space-y-1.5 shrink-0 pr-12'>
              <DialogTitle className='text-xl font-semibold tracking-tight'>
                {product.name}
              </DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground'>
                {product.description ||
                  'A thoughtfully curated hamper from Prestige Hampers.'}
              </DialogDescription>
              <p className='text-lg font-semibold text-foreground pt-1'>
                ₵{product.price.toFixed(2)}
              </p>
            </DialogHeader>

            <div className='flex-1 min-h-0 overflow-y-auto px-5 pb-2'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2'>
                What’s inside
              </p>
              {contents.length > 0 ? (
                <ul className='space-y-1.5 text-sm text-neutral-700'>
                  {contents.map((item) => (
                    <li key={item} className='flex gap-2'>
                      <span className='text-neutral-400 shrink-0'>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  Contents list coming soon.
                </p>
              )}
            </div>

            <div className='shrink-0 border-t px-5 py-4 flex flex-col sm:flex-row gap-2'>
              <Button
                className='flex-1 rounded-full h-11'
                disabled={isOutOfStock}
                onClick={() => {
                  onAddToCart();
                  onOpenChange(false);
                }}
              >
                <ShoppingBag className='mr-2 h-4 w-4' />
                {isOutOfStock ? 'Out of stock' : 'Add to cart'}
              </Button>
              <Button
                type='button'
                variant='outline'
                className='rounded-full h-11 sm:w-11 sm:px-0'
                onClick={handleSave}
                aria-label={saved ? 'Remove from saved' : 'Save hamper'}
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    saved ? 'fill-neutral-900 text-neutral-900' : ''
                  }`}
                />
                <span className='sm:hidden ml-2'>
                  {saved ? 'Saved' : 'Save'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
