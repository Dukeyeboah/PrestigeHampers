'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
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
      <Image src='/images/hamperBackground.jpg' alt='' fill priority sizes='100vw' className='object-cover object-center' />
      <div className='absolute inset-0 bg-black/50' aria-hidden='true' />
      <h1 className='store-title'>Thoughtfully curated hampers,<br className='hidden sm:block' /> delivered with quiet luxury.</h1>
      <p className='mt-3 text-sm md:text-base leading-relaxed text-white/90'>Order from our collection of premium signature hampers</p>
    </section>
    <div className='mx-auto max-w-[1440px] px-4 md:px-8 pb-6 md:pb-10'>
    <div className='store-filters'>
      <div className='relative md:hidden'>
        <label htmlFor='hamper-category' className='sr-only'>Filter hampers</label>
        <select id='hamper-category' value={filter} onChange={e => setFilter(e.target.value)} className='appearance-none bg-transparent border-0 rounded-none min-h-11 pl-2 pr-8 text-base text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'>
          {filters.map(label => <option key={label} value={label}>{label}</option>)}
        </select>
        <ChevronDown aria-hidden='true' className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4' />
      </div>
      <div className='hidden md:flex justify-center gap-8' role='group' aria-label='Filter hampers'>
        {filters.map(label => <button key={label} onClick={() => setFilter(label)} aria-pressed={filter === label} className={`whitespace-nowrap min-h-11 border-b-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${filter === label ? 'border-primary font-medium' : 'border-transparent text-muted-foreground hover:text-primary'}`}>{label}</button>)}
      </div>
    </div>
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12 pt-3 pb-7 md:pt-4 md:pb-10'>
      {loading ? Array.from({length:8},(_,i)=><Skeleton key={i} className='aspect-square rounded-xl'/>) : products.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart}/>)}
    </div>
    {!loading && !products.length && <p className='text-center py-16'>No hampers in this collection yet.</p>}
    <footer className='border-t border-primary/30 mt-6 py-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm'>
      <Link href='/about'>About us</Link><Link href='/about#delivery'>FAQs</Link><Link href='/about#contact'>Contact</Link>
    </footer>
    </div>
  </div>;
}
