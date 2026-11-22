'use client';
import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShopCatalog } from '@/hooks/use-shop-catalog';
import { useCart } from '@/hooks/use-cart';
import { TopNav } from '@/components/top-nav';
import { SetCard, money } from '@/components/editorial/set-card';
import { EditorialFooter } from '@/components/editorial/footer';
import { WHATSAPP_ORDER_CHAT_DIGITS } from '@/lib/whatsapp-order';
export default function SetPage({params}:{params:Promise<{id:string}>}){
 const {id}=use(params);const {hampers,loading}=useShopCatalog();const {addToCart,cart}=useCart();const router=useRouter();const [quantity,setQuantity]=useState(1);const [photo,setPhoto]=useState(0);const p=hampers.find(p=>p.id===id&&!p.isHidden);
 if(loading)return <><TopNav/><main className='editorial-container py-24'>Loading your set…</main></>;
 if(!p)return <><TopNav/><main className='editorial-container py-24'><h1>Set not found</h1><Link href='/products'>Browse the collection</Link></main></>;
 const photos=[p.imageUrl!,`/images/hampers/optimized/${id.replace('hamper-','').replaceAll('-','_')}.webp`];
 function add(send:boolean){if(!p)return;const already=cart.find(i=>i.id===p.id)?.quantity||0;if(already+quantity>p.stock)return;addToCart(p,quantity);if(send)router.push('/gift-details');}
 return <><TopNav/><main className='editorial-container set-page'><p className='breadcrumb'><Link href='/products#sets'>Shop</Link> / {p.name}</p><div className='set-detail-grid'><div><div className='detail-photo'><Image src={photos[photo]} alt={p.name} fill priority sizes='(max-width:767px) 100vw, 55vw' className={photo===0?'object-contain p-8':'object-cover'}/></div><div className='photo-thumbnails'>{photos.map((src,i)=><button key={src} onClick={()=>setPhoto(i)} aria-label={i===0?'View hamper contents':'View wrapped hamper'} aria-pressed={photo===i}><Image src={src} alt={i===0?'Hamper contents':'Wrapped hamper'} fill sizes='100px' className='object-contain'/></button>)}</div></div><div className='set-description'><p className='eyebrow'>The 2026 collection</p><h1>{p.name}</h1><p className='detail-price'>{money(p.price)}</p><p>{p.description}</p><div className='contents-heading'><span>What’s inside</span><span>{p.contents?.length} items</span></div><ol className='contents-list'>{p.contents?.map((item,i)=><li key={item}><span>{String(i+1).padStart(2,'0')}</span>{item}</li>)}</ol><label className='quantity-label'>Quantity <input type='number' min='1' max={p.stock} value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(p.stock,Number(e.target.value)||1)))}/></label><div className='set-actions'><button className='editorial-button' disabled={p.stock<=0||(cart.find(i=>i.id===p.id)?.quantity||0)+quantity>p.stock} onClick={()=>add(true)}>Send this set · {money(p.price*quantity)}</button><button className='editorial-button outline' disabled={p.stock<=0||(cart.find(i=>i.id===p.id)?.quantity||0)+quantity>p.stock} onClick={()=>add(false)}>Add to bag, keep browsing</button></div><div className='set-assurances'><p>Thoughtfully selected and wrapped with care.</p><p>Pickup and delivery confirmed on WhatsApp.</p><a href={`https://wa.me/${WHATSAPP_ORDER_CHAT_DIGITS}`}>Questions? WhatsApp us</a></div></div></div><section className='other-sets'><h2>Other sets</h2><div className='set-grid'>{hampers.filter(x=>x.id!==id&&!x.isHidden).slice(0,3).map(x=><SetCard key={x.id} product={x}/>)}</div></section></main><EditorialFooter/></>;
}
