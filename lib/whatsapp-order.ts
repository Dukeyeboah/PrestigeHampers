import type { CartItem, User } from '@/types';

/** Prestige Hampers order WhatsApp — digits only for wa.me */
export const WHATSAPP_ORDER_CHAT_DIGITS = '14844674166';

export const WHATSAPP_PENDING_KEY = 'prestige_whatsapp_pending';
export const WHATSAPP_CHECKOUT_EVENT = 'prestige:whatsapp-checkout';

export function markWhatsAppCheckoutPending() {
  sessionStorage.setItem(WHATSAPP_PENDING_KEY, '1');
  window.dispatchEvent(new Event(WHATSAPP_CHECKOUT_EVENT));
}

const money = (value: number) => value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://prestigehampers.com'
  );
}

export function buildWhatsAppOrderMessage(opts: {
  items: CartItem[];
  total: number;
  user?: User | null;
  customerName?: string;
  contactPhone?: string;
  paymentMethod?: 'momo' | 'cash' | 'card';
  notes?: string;
  displayOrderId?: string;
}): string {
  const {
    items,
    total,
    user,
    contactPhone,
    customerName,
    paymentMethod,
    notes,
    displayOrderId,
  } = opts;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const lines: string[] = ['*Order from Prestige Hampers*', ''];

  if (displayOrderId) {
    lines.push(`*Order ID:* ${displayOrderId}`, '');
  }

  lines.push(
    'Hello Prestige Hampers,',
    '',
    'I would like to place the following order.',
    ''
  );

  if (!user && customerName?.trim()) lines.push(`*Ordered by:* ${customerName.trim()}`);
  if (user) {
    lines.push(`*Ordered by:* ${user.name || user.email || '—'}`);
    if (user.email) lines.push(`*Email:* ${user.email}`);
    if (user.phone) lines.push(`*Phone:* ${user.phone}`);
  }
  if (contactPhone?.trim()) {
    lines.push(`*Contact phone:* ${contactPhone.trim()}`);
  }
  if (paymentMethod) {
    const payLabel =
      paymentMethod === 'momo'
        ? 'MoMo'
        : paymentMethod === 'card'
          ? 'Card'
          : 'Cash';
    lines.push(`*Payment method:* ${payLabel}`);
  }
  if (notes?.trim()) {
    lines.push(`*Notes:* ${notes.trim()}`);
  }

  lines.push('', '————————————', '*ORDER LIST*', '————————————', '');

  items.forEach((item, i) => {
    const lineTotal = item.price * item.quantity;
    lines.push(
      `${i + 1}. *${item.name}*`,
      `Quantity: ${item.quantity}`,
      `Price each: ₵${money(item.price)}`,
      `Subtotal: ₵${money(lineTotal)}`,
      ''
    );
  });

  lines.push(
    '————————————',
    `*Grand total: ₵${money(total)}*`,
    `*${itemCount} item${itemCount === 1 ? '' : 's'} (${items.length} product${items.length === 1 ? '' : 's'})*`,
    '————————————',
    '',
    'Please confirm availability. Thank you.',
    '',
    `Submitted via ${siteBaseUrl()}`
  );

  return lines.join('\n');
}

export function whatsappOrderLaunchUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_ORDER_CHAT_DIGITS}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppUrl(
  url: string,
  existingWindow?: Window | null
): void {
  if (existingWindow && !existingWindow.closed) {
    existingWindow.location.href = url;
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
