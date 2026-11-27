'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/top-nav';
import { useCart } from '@/hooks/use-cart';
import { whatsappOrderLaunchUrl } from '@/lib/whatsapp-order';

type Receipt = { reference: string; status: string; total?: number; name?: string; phone?: string; deliveryOption?: string; paymentChannel?: string; items?: { id: string; name: string; quantity: number; price: number }[] };
export default function PaymentResult() {
  const [reference, setReference] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [removed, setRemoved] = useState(false);
  const { removePurchasedItems, isInitialized } = useCart();
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('reference') || sessionStorage.getItem('paystack_last_reference') || '';
    setReference(ref); if (!ref) setError('No payment reference found. Please return to checkout.');
    setRemoved(localStorage.getItem(`paid_bag_removed_${ref}`) === 'yes');
  }, []);
  const check = useCallback(async (signal?: AbortSignal) => {
    if (!reference) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, { cache: 'no-store', signal });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('The payment service is temporarily unavailable. Please check again shortly.');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not check payment.');
      setReceipt(result);
    } catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : 'Could not check payment.'); }
    finally { if (!signal?.aborted) setBusy(false); }
  }, [reference]);
  useEffect(() => { const controller = new AbortController(); void check(controller.signal); return () => controller.abort(); }, [check]);
  useEffect(() => {
    if (receipt?.status !== 'pending') return;
    let count = 0;
    const timer = setInterval(() => { if (++count > 12) clearInterval(timer); else void check(); }, 10000);
    return () => clearInterval(timer);
  }, [receipt?.status, check]);
  const paid = receipt?.status === 'paid';
  const message = paid ? [
    '*TEST ORDER — no real payment; do not fulfil*', '*Prestige Hampers — payment confirmed*', `Order: ${reference}`, '',
    ...(receipt.items || []).map(i => `• ${i.quantity} × ${i.name} — GHC ${(i.quantity * i.price).toFixed(2)}`), '',
    `Total paid (test): GHC ${receipt.total?.toFixed(2)}`, `Payment method: ${receipt.paymentChannel}`, `Name: ${receipt.name}`, `Phone: ${receipt.phone}`, `Pickup / delivery: ${receipt.deliveryOption}`,
    'Please confirm pickup or delivery arrangements. Any delivery charges are separate.',
  ].join('\n') : '';
  return <><TopNav /><main className='editorial-container flow-page payment-result'>
    <p className='payment-test-banner'>Test checkout · No real money charged.</p>
    <h1>{paid ? 'Thank you. Your order is confirmed.' : receipt?.status === 'failed' ? 'Payment wasn’t completed.' : 'Checking your payment.'}</h1>
    {error && <p role='alert' className='form-error'>{error}</p>}
    {!paid && <><p>{receipt?.status === 'pending' ? 'We’re waiting for Paystack to confirm your payment. If you approved a MoMo prompt, please don’t pay again while it is processing.' : 'Your bag is still saved. Only a verified successful payment confirms an order.'}</p><button className='editorial-button' disabled={busy || !reference} onClick={() => void check()}>{busy ? 'Checking…' : 'Check payment status'}</button><p><Link href='/checkout' onClick={() => { if (receipt?.status === 'failed') sessionStorage.removeItem('paystack_attempt'); }}>Return to checkout</Link></p></>}
    {paid && <>
      <p>Your test order has been saved. You don’t need to send a WhatsApp message to complete it.</p>
      <p className='payment-reference'>Order reference: {reference}</p>
      <section className='editorial-summary'><p className='eyebrow'>Payment confirmed</p>{receipt.items?.map(i => <div className='paid-line' key={i.id}><span>{i.quantity} × {i.name}</span><strong>GHC {(i.price * i.quantity).toLocaleString('en-GH')}</strong></div>)}<div className='paid-line'><strong>Total paid (test)</strong><strong>GHC {receipt.total?.toLocaleString('en-GH')}</strong></div></section>
      <p className='payment-delivery-note'>Payment covers your hampers only. Delivery charges, if applicable, will be confirmed separately after payment.</p>
      <div className='payment-actions'><a className='editorial-button' href={whatsappOrderLaunchUrl(message)} target='_blank' rel='noopener noreferrer'>Discuss my order on WhatsApp</a><Link href='/products#sets' className='editorial-button outline'>Continue browsing</Link></div>
      <section className='paid-bag-choice'><h2>Your bag</h2><p>{removed ? 'The items from this order have been removed from your bag.' : 'Keep your items for later, or remove the quantities included in this paid order.'}</p>{!removed && <button className='editorial-button outline' disabled={!isInitialized} onClick={() => { removePurchasedItems(receipt.items || []); localStorage.setItem(`paid_bag_removed_${reference}`, 'yes'); sessionStorage.removeItem('paystack_attempt'); setRemoved(true); }}>Remove paid items from my bag</button>}</section>
    </>}
  </main></>;
}
