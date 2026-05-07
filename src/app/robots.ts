import type { MetadataRoute } from 'next';

// Robots.txt — standaard allow: /. Zet env SEO_NOINDEX=true om alles
// dicht te zetten (handig tijdens content-migraties of staging deploys).

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com';
  const seoEnabled = process.env.SEO_NOINDEX !== 'true';

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
