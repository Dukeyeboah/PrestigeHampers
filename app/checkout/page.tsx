'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useCart } from '@/hooks/use-cart';
import { TopNav } from '@/components/top-nav';
import { OrderSummary } from '@/components/editorial/order-summary';
import { GIFT_DETAILS_KEY, emptyGift, type GiftDetails } from '@/lib/gift-details';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { cart, total, isInitialized } = useCart();
  const [gift, setGift] = useState<GiftDetails | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try { const raw = sessionStorage.getItem(GIFT_DETAILS_KEY); if (raw) { const saved = { ...emptyGift, ...JSON.parse(raw) }; setGift(saved); setEmail(saved.buyerEmail); } } catch {}
    setReady(true);
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!gift || !cart.length || busy) return;
    setBusy(true);
    try {
      const updatedGift = { ...gift, buyerEmail: email.trim() };
      sessionStorage.setItem(GIFT_DETAILS_KEY, JSON.stringify(updatedGift));
      const payload = { items: cart.map(i => ({ id: i.id, quantity: i.quantity })), expectedAmount: Math.round(total * 100), gift: updatedGift, notes };
      const fingerprint = JSON.stringify(payload);
      let attempt: { id: string; fingerprint: string } | null = null;
      try { attempt = JSON.parse(sessionStorage.getItem('paystack_attempt') || 'null'); } catch {}
      if (!attempt || attempt.fingerprint !== fingerprint) { attempt = { id: crypto.randomUUID(), fingerprint }; sessionStorage.setItem('paystack_attempt', JSON.stringify(attempt)); }
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/paystack/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) }, body: JSON.stringify({ ...payload, attemptId: attempt.id }) });
      const result = await response.json();
      if (!response.ok) { if (!result.reference) sessionStorage.removeItem('paystack_attempt'); throw new Error(result.error || 'Unable to start payment.'); }
      sessionStorage.setItem('paystack_last_reference', result.reference);
      window.location.assign(result.authorizationUrl);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to start payment.'); setBusy(false); }
  }
  return <><TopNav /><main className='editorial-container flow-page'>
    <nav className='flow-steps'><Link href='/gift-details'>01 Order details</Link><span aria-current='step'>02 Payment details</span></nav>
    {!ready || !isInitialized ? <p>Loading checkout…</p> : !cart.length ? <div className='py-16'><h1>Your bag is empty</h1><Link className='editorial-button' href='/products#sets'>Choose a set</Link></div> : !gift?.buyerName || !gift?.buyerPhone ? <div className='py-16'><h1>Who’s it for?</h1><p>Let’s add your order details first.</p><Link className='editorial-button' href='/gift-details'>Add order details</Link></div> : <div className='flow-grid'>
      <form onSubmit={submit} onInvalidCapture={() => toast.error('Please enter a valid email for your payment receipt.', { id: 'payment-email' })}>
        <h1>Payment details</h1><p className='payment-test-banner'>Test checkout · No real money will be charged.</p>
        <p className='flow-intro'>Pay securely by Mobile Money or card through Paystack.</p>
        <section className='buyer-review'><p className='eyebrow'>Your details</p><h3>{gift.buyerName}</h3><p>{gift.buyerPhone}</p><Link href='/gift-details'>Edit order details</Link></section>
        <label>Email for your receipt<input type='email' required maxLength={254} autoComplete='email' value={email} onChange={e => setEmail(e.target.value)} /></label>
        <fieldset><legend>Payment method</legend><p>Choose Mobile Money or card on the secure Paystack payment screen.</p><p className='field-note'>MTN MoMo, Telecel Cash, ATMoney and cards.</p></fieldset>
        <label>Anything else? (optional)<textarea rows={3} maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} placeholder='Special instructions for your order' /></label>
        <p className='payment-delivery-note'>Payment covers your hampers only. Delivery charges, if applicable, will be confirmed separately after payment.</p>
        <button className='editorial-button checkout-submit' disabled={busy} type='submit'>{busy ? 'Opening secure payment…' : `Pay GHC ${total.toLocaleString('en-GH')} · Test payment`}</button>
        <p className='field-note'>Your order is confirmed once payment is verified. You can then discuss pickup or delivery with us on WhatsApp.</p>
      </form><div><OrderSummary /><section className='gift-review'><p className='eyebrow'>Pickup / delivery</p><p>{gift.deliveryOption === 'pickup' ? 'Pick up' : [gift.area, gift.region].filter(Boolean).join(', ')}{gift.date ? ` · Preferred ${gift.date}` : ''}</p><Link href='/gift-details'>Edit order details</Link></section></div>
    </div>}
  </main></>;
}
