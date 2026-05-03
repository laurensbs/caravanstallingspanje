import type { MetadataRoute } from 'next';

// Sitemap voor de publieke routes. Wordt nog niet door zoekmachines opgepikt
// zolang `app/robots.ts` alles blokkeert (zie roadmap fase 8 — SEO-flip).
//
// Bij de flip zetten we hreflang-alternates ook hier zodra de NL/EN paden
// uit elkaar lopen. Voor nu één URL per pagina, taalkeuze blijft cookie-based.

const ROUTES = [
  '',
  '/contact',
  '/diensten',
  '/diensten/reparatie',
  '/diensten/inspectie',
  '/diensten/service',
  '/diensten/transport',
  '/diensten/stalling',
  '/diensten/airco',
  '/koelkast',
  '/ideeen',
  '/privacy',
  '/cookies',
  '/verwerkers',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com';
  const now = new Date();
  return ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    // Homepage en koelkast/diensten zijn de hoge-intent pagina's; legal lager.
    changeFrequency:
      path === '' || path === '/koelkast' || path === '/diensten'
        ? 'weekly'
        : path.startsWith('/privacy') || path.startsWith('/cookies') || path.startsWith('/verwerkers')
          ? 'yearly'
          : 'monthly',
    priority:
      path === '' ? 1.0 : path.startsWith('/diensten') || path === '/koelkast' ? 0.8 : 0.5,
  }));
}
