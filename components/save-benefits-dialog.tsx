'use client';

import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bookmark, ShoppingBag, Bell, Heart } from 'lucide-react';

interface SaveBenefitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignIn?: () => void;
}

export function SaveBenefitsDialog({
  open,
  onOpenChange,
  onSignIn,
}: SaveBenefitsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md rounded-2xl'>
        <DialogHeader className='text-center sm:text-center'>
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100'>
            <Bookmark className='h-5 w-5 text-neutral-700' />
          </div>
          <DialogTitle className='text-xl font-semibold'>
            Save items for later
          </DialogTitle>
          <DialogDescription className='text-base'>
            Create a free account to bookmark products and never lose track of
            what you love.
          </DialogDescription>
        </DialogHeader>

        <ul className='space-y-3 py-2'>
          <li className='flex items-start gap-3 text-sm text-muted-foreground'>
            <Heart className='h-4 w-4 mt-0.5 text-neutral-500 shrink-0' />
            <span>Save favourites and build your wishlist over time</span>
          </li>
          <li className='flex items-start gap-3 text-sm text-muted-foreground'>
            <ShoppingBag className='h-4 w-4 mt-0.5 text-neutral-500 shrink-0' />
            <span>Keep your cart safe — come back anytime without losing items</span>
          </li>
          <li className='flex items-start gap-3 text-sm text-muted-foreground'>
            <Bell className='h-4 w-4 mt-0.5 text-neutral-500 shrink-0' />
            <span>Get updates on promos, new hampers, and special offers</span>
          </li>
        </ul>

        <div className='flex flex-col gap-2 pt-2'>
          {onSignIn ? (
            <Button
              className='w-full rounded-full h-11'
              onClick={() => {
                onOpenChange(false);
                onSignIn();
              }}
            >
              Sign up / Sign in
            </Button>
          ) : (
            <Button className='w-full rounded-full h-11' asChild>
              <Link href='/login'>Sign up / Sign in</Link>
            </Button>
          )}
          <Button
            variant='ghost'
            className='w-full rounded-full text-muted-foreground'
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
