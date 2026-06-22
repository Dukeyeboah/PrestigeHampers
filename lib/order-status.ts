import type { Order } from '@/types';

/** Legacy Firestore values mapped to current Prestige labels */
export function normalizeOrderStatus(status: string): Order['status'] {
  if (status === 'pharmacy_confirmed') return 'shop_confirmed';
  return status as Order['status'];
}

export function isShopConfirmed(status: string): boolean {
  return status === 'shop_confirmed' || status === 'pharmacy_confirmed';
}

export const ORDER_STATUS_LABELS: Record<Order['status'] | 'pharmacy_confirmed', string> = {
  pending: 'Pending',
  checking_stock: 'Checking Stock',
  shop_confirmed: 'Shop Confirmed',
  pharmacy_confirmed: 'Shop Confirmed',
  customer_confirmed: 'Customer Confirmed',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function formatOrderStatus(status: string): string {
  const key = normalizeOrderStatus(status);
  return ORDER_STATUS_LABELS[key] ?? status.replace(/_/g, ' ');
}
