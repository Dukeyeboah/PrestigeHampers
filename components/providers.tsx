'use client';

import type React from 'react';

import { WhatsAppReturnDialog } from '@/components/whatsapp-return-dialog';
import { CartProvider } from '@/hooks/use-cart';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { DemoBanner } from '@/components/demo-banner';
import { CompleteProfileDialog } from '@/components/complete-profile-dialog';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
      <DemoBanner />
      {children}
      <CompleteProfileDialog />
      <WhatsAppReturnDialog />
      <Toaster />
    </CartProvider>
    </AuthProvider>
  );
}
