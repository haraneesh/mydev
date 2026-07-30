import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const cleanupSource = readFileSync(
  new URL(
    '../../imports/infra/cordovaServiceWorkerCleanup.js',
    import.meta.url,
  ),
  'utf8',
);
const cleanupModuleUrl = `data:text/javascript;base64,${Buffer.from(cleanupSource).toString('base64')}`;
const { cleanupCordovaServiceWorkers } = await import(cleanupModuleUrl);

const createStorage = (initialEntries = []) => {
  const entries = new Map(initialEntries);
  return {
    entries,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
};

test('does nothing when the service-worker API is unavailable', async () => {
  let reloadCount = 0;

  await cleanupCordovaServiceWorkers({
    serviceWorker: null,
    storage: createStorage(),
    reload: () => {
      reloadCount += 1;
    },
  });

  assert.equal(reloadCount, 0);
});

test('marks cleanup complete without reloading when there are no registrations', async () => {
  const storage = createStorage();
  let reloadCount = 0;

  await cleanupCordovaServiceWorkers({
    serviceWorker: {
      getRegistrations: async () => [],
    },
    storage,
    reload: () => {
      reloadCount += 1;
    },
  });

  assert.equal(
    storage.entries.get('suvai:cordova-service-worker-cleanup:v1'),
    'complete',
  );
  assert.equal(reloadCount, 0);
});

test('unregisters existing workers and reloads after recording completion', async () => {
  const storage = createStorage();
  const unregisterCalls = [];
  let reloadCount = 0;
  const createRegistration = (name) => ({
    unregister: async () => {
      unregisterCalls.push(name);
      return true;
    },
  });

  await cleanupCordovaServiceWorkers({
    serviceWorker: {
      getRegistrations: async () => [
        createRegistration('first'),
        createRegistration('second'),
      ],
    },
    storage,
    reload: () => {
      assert.equal(
        storage.entries.get('suvai:cordova-service-worker-cleanup:v1'),
        'complete',
      );
      reloadCount += 1;
    },
  });

  assert.deepEqual(unregisterCalls, ['first', 'second']);
  assert.equal(reloadCount, 1);
});

test('the completion marker prevents a cleanup reload loop', async () => {
  const storage = createStorage([
    ['suvai:cordova-service-worker-cleanup:v1', 'complete'],
  ]);
  let registrationLookupCount = 0;
  let reloadCount = 0;

  await cleanupCordovaServiceWorkers({
    serviceWorker: {
      getRegistrations: async () => {
        registrationLookupCount += 1;
        return [];
      },
    },
    storage,
    reload: () => {
      reloadCount += 1;
    },
  });

  assert.equal(registrationLookupCount, 0);
  assert.equal(reloadCount, 0);
});

test('does not mark completion or reload when no registration was removed', async () => {
  const storage = createStorage();
  let reloadCount = 0;

  await cleanupCordovaServiceWorkers({
    serviceWorker: {
      getRegistrations: async () => [
        {
          unregister: async () => false,
        },
      ],
    },
    storage,
    reload: () => {
      reloadCount += 1;
    },
  });

  assert.equal(storage.entries.size, 0);
  assert.equal(reloadCount, 0);
});
