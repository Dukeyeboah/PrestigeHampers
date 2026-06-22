'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatOrderStatus, isShopConfirmed } from '@/lib/order-status';
import { LoginDialog } from '@/components/login-dialog';

export default function OrdersPage() {
  const { user, loading: authLoading, isAdmin, viewMode } = useAuth();
  const showPrice = isAdmin || viewMode === 'admin';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    if (!db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'orders'), where('userId', '==', user.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        fetchedOrders.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error: unknown) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant='secondary'
            className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
          >
            <Clock className='mr-1 h-3 w-3' /> Pending
          </Badge>
        );
      case 'checking_stock':
        return (
          <Badge
            variant='secondary'
            className='bg-blue-100 text-blue-800 hover:bg-blue-100'
          >
            Checking Stock
          </Badge>
        );
      case 'shop_confirmed':
      case 'pharmacy_confirmed':
        return (
          <Badge variant='default' className='bg-primary hover:bg-primary'>
            Ready for Verification
          </Badge>
        );
      case 'customer_confirmed':
        return (
          <Badge variant='default' className='bg-green-600 hover:bg-green-600'>
            <CheckCircle2 className='mr-1 h-3 w-3' /> Verified
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant='default' className='bg-blue-600 hover:bg-blue-600'>
            <Package className='mr-1 h-3 w-3' /> Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant='default' className='bg-green-600 hover:bg-green-600'>
            <CheckCircle2 className='mr-1 h-3 w-3' /> Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant='destructive'>
            <AlertCircle className='mr-1 h-3 w-3' /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant='outline'>{formatOrderStatus(status)}</Badge>;
    }
  };

  const pageHeader = (
    <div className='text-center space-y-1'>
      <h1 className='text-2xl md:text-3xl font-semibold tracking-tight'>
        My Orders
      </h1>
      <p className='text-sm text-muted-foreground'>
        Track your hamper orders in one place
      </p>
    </div>
  );

  if (authLoading || (user && loading)) {
    return (
      <div className='space-y-6'>
        {pageHeader}
        {[1, 2].map((i) => (
          <Skeleton key={i} className='h-32 w-full rounded-2xl' />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className='text-center py-16 md:py-24 space-y-4 px-2'>
        <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100'>
          <ClipboardList className='h-6 w-6 text-neutral-600' />
        </div>
        {pageHeader}
        <p className='text-muted-foreground max-w-md mx-auto text-sm'>
          Sign in to view your order history. Orders are saved to your account
          so you can track status and confirmations anytime.
        </p>
        <Button className='rounded-full' onClick={() => setShowLogin(true)}>
          Sign in to view orders
        </Button>
        <LoginDialog
          open={showLogin}
          onOpenChange={setShowLogin}
          defaultMode='login'
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className='space-y-6'>
        {pageHeader}
        <div className='text-center py-12 md:py-16 border rounded-2xl bg-card px-4'>
          <Package className='mx-auto h-12 w-12 text-muted-foreground/50' />
          <h3 className='mt-4 text-lg font-medium'>No orders yet</h3>
          <p className='text-muted-foreground text-sm mt-1'>
            Place your first order from our product collection.
          </p>
          <Button asChild className='rounded-full mt-6'>
            <Link href='/inventory'>Browse products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 md:space-y-8'>
      {pageHeader}

      <div className='space-y-4'>
        {orders.map((order) => (
          <Card key={order.id} className='overflow-hidden rounded-2xl'>
            <CardHeader className='bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 px-4 md:px-6'>
              <div className='space-y-1 min-w-0'>
                <CardTitle className='text-base font-mono'>
                  #{order.id.slice(0, 8)}
                </CardTitle>
                <p className='text-xs text-muted-foreground'>
                  {format(order.createdAt, 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
              <div className='flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto'>
                {showPrice && (
                  <span className='font-bold text-sm md:text-base'>
                    ₵{(order.total + (order.deliveryFee || 0)).toFixed(2)}
                  </span>
                )}
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className='p-4 md:p-6'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  {order.items.map((item) => (
                    <div key={item.id} className='flex justify-between gap-2 text-sm'>
                      <span className='min-w-0'>
                        <span className='font-medium'>{item.quantity}×</span>{' '}
                        <span className='line-clamp-2'>{item.name}</span>
                      </span>
                      {showPrice && (
                        <span className='text-muted-foreground shrink-0'>
                          ₵{(item.price * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {order.deliveryOption && (
                  <div className='pt-2 border-t text-sm space-y-0.5'>
                    <p className='text-muted-foreground'>
                      Delivery:{' '}
                      {order.deliveryOption === 'delivery'
                        ? 'Home Delivery'
                        : 'Store Pickup'}
                    </p>
                    {order.deliveryFee && order.deliveryFee > 0 && (
                      <p className='text-muted-foreground'>
                        Delivery Fee: ₵{order.deliveryFee.toFixed(2)}
                      </p>
                    )}
                    {order.paymentMethod && (
                      <p className='text-muted-foreground'>
                        Payment:{' '}
                        {order.paymentMethod === 'momo'
                          ? 'Mobile Money (MoMo)'
                          : 'Cash'}
                      </p>
                    )}
                  </div>
                )}

                {showPrice && (
                  <div className='pt-2 border-t flex justify-between font-bold text-sm md:text-base'>
                    <span>Total</span>
                    <span>
                      ₵{(order.total + (order.deliveryFee || 0)).toFixed(2)}
                    </span>
                  </div>
                )}

                {isShopConfirmed(order.status) && (
                  <Link href={`/orders/${order.id}`}>
                    <Button className='w-full mt-2 rounded-full'>
                      Verify & Confirm Order
                      <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
