'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';
import { LazyImage } from '@/components/lazy-image';
import { resolveProductImageUrl } from '@/lib/product-image';
import { ArrowRight } from 'lucide-react';

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function ProductCarousel({
  products,
  title = 'Featured Products',
  subtitle = 'Curated picks from our collection',
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);

  const scroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isPaused) return;

    el.scrollLeft += 0.5;

    // Loop back to start when we've scrolled past half (duplicated content)
    if (el.scrollLeft >= el.scrollWidth / 2) {
      el.scrollLeft = 0;
    }

    animationRef.current = requestAnimationFrame(scroll);
  }, [isPaused]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(scroll);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [scroll]);

  if (products.length === 0) return null;

  // Duplicate items for seamless loop
  const carouselItems = [...products, ...products];

  return (
    <section className='w-full py-10 md:py-16'>
      <div className='mx-auto max-w-6xl px-4 md:px-8 mb-6 text-center'>
        <h2 className='text-xl md:text-2xl font-semibold tracking-tight text-foreground'>
          {title}
        </h2>
        <p className='text-sm text-muted-foreground mt-1'>{subtitle}</p>
      </div>

      <div
        className='relative w-full overflow-hidden'
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className='flex gap-5 overflow-x-auto scroll-smooth px-4 md:px-8 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
        >
          {carouselItems.map((product, index) => {
            const imageSrc = resolveProductImageUrl(product);
            return (
            <Link
              key={`${product.id}-${index}`}
              href='/products'
              className='group flex-shrink-0 w-[150px] sm:w-[200px] md:w-[260px] cursor-pointer'
            >
              <div className='relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]'>
                {imageSrc ? (
                  <LazyImage
                    src={imageSrc}
                    alt={product.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-neutral-100'>
                    <span className='text-4xl font-serif text-neutral-300'>
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12'>
                  <p className='text-white text-sm font-medium truncate'>
                    {product.name}
                  </p>
                  <p className='text-white/80 text-xs mt-0.5'>
                    ₵{product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
            );
          })}

          {/* See more card */}
          <Link
            href='/products'
            className='flex-shrink-0 w-[150px] sm:w-[200px] md:w-[260px] flex items-center justify-center cursor-pointer'
          >
            <div className='flex flex-col items-center justify-center gap-3 w-full aspect-[4/5] rounded-2xl border border-dashed border-neutral-300 bg-white/60 backdrop-blur-sm transition-all hover:border-neutral-400 hover:bg-white/80'>
              <div className='h-12 w-12 rounded-full bg-neutral-900 flex items-center justify-center'>
                <ArrowRight className='h-5 w-5 text-white' />
              </div>
              <span className='text-sm font-medium text-neutral-700'>
                See more
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
