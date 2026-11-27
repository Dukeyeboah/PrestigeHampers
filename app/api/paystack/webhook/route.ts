import { NextResponse } from 'next/server';
import { testSecret, jsonError } from '@/lib/paystack/server';
import { validWebhookSignature } from '@/lib/paystack/signature';
import { confirmPayment, notifyMerchant } from '@/lib/paystack/finalize';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request: Request) {
  const body = Buffer.from(await request.arrayBuffer());
  if (body.length > 1000000) return new Response('Too large', { status: 413 });
  try {
    if (!validWebhookSignature(body, request.headers, testSecret(), process.env.PAYSTACK_WEBHOOK_SECRET)) return new Response('Invalid signature', { status: 401 });
    const event = JSON.parse(body.toString('utf8'));
    if (event.event !== 'charge.success' || !/^PH-TEST-[0-9a-f-]{36}$/.test(event.data?.reference || '')) return NextResponse.json({ received: true });
    const order = await confirmPayment(event.data.reference);
    if (order?.paymentStatus === 'paid') await notifyMerchant(event.data.reference);
    // Acknowledge only after the durable order write. Failure returns 503 so Paystack retries.
    return NextResponse.json({ received: true });
  } catch (error) { return jsonError(error); }
}
