import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';
import { assert, createFixture } from '@aurelia/testing';
import { isNode } from '../util.js';

describe('fetch-client/fetch-client.interceptors.spec.ts', function () {
  if (isNode()) {
    return;
  }

  const originalFetchFn = window.fetch;
  let mockResponse: Response | Promise<Response>;
  let client: IHttpClient;
  let callCount: number;

  beforeEach(function () {
    callCount = 0;
    mockResponse = new Response(null, { status: 200 });
    window.fetch = function (...args: any[]) {
      callCount++;
      if (mockResponse instanceof Promise) {
        return mockResponse;
      }
      if (mockResponse.status === 599) {
        return originalFetchFn.apply(this, args);
      }
      return Promise.resolve(mockResponse);
    };

    // createing client in an app to make it more like a real app
    // though it should work just fine without an app
    ({ component: { http: client } } = createFixture('${message}', class App {
      http = resolve(IHttpClient);
    }));
  });

  afterEach(function () {
    window.fetch = originalFetchFn;
  });

  it('caches successful get requests', async function () {
    mockResponse = new Response(null, { status: 200 });
    client.configure(c => c.withCache({}));

    await client.fetch('/a');
    assert.strictEqual(callCount, 1);
    await client.fetch('/a');
    assert.strictEqual(callCount, 1);
  });

  it('does not cache non-get requests', async function () {
    mockResponse = new Response(null, { status: 200 });
    client.configure(c => c.withCache({}));

    await client.post('/a');
    assert.strictEqual(callCount, 1);
    await client.post('/a');
    assert.strictEqual(callCount, 2);
  });

  // todo: events cache hit, miss, stale, expired
  // todo: ability to change storage. Browser local storage, session storage
});
