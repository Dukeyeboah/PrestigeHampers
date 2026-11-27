import { NextRequest, NextResponse } from 'next/server';
import { CHECKOUTS, jsonError, orderDb, tokenHash, testSecret } from '@/lib/paystack/server';
import { confirmPayment, notifyMerchant } from '@/lib/paystack/finalize';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference') || '';
  if (!/^PH-TEST-[0-9a-f-]{36}$/.test(reference)) return NextResponse.json({ error: 'Invalid order reference.' }, { status: 400 });
  try {
    testSecret();
    const token = request.cookies.get(`ph_receipt_${reference.slice(8)}`)?.value;
    const snapshot = await orderDb().collection(CHECKOUTS).doc(reference).get();
    if (!snapshot.exists || !token || tokenHash(token) !== snapshot.data()?.tokenHash) return NextResponse.json({ error: 'Open this receipt in the browser where you placed the order.' }, { status: 403 });
    const order = await confirmPayment(reference);
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.paymentStatus === 'paid') await notifyMerchant(reference).catch(() => {});
    return NextResponse.json({ reference, status: order.paymentStatus, testMode: true,
      ...(order.paymentStatus === 'paid' ? { items: order.items.map((i: {id:string;name:string;quantity:number;price:number}) => ({ id:i.id, name:i.name, quantity:i.quantity, price:i.price })), total: order.amount / 100, name: order.gift.buyerName, phone: order.gift.buyerPhone, deliveryOption: order.gift.deliveryOption, paymentChannel: order.paymentChannel } : {}),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return jsonError(error, 'We could not confirm your payment yet. Please check again; do not pay again if you have already approved it.'); }
}
