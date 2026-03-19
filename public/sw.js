/// <reference lib="webworker" />

const CACHE_VERSION = 2;
const CACHE_NAME = `cs-v${CACHE_VERSION}`;
const STATIC_CACHE = `cs-static-v${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/stalling',
  '/diensten',
  '/tarieven',
  '/contact',
  '/locaties',
  '/blog',
];

// @ts-ignore — this file runs as plain JS in the browser
const sw = /** @type {ServiceWorkerGlobalScope} */ (globalThis);

// Install — precache essential pages
sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  sw.skipWaiting();
});

// Activate — clean old caches (any cache not matching current version)
sw.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  sw.clients.claim();
});

// Fetch — network-first with cache fallback
sw.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls and admin/staff routes (always fresh)
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/staff')) {
    return;
  }

  // For navigation requests — network first, fall back to cache/offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigations
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // For static assets — cache first, fallback to network (separate cache)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default — network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((c) => c || new Response('', { status: 503 })))
  );
});

// Push notification handler
sw.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Caravan Stalling Spanje', body: 'Nieuwe notificatie' };
  
  event.waitUntil(
    sw.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      tag: data.tag || 'default',
      data: { url: data.url || '/' },
    })
  );
});

// Notification click — open relevant page
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if available
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      return sw.clients.openWindow(url);
    })
  );
});

// Background sync — retry failed form submissions when back online
sw.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(replayQueuedRequests());
  }
});

async function replayQueuedRequests() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const queued = keys.filter((r) => r.url.includes('/__queued/'));
    for (const request of queued) {
      const response = await cache.match(request);
      if (!response) continue;
      const body = await response.text();
      const originalUrl = request.url.replace('/__queued/', '/api/');
      await fetch(originalUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      await cache.delete(request);
    }
  } catch {
    // Will retry on next sync event
  }
}
