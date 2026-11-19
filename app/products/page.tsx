'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      <div className='hero-collage hero-collage-left' aria-hidden='true'>
        <Image src='/images/hampers/illustrations/deluxe_hamper.webp' alt='' width={320} height={280} className='hero-cutout hero-cutout-back' priority />
        <Image src='/images/hampers/illustrations/family_breakfast.webp' alt='' width={320} height={180} className='hero-cutout hero-cutout-front' priority />
      </div>
      <div className='hero-collage hero-collage-right' aria-hidden='true'>
        <Image src='/images/hampers/illustrations/alcohol_free.webp' alt='' width={320} height={285} className='hero-cutout hero-cutout-back' priority />
        <Image src='/images/hampers/illustrations/for_her.webp' alt='' width={320} height={275} className='hero-cutout hero-cutout-front' priority />
      </div>
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
