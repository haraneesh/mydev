import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const readProjectFile = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const noop = () => undefined;

const platformDecisionSource = readProjectFile(
  'imports/modules/serviceWorkerPlatform.js',
);
const platformDecisionModuleUrl = `data:text/javascript;base64,${Buffer.from(
  platformDecisionSource,
).toString('base64')}`;
const { shouldRegisterBrowserServiceWorker } = await import(
  platformDecisionModuleUrl
);

test('the general client startup path does not register a service worker', () => {
  const startupSource = readProjectFile('imports/startup/client/index.js');

  assert.doesNotMatch(startupSource, /serviceWorkerInit/);
});

test('does not register a browser service worker when Meteor reports Cordova', () => {
  const shouldRegister = shouldRegisterBrowserServiceWorker({
    meteor: { isCordova: true },
    browserWindow: {},
  });

  assert.equal(shouldRegister, false);
});

test('does not register a browser service worker when window reports Cordova', () => {
  const shouldRegister = shouldRegisterBrowserServiceWorker({
    meteor: { isCordova: false },
    browserWindow: { cordova: {} },
  });

  assert.equal(shouldRegister, false);
});

test('registers a browser service worker for the web runtime', () => {
  const shouldRegister = shouldRegisterBrowserServiceWorker({
    meteor: { isCordova: false },
    browserWindow: {},
  });

  assert.equal(shouldRegister, true);
});

test('registration uses a stable worker URL and bypasses HTTP cache checks', async () => {
  const registrationSource = readProjectFile(
    'imports/infra/serviceWorkerInit.js',
  );
  let resolveRegistration;
  const registrationCalled = new Promise((resolve) => {
    resolveRegistration = resolve;
  });

  vm.runInNewContext(registrationSource, {
    console,
    navigator: {
      serviceWorker: {
        addEventListener: noop,
        register(...args) {
          resolveRegistration(args);
          return Promise.resolve({
            addEventListener: noop,
            waiting: undefined,
          });
        },
      },
    },
    window: {
      location: {
        reload: noop,
      },
    },
  });

  const [workerUrl, options] = await registrationCalled;
  assert.equal(workerUrl, '/sw.js');
  assert.equal(options.updateViaCache, 'none');
});
