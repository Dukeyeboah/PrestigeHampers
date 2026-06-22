/** Human-readable payment method label */
export function formatPaymentMethod(
  method?: 'momo' | 'cash' | 'card'
): string {
  switch (method) {
    case 'momo':
      return 'Mobile Money (MoMo)';
    case 'card':
      return 'Card (Stripe — pending)';
    case 'cash':
      return 'Cash on delivery / pickup';
    default:
      return 'Not specified';
  }
}

/** Extra payment lines for admin invoices and order cards */
export function formatOrderPaymentDetails(order: {
  paymentMethod?: 'momo' | 'cash' | 'card';
  cashPayerName?: string;
  cashPayerPhone?: string;
  userName?: string;
  userEmail?: string;
  customerPhone?: string;
}): string[] {
  const lines: string[] = [];
  if (order.paymentMethod) {
    lines.push(`Payment: ${formatPaymentMethod(order.paymentMethod)}`);
  }
  if (order.paymentMethod === 'cash' && order.cashPayerName) {
    lines.push(`Cash contact: ${order.cashPayerName} · ${order.cashPayerPhone || '—'}`);
  }
  if (order.userEmail) {
    lines.push(`Account: ${order.userName || '—'} · ${order.userEmail}`);
  }
  if (order.customerPhone) {
    lines.push(`Profile phone: ${order.customerPhone}`);
  }
  return lines;
}
