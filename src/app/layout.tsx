import type { Metadata } from 'next';
import './globals.css';
import { LocaleProvider } from '@/components/LocaleProvider';

export const metadata: Metadata = {
  title: { default: 'Caravanstalling Spanje | Veilige Stalling Costa Brava', template: '%s | Caravanstalling Spanje' },
  description: 'Dé specialist in het veilig stallen, onderhouden, repareren en transporteren van uw caravan aan de Costa Brava. 2000+ caravans, 3 locaties.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-slate-900 antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
