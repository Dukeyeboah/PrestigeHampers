import { NextResponse } from 'next/server';
import { orderAdmin } from '@/lib/paystack/admin';
import { testSecret } from '@/lib/paystack/server';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    testSecret();
    return NextResponse.json({ admin: Boolean(await orderAdmin(request)) }, { headers });
  } catch {
    return NextResponse.json({ admin: false }, { status: 503, headers });
  }
}
