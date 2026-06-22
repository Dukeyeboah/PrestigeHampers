import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HomeAboutSections() {
  return (
    <>
      {/* What Prestige Hampers is */}
      <section className='py-14 md:py-20 bg-neutral-50'>
        <div className='mx-auto max-w-6xl px-4 md:px-8'>
          <div className='grid md:grid-cols-2 gap-10 md:gap-16 items-center'>
            <div className='space-y-4 text-center md:text-left'>
              <p className='text-xs uppercase tracking-[0.2em] text-neutral-500'>
                About us
              </p>
              <h2 className='font-serif text-2xl md:text-4xl font-light tracking-tight text-neutral-900 leading-snug'>
                Premium gifts &amp; hampers, made simple
              </h2>
              <p className='text-sm md:text-base text-neutral-600 leading-relaxed'>
                Prestige Hampers is your destination for beautifully curated gift
                hampers and premium individual products. From celebration boxes to
                everyday treats, every item is selected with care — perfect for
                gifting or treating yourself.
              </p>
            </div>
            <div className='flex justify-center md:justify-end'>
              <div className='relative w-full max-w-sm aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-neutral-200 shadow-md'>
                <Image
                  src='/images/hampers/Christmas_Surprise.jpeg'
                  alt='Christmas Surprise hamper from Prestige Hampers'
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 384px'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How ordering works */}
      <section className='py-14 md:py-20 bg-white'>
        <div className='mx-auto max-w-6xl px-4 md:px-8 text-center'>
          <p className='text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3'>
            How it works
          </p>
          <h2 className='font-serif text-2xl md:text-4xl font-light tracking-tight text-neutral-900 mb-4'>
            Hampers &amp; products, one easy shop
          </h2>
          <p className='text-sm md:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-12'>
            Browse our signature hampers or pick individual products from our
            collection. Add what you love to your cart, sign in, and place your
            order — we&apos;ll take care of the rest.
          </p>

          <div className='grid sm:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto'>
            {[
              {
                step: '1',
                title: 'Browse',
                text: 'Explore curated hampers and premium products.',
              },
              {
                step: '2',
                title: 'Add to cart',
                text: 'Choose quantities and save favourites for later.',
              },
              {
                step: '3',
                title: 'Order',
                text: 'Checkout with cash or MoMo — track from your account.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className='rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 text-left'
              >
                <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white text-sm font-medium mb-3'>
                  {item.step}
                </span>
                <h3 className='font-semibold text-neutral-900 mb-1'>
                  {item.title}
                </h3>
                <p className='text-sm text-neutral-600'>{item.text}</p>
              </div>
            ))}
          </div>

          <div className='mt-10 flex items-center justify-center gap-2 text-sm text-neutral-500'>
            <Package className='h-4 w-4' />
            <span>Full hampers &amp; à la carte products available</span>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className='py-16 md:py-24 bg-neutral-900 text-white'>
        <div className='mx-auto max-w-2xl px-4 md:px-8 text-center space-y-6'>
          <h2 className='font-serif text-2xl md:text-4xl font-light tracking-tight leading-snug'>
            Ready to find the perfect gift?
          </h2>
          <p className='text-sm md:text-base text-white/75 leading-relaxed'>
            Start with our featured hampers or browse the full collection. Your
            next thoughtful gift is just a few clicks away.
          </p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-3 pt-2'>
            <Button
              asChild
              size='lg'
              className='rounded-full bg-white text-neutral-900 hover:bg-neutral-100 w-full sm:w-auto'
            >
              <Link href='/inventory'>
                Shop hampers
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='rounded-full border-white/30 text-white hover:bg-white/10 w-full sm:w-auto'
            >
              <Link href='/inventory?tab=products'>Browse products</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
