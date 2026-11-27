'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { TopNav } from '@/components/top-nav';
type TestOrder = { id: string; userName: string; userEmail: string; customerPhone: string; total: number; paymentChannel: string; notificationStatus: string; deliveryOption: string; deliveryAddress: string; notes: string; createdAt: number; items: {name:string;quantity:number}[] };
export default function TestOrders() {
  const {user,loading}=useAuth(); const [orders,setOrders]=useState<TestOrder[]>([]); const [error,setError]=useState(''); const [emailReady,setEmailReady]=useState(true);
  async function refresh(){try{const token=await auth.currentUser?.getIdToken();if(!token)return;const response=await fetch('/api/paystack/orders',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const result=await response.json();if(!response.ok)throw new Error(result.error);setOrders(result.orders);setEmailReady(result.emailConfigured);setError('');}catch(e){setError(e instanceof Error?e.message:'Could not load test orders.');}}
  useEffect(()=>{if(user)void refresh();},[user]);
  return <><TopNav/><main className='editorial-container flow-page'><h1>Paystack test orders</h1><p className='payment-test-banner'>Test orders only · Do not fulfil. Production orders are unchanged.</p>{loading?<p>Loading…</p>:!user?<p><Link href='/login'>Sign in</Link> with the test administrator email to view paid orders.</p>:<><button className='editorial-button outline' onClick={()=>void refresh()}>Refresh orders</button>{error&&<p role='alert'>{error}</p>}{!emailReady&&<p>Email alerts are not configured yet. Paid test orders are saved here.</p>}{!error&&!orders.length&&<p>No paid test orders yet.</p>}{orders.map(o=><article className='editorial-summary test-order' key={o.id}><h2>{o.userName} · GHC {o.total.toLocaleString('en-GH')}</h2><p className='payment-reference'>{o.id}</p><p>{new Date(o.createdAt).toLocaleString()} · Paid by {o.paymentChannel}</p><p>{o.userEmail} · {o.customerPhone}</p><ul>{o.items.map((i,n)=><li key={n}>{i.quantity} × {i.name}</li>)}</ul><p>{o.deliveryOption}: {o.deliveryAddress||'Details to be confirmed'}</p><p>{o.notes}</p><p>Email notification: {o.notificationStatus.replaceAll('_',' ')}</p></article>)}</>}</main></>;
}
