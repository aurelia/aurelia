// import { CacheEvent, IHttpClient } from '@aurelia/fetch-client';
// import { IEventAggregator, IPlatform, Writable, resolve } from '@aurelia/kernel';
// import { assert, createFixture, createSpy } from '@aurelia/testing';
// import { isNode } from '../util.js';

describe('fetch-client/fetch-client.cache-interceptor.spec.ts', function () {
  // if (isNode()) {
  //   return;
  // }

  // const originalFetchFn = window.fetch;
  // let mockResponse: Response | Promise<Response>;
  // let client: IHttpClient;
  // let callCount: number;
  // let ea: IEventAggregator;
  // let eventCount: Writable<typeof CacheEvent>;
  // let p: IPlatform;

  // beforeEach(function () {
  //   callCount = 0;
  //   mockResponse = new Response(null, { status: 200 });
  //   eventCount = Object.keys(CacheEvent).reduce((acc, key) => { acc[key] = 0; return acc; }, {}) as typeof eventCount;
  //   window.fetch = function (...args: any[]) {
  //     callCount++;
  //     if (mockResponse instanceof Promise) {
  //       return mockResponse;
  //     }
  //     if (mockResponse.status === 599) {
  //       return originalFetchFn.apply(this, args);
  //     }
  //     return Promise.resolve(mockResponse);
  //   };

  //   // createing client in an app to make it more like a real app
  //   // though it should work just fine without an app
  //   ({ component: { http: client, ea, p } } = createFixture('${message}', class App {
  //     http = resolve(IHttpClient);
  //     ea = resolve(IEventAggregator);
  //     p = resolve(IPlatform);
  //   }));

  //   for (const key of Object.keys(CacheEvent)) {
  //     ea.subscribe(CacheEvent[key], () => eventCount[key]++);
  //   }

  // });

  // afterEach(function () {
  //   window.fetch = originalFetchFn;
  // });

  // it('throws if cache interceptor is not in the last position', function () {
  //   let c = 0;
  //   try {
  //     client.configure(c => c.withCache().withInterceptor({ }));
  //   } catch (ex) {
  //     c++;
  //     assert.match(ex.message, /The cache interceptor is only allowed as the last interceptor/);
  //   }
  //   assert.strictEqual(c, 1);
  // });

  // it('does not throw if retry interceptor is after cache interceptor', function () {
  //   client.configure(c => c.withCache().withRetry());
  // });

  // it('throws if cache is not before retry interceptor', function () {
  //   let error: Error;
  //   try {
  //     client.configure(c => c.withCache().withInterceptor({}).withRetry());
  //   } catch (ex) {
  //     error = ex;
  //   }
  //   assert.match(error.message, /The cache interceptor must be defined before the retry interceptor/);
  // });

  // it('caches successful get requests', async function () {
  //   mockResponse = new Response(null, { status: 200 });
  //   client.configure(c => c.withCache());

  //   await client.fetch('/a');
  //   assert.strictEqual(callCount, 1);
  //   assert.strictEqual(eventCount.CacheMiss, 1, `eventCount.Set`);
  //   assert.strictEqual(eventCount.Set, 1, `eventCount.Set`);
  //   assert.strictEqual(eventCount.CacheHit, 0, `eventCount.CacheHit`);
  //   await client.fetch('/a');
  //   assert.strictEqual(callCount, 1);
  //   assert.strictEqual(eventCount.CacheMiss, 1, `eventCount.Set`);
  //   assert.strictEqual(eventCount.Set, 1, `eventCount.Set`);
  //   assert.strictEqual(eventCount.CacheHit, 1, `eventCount.CacheHit`);
  // });

  // it('does not cache failed get requests', async function () {
  //   mockResponse = new Response(null, { status: 400 });
  //   client.configure(c => c.rejectErrorResponses().withCache());

  //   await client.fetch('/a').catch(() => {});
  //   assert.strictEqual(callCount, 1);
  //   assert.strictEqual(eventCount.CacheMiss, 1, `eventCount.Set`);
  //   assert.strictEqual(eventCount.Set, 0, `eventCount.Set`);
  //   assert.strictEqual(eventCount.CacheHit, 0, `eventCount.CacheHit`);
  //   await client.fetch('/a').catch(() => {});
  //   assert.strictEqual(callCount, 2);
  //   assert.strictEqual(eventCount.CacheMiss, 2, `eventCount.Set`);
  //   assert.strictEqual(eventCount.Set, 0, `eventCount.Set`);
  //   assert.strictEqual(eventCount.CacheHit, 0, `eventCount.CacheHit`);
  // });

  // it('does not cache non-get requests', async function () {
  //   mockResponse = new Response(null, { status: 200 });
  //   client.configure(c => c.withCache());

  //   await client.post('/a');
  //   assert.strictEqual(callCount, 1);
  //   await client.post('/a');
  //   assert.strictEqual(callCount, 2);
  // });

  // it('stops background refresh when disposed', async function () {
  //   let intervalCount = 0;
  //   const spy = createSpy(p, 'setInterval', (handler: Function, timer: number) => {
  //     return setInterval(() => {
  //       intervalCount++;
  //       handler();
  //     }, timer);
  //   });
  //   mockResponse = new Response(null, { status: 200 });
  //   client.configure(c => c.withCache({ refreshInterval: 100 }));

  //   await client.fetch('/a');
  //   assert.strictEqual(callCount, 1);
  //   assert.strictEqual(intervalCount, 0);
  //   assert.strictEqual(eventCount.CacheBackgroundRefreshed, 0);
  //   assert.strictEqual(eventCount.CacheBackgroundRefreshing, 0);
  //   assert.strictEqual(eventCount.CacheBackgroundStopped, 0);
  //   await new Promise(r => p.setTimeout(r, 101));
  //   assert.strictEqual(intervalCount, 1);
  //   assert.strictEqual(eventCount.CacheBackgroundRefreshed, 1);
  //   assert.strictEqual(eventCount.CacheBackgroundRefreshing, 1);
  //   assert.strictEqual(eventCount.CacheBackgroundStopped, 0);

  //   await new Promise(r => p.setTimeout(r, 101));
  //   assert.strictEqual(intervalCount, 2);
  //   assert.strictEqual(eventCount.CacheBackgroundRefreshed, 2);
  //   assert.strictEqual(eventCount.CacheBackgroundRefreshing, 2);
  //   assert.strictEqual(eventCount.CacheBackgroundStopped, 0);

  //   client.dispose();
  //   await new Promise(r => p.setTimeout(r, 101));
  //   assert.strictEqual(intervalCount, 2);
  //   assert.strictEqual(eventCount.CacheBackgroundRefreshed, 2);
  //   assert.strictEqual(eventCount.CacheBackgroundRefreshing, 2);
  //   assert.strictEqual(eventCount.CacheBackgroundStopped, 1);

  //   spy.restore();
  // });

  // todo: events cache stale, expired
});
