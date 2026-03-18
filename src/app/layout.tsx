import type { Metadata } from 'next';
import './globals.css';
import { LocaleProvider } from '@/components/LocaleProvider';
import FloatingActions from '@/components/FloatingActions';
import MobileNav from '@/components/MobileNav';
import ToastProvider from '@/components/ui/Toast';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import CookieConsent from '@/components/CookieConsent';
import Breadcrumbs from '@/components/Breadcrumbs';
import Analytics from '@/components/Analytics';
import LiveChat from '@/components/LiveChat';

export const metadata: Metadata = {
  title: { default: 'Caravanstalling Spanje | Veilige Stalling Costa Brava', template: '%s | Caravanstalling Spanje' },
  description: 'Dé specialist in het veilig stallen, onderhouden, repareren en transporteren van uw caravan aan de Costa Brava. 2000+ caravans, 3 locaties.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com'),
  manifest: '/manifest.json',
  themeColor: '#C4653A',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Caravanstalling' },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Caravanstalling Spanje',
    title: 'Caravanstalling Spanje | Veilige Stalling Costa Brava',
    description: 'Dé specialist in het veilig stallen, onderhouden, repareren en transporteren van uw caravan aan de Costa Brava.',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Caravanstalling Spanje — Costa Brava' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caravanstalling Spanje',
    description: 'Veilige caravanstalling aan de Costa Brava. Stalling, onderhoud, reparatie en transport.',
  },
  alternates: {
    canonical: 'https://caravanstalling-spanje.com',
    languages: {
      'nl': 'https://caravanstalling-spanje.com',
      'x-default': 'https://caravanstalling-spanje.com',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
      </head>
      <body className="bg-surface dark:bg-[#1a1714] text-[#3D3530] dark:text-[#e8e0d6] antialiased pb-16 md:pb-0">
        <a href="#main-content" className="skip-link">Ga naar inhoud</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'Caravanstalling Spanje',
              description: 'Specialist in veilige caravanstalling, onderhoud, reparatie en transport aan de Costa Brava.',
              url: 'https://caravanstalling-spanje.com',
              telephone: '+34650036755',
              email: 'info@caravanstalling-spanje.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Ctra de Palamos 91',
                addressLocality: 'Sant Climent de Peralta',
                addressRegion: 'Girona',
                postalCode: '17110',
                addressCountry: 'ES',
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:30',
                closes: '16:30',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '25',
                bestRating: '5',
              },
              priceRange: '€45 - €95 per maand',
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Stallingsdiensten',
                itemListElement: [
                  { '@type': 'Offer', name: 'Buitenstalling', price: '65', priceCurrency: 'EUR', description: 'Veilige buitenstalling met 24/7 bewaking' },
                  { '@type': 'Offer', name: 'Binnenstalling', price: '95', priceCurrency: 'EUR', description: 'Overdekte stalling in geïsoleerde hal' },
                  { '@type': 'Offer', name: 'Seizoensstalling', price: '45', priceCurrency: 'EUR', description: 'Voordelig tarief buiten het kampeerseizoen' },
                ],
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Caravanstalling Spanje',
              url: 'https://caravanstalling-spanje.com',
              inLanguage: 'nl',
            }),
          }}
        />
        <LocaleProvider><Analytics /><LiveChat /><Breadcrumbs />{children}<FloatingActions /><MobileNav /><ExitIntentPopup /><CookieConsent /><ToastProvider /><ServiceWorkerRegistration /></LocaleProvider>
      </body>
    </html>
  );
}
