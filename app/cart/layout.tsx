'use client';

import type React from 'react';
import { TopNav } from '@/components/top-nav';

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-white'>
      <TopNav />
      <main className='pt-20'>
        <div className='mx-auto max-w-6xl px-4 md:px-8 py-6 md:py-10'>{children}</div>
      </main>
    </div>
  );
}
