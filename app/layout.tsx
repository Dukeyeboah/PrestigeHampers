import type React from 'react';
import type { Metadata } from 'next';
import { Hanken_Grotesk, Geist_Mono, Newsreader } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  OG_IMAGE_PATH,
  OG_IMAGE_ALT,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  getSiteUrl,
} from '@/lib/site-config';
import './globals.css';
import { Providers } from '@/components/providers';

const geist = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const playfair = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Thoughtfully Curated Hampers`,
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
      { url: '/favicon.ico?v=20261122', sizes: '32x32' },
      { url: '/prestige-icon.svg', type: 'image/svg+xml' },
      { url: '/prestige-icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=20261122',
    apple: [{ url: '/prestige-icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: '/',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Thoughtfully Curated Hampers`,
    description: SITE_TAGLINE,
    images: [
      {
        // Relative path resolved against metadataBase (production domain)
        url: OG_IMAGE_PATH,
        secureUrl: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: OG_IMAGE_ALT,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Thoughtfully Curated Hampers`,
    description: SITE_TAGLINE,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  alternates: {
    canonical: '/',
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
