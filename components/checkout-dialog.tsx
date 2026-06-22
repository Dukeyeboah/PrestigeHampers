'use client';

import { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/hooks/use-cart';
import { notifyAdminsOfNewOrder } from '@/lib/notifications';
import { MOMO_NUMBER } from '@/lib/payment-config';
import type { Order } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (orderId: string) => void;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  onSuccess,
}: CheckoutDialogProps) {
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'momo' | 'card'>(
    'cash'
  );
  const [notes, setNotes] = useState('');
  const [cashPayerName, setCashPayerName] = useState('');
  const [cashPayerPhone, setCashPayerPhone] = useState('');

  useEffect(() => {
    if (open && user) {
      setCashPayerName(user.name || '');
      setCashPayerPhone(user.phone || '');
    }
  }, [open, user]);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order.');
      return;
    }

    if (!db) {
      toast.error('Unable to connect. Please try again.');
      return;
    }

    if (paymentMethod === 'card') {
      toast.info('Card payments via Stripe are coming soon. Please choose Cash or MoMo.');
      return;
    }

    if (paymentMethod === 'cash') {
      if (!cashPayerName.trim() || !cashPayerPhone.trim()) {
        toast.error('Please enter your name and phone number for cash payment.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const calculatedTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const newOrder: Omit<Order, 'id'> = {
        userId: user.id,
        userName: user.name || cashPayerName.trim() || '',
        userEmail: user.email,
        customerPhone: user.phone || undefined,
        items: cart,
        status: 'pending',
        total: calculatedTotal,
        paymentMethod,
        notes: notes.trim() || undefined,
        isGuest: false,
        ...(paymentMethod === 'cash' && {
          cashPayerName: cashPayerName.trim(),
          cashPayerPhone: cashPayerPhone.trim(),
        }),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'orders'), newOrder);

      await notifyAdminsOfNewOrder(
        docRef.id,
        user.name || user.email,
        calculatedTotal,
        cart.reduce((n, i) => n + i.quantity, 0)
      );

      clearCart();
      onOpenChange(false);
      onSuccess(docRef.id);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)]'>
        <DialogHeader>
          <DialogTitle>Complete your order</DialogTitle>
          <DialogDescription>
            Total: <strong>₵{total.toFixed(2)}</strong> · {cart.length} item
            {cart.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 py-2'>
          <div className='space-y-3'>
            <Label>Payment method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) =>
                setPaymentMethod(v as 'cash' | 'momo' | 'card')
              }
              className='grid gap-2'
            >
              <label
                htmlFor='pay-cash'
                className='flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-neutral-50 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50'
              >
                <RadioGroupItem value='cash' id='pay-cash' />
                <Banknote className='h-4 w-4 text-neutral-600 shrink-0' />
                <span className='text-sm font-medium'>Pay with cash</span>
              </label>
              <label
                htmlFor='pay-momo'
                className='flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-neutral-50 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50'
              >
                <RadioGroupItem value='momo' id='pay-momo' />
                <Smartphone className='h-4 w-4 text-neutral-600 shrink-0' />
                <span className='text-sm font-medium'>Mobile Money (MoMo)</span>
              </label>
              <label
                htmlFor='pay-card'
                className='flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-neutral-50 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50'
              >
                <RadioGroupItem value='card' id='pay-card' />
                <CreditCard className='h-4 w-4 text-neutral-600 shrink-0' />
                <span className='text-sm font-medium'>
                  Pay by card{' '}
                  <span className='text-muted-foreground font-normal'>
                    (Stripe — coming soon)
                  </span>
                </span>
              </label>
            </RadioGroup>

            {paymentMethod === 'cash' && (
              <div className='space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4'>
                <p className='text-sm text-muted-foreground'>
                  Cash payment — we&apos;ll contact you to arrange collection or
                  delivery. Please confirm your details below.
                </p>
                <div className='space-y-1.5'>
                  <Label htmlFor='cash-name'>Full name</Label>
                  <Input
                    id='cash-name'
                    value={cashPayerName}
                    onChange={(e) => setCashPayerName(e.target.value)}
                    placeholder='Your name'
                    className='rounded-xl bg-white'
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='cash-phone'>Phone number</Label>
                  <Input
                    id='cash-phone'
                    type='tel'
                    value={cashPayerPhone}
                    onChange={(e) => setCashPayerPhone(e.target.value)}
                    placeholder='0244123456'
                    className='rounded-xl bg-white'
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'momo' && (
              <Alert>
                <AlertDescription className='text-sm'>
                  Send payment to MoMo number:{' '}
                  <strong className='font-mono'>{MOMO_NUMBER}</strong>
                  <br />
                  <span className='text-muted-foreground'>
                    Use your order reference in the payment description after
                    placing the order.
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {paymentMethod === 'card' && (
              <Alert className='bg-neutral-50'>
                <AlertDescription className='text-sm text-muted-foreground'>
                  Card payments will be available soon via Stripe. Please select
                  Cash or MoMo to complete your order today.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='order-notes'>Order notes (optional)</Label>
            <Input
              id='order-notes'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Delivery instructions, gift message, etc.'
              className='rounded-xl'
            />
          </div>
        </div>

        <DialogFooter className='gap-2 flex-col-reverse sm:flex-row'>
          <Button
            variant='outline'
            className='rounded-full w-full sm:w-auto'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className='rounded-full w-full sm:w-auto min-w-[140px]'
            onClick={handlePlaceOrder}
            disabled={isSubmitting || paymentMethod === 'card'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Placing order…
              </>
            ) : (
              'Place order'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
