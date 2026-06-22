'use client';

import { Suspense } from 'react';
import type React from 'react';
import { TopNav } from '@/components/top-nav';
import { Skeleton } from '@/components/ui/skeleton';

function InventoryLoading() {
  return (
    <div className='space-y-8'>
      <Skeleton className='h-10 w-48 mx-auto' />
      <Skeleton className='h-12 w-full max-w-xl mx-auto rounded-full' />
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='aspect-[3/4] rounded-2xl' />
        ))}
      </div>
    </div>
  );
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-white'>
      <TopNav />
      <main className='pt-20'>
        <div className='mx-auto max-w-6xl px-4 md:px-8 py-6 md:py-10'>
          <Suspense fallback={<InventoryLoading />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
