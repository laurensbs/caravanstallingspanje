import type { Metadata } from 'next';
import './globals.css';
import { LocaleProvider } from '@/components/LocaleProvider';
import FloatingActions from '@/components/FloatingActions';
import MobileNav from '@/components/MobileNav';
import ToastProvider from '@/components/ui/Toast';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: { default: 'Caravanstalling Spanje | Veilige Stalling Costa Brava', template: '%s | Caravanstalling Spanje' },
  description: 'Dé specialist in het veilig stallen, onderhouden, repareren en transporteren van uw caravan aan de Costa Brava. 2000+ caravans, 3 locaties.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com'),
  manifest: '/manifest.json',
  themeColor: '#C4653A',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Caravanstalling' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
      </head>
      <body className="bg-surface text-[#3D3530] antialiased pb-16 md:pb-0">
        <LocaleProvider>{children}<FloatingActions /><MobileNav /><ToastProvider /><ServiceWorkerRegistration /></LocaleProvider>
      </body>
    </html>
  );
}
