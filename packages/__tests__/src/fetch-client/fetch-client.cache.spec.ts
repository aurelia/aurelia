import { CacheEvents, IHttpClient } from '@aurelia/fetch-client';
import { IEventAggregator, Writable, resolve } from '@aurelia/kernel';
import { assert, createFixture } from '@aurelia/testing';
import { isNode } from '../util.js';

describe('fetch-client/fetch-client.cache.spec.ts', function () {
  if (isNode()) {
    return;
  }

  const originalFetchFn = window.fetch;
  let mockResponse: Response | Promise<Response>;
  let client: IHttpClient;
  let callCount: number;
  let ea: IEventAggregator;
  let eventCount: Writable<typeof CacheEvents>;

  beforeEach(function () {
    callCount = 0;
    mockResponse = new Response(null, { status: 200 });
    eventCount = Object.keys(CacheEvents).reduce((acc, key) => { acc[key] = 0; return acc; }, {}) as typeof eventCount;
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
    ({ component: { http: client, ea } } = createFixture('${message}', class App {
      http = resolve(IHttpClient);
      ea = resolve(IEventAggregator);
    }));

    for (const key of Object.keys(CacheEvents)) {
      ea.subscribe(CacheEvents[key], () => eventCount[key]++);
    }

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
    // todo: should this be 1? if data was retrieved from cache, it shouldn't update the cache
    assert.strictEqual(eventCount.Set, 2, `eventCount.Set`);
    assert.strictEqual(eventCount.CacheHit, 1, `eventCount.CacheHit`);
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
