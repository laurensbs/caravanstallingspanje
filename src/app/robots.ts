import type { MetadataRoute } from 'next';

// Robots.txt — staat tijdens de upgrade nog op disallow: / zodat zoekmachines
// de site niet oppikken voordat de SEO-pakket (sitemap, JSON-LD, hreflang,
// OG, canonical) klaar staat.
//
// Bij de flip in fase 8: vervang `disallow: '/'` door `allow: '/'` en houd
// alleen admin/api als disallow. De sitemap-URL kan blijven staan.

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com';
  const seoEnabled = process.env.SEO_INDEX === 'true';

  if (!seoEnabled) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
