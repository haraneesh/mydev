import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const serviceWorkerSource = readFileSync(
  new URL('../../public/sw.js', import.meta.url),
  'utf8',
);
const offlineFallbackSource = readFileSync(
  new URL('../../public/not-connected.html', import.meta.url),
  'utf8',
);

const createRequest = (overrides = {}) => ({
  method: 'GET',
  mode: 'cors',
  url: 'https://www.nammasuvai.com/example',
  clone() {
    return this;
  },
  ...overrides,
});

const loadServiceWorker = ({
  cacheNames = [],
  cachedOfflineResponse = { source: 'offline' },
  fetchImpl = async () => ({ source: 'network' }),
} = {}) => {
  const listeners = {};
  const deletedCaches = [];
  const addedResources = [];
  let clientsClaimed = false;
  let skippedWaiting = false;

  const offlineCache = {
    addAll: async (resources) => {
      addedResources.push(...resources);
    },
    match: async () => cachedOfflineResponse,
  };

  const context = {
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
    caches: {
      delete: async (cacheName) => {
        deletedCaches.push(cacheName);
        return true;
      },
      keys: async () => cacheNames,
      open: async () => offlineCache,
    },
    clients: {
      async claim() {
        clientsClaimed = true;
      },
    },
    console,
    fetch: fetchImpl,
    async skipWaiting() {
      skippedWaiting = true;
    },
  };

  vm.runInNewContext(serviceWorkerSource, context, {
    filename: 'public/sw.js',
  });

  return {
    addedResources,
    clientsClaimed: () => clientsClaimed,
    deletedCaches,
    listeners,
    skippedWaiting: () => skippedWaiting,
  };
};

test('does not intercept non-navigation bundle requests', () => {
  const { listeners } = loadServiceWorker();
  let responsePromise;

  listeners.fetch({
    request: createRequest({
      url: 'https://www.nammasuvai.com/app.js?meteor_js_resource=true',
    }),
    respondWith(promise) {
      responsePromise = promise;
    },
  });

  assert.equal(responsePromise, undefined);
});

test('does not intercept non-GET navigation requests', () => {
  let fetchCallCount = 0;
  let respondWithCalled = false;
  const { listeners } = loadServiceWorker({
    fetchImpl: async () => {
      fetchCallCount += 1;
      return { source: 'network' };
    },
  });

  listeners.fetch({
    request: createRequest({
      method: 'POST',
      mode: 'navigate',
      url: 'https://www.nammasuvai.com/neworder',
    }),
    respondWith() {
      respondWithCalled = true;
    },
  });

  assert.equal(respondWithCalled, false);
  assert.equal(fetchCallCount, 0);
});

test('fetches navigations with the browser HTTP cache disabled', async () => {
  const fetchCalls = [];
  const networkResponse = { source: 'network' };
  const { listeners } = loadServiceWorker({
    fetchImpl: async (...args) => {
      fetchCalls.push(args);
      return networkResponse;
    },
  });
  let responsePromise;

  const request = createRequest({
    mode: 'navigate',
    url: 'https://www.nammasuvai.com/neworder',
  });
  listeners.fetch({
    request,
    respondWith(promise) {
      responsePromise = promise;
    },
  });

  assert.equal(await responsePromise, networkResponse);
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0][0], request);
  assert.equal(fetchCalls[0][1].cache, 'no-store');
});

test('precaches only the offline fallback page', async () => {
  const { addedResources, listeners, skippedWaiting } = loadServiceWorker();
  let installPromise;

  listeners.install({
    waitUntil(promise) {
      installPromise = promise;
    },
  });
  await installPromise;

  assert.deepEqual(addedResources, ['/not-connected.html']);
  assert.equal(skippedWaiting(), false);
});

test('the precached offline fallback has a self-contained backing asset', () => {
  assert.match(offlineFallbackSource, /<title>You are offline \| Namma Suvai/);
  assert.match(offlineFallbackSource, /<h1>You are offline<\/h1>/);
  assert.doesNotMatch(
    offlineFallbackSource,
    /<(?:img|link|script)\b[^>]*(?:href|src)=["'](?:https?:)?\/\//i,
  );
});

test('activates immediately when requested by the client', async () => {
  const { listeners, skippedWaiting } = loadServiceWorker();
  let messagePromise;

  listeners.message({
    data: { type: 'SKIP_WAITING' },
    waitUntil(promise) {
      messagePromise = promise;
    },
  });
  await messagePromise;

  assert.equal(skippedWaiting(), true);
});

test('activation removes legacy Suvai caches but preserves unrelated caches', async () => {
  const { clientsClaimed, deletedCaches, listeners } = loadServiceWorker({
    cacheNames: [
      'Suvai-bundleCache-v5',
      'Suvai-preCache-v5',
      'Suvai-assetsCache-v5',
      'Suvai-offline-v5',
      'Suvai-offline-v6',
      'Suvai-user-content',
      'MSW V0.3',
      'other-app-cache',
    ],
  });
  let activationPromise;

  listeners.activate({
    waitUntil(promise) {
      activationPromise = promise;
    },
  });
  await activationPromise;

  assert.deepEqual(deletedCaches.sort(), [
    'MSW V0.3',
    'Suvai-assetsCache-v5',
    'Suvai-bundleCache-v5',
    'Suvai-offline-v5',
    'Suvai-preCache-v5',
  ]);
  assert.equal(clientsClaimed(), true);
});

test('uses the offline fallback only when a navigation fetch fails', async () => {
  const offlineResponse = { source: 'offline' };
  const { listeners } = loadServiceWorker({
    cachedOfflineResponse: offlineResponse,
    fetchImpl: async () => {
      throw new Error('network unavailable');
    },
  });
  let responsePromise;

  listeners.fetch({
    request: createRequest({ mode: 'navigate' }),
    respondWith(promise) {
      responsePromise = promise;
    },
  });

  assert.equal(await responsePromise, offlineResponse);
});
