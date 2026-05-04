import type { NextConfig } from 'next';

// Long-cache headers voor static assets. `_next/static` is content-hashed
// dus veilig voor 1 jaar immutable; favicon/og-images korter zodat een swap
// snel doorkomt.
const STATIC_CACHE = 'public, max-age=31536000, immutable';
const SHORT_CACHE = 'public, max-age=3600, must-revalidate';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  images: {
    remotePatterns: [
      // Tijdelijke foto-host voor brand-fotografie van de stalling.
      // Vervangen wanneer we eigen CDN/Vercel-blob gebruiken.
      { protocol: 'https', hostname: 'u.cubeupload.com' },
    ],
    // AVIF + WebP waar mogelijk; ~30% kleiner dan PNG/JPG.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 60,
  },

  async redirects() {
    return [
      // Sinds de homepage alle 7 diensten toont is /diensten een duplicate
      // landing-page. Permanent redirecten zodat zoekmachines de juice
      // consolideren naar /. We laten de dienst-detail-pagina's
      // (/diensten/airco, etc.) intact — die hebben echte content.
      { source: '/diensten', destination: '/', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: STATIC_CACHE }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: STATIC_CACHE }],
      },
      {
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: SHORT_CACHE }],
      },
      // Admin- en API-routes mogen nooit gecached worden door CDNs/browsers.
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
    ];
  },
};

export default nextConfig;
