import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Neem Contact Op',
  description: 'Neem contact op met Caravanstalling Spanje. Bel +34 650 036 755, mail info@caravanstalling-spanje.com of vul het contactformulier in. Wij spreken Nederlands.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
