import { NextResponse } from 'next/server';
import { orderDb, ORDERS, signedInUser, testSecret, jsonError } from '@/lib/paystack/server';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    testSecret();
    const user = await signedInUser(request);
    // Use the verified Google/Firebase identity, not the client-editable profile role.
    const allowed = (process.env.PAYSTACK_TEST_ADMIN_EMAILS || process.env.ORDER_NOTIFICATION_EMAIL || '').split(',').map(x => x.trim().toLowerCase());
    if (!user?.email_verified || !user.email || !allowed.includes(user.email.toLowerCase())) return NextResponse.json({ error: 'Sign in with the test order administrator email.' }, { status: 403 });
    const snapshot = await orderDb().collection(ORDERS).orderBy('createdAt', 'desc').limit(100).get();
    return NextResponse.json({ orders: snapshot.docs.map(d => ({ ...d.data(), id: d.id })), emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.ORDER_NOTIFICATION_FROM) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return jsonError(error); }
}
