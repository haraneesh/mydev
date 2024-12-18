/**
 * Caching of files and offline support
 */
/* eslint-env worker */
/* eslint-env serviceworker */

/**
 * Project Level Configurations
 */

const debug = false;
const OFFLINE_HTML = '/not-connected.html';
const MANIFEST = '/manifest.json';
const PROJECT_NAME = 'Suvai';
const VERSION = 'v3';

/**
 * Web Worker Constants
 */
const BUNDLE_CACHE = `${PROJECT_NAME}-bundleCache-${VERSION}`;
const PRECACHE_CACHE = `${PROJECT_NAME}-preCache-${VERSION}`;
const ASSETS_CACHE = `${PROJECT_NAME}-assetsCache-${VERSION}`;
const isBundleFile = (str) => /_resource=true/.test(str);
const isJSBundleFile = (str) => /_js_|meteor_runtime_config/.test(str);
const filesToCacheOnInstall = [OFFLINE_HTML, MANIFEST, '/?homescreen=1'];
// const assetsRegex = /activitree\.com\/activities\/|activitree\.com\/audio|activitree\.com\/cdn/

const returnOffline = () =>
  caches.open(PRECACHE_CACHE).then((cache) =>
    cache
      .match(OFFLINE_HTML)
      .then((cached) => cached)
      .catch((err) =>
        console.log('there was an error on catching the cache', err),
      ),
  );

const cacheFirstStrategyCaching = (isBundleFile, event) => {
  event.respondWith(
    (async () => {
      try {
        const requestToFetch = event.request.clone();
        return caches
          .open(isBundleFile ? BUNDLE_CACHE : ASSETS_CACHE)
          .then((cache) =>
            cache
              .match(event.request.url)
              .then((cached) => {
                if (cached) {
                  if (debug) {
                    console.info('I am returning the cached file: ', cached);
                  }
                  return cached;
                }
                // if use bundle provided by Meteor server: `isBundleFile ? {} : { mode: 'cors' }`
                // if use bundle from CDN get it with mode cors: `{ mode: 'cors' }`
                return fetch(requestToFetch, {
                  method: 'GET',
                  mode: 'cors',
                  headers: {
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'Origin',
                  },
                }) // fetch(requestToFetch), without options, if you don't use external CDNs
                  .then((response) => {
                    if (debug) {
                      console.log(
                        'What do I have in this response? ',
                        response.clone(),
                      );
                    }
                    const clonedResponse = response.clone();
                    if (
                      response.clone().status === 200 ||
                      response.clone().status === 304
                    ) {
                      // Only delete the old and cache the new one if we avail of the file.(other possibilities are to get a 404 and we don't want to cache that.)
                      if (debug) {
                        console.log('I do have a status response 200 here');
                      }
                      return caches
                        .open(isBundleFile ? BUNDLE_CACHE : ASSETS_CACHE)
                        .then((cache) =>
                          cache
                            .keys()
                            .then((cacheNames) => {
                              if (isBundleFile) {
                                cacheNames.map((cacheName) => {
                                  if (
                                    (isJSBundleFile(cacheName.url) &&
                                      isJSBundleFile(event.request.url)) ||
                                    (!isJSBundleFile(cacheName.url) &&
                                      !isJSBundleFile(event.request.url))
                                  ) {
                                    if (debug) {
                                      console.info(
                                        'I delete a bundle file - delete this keys: ',
                                        cacheName,
                                      );
                                    }
                                    cache.delete(cacheName);
                                  }
                                });
                              }
                            })
                            .then(() => {
                              cache.put(response.url, clonedResponse);
                              if (debug) {
                                console.info(
                                  'Reached the end, it was a new Meteor build, old files deleted, new ones in place, returning response (new files)',
                                  response.clone(),
                                );
                              }
                              return response.clone();
                            }),
                        );
                    }
                    if (debug) {
                      console.info(
                        'I should reach here when a bundle changed and I need to return the new bundle after I cached it)',
                        response.clone(),
                      );
                    }
                    return response.clone();
                  });
              })
              .catch((e) => console.log(e)),
          );
      } catch (error) {
        console.log('Fetch failed; returning offline page instead.', error);
      }
    })(),
  );
};

/**
 * Web Workers Specific Listener: install
 */
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches
      .open(PRECACHE_CACHE)
      .then((cache) => cache.addAll(filesToCacheOnInstall)),
  );
});

/**
 * Web Workers Specific Listener: activate
 */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) =>
      cacheNames.map((cacheName) => {
        if (
          (cacheName.indexOf('bundleCache') !== -1 &&
            cacheName !== BUNDLE_CACHE) ||
          (cacheName.indexOf('preCache') !== -1 &&
            cacheName !== PRECACHE_CACHE) ||
          (cacheName.indexOf('assetsCache') !== -1 &&
            cacheName !== ASSETS_CACHE)
        ) {
          return caches.delete(cacheName);
        }
      }),
    ),
  );
});

/**
 * Web Worker Specific Listener: fetch
 */
self.addEventListener('fetch', (event) => {
  self.clients.claim();

  if (/a.txt/.test(event.request.url)) {
    if (debug) {
      console.info('%cROUTING IS INVOLVED', { color: 'red' });
    }
    event.respondWith(
      fetch(event.request.clone())
        // .then(response => response)
        .catch((error) => {
          console.log('Failed to route, probably disconnected: ', error);
          return returnOffline();
        }),
    );
  }

  // Bundle files JS and CSS management. If new names are detected while calling the bundle files from the cache, the olds files
  // are deleted and the new ones cached.
  if (isBundleFile(event.request.url)) {
    if (debug) {
      console.log('My event request url for BUNDLE file: ', event.request.url);
    }
    cacheFirstStrategyCaching(true, event);
  } else {
    // I only need to return this once if I need this exact path (but I only use it for offline PWA Lighthouse test)
    if (/\?homescreen/.test(event.request.url)) {
      event.respondWith(
        fetch(event.request.clone())
          // .then(response => response)
          .catch((error) => {
            if (debug) {
              console.log('Failed on homescreen fetch: ', error);
            }
            return returnOffline();
          }),
      );
    }

    // manifest-pwa.json is on a CacheFirst strategy. Fallback goes to network but that ideally should never happen .
    if (/manifest-pwa/.test(event.request.url)) {
      event.respondWith(
        (async function () {
          const cachedResponse = await caches
            .open(PRECACHE_CACHE)
            .then((cache) =>
              cache.match(event.request.url).then((cached) => cached),
            );
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request);
        })(),
      );
    }

    // cache all other assets.
    // const isAsset = assetsRegex.test(event.request.url)

    // DO NOT CACHE ASSETS, will be following the cache policy from the CDN
    /*
      if (isAsset) {
        cacheFirstStrategyCaching(false, event)
        return false
      }
  */
    // This is a NetworkFirst (or Network Only) strategy and is intended to let every traffic pass through unless handled by the above IF's
    // except the pre-cached files which I would prefer to have from the cache. Without these files, when offline, I cannot
    // route to where I need. This was implemented with React Router. If I don't ignore robots, sitemap etc the browser will
    // route to these locations instead of returning the files (those Routes do not exist e.g. www.website.com/robots.txt
    // but there is a public file there which is what I want.)
    if (
      event.request.mode === 'navigate' &&
      !/robots|sitemap|\?homescreen|manifest-pwa|a.txt|not-connected.html/.test(
        event.request.url,
      ) /* && !isAsset */
    ) {
      const requestToFetch = event.request.clone();
      event.respondWith(
        fetch(requestToFetch)
          .then((response) =>
            caches
              .open(PRECACHE_CACHE)
              .then((cache) =>
                cache
                  .match(event.request.url)
                  .then((cached) => cached || response),
              ),
          )
          .catch((error) => {
            if (debug) {
              console.log(
                "I am probably offline. You can't see me because I run very fast in debug screen ",
                error,
              );
            }
            return returnOffline(); // no cache and no live return the offline page (Pure HTML)
          }),
      );
    }
  }
});
