// SEO helpers — JSON-LD builders + canonical/hreflang utilities.
// We injecten JSON-LD via een <script type="application/ld+json"> tag.
// Geen externe dep — Schema.org-types zijn bewust losjes (Record<string, unknown>)
// omdat full Schema.org-typings te zwaar zijn voor wat we gebruiken.

export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com').replace(/\/$/, '');
export const ORG_NAME = 'Caravanstalling Spanje';
export const ORG_LEGAL = 'Caravan Storage Spain S.L.';
export const ORG_PHONE = '+34633778699';
export const ORG_EMAIL = 'info@caravanstalling-spanje.com';
export const ORG_ADDRESS = {
  streetAddress: 'Ctra de Palamos 9',
  addressLocality: 'Sant Climent de Peralta',
  postalCode: '17110',
  addressRegion: 'Girona',
  addressCountry: 'ES',
};
// Approximate — exact GPS optional, helps Maps surfacing.
export const ORG_GEO = { latitude: 41.961, longitude: 3.105 };

type JsonLd = Record<string, unknown>;

/** Top-level Organization (used everywhere). */
export function organizationLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    legalName: ORG_LEGAL,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-v2.png`,
    email: ORG_EMAIL,
    telephone: ORG_PHONE,
    address: { '@type': 'PostalAddress', ...ORG_ADDRESS },
    sameAs: [
      'https://www.facebook.com/caravanstalling.spanje',
      'https://www.linkedin.com/company/caravanstalling-spanje',
      'https://www.google.com/maps/place/Caravanstalling+Spanje',
    ],
  };
}

/** LocalBusiness for the storage location — surfaces in Maps + local search. */
export function localBusinessLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: ORG_NAME,
    image: `${SITE_URL}/images/logo-v2.png`,
    url: SITE_URL,
    telephone: ORG_PHONE,
    email: ORG_EMAIL,
    priceRange: '€€',
    address: { '@type': 'PostalAddress', ...ORG_ADDRESS },
    geo: { '@type': 'GeoCoordinates', ...ORG_GEO },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:30',
        closes: '16:30',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: 25,
      bestRating: '5',
    },
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  };
}

/** Service-page JSON-LD. Pas in de page mee als de dienst-pagina rendert. */
export function serviceLd(input: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
  areaServed?: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    serviceType: input.serviceType ?? input.name,
    areaServed: input.areaServed ?? 'Costa Brava, Spain',
    provider: { '@id': `${SITE_URL}/#organization` },
    url: input.url.startsWith('http') ? input.url : `${SITE_URL}${input.url}`,
  };
}

export function breadcrumbLd(items: Array<{ name: string; href: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}`,
    })),
  };
}

export function faqLd(qa: Array<{ q: string; a: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** Hreflang/canonical helper — gebruikt in `metadata.alternates` per pagina.
 *  Voor nu: één URL, beide locales mappen erop (cookie-based locale).
 *  Bij echte locale-prefix (/en/foo) later: vervang door routes per locale. */
export function alternatesFor(path: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const url = `${SITE_URL}${path}`;
  return {
    canonical: url,
    languages: { nl: url, en: url, 'x-default': url },
  };
}

/** React-ready JSON-LD inline tag. Gebruik in een Server Component:
 *      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(orgLd()) }} />
 *  Of gebruik <JsonLd payload={…}/> hieronder. */
export function jsonLdString(payload: JsonLd | JsonLd[]): string {
  return JSON.stringify(payload).replace(/</g, '\\u003c');
}
