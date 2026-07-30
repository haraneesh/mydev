// @ts-nocheck
/* eslint-env serviceworker */

const OFFLINE_HTML = '/not-connected.html';
const CACHE_PREFIX = 'Suvai-';
const OFFLINE_CACHE = `${CACHE_PREFIX}offline-v6`;
const LEGACY_CACHE_PREFIXES = [
  `${CACHE_PREFIX}bundleCache-`,
  `${CACHE_PREFIX}preCache-`,
  `${CACHE_PREFIX}assetsCache-`,
  `${CACHE_PREFIX}offline-`,
];
const LEGACY_CACHE_NAMES = new Set(['MSW V0.3']);
const serviceWorker = globalThis;

const getOfflineResponse = async () => {
  const cache = await caches.open(OFFLINE_CACHE);
  return cache.match(OFFLINE_HTML);
};

serviceWorker.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    const activation = serviceWorker.skipWaiting();
    if (event.waitUntil) {
      event.waitUntil(activation);
    }
  }
});

serviceWorker.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.addAll([OFFLINE_HTML])),
  );
});

serviceWorker.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName !== OFFLINE_CACHE &&
              (LEGACY_CACHE_NAMES.has(cacheName) ||
                LEGACY_CACHE_PREFIXES.some((prefix) =>
                  cacheName.startsWith(prefix),
                )),
          )
          .map((cacheName) => caches.delete(cacheName)),
      );
      await serviceWorker.clients.claim();
      console.log('[sw.js] Service Worker loaded');
    })(),
  );
});

serviceWorker.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate') {
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).catch(getOfflineResponse),
  );
});
