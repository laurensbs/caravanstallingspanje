import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/staff/', '/mijn-account/'],
      },
    ],
    sitemap: 'https://caravanstalling-spanje.com/sitemap.xml',
  };
}
