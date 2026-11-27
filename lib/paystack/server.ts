import { NextResponse } from 'next/server';
import 'server-only';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createHash, createHmac } from 'node:crypto';

export const CHECKOUTS = 'paystack_test_checkouts';
export const ORDERS = 'paystack_test_orders';
export function testSecret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key?.startsWith('sk_test_')) throw new Error('Paystack test checkout is not configured.');
  if (process.env.VERCEL_ENV === 'production') throw new Error('This checkout is only enabled on the test preview.');
  return key;
}
function adminApp() {
  const existing = getApps().find(a => a.name === 'paystack-server');
  if (existing) return existing;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('The secure order database is not configured yet.');
  const serviceAccount = JSON.parse(raw);
  if (serviceAccount.project_id !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) throw new Error('Order database project does not match the storefront.');
  return initializeApp({ credential: cert(serviceAccount) }, 'paystack-server');
}
export const orderDb = () => getFirestore(adminApp());
export async function signedInUser(request: Request) {
  const header = request.headers.get('authorization');
  if (!header) return null;
  if (!header.startsWith('Bearer ')) throw new Error('Please sign in again.');
  return getAuth(adminApp()).verifyIdToken(header.slice(7));
}
export function accessToken(reference: string) {
  return createHmac('sha256', testSecret()).update(`receipt:${reference}`).digest('hex');
}
export function tokenHash(token: string) { return createHash('sha256').update(token).digest('hex'); }
export async function paystack(path: string, body?: unknown) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${testSecret()}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store', signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok || !result.status) throw new Error('Paystack could not complete the request. Please check the payment status before trying again.');
  return result.data;
}
export function jsonError(error: unknown, fallback = 'Unable to complete this request. Please try again.') {
  // Do not expose upstream errors, credentials or database configuration details.
  console.error('Paystack request failed:', error instanceof Error ? error.name : 'Unknown error');
  return NextResponse.json({ error: fallback }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
