'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { money } from './set-card';
export function OrderSummary(){const {cart,total}=useCart();return <aside className='editorial-summary'><p className='eyebrow'>Your order</p>{cart.map(i=><div className='summary-item' key={i.id}><Image src={i.imageUrl||'/images/hamperBackground.jpg'} width={88} height={88} alt={i.name}/><div><h3>{i.name}</h3><p>Qty {i.quantity} · <Link href='/cart'>Edit bag</Link></p></div><span>{money(i.price*i.quantity)}</span></div>)}<div className='summary-total'><p><span>Subtotal</span><span>{money(total)}</span></p><p><span>Pickup / delivery</span><span>To be confirmed</span></p><p><strong>Items total</strong><strong>{money(total)}</strong></p></div></aside>}
