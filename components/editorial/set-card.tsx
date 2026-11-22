'use client';
import Link from 'next/link';
import Image from 'next/image';
import { SaveSet } from './save-set';
import type { Product } from '@/types';
export const money = (value:number) => `GHC ${value.toLocaleString('en-GH')}`;
export function SetCard({product}:{product:Product}) { return <article className='set-card'><SaveSet id={product.id}/><Link href={`/sets/${product.id}`} className='set-photo'><Image src={product.imageUrl || '/images/hamperBackground.jpg'} alt={product.name} fill sizes='(max-width: 767px) 45vw, 30vw' className='object-contain p-4 md:p-8'/></Link><div className='set-title'><Link href={`/sets/${product.id}`}>{product.name}</Link><span>{money(product.price)}</span></div><p>{product.contents?.slice(0,5).join(' · ')}{(product.contents?.length || 0)>5 ? ` + ${(product.contents?.length || 0)-5} more` : ''}</p><Link href={`/sets/${product.id}`} className='editorial-button outline'>Send this set</Link></article>; }
