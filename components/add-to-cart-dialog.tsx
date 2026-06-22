'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

interface AddToCartDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (product: Product, quantity: number) => void;
}

export function AddToCartDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: AddToCartDialogProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) setQuantity(1);
  }, [open, product?.id]);

  if (!product) return null;

  const maxQty = Math.max(1, product.stock);

  const handleConfirm = () => {
    onConfirm(product, Math.min(quantity, product.stock));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm rounded-2xl gap-0 p-0 overflow-hidden'>
        <DialogHeader className='px-5 pt-5 pb-3 text-left'>
          <DialogTitle className='text-base font-semibold leading-snug pr-6'>
            {product.name}
          </DialogTitle>
          <DialogDescription className='text-sm'>
            ₵{product.price.toFixed(2)} · {product.stock} available
          </DialogDescription>
        </DialogHeader>

        <div className='px-5 py-4 flex items-center justify-between border-y border-neutral-100 bg-neutral-50/50'>
          <span className='text-sm font-medium text-neutral-700'>Quantity</span>
          <div className='flex items-center gap-3'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='h-9 w-9 rounded-full'
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label='Decrease quantity'
            >
              <Minus className='h-4 w-4' />
            </Button>
            <span className='w-8 text-center text-base font-semibold tabular-nums'>
              {quantity}
            </span>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='h-9 w-9 rounded-full'
              disabled={quantity >= maxQty}
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              aria-label='Increase quantity'
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='px-5 py-3 flex justify-between text-sm'>
          <span className='text-muted-foreground'>Subtotal</span>
          <span className='font-semibold'>
            ₵{(product.price * quantity).toFixed(2)}
          </span>
        </div>

        <DialogFooter className='px-5 pb-5 pt-1 gap-2 sm:gap-2'>
          <Button
            type='button'
            variant='outline'
            className='rounded-full flex-1'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            className='rounded-full flex-1'
            onClick={handleConfirm}
          >
            <ShoppingBag className='mr-1.5 h-4 w-4' />
            Add to cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
