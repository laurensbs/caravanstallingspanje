'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const LABELS: Record<string, string> = {
  '': 'Home',
  stalling: 'Stalling',
  tarieven: 'Tarieven',
  diensten: 'Diensten',
  locaties: 'Locaties',
  contact: 'Contact',
  blog: 'Blog',
  'mijn-account': 'Mijn Account',
  reserveren: 'Reserveren',
  privacy: 'Privacybeleid',
  voorwaarden: 'Algemene Voorwaarden',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/staff')) return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', href: '/' }];
  let path = '';
  for (const seg of segments) {
    path += '/' + seg;
    crumbs.push({ label: LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1), href: path });
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: `https://caravanstalling-spanje.com${c.href}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <ol className="flex items-center gap-1.5 text-xs text-gray-500/70 flex-wrap">
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={10} className="text-gray-500/40" />}
              {i === crumbs.length - 1 ? (
                <span className="font-semibold text-gray-900">{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:text-primary transition-colors flex items-center gap-1">
                  {i === 0 && <Home size={11} />}
                  {c.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
