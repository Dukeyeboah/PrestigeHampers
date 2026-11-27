import 'server-only';
import { orderDb, CHECKOUTS, ORDERS, paystack } from './server';
import { assertPaidTransaction } from './validation';

export async function confirmPayment(reference: string, dependencies?: { db: ReturnType<typeof orderDb>; verify: (path: string) => Promise<any> }) {
  const db = dependencies?.db || orderDb();
  const ref = db.collection(CHECKOUTS).doc(reference);
  const snapshot = await ref.get();
  if (!snapshot.exists) return null;
  const order = snapshot.data()!;
  if (order.paymentStatus === 'paid') return order;
  const payment = await (dependencies?.verify || paystack)(`/transaction/verify/${encodeURIComponent(reference)}`);
  if (payment.status !== 'success') return { ...order, paymentStatus: ['failed', 'abandoned', 'reversed'].includes(payment.status) ? 'failed' : 'pending' };
  assertPaidTransaction(payment, { reference, amount: order.amount });
  // Both the webhook and browser return use this transaction: only one paid order is created.
  await db.runTransaction(async tx => {
    const latest = await tx.get(ref);
    if (latest.data()?.paymentStatus === 'paid') return;
    const paid = { paymentStatus: 'paid', paidAt: payment.paid_at || new Date().toISOString(), paymentChannel: payment.channel, paymentReference: reference, updatedAt: Date.now() };
    tx.update(ref, paid);
    tx.create(db.collection(ORDERS).doc(reference), {
      reference, testMode: true, userId: order.userId, userName: order.gift.buyerName,
      userEmail: order.gift.buyerEmail, customerPhone: order.gift.buyerPhone,
      items: order.items, total: order.amount / 100, currency: 'GHS', status: 'pending',
      deliveryOption: order.gift.deliveryOption, deliveryAddress: [order.gift.area, order.gift.region, order.gift.address].filter(Boolean).join(', '),
      giftDetails: order.gift, notes: order.notes, isGuest: !order.userId, createdAt: order.createdAt, ...paid,
      notificationStatus: 'pending', notificationTo: process.env.ORDER_NOTIFICATION_EMAIL || '',
    });
  });
  return (await ref.get()).data()!;
}

export async function notifyMerchant(reference: string) {
  const ref = orderDb().collection(ORDERS).doc(reference);
  const snapshot = await ref.get();
  if (!snapshot.exists) return;
  const order = snapshot.data()!;
  if (order.notificationStatus === 'sent') return;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_NOTIFICATION_FROM;
  if (!apiKey || !from || !order.notificationTo) {
    await ref.update({ notificationStatus: 'not_configured' });
    return;
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `paid-test-order-${reference}` },
    body: JSON.stringify({ from, to: [order.notificationTo], subject: `[TEST] Paid Prestige Hampers order ${reference}`, text: [
      'TEST ORDER — no real payment. Do not fulfil.', `Order: ${reference}`, `Customer: ${order.userName}`, `Email: ${order.userEmail}`, `Phone: ${order.customerPhone}`, '',
      ...order.items.map((i: { name: string; quantity: number; price: number }) => `${i.quantity} × ${i.name} — GHC ${(i.price * i.quantity).toFixed(2)}`),
      '', `Paid: GHC ${order.total.toFixed(2)}`, `Payment method: ${order.paymentChannel}`, `Fulfilment: ${order.deliveryOption}`, order.deliveryAddress, 'Delivery charges are separate and will be confirmed after payment.', order.notes,
    ].join('\n') }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Notification delivery failed.');
  await ref.update({ notificationStatus: 'sent', notificationSentAt: Date.now() });
}
