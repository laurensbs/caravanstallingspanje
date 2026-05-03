import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from 'sonner';
import { LocaleProvider } from '@/components/LocaleProvider';
import PublicChrome from '@/components/PublicChrome';
import JsonLd from '@/components/JsonLd';
import { alternatesFor, localBusinessLd, organizationLd, SITE_URL } from '@/lib/seo';
import './globals.css';

// SEO-flip: zet env `SEO_INDEX=true` zodra hreflang + JSON-LD + redirects klaar
// zijn (zie roadmap fase 8). Tot die tijd noindex op alle pagina's.
const SEO_INDEX = process.env.SEO_INDEX === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Caravanstalling Spanje — Stalling, transport, reparatie & service',
    template: '%s · Caravanstalling Spanje',
  },
  description:
    'Stalling, reparatie, transport en service aan de Costa Brava. 24/7 beveiligd, eigen werkplaats, vast personeel — al meer dan 25 jaar.',
  applicationName: 'Caravanstalling Spanje',
  authors: [{ name: 'Caravan Storage Spain S.L.' }],
  robots: SEO_INDEX
    ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } }
    : { index: false, follow: false },
  alternates: alternatesFor('/'),
  openGraph: {
    type: 'website',
    siteName: 'Caravanstalling Spanje',
    locale: 'nl_NL',
    alternateLocale: 'en_GB',
    url: SITE_URL,
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: '#0A1929',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <JsonLd id="org" payload={organizationLd()} />
        <JsonLd id="local" payload={localBusinessLd()} />
        <LocaleProvider>
          {children}
          <PublicChrome />
        </LocaleProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </body>
    </html>
  );
}
