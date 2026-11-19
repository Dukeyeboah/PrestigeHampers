'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useShopCatalog } from '@/hooks/use-shop-catalog';
import { useCart } from '@/hooks/use-cart';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
const filters = ['All hampers', 'Celebrations', 'For the family', 'Alcohol free'];
export default function ProductsPage() {
  const { hampers, loading } = useShopCatalog();
  const { addToCart } = useCart();
  const [filter, setFilter] = useState('All hampers');
  const products = useMemo(() => {
    const items = hampers.filter(p => !p.isHidden).filter(p =>
      filter === 'All hampers' ||
      (filter === 'Celebrations' && /christmas|deluxe|for her|for him/i.test(p.name)) ||
      (filter === 'For the family' && /family|budget/i.test(p.name)) ||
      (filter === 'Alcohol free' && /alcohol free/i.test(p.name)));
    return items;
  }, [hampers, filter]);
  return <div>
    <section className='store-intro text-center'>
      <svg className='hero-art hero-art-ribbon' viewBox='0 0 220 190' fill='none' aria-hidden='true' focusable='false'>
        <g stroke='currentColor' strokeWidth='1.15' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M108 86C78 81 39 49 49 33C62 14 103 51 108 86ZM110 86C113 56 146 25 159 38C175 55 140 84 110 86Z' />
          <path d='M107 86C93 114 64 127 49 157L70 150L74 169C84 142 104 117 110 91M113 88C123 111 144 120 157 141L138 137L139 156C121 140 111 115 110 91' />
          <ellipse cx='109' cy='87' rx='7' ry='5' transform='rotate(-15 109 87)' />
          <path d='M24 76v12M18 82h12M180 104v8M176 108h8' />
          <circle cx='166' cy='22' r='2' />
        </g>
      </svg>
      <svg className='hero-art hero-art-tag' viewBox='0 0 220 190' fill='none' aria-hidden='true' focusable='false'>
        <g stroke='currentColor' strokeWidth='1.15' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M104 62C90 36 119 15 145 27C171 40 153 66 127 48C111 37 140 13 173 20' />
          <path d='M93 53L121 61L148 120L99 143L72 84Z' />
          <circle cx='100' cy='69' r='4' />
          <path d='M105 95C96 86 87 98 112 111C127 88 111 83 105 95Z' />
          <path d='M49 114C49 104 45 100 37 100C45 100 49 96 49 86C49 96 53 100 61 100C53 100 49 104 49 114ZM169 79v10M164 84h10' />
          <circle cx='168' cy='145' r='2' />
        </g>
      </svg>
      <h1 className='store-title'>Thoughtfully curated hampers,<br className='hidden sm:block' /> delivered with quiet luxury.</h1>
      <p className='mt-3 text-sm md:text-base leading-relaxed text-primary/75'>Order from our collection of premium signature gift hampers</p>
    </section>
    <div className='store-filters'>
      <div className='flex flex-wrap justify-center gap-1 md:gap-5' role='group' aria-label='Filter hampers'>
        {filters.map(label => <button key={label} onClick={() => setFilter(label)} aria-pressed={filter === label} className={`whitespace-nowrap rounded-full px-3 md:px-6 min-h-11 text-sm transition-colors ${filter === label ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>{label}</button>)}
      </div>
    </div>
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12 py-7 md:py-10'>
      {loading ? Array.from({length:8},(_,i)=><Skeleton key={i} className='aspect-square rounded-xl'/>) : products.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart}/>)}
    </div>
    {!loading && !products.length && <p className='text-center py-16'>No hampers in this collection yet.</p>}
    <footer className='border-t border-primary/30 mt-6 py-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm'>
      <Link href='/about'>About us</Link><Link href='/about#delivery'>Delivery & FAQs</Link><Link href='/about#contact'>Contact</Link>
    </footer>
  </div>;
}
