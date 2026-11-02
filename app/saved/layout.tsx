'use client';

import type React from 'react';
import { TopNav } from '@/components/top-nav';

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-white'>
      <TopNav />
      <main className='pt-14'>
        <div className='mx-auto max-w-6xl px-4 md:px-8 pt-4 pb-6 md:pt-5 md:pb-10'>
          {children}
        </div>
      </main>
    </div>
  );
}
