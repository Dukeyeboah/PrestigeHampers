import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { checkoutSchema, priceOrder, type CheckoutInput } from '@/lib/paystack/validation';
import { accessToken, CHECKOUTS, jsonError, orderDb, paystack, signedInUser, testSecret, tokenHash } from '@/lib/paystack/server';
import { mergeHamperCatalogWithFirestore } from '@/lib/admin-inventory';
import { withResolvedImage } from '@/lib/product-image';
import type { Product } from '@/types';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid checkout origin.' }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 20000) return NextResponse.json({ error: 'Order is too large.' }, { status: 413 });
  let input: CheckoutInput;
  try { input = checkoutSchema.parse(JSON.parse(raw)); }
  catch { return NextResponse.json({ error: 'Please check your name, email, phone number, delivery details and bag quantities.' }, { status: 400 }); }
  try {
    testSecret();
    const db = orderDb();
    const user = await signedInUser(request);
    // A small durable limiter avoids unbounded payment initialization on the public preview.
    const bucket = Math.floor(Date.now() / 60000);
    const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'local';
    const limitRef = db.collection('paystack_test_limits').doc(createHash('sha256').update(`${ip}:${bucket}`).digest('hex'));
    const allowed = await db.runTransaction(async tx => {
      const snap = await tx.get(limitRef); const count = snap.data()?.count || 0;
      if (count >= 10) return false;
      tx.set(limitRef, { count: count + 1, expiresAt: new Date(Date.now() + 3600000) }); return true;
    });
    if (!allowed) return NextResponse.json({ error: 'Please wait a minute before trying again.' }, { status: 429 });
    const inventory = await db.collection('inventory').get();
    const products = inventory.docs.map(d => ({ ...d.data(), id: d.id }) as Product);
    const catalog = mergeHamperCatalogWithFirestore(products).map(withResolvedImage);
    const { items, amount } = priceOrder(input.items, catalog);
    if (amount !== input.expectedAmount) return NextResponse.json({ error: 'Prices have changed. Please refresh your bag before paying.' }, { status: 409 });
    const reference = `PH-TEST-${input.attemptId}`;
    const receiptToken = accessToken(reference);
    const ref = db.collection(CHECKOUTS).doc(reference);
    const fingerprint = createHash('sha256').update(JSON.stringify({ items: input.items, amount, gift: input.gift, notes: input.notes, userId: user?.uid || null })).digest('hex');
    const existing = await db.runTransaction(async tx => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) return snapshot.data()!;
      tx.create(ref, JSON.parse(JSON.stringify({ reference, fingerprint, items, amount, gift: input.gift, notes: input.notes,
        userId: user?.uid || null, paymentStatus: 'pending', tokenHash: tokenHash(receiptToken), createdAt: Date.now(), updatedAt: Date.now() })));
      return null;
    });
    if (existing && existing.fingerprint !== fingerprint) return NextResponse.json({ error: 'Your order has changed. Please restart checkout.' }, { status: 409 });
    const resultPath = `/checkout/result?reference=${encodeURIComponent(reference)}`;
    let url = existing?.authorizationUrl;
    if (existing?.paymentStatus === 'paid') url = resultPath;
    else if (existing && !url) return NextResponse.json({ error: 'Payment is being prepared. Please wait, then check its status.', reference }, { status: 409 });
    if (!url) {
      const initialized = await paystack('/transaction/initialize', {
        email: input.gift.buyerEmail, amount, currency: 'GHS', reference, channels: ['card', 'mobile_money'],
        callback_url: `${request.nextUrl.origin}${resultPath}`,
        metadata: { order_reference: reference, test_order: true,
          custom_fields: [
            { display_name: 'Order number', variable_name: 'order_number', value: reference },
            { display_name: 'Items', variable_name: 'items', value: items.map(i => `${i.quantity} × ${i.name}`).join('; ') },
            { display_name: 'Fulfilment', variable_name: 'fulfilment', value: `${input.gift.deliveryOption}; delivery fees confirmed separately after payment` },
          ],
          cancel_action: `${request.nextUrl.origin}${resultPath}&cancelled=1`,
        },
      });
      const checkoutUrl = new URL(initialized.authorization_url);
      if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.paystack.com') throw new Error('Invalid payment destination.');
      url = checkoutUrl.href;
      await ref.update({ authorizationUrl: url });
    }
    const response = NextResponse.json({ authorizationUrl: url, reference, testMode: true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(`ph_receipt_${input.attemptId}`, receiptToken, { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/api/paystack', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) { return jsonError(error, 'Test payment could not start. Please try again shortly; if this continues, contact us to check the preview configuration.'); }
}
