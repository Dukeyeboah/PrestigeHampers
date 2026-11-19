'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WHATSAPP_CHECKOUT_EVENT, WHATSAPP_PENDING_KEY } from '@/lib/whatsapp-order';

export function WhatsAppReturnDialog() {
  const { clearCart } = useCart();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Keep this prompt across navigation/reloads, including mobile app handoffs.
    const checkPending = () => {
      if (sessionStorage.getItem(WHATSAPP_PENDING_KEY)) setOpen(true);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkPending();
    };
    checkPending();
    window.addEventListener(WHATSAPP_CHECKOUT_EVENT, checkPending);
    window.addEventListener('focus', checkPending);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(WHATSAPP_CHECKOUT_EVENT, checkPending);
      window.removeEventListener('focus', checkPending);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  const dismiss = () => {
    sessionStorage.removeItem(WHATSAPP_PENDING_KEY);
    setOpen(false);
  };
  return <Dialog open={open} onOpenChange={value => { if (!value) dismiss(); }}>
    <DialogContent className='sm:max-w-md rounded-2xl'>
      <DialogHeader>
        <DialogTitle>Did you send your order on WhatsApp?</DialogTitle>
        <DialogDescription>
          If you sent the message, you can clear your cart. If you haven’t sent it yet or want to keep shopping, keep your items here.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className='gap-2 sm:flex-col'>
        <Button className='w-full rounded-lg' onClick={() => { clearCart(); dismiss(); }}>Yes, I sent it — clear cart</Button>
        <Button variant='outline' className='w-full rounded-lg' onClick={dismiss}>Keep my items</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
