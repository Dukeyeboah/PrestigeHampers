import type React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  OG_IMAGE_PATH,
  OG_IMAGE_ALT,
  getSiteUrl,
  absoluteUrl,
} from '@/lib/site-config';
import './globals.css';
import { Providers } from '@/components/providers';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const siteUrl = getSiteUrl();
const ogImageUrl = absoluteUrl(OG_IMAGE_PATH);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Premium Gift Hampers & Treats`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Prestige Hampers',
    'gift hampers',
    'Ghana hampers',
    'premium gifts',
    'curated hampers',
    'online hamper shop',
    'MoMo payment',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      {
        url: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium Gift Hampers & Treats`,
    description: SITE_TAGLINE,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Premium Gift Hampers & Treats`,
    description: SITE_TAGLINE,
    images: [ogImageUrl],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geist.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
