import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Tips, Reisgidsen & Caravankennis',
  description: 'Praktische onderhoudstips voor uw caravan, reisgidsen voor de Costa Brava en alles over het stallen van uw caravan in Spanje.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
