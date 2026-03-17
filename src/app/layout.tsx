import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Caravanstalling Spanje | Veilige Stalling aan de Costa Brava', template: '%s | Caravanstalling Spanje' },
  description: 'Dé specialist in het veilig en betrouwbaar stallen van uw caravan aan de Costa Brava. Binnen- en buitenstalling met 24/7 bewaking.',
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
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
