import { z } from 'zod';
import { normalizePhone, GHANA_REGIONS } from '../phone-number';
import type { CountryCode } from 'libphonenumber-js';
import type { Product, CartItem } from '../../types';

export const checkoutSchema = z.object({
  attemptId: z.string().uuid(),
  items: z.array(z.object({ id: z.string().min(1).max(150), quantity: z.number().int().min(1).max(99) })).min(1).max(30),
  expectedAmount: z.number().int().positive(),
  gift: z.object({
    buyerName: z.string().trim().min(2).max(100),
    buyerEmail: z.string().trim().email().max(254),
    buyerPhone: z.string().min(5).max(40),
    buyerCountry: z.string().regex(/^[A-Z]{2}$/),
    buyerPhoneKind: z.enum(['local', 'whatsapp']),
    deliveryOption: z.enum(['pickup', 'delivery']),
    region: z.string().max(60), area: z.string().trim().max(200), address: z.string().trim().max(500),
    date: z.string().max(10).refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Invalid date'),
  }).superRefine((g, ctx) => {
    if (!normalizePhone(g.buyerPhone, g.buyerCountry as CountryCode, g.buyerPhoneKind)) ctx.addIssue({ code: 'custom', message: 'Please enter a valid phone number.' });
    if (g.deliveryOption === 'delivery' && (!GHANA_REGIONS.includes(g.region) || !g.area || !g.address)) ctx.addIssue({ code: 'custom', message: 'Please complete your delivery address and region.' });
  }).transform(g => ({ ...g, buyerPhone: normalizePhone(g.buyerPhone, g.buyerCountry as CountryCode, g.buyerPhoneKind)! })),
  notes: z.string().trim().max(1000).default(''),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export function priceOrder(requested: CheckoutInput['items'], catalog: Product[]) {
  const seen = new Set<string>();
  const items: CartItem[] = requested.map(({ id, quantity }) => {
    if (seen.has(id)) throw new Error('Duplicate item. Please refresh your bag.');
    seen.add(id);
    const product = catalog.find(p => p.id === id && !p.isHidden);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(product.stock, 99)) throw new Error('An item is unavailable in this quantity. Please review your bag.');
    if (!Number.isFinite(product.price) || product.price <= 0) throw new Error('This item is not available for payment.');
    return { ...product, quantity };
  });
  const amount = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100_000_000) throw new Error('Please contact us for an order of this size.');
  return { items, amount };
}

export function assertPaidTransaction(data: { status: string; reference: string; amount: number; currency: string; domain: string }, order: { reference: string; amount: number }) {
  if (data.status !== 'success' || data.reference !== order.reference || data.amount !== order.amount || data.currency !== 'GHS' || data.domain !== 'test') {
    throw new Error('Payment did not match the expected test order.');
  }
}
