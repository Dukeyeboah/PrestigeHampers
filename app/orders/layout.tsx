'use client';

import type React from 'react';
import { TopNav } from '@/components/top-nav';

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-background'>
      <TopNav />
      <main className='pt-20'>
        <div className='mx-auto max-w-[1440px] px-4 md:px-8 py-6 md:py-10'>{children}</div>
      </main>
    </div>
  );
}
