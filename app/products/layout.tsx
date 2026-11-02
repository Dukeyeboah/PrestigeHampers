'use client';

import { Suspense } from 'react';
import type React from 'react';
import { TopNav } from '@/components/top-nav';
import { Skeleton } from '@/components/ui/skeleton';

function ProductsLoading() {
  return (
    <div className='space-y-5'>
      <Skeleton className='h-8 w-40 mx-auto' />
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='aspect-[3/4] rounded-2xl' />
        ))}
      </div>
    </div>
  );
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-white'>
      <TopNav />
      <main className='pt-14'>
        <div className='mx-auto max-w-6xl px-4 md:px-8 pt-4 pb-6 md:pt-5 md:pb-10'>
          <Suspense fallback={<ProductsLoading />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
