'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
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
  const [sort, setSort] = useState('featured');
  const products = useMemo(() => {
    const items = hampers.filter(p => !p.isHidden).filter(p =>
      filter === 'All hampers' ||
      (filter === 'Celebrations' && /christmas|deluxe|for her|for him/i.test(p.name)) ||
      (filter === 'For the family' && /family|budget/i.test(p.name)) ||
      (filter === 'Alcohol free' && /alcohol free/i.test(p.name)));
    if (sort === 'low') items.sort((a,b) => a.price - b.price);
    if (sort === 'high') items.sort((a,b) => b.price - a.price);
    return items;
  }, [hampers, filter, sort]);
  return <div>
    <section className='store-intro text-center'>
      <p className='text-[#c3483a] text-xs md:text-sm font-semibold tracking-[.22em] uppercase'>The hamper collection</p>
      <h1 className='store-title'>Good things, gathered<span className='text-[#df6555]'>.</span></h1>
      <p className='text-base md:text-lg max-w-xl mx-auto leading-relaxed'>Thoughtfully curated hampers for every occasion.</p>
    </section>
    <div className='store-filters'>
      <div className='flex gap-2 md:gap-5 overflow-x-auto pb-1' role='group' aria-label='Filter hampers'>
        {filters.map(label => <button key={label} onClick={() => setFilter(label)} aria-pressed={filter === label} className={`whitespace-nowrap rounded-full px-4 md:px-6 min-h-11 text-sm transition-colors ${filter === label ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>{label}</button>)}
      </div>
      <div className='relative shrink-0 self-end md:self-center'>
        <label htmlFor='sort' className='sr-only'>Sort hampers</label>
        <select id='sort' value={sort} onChange={e=>setSort(e.target.value)} className='appearance-none bg-transparent pl-2 pr-8 min-h-11 text-sm cursor-pointer'>
          <option value='featured'>Sort by: Featured</option><option value='low'>Price: Low to high</option><option value='high'>Price: High to low</option>
        </select><ChevronDown className='absolute right-1 top-3.5 h-4 w-4 pointer-events-none'/>
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
