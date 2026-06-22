'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TopNav } from '@/components/top-nav';
import { ProductCarousel } from '@/components/product-carousel';
import { HomeAboutSections } from '@/components/home-about-sections';
import { useShopCatalog } from '@/hooks/use-shop-catalog';

export default function Home() {
  const { hampers, loading } = useShopCatalog();

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <TopNav />

      <section className='relative min-h-[70vh] flex items-center justify-center overflow-hidden'>
        <Image
          src='/images/hamperBackground.jpg'
          alt='Prestige Hampers'
          fill
          priority
          className='object-cover'
        />
        <div className='absolute inset-0 bg-black/40' />

        <div className='relative z-10 mx-auto max-w-3xl px-4 md:px-8 pt-24 pb-10 md:pt-20 md:pb-12 text-center'>
          <p className='text-[10px] md:text-xs uppercase tracking-[0.25em] md:tracking-[0.3em] text-white/80 mb-3 md:mb-4'>
            Prestige Hampers
          </p>
          <h1 className='font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight'>
            Thoughtfully curated hampers,
            <span className='block mt-1'>delivered with quiet luxury.</span>
          </h1>
          <p className='mx-auto mt-4 md:mt-5 max-w-xl text-sm md:text-lg text-white/85 leading-relaxed'>
            Premium gift hampers and hand-picked treats — order from our
            collection of signature hampers and individual products.
          </p>

          <div className='mt-8'>
            <Link href='/inventory'>
              <button className='px-8 py-3.5 rounded-full bg-neutral-900 text-white text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors'>
                Shop hampers
              </button>
            </Link>
          </div>
        </div>
      </section>

      {!loading && hampers.length > 0 && (
        <ProductCarousel
          products={hampers}
          title='Featured Hampers'
          subtitle='Our signature curated gift collections'
        />
      )}

      <HomeAboutSections />

      <footer className='py-8 text-center text-xs text-neutral-400'>
        © {new Date().getFullYear()} Prestige Hampers
      </footer>
    </div>
  );
}
