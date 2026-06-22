'use client';

import type React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-white'>
        <Loader2 className='h-8 w-8 animate-spin text-neutral-400' />
      </div>
    );
  }

  return <div className='min-h-screen bg-neutral-50'>{children}</div>;
}
