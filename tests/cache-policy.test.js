import assert from 'assert';
import { Meteor } from 'meteor/meteor';
import {
  HTML_CACHE_CONTROL,
  getCacheControlForRequest,
} from '../imports/modules/cachePolicy';

describe('HTTP cache policy', function () {
  it('disables storage for HTML navigations', function () {
    assert.strictEqual(
      getCacheControlForRequest({
        method: 'GET',
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'sec-fetch-mode': 'navigate',
        },
      }),
      HTML_CACHE_CONTROL,
    );
  });

  it('handles clients that identify navigations only through Accept', function () {
    assert.strictEqual(
      getCacheControlForRequest({
        method: 'HEAD',
        headers: { accept: 'text/html' },
      }),
      HTML_CACHE_CONTROL,
    );
  });

  it('preserves normal caching for Meteor bundles and static assets', function () {
    assert.strictEqual(
      getCacheControlForRequest({
        method: 'GET',
        headers: {
          accept: '*/*',
          'sec-fetch-mode': 'cors',
        },
      }),
      undefined,
    );
  });

  it('does not apply navigation cache policy to mutations', function () {
    assert.strictEqual(
      getCacheControlForRequest({
        method: 'POST',
        headers: {
          accept: 'text/html',
          'sec-fetch-mode': 'navigate',
        },
      }),
      undefined,
    );
  });
});

if (Meteor.isServer) {
  describe('HTTP cache headers', function () {
    before(async function () {
      await import('../imports/startup/server/cacheHeaders');
    });

    it('sends no-store headers on the final HTML response', async function () {
      const response = await fetch(
        Meteor.absoluteUrl(`cache-policy-test?request=${Date.now()}`),
        {
          headers: { accept: 'text/html' },
        },
      );

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('cache-control'),
        HTML_CACHE_CONTROL,
      );
      assert.strictEqual(
        response.headers.get('surrogate-control'),
        'no-store',
      );
    });

    it('leaves static asset caching available', async function () {
      const response = await fetch(
        Meteor.absoluteUrl(`favicon.ico?request=${Date.now()}`),
        {
          headers: { accept: 'image/x-icon' },
        },
      );
      const cacheControl = response.headers.get('cache-control') || '';

      assert.strictEqual(response.status, 200);
      assert.doesNotMatch(cacheControl, /(?:^|,)\s*no-store(?:,|$)/);
      assert.strictEqual(response.headers.get('surrogate-control'), null);
    });
  });
}
