'use client';
import {useState,useEffect} from 'react';
import {createPortal} from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {SaveSet} from './save-set';
import {QuantityControls} from './quantity-controls';
import {useCart} from '@/hooks/use-cart';
import type { Product } from '@/types';
export const money = (value:number) => `GHC ${value.toLocaleString('en-GH')}`;
export function SetCard({product}:{product:Product}) {
 useEffect(()=>{const close=()=>setOpen(false);window.addEventListener('prestige-bag-panel',close);return()=>window.removeEventListener('prestige-bag-panel',close);},[]);
 const {cart,addToCart}=useCart();const [open,setOpen]=useState(false);const quantity=cart.find(i=>i.id===product.id)?.quantity||0;
 return <article className='set-card'><SaveSet id={product.id}/><Link href={`/sets/${product.id}`} className='set-photo'><Image src={product.imageUrl || '/images/hamperBackground.jpg'} alt={product.name} fill sizes='(max-width: 767px) 45vw, 30vw' className='object-contain p-4 md:p-8'/></Link><div className='set-title'><Link href={`/sets/${product.id}`}>{product.name}</Link><span>{money(product.price)}</span></div><p>{product.contents?.slice(0,5).join(' · ')}{(product.contents?.length || 0)>5 ? ` + ${(product.contents?.length || 0)-5} more` : ''}</p><div className='set-card-actions'><Link href={`/sets/${product.id}`} className='editorial-button outline'>Product details</Link><button type='button' className='editorial-button' disabled={quantity>=product.stock} onClick={()=>{window.dispatchEvent(new Event('prestige-bag-panel'));addToCart(product,1,true);setOpen(true);}}>{product.stock<=0?'Sold out':'Add to bag'}</button></div>{open&&createPortal(<section className='bag-confirmation' role='region' aria-label='Added to bag'><button type='button' className='bag-confirmation-close' aria-label='Close added to bag panel' onClick={()=>setOpen(false)}>×</button><p className='eyebrow' role='status'>Added to your bag</p><h3>{product.name}</h3><p>Want to add another?</p><QuantityControls id={product.id}/><div className='bag-confirmation-actions'><button type='button' onClick={()=>setOpen(false)}>Keep browsing</button><Link href='/cart'>View bag →</Link></div></section>,document.body)}</article>;
}
