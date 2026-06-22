'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resolveProductImageUrl } from '@/lib/product-image';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  Trash2,
  ShoppingBag,
  Minus,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { CheckoutDialog } from '@/components/checkout-dialog';
import { LoginDialog } from '@/components/login-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    setQuantity,
    total,
    isInitialized,
  } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [orderConfirmId, setOrderConfirmId] = useState<string | null>(null);

  const handleCheckout = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setCheckoutOpen(true);
  };

  if (!isInitialized) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900' />
        <p className='text-muted-foreground text-sm'>Loading cart…</p>
      </div>
    );
  }

  if (cart.length === 0 && !orderConfirmId) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center px-4'>
        <div className='bg-neutral-100 p-5 md:p-6 rounded-full'>
          <ShoppingBag className='h-10 w-10 md:h-12 md:w-12 text-neutral-400' />
        </div>
        <h2 className='text-xl md:text-2xl font-semibold tracking-tight'>Your cart is empty</h2>
        <p className='text-muted-foreground max-w-sm text-sm'>
          Browse our collection and add items to get started.
        </p>
        <Button
          onClick={() => router.push('/inventory')}
          className='mt-2 rounded-full'
        >
          See products
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6 md:space-y-8 pb-4'>
      <h1 className='text-2xl md:text-3xl font-semibold tracking-tight text-center'>
        Your cart
      </h1>

      <div className='grid gap-6 lg:gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-3 md:space-y-4'>
          {cart.map((item) => {
            const itemImage = resolveProductImageUrl(item);
            return (
            <div
              key={item.id}
              className='flex gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border border-neutral-200 bg-white'
            >
              <div className='h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100'>
                {itemImage ? (
                  <img
                    src={itemImage}
                    alt={item.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-xl md:text-2xl text-neutral-300 font-serif'>
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className='flex-1 min-w-0 flex flex-col justify-between gap-2'>
                <div className='flex justify-between gap-2'>
                  <div className='min-w-0'>
                    <h3 className='font-medium text-sm line-clamp-2'>{item.name}</h3>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      ₵{item.price.toFixed(2)} each
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 flex-shrink-0 text-neutral-400 hover:text-red-600 -mr-1'
                    onClick={() => removeFromCart(item.id)}
                    aria-label='Remove item'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8 rounded-full'
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className='h-3 w-3' />
                    </Button>
                    <Input
                      type='number'
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) =>
                        setQuantity(item.id, parseInt(e.target.value, 10) || 1)
                      }
                      className='w-12 h-8 text-center text-sm rounded-lg px-1'
                    />
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8 rounded-full'
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className='h-3 w-3' />
                    </Button>
                  </div>
                  <p className='font-semibold text-sm'>
                    ₵{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <div className='h-fit lg:sticky lg:top-20'>
          <div className='rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 space-y-4'>
            <h2 className='font-semibold text-lg'>Order summary</h2>

            <div className='space-y-2 text-sm max-h-40 overflow-y-auto'>
              {cart.map((item) => (
                <div key={item.id} className='flex justify-between text-muted-foreground gap-2'>
                  <span className='truncate'>
                    {item.quantity}× {item.name}
                  </span>
                  <span className='flex-shrink-0'>
                    ₵{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className='flex justify-between font-semibold text-lg'>
              <span>Total</span>
              <span>₵{total.toFixed(2)}</span>
            </div>

            <Button
              className='w-full rounded-full h-11'
              size='lg'
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              {user ? 'Checkout' : 'Sign in to checkout'}
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>

            <p className='text-xs text-center text-muted-foreground'>
              {user
                ? 'Orders are saved to your account for easy tracking.'
                : 'An account is required to place orders and view order history.'}
            </p>
          </div>
        </div>
      </div>

      {user && (
        <CheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          onSuccess={(orderId) => setOrderConfirmId(orderId)}
        />
      )}

      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        defaultMode='login'
      />

      <Dialog open={!!orderConfirmId} onOpenChange={() => setOrderConfirmId(null)}>
        <DialogContent className='rounded-2xl sm:max-w-md text-center w-[calc(100%-2rem)]'>
          <DialogHeader className='items-center'>
            <div className='mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100'>
              <CheckCircle2 className='h-7 w-7 text-green-600' />
            </div>
            <DialogTitle>Order placed!</DialogTitle>
            <DialogDescription>
              Your order{' '}
              <strong className='font-mono'>#{orderConfirmId?.slice(0, 8)}</strong>{' '}
              has been received. Track it anytime from My Orders.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-2 pt-2'>
            <Button className='rounded-full' asChild>
              <Link href='/orders'>View my orders</Link>
            </Button>
            <Button variant='outline' className='rounded-full' asChild>
              <Link href='/inventory'>Continue shopping</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
