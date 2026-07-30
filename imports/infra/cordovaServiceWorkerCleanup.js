const CLEANUP_STORAGE_KEY = 'suvai:cordova-service-worker-cleanup:v1';

const cleanupWasCompleted = (storage) => {
  try {
    return storage?.getItem(CLEANUP_STORAGE_KEY) === 'complete';
  } catch {
    return false;
  }
};

const markCleanupCompleted = (storage) => {
  try {
    storage?.setItem(CLEANUP_STORAGE_KEY, 'complete');
  } catch {
    // A storage failure is safe here: removed registrations cannot return.
  }
};

export const cleanupCordovaServiceWorkers = async ({
  serviceWorker = globalThis.navigator?.serviceWorker,
  storage = globalThis.localStorage,
  reload = () => globalThis.location.reload(),
} = {}) => {
  if (
    !serviceWorker ||
    typeof serviceWorker.getRegistrations !== 'function' ||
    cleanupWasCompleted(storage)
  ) {
    return;
  }

  const registrations = await serviceWorker.getRegistrations();
  if (registrations.length === 0) {
    markCleanupCompleted(storage);
    return;
  }

  const unregisterResults = await Promise.all(
    registrations.map((registration) => registration.unregister()),
  );

  if (!unregisterResults.some(Boolean)) {
    return;
  }

  markCleanupCompleted(storage);
  reload();
};
