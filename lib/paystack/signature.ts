import { createHmac, timingSafeEqual } from 'node:crypto';
function matches(body: Buffer, signature: string, secret: string) {
  return /^[0-9a-f]{128}$/.test(signature) && timingSafeEqual(createHmac('sha512', secret).update(body).digest(), Buffer.from(signature, 'hex'));
}
export function validWebhookSignature(body: Buffer, headers: Headers, apiSecret: string, webhookSecret?: string, now = Math.floor(Date.now() / 1000)) {
  const modern = headers.get('paystack-signature');
  if (modern && webhookSecret) {
    const parts = modern.split(',').map(p => p.trim());
    const stamps = parts.filter(p => p.startsWith('t='));
    if (stamps.length !== 1 || !/^t=\d+$/.test(stamps[0])) return false;
    const timestamp = Number(stamps[0].slice(2));
    if (Math.abs(now - timestamp) > 300) return false;
    const signed = Buffer.concat([Buffer.from(`${timestamp}.`), body]);
    return parts.filter(p => p.startsWith('v1=')).some(p => matches(signed, p.slice(p.indexOf(':') + 1), webhookSecret));
  }
  // Paystack still sends this signature for integrations using an API secret key.
  return matches(body, headers.get('x-paystack-signature') || '', apiSecret);
}
