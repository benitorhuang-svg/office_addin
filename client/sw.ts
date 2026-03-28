/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// @ts-expect-error: __WB_MANIFEST is injected by Webpack
precacheAndRoute(self.__WB_MANIFEST || []);



// Utility: Match API or Manifest routes
const isDynamicSync = (url: string) => url.includes('/api/') || url.includes('manifest.json');

// Install & Activate handled by Workbox precache

// 3. Cache Fonts & Static CDNs (Cache-First)
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com' || 
                 url.origin === 'https://fonts.gstatic.com' ||
                 url.origin === 'https://appsforoffice.microsoft.com',
    new CacheFirst({
        cacheName: 'nexus-static-cdns',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        ],
    })
);

// 4. API & Manifest (Network-First)
registerRoute(
    ({ request }) => isDynamicSync(request.url),
    new NetworkFirst({
        cacheName: 'nexus-api-cache',
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
        ],
    })
);

// 5. Default Static Assets (Stale-While-Revalidate)
registerRoute(
    ({ request }) => request.destination === 'document' || 
                     request.destination === 'script' || 
                     request.destination === 'style' ||
                     request.destination === 'image',
    new StaleWhileRevalidate({
        cacheName: 'nexus-static-assets'
    })
);
