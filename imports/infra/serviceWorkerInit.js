const iOS = () => {
  const iDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod',
  ];

  return !!navigator.platform && iDevices.indexOf(navigator.platform) !== -1;
};

const register = () => {
  if (!('serviceWorker' in navigator)) {
    console.log('serviceWorker is not in navigator!');
    return;
  }

  const VERSION = 'v5';

  navigator.serviceWorker
    .register(`/sw.js?v=${VERSION}`, { updateViaCache: 'none' })
    .then((registration) => {
      console.log('serviceWorker registered with success!');

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    })
    .catch((error) => console.error('Error registering serviceWorker!', error));
};

register();
