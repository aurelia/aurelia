import { DI, IPlatform, Registration, Writable } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import {
  IFetchInterceptor,
  IFetchFn,
  IHttpClient,
  RetryStrategy,
} from '@aurelia/fetch-client';
import { assert } from '@aurelia/testing';

describe('fetch-client/http-client.spec.ts', function () {
  const baseUrl = 'https://api.example.com/';

  interface RecordedRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  }

  function headerRecord(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  function createTestClient(fetchFn: (request: Request, record: (request: Request) => Promise<void>) => Promise<Response>) {
    const requests: RecordedRequest[] = [];
    // pushes synchronously so aborted/hung requests are still recorded; body fills in async
    const record = async (request: Request): Promise<void> => {
      const entry: RecordedRequest = { method: request.method, url: request.url, headers: headerRecord(request.headers) };
      requests.push(entry);
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        entry.body = await request.text();
      }
    };
    const platform = new BrowserPlatform(globalThis);
    const delays: number[] = [];
    // record the requested delay but fire immediately so tests stay fast
    (platform as Writable<BrowserPlatform>).setTimeout = ((callback: () => void, ms?: number) => {
      delays.push(ms ?? 0);
      return globalThis.setTimeout(callback, 0);
    }) as BrowserPlatform['setTimeout'];
    const container = DI.createContainer();
    container.register(
      Registration.instance(IPlatform, platform),
      Registration.instance(IFetchFn, ((request: Request) => fetchFn(request, record)) as typeof fetch),
    );
    return { client: container.get(IHttpClient), delays, requests, record, platform };
  }

  function serverError(): Promise<Response> {
    return Promise.resolve(new Response(null, { status: 500 }));
  }

  function rejector<T>(promise: Promise<T>): Promise<unknown> {
    return promise.then(() => { throw new Error('expected the fetch to reject'); }, e => e);
  }

  describe('retry', function () {
    it('throws AUR5004 when multiple retry interceptors are defined', function () {
      const { client } = createTestClient(() => Promise.resolve(new Response('ok')));

      assert.throws(
        () => client.configure(config => config.withRetry().withRetry()),
        /AUR5004/,
      );
    });

    it('throws AUR5005 when the retry interceptor is not the last interceptor', function () {
      const { client } = createTestClient(() => Promise.resolve(new Response('ok')));

      assert.throws(
        () => client.configure(config => config.withRetry().rejectErrorResponses()),
        /AUR5005/,
      );
    });

    it('retries the request maxRetries times', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return serverError();
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({ maxRetries: 3, interval: 1 }));

      const err = await rejector(client.fetch('users/1'));

      assert.instanceOf(err, Response);
      assert.strictEqual((err as Response).status, 500);
      // 1 original call plus 3 retries
      assert.strictEqual(requests.length, 4);
    });

    it('continues with retry when doRetry returns true', async function () {
      let doRetryCalls = 0;
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return serverError();
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({
          maxRetries: 2,
          interval: 1,
          doRetry: () => {
            doRetryCalls++;
            return true;
          },
        }));

      const err = await rejector(client.fetch('users/1'));

      assert.instanceOf(err, Response);
      // 1 original call plus 2 retries
      assert.strictEqual(requests.length, 3);
      assert.strictEqual(doRetryCalls, 2);
    });

    it('does not retry when doRetry returns false', async function () {
      let doRetryCalls = 0;
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return serverError();
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({
          maxRetries: 2,
          interval: 1,
          doRetry: () => {
            doRetryCalls++;
            return false;
          },
        }));

      const err = await rejector(client.fetch('users/1'));

      assert.instanceOf(err, Response);
      assert.strictEqual(requests.length, 1);
      assert.strictEqual(doRetryCalls, 1);
    });

    it('calls beforeRetry callback when specified', async function () {
      let beforeRetryCalls = 0;
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return serverError();
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({
          maxRetries: 2,
          interval: 1,
          beforeRetry: request => {
            beforeRetryCalls++;
            request.headers.set('x-retry', '1');
            return request;
          },
        }));

      const err = await rejector(client.fetch('users/1'));

      assert.instanceOf(err, Response);
      // 1 original call plus 2 retries
      assert.strictEqual(requests.length, 3);
      assert.strictEqual(beforeRetryCalls, 2);
      assert.strictEqual(requests[0].headers['x-retry'], undefined);
      assert.strictEqual(requests[1].headers['x-retry'], '1');
      assert.strictEqual(requests[2].headers['x-retry'], '1');
    });

    it('fetches a brand-new Request returned from beforeRetry and still stops after maxRetries', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return serverError();
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({
          maxRetries: 2,
          interval: 1,
          beforeRetry: () => new Request(`${baseUrl}users/1`, { method: 'PUT' }),
        }));

      const err = await rejector(client.fetch('users/1'));

      assert.instanceOf(err, Response);
      // 1 original call plus 2 retries; retries must not be unbounded
      assert.strictEqual(requests.length, 3);
      assert.strictEqual(requests[1].method, 'PUT');
      assert.strictEqual(requests[1].url, 'https://api.example.com/users/1');
      assert.strictEqual(requests[2].method, 'PUT');
    });

    it('calls custom retry strategy callback when specified', async function () {
      const counters: number[] = [];
      const { client, requests, delays } = createTestClient(async (req, record) => {
        await record(req);
        return serverError();
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({
          maxRetries: 2,
          strategy: retryCount => {
            counters.push(retryCount);
            return retryCount * 10;
          },
        }));

      const err = await rejector(client.fetch('users/1'));

      assert.instanceOf(err, Response);
      assert.strictEqual(requests.length, 3);
      assert.deepStrictEqual(counters, [1, 2]);
      assert.deepStrictEqual(delays, [10, 20]);
    });

    it('waits the configured interval with the fixed retry strategy', async function () {
      const { client, delays } = createTestClient(async () => serverError());
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({ maxRetries: 2, interval: 250, strategy: RetryStrategy.fixed }));

      await rejector(client.fetch('users/1'));

      assert.deepStrictEqual(delays, [250, 250]);
    });

    it('waits increasing intervals with the incremental retry strategy', async function () {
      const { client, delays } = createTestClient(async () => serverError());
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({ maxRetries: 2, interval: 250, strategy: RetryStrategy.incremental }));

      await rejector(client.fetch('users/1'));

      assert.deepStrictEqual(delays, [250, 500]);
    });

    it('waits doubling intervals with the exponential retry strategy', async function () {
      const { client, delays } = createTestClient(async () => serverError());
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({ maxRetries: 2, interval: 2000, strategy: RetryStrategy.exponential }));

      await rejector(client.fetch('users/1'));

      assert.deepStrictEqual(delays, [2000, 4000]);
    });

    it('waits random intervals within the configured bounds with the random retry strategy', async function () {
      const originalRandom = Math.random;
      const randoms = [0.1, 0.4];
      Math.random = () => randoms.shift()!;
      try {
        const { client, delays } = createTestClient(async () => serverError());
        client.configure(config => config
          .withBaseUrl(baseUrl)
          .rejectErrorResponses()
          .withRetry({
            maxRetries: 2,
            strategy: RetryStrategy.random,
            minRandomInterval: 1000,
            maxRandomInterval: 3000,
          }));

        await rejector(client.fetch('users/1'));

        assert.deepStrictEqual(delays, [1200, 1800]);
      } finally {
        Math.random = originalRandom;
      }
    });

    it('resolves without error when a retry succeeds', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return requests.length === 1 ? serverError() : Promise.resolve(new Response('ok', { status: 200 }));
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({ maxRetries: 3, interval: 1, strategy: RetryStrategy.fixed }));

      const response = await client.fetch('users/1');

      assert.strictEqual(requests.length, 2);
      assert.strictEqual(response.status, 200);
    });

    // https://github.com/aurelia/aurelia/issues/2502
    it('preserves the original request on retry #2502', async function () {
      let calls = 0;
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        if (calls++ === 0) {
          throw new TypeError('Failed to fetch');
        }
        return new Response('ok', { status: 200 });
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .withDefaults({ headers: { 'x-token': 'abc' } })
        .withRetry({ maxRetries: 2, interval: 1 }));

      const response = await client.fetch('users/1', {
        method: 'PUT',
        body: 'payload',
        headers: { 'x-token': 'per-request' },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(requests.length, 2);
      for (const req of requests) {
        assert.strictEqual(req.method, 'PUT');
        assert.strictEqual(req.url, 'https://api.example.com/users/1');
        assert.strictEqual(req.headers['x-token'], 'per-request');
        assert.strictEqual(req.body, 'payload');
      }
    });

    // https://github.com/aurelia/aurelia/issues/2502
    it('stops retrying a persistent network error after maxRetries #2502', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        throw new TypeError('Failed to fetch');
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .withRetry({ maxRetries: 2, interval: 1 }));

      const err = await rejector(client.fetch('users/1'));

      assert.instanceOf(err, TypeError);
      // 1 original call plus 2 retries
      assert.strictEqual(requests.length, 3);
    });

    // https://github.com/aurelia/aurelia/issues/2502
    it('does not retry an aborted request #2502', async function () {
      let doRetryCalls = 0;
      const { client, requests } = createTestClient((req, record) => {
        void record(req);
        return new Promise<Response>((_resolve, reject) => {
          if (req.signal.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
          } else {
            req.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          }
        });
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .withRetry({
          maxRetries: 2,
          interval: 1,
          doRetry: () => {
            doRetryCalls++;
            return true;
          },
        }));
      const controller = new AbortController();

      const promise = client.fetch('users/1', { signal: controller.signal });
      controller.abort();
      const err = await rejector(promise);

      assert.strictEqual((err as DOMException).name, 'AbortError');
      assert.strictEqual(requests.length, 1);
      assert.strictEqual(doRetryCalls, 0);
    });

    // https://github.com/aurelia/aurelia/issues/2502
    for (const method of ['POST', 'PATCH']) {
      it(`does not retry ${method} on a network error by default #2502`, async function () {
        const { client, requests } = createTestClient(async (req, record) => {
          await record(req);
          throw new TypeError('Failed to fetch');
        });
        client.configure(config => config
          .withBaseUrl(baseUrl)
          .withRetry({ maxRetries: 2, interval: 1 }));

        const err = await rejector(client.fetch('users/1', { method, body: 'payload' }));

        assert.instanceOf(err, TypeError);
        assert.strictEqual(requests.length, 1);
      });
    }

    // https://github.com/aurelia/aurelia/issues/2502
    for (const method of ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']) {
      it(`retries ${method} on a network error by default #2502`, async function () {
        const { client, requests } = createTestClient(async (req, record) => {
          await record(req);
          return requests.length === 1 ? Promise.reject(new TypeError('Failed to fetch')) : Promise.resolve(new Response('ok', { status: 200 }));
        });
        client.configure(config => config
          .withBaseUrl(baseUrl)
          .withRetry({ maxRetries: 2, interval: 1 }));

        const response = await client.fetch('users/1', { method, ...(method === 'PUT' ? { body: 'payload' } : {}) });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(requests.length, 2);
        for (const req of requests) {
          assert.strictEqual(req.method, method);
          assert.strictEqual(req.url, 'https://api.example.com/users/1');
        }
      });
    }

    // https://github.com/aurelia/aurelia/issues/2502
    it('retries a POST when doRetry opts it in #2502', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return requests.length === 1 ? Promise.reject(new TypeError('Failed to fetch')) : Promise.resolve(new Response('ok', { status: 200 }));
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .withRetry({ maxRetries: 2, interval: 1, doRetry: () => true }));

      const response = await client.fetch('users/1', { method: 'POST', body: 'payload' });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(requests.length, 2);
      for (const req of requests) {
        assert.strictEqual(req.method, 'POST');
        assert.strictEqual(req.body, 'payload');
      }
    });

    // https://github.com/aurelia/aurelia/issues/2502
    it('does not retry when a previous interceptor short-circuits the request #2502', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return new Response('ok');
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .withInterceptor({ request: () => new Response(null, { status: 500 }) })
        .rejectErrorResponses()
        .withRetry({ maxRetries: 2 }));

      const err = await rejector(client.fetch('users/1'));

      // the 500 response must propagate, not a TypeError from a missing retryConfig
      assert.instanceOf(err, Response);
      assert.strictEqual((err as Response).status, 500);
      assert.strictEqual(requests.length, 0);
    });
  });

  describe('cancellation review (#2554)', function () {
    for (const preserveSignal of [true, false]) {
      it(`keeps cancellation effective during an async retry hook (replacement inherits signal=${preserveSignal})`, async function () {
        let enterHook: () => void;
        let releaseHook: () => void;
        const entered = new Promise<void>(resolve => { enterHook = resolve; });
        const released = new Promise<void>(resolve => { releaseHook = resolve; });
        const nativeFetch = globalThis.fetch.bind(globalThis);
        const controller = new AbortController();
        const { client, requests } = createTestClient(async (request, record) => {
          await record(request);
          // One service failure enters retry handling; the retry uses actual Fetch
          // cancellation semantics without contacting an external server.
          return requests.length === 1 ? new Response(null, { status: 503 }) : nativeFetch(request);
        });
        client.configure(config => config.rejectErrorResponses().withRetry({
          maxRetries: 1,
          interval: 0,
          beforeRetry: async request => {
            enterHook!();
            await released;
            return new Request(preserveSignal ? request : request.url, { headers: { 'x-token': 'refreshed' } });
          },
        }));
        const outcome = client.fetch('data:text/plain,retried', { signal: controller.signal })
          .then(response => ({ response, error: null }), error => ({ response: null, error }));
        await entered;
        controller.abort();
        releaseHook!();
        const result = await outcome;
        assert.strictEqual(result.response, null, 'the cancelled logical call must not succeed');
        assert.strictEqual(result.error?.name, 'AbortError');
        assert.strictEqual(client.isRequesting, false);
      });
    }

    it('keeps the caller signal on a url-built replacement request once it is dispatched', async function () {
      const nativeFetch = globalThis.fetch.bind(globalThis);
      const controller = new AbortController();
      const { client, requests } = createTestClient(async (request, record) => {
        await record(request);
        if (requests.length === 1) {
          return new Response(null, { status: 503 });
        }
        // abort after the replacement is in flight; native Fetch rejects only if it carries the signal
        controller.abort();
        return nativeFetch(request);
      });
      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 1,
        interval: 0,
        beforeRetry: request => new Request(request.url, { headers: { 'x-token': 'refreshed' } }),
      }));
      const result = await client.fetch('data:text/plain,retried', { signal: controller.signal })
        .then(response => ({ response, error: null }), error => ({ response: null, error }));
      assert.strictEqual(result.response, null, 'the cancelled logical call must not succeed');
      assert.strictEqual(result.error?.name, 'AbortError');
      assert.strictEqual(requests[1].headers['x-token'], 'refreshed');
      assert.strictEqual(client.isRequesting, false);
    });

    it('settles cancellation during backoff without waiting for its timer or running the retry hook', async function () {
      let delayScheduled: () => void;
      let releaseDelay: () => void;
      const scheduled = new Promise<void>(resolve => { delayScheduled = resolve; });
      const controller = new AbortController();
      const nativeFetch = globalThis.fetch.bind(globalThis);
      const { client, requests, platform } = createTestClient(async (request, record) => {
        await record(request);
        return requests.length === 1 ? new Response(null, { status: 503 }) : nativeFetch(request);
      });
      // Hold only the retry timer. A separate task below drains ordinary promise
      // reactions so the test does not depend on guessed millisecond delays.
      (platform as Writable<BrowserPlatform>).setTimeout = ((callback: () => void) => {
        releaseDelay = callback;
        delayScheduled!();
        return 0;
      }) as BrowserPlatform['setTimeout'];
      let hookCalls = 0;
      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 1,
        interval: 30_000,
        beforeRetry: request => { ++hookCalls; return request; },
      }));
      let settled = false;
      const outcome = client.fetch('data:text/plain,retried', { signal: controller.signal })
        .then(response => ({ response, error: null }), error => ({ response: null, error }));
      void outcome.then(() => { settled = true; });
      await scheduled;
      controller.abort();
      await new Promise<void>(resolve => globalThis.setTimeout(resolve, 0));
      const settledOnAbort = settled;
      const requestingAfterAbort = client.isRequesting;
      // Release the held callback even on the broken implementation so no test
      // leaves pending work behind. Native Fetch rejects its aborted clone.
      releaseDelay!();
      const result = await outcome;
      assert.strictEqual(result.error?.name, 'AbortError');
      assert.deepStrictEqual(
        { settledOnAbort, requestingAfterAbort, hookCalls },
        { settledOnAbort: true, requestingAfterAbort: false, hookCalls: 0 },
        'abort should settle the call before the retry delay elapses and skip its hook',
      );
    });
  });

  describe('isRequesting', function () {
    it('is set to true when starting a request', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return new Response('ok');
      });

      assert.strictEqual(client.isRequesting, false);
      const promise = client.fetch('https://example.com/some/cool/path');
      assert.strictEqual(client.isRequesting, true);

      await promise;
      assert.strictEqual(requests.length, 1);
    });

    it('is set to false when the request is finished', async function () {
      const { client } = createTestClient(() => Promise.resolve(new Response('ok')));

      const promise = client.fetch('https://example.com/some/cool/path');
      assert.strictEqual(client.isRequesting, true);

      await promise;
      assert.strictEqual(client.isRequesting, false);
    });

    it('is still true when a second request is in progress', async function () {
      let resolveSecond: (response: Response) => void;
      let call = 0;
      const { client } = createTestClient(() => call++ === 0
        ? Promise.resolve(new Response('ok'))
        : new Promise<Response>(resolve => { resolveSecond = resolve; }));

      const first = client.fetch('https://example.com/some/cool/path');
      const second = client.fetch('https://example.com/some/other/path');
      assert.strictEqual(client.isRequesting, true);

      await first;
      assert.strictEqual(client.isRequesting, true);

      resolveSecond!(new Response('ok'));
      await second;
      assert.strictEqual(client.isRequesting, false);
    });

    it('is set to false when the request is rejected', async function () {
      const { client } = createTestClient(() => Promise.reject(new TypeError('Failed to fetch')));

      const err = await rejector(client.fetch('https://example.com/some/cool/path'));

      assert.strictEqual((err as TypeError).message, 'Failed to fetch');
      assert.strictEqual(client.isRequesting, false);
    });

    it('stays true during a series of retries and is false after they all fail', async function () {
      const requestingSamples: boolean[] = [];
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return serverError();
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({
          maxRetries: 3,
          interval: 1,
          doRetry: () => {
            requestingSamples.push(client.isRequesting);
            return true;
          },
        }));

      const promise = client.fetch('users/1');
      assert.strictEqual(client.isRequesting, true);

      const err = await rejector(promise);
      assert.instanceOf(err, Response);
      // 1 original call plus 3 retries
      assert.strictEqual(requests.length, 4);
      assert.deepStrictEqual(requestingSamples, [true, true, true]);
      assert.strictEqual(client.activeRequestCount, 0);
      assert.strictEqual(client.isRequesting, false);
    });

    it('is set to false after a retry succeeds', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return requests.length === 1 ? serverError() : Promise.resolve(new Response('ok', { status: 200 }));
      });
      client.configure(config => config
        .withBaseUrl(baseUrl)
        .rejectErrorResponses()
        .withRetry({ maxRetries: 3, interval: 1, strategy: RetryStrategy.fixed }));

      const promise = client.fetch('users/1');
      assert.strictEqual(client.isRequesting, true);

      const response = await promise;
      // 1 original call plus 1 retry
      assert.strictEqual(requests.length, 2);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(client.activeRequestCount, 0);
      assert.strictEqual(client.isRequesting, false);
    });

    it('tracks forward requests from interceptors', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        throw new Response(null, { status: 500 });
      });
      client.configure(config => config.withBaseUrl(baseUrl));
      let retry = 3;
      const responseErrors: [unknown, Request][] = [];
      const interceptor: IFetchInterceptor = {
        responseError(error, request, httpClient) {
          responseErrors.push([error, request!]);
          if (retry--) {
            return httpClient!.fetch(httpClient!.buildRequest('retry', {}));
          }
          throw error;
        }
      };
      client.configure(config => config.withInterceptor(interceptor));

      const err = await rejector(client.fetch('users/1'));

      assert.instanceOf(err, Response);
      for (const [error, request] of responseErrors) {
        assert.instanceOf(error, Response);
        assert.instanceOf(request, Request);
      }
      // 1 original call plus 3 forwarded requests
      assert.strictEqual(requests.length, 4);
      assert.strictEqual(client.activeRequestCount, 0);
      assert.strictEqual(client.isRequesting, false);
    });
  });

  describe('default request parameters', function () {
    it('doesn\'t apply baseUrl to absolute URLs', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return new Response('ok');
      });
      client.configure(config => config.withBaseUrl('http://aurelia.io/'));

      await client.fetch('https://example.com/test');

      assert.strictEqual(requests.length, 1);
      assert.strictEqual(requests[0].url, 'https://example.com/test');
    });

    it('applies default headers to requests using a Headers instance', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return new Response('ok');
      });
      client.configure(config => config.withDefaults({ headers: { 'x-foo': 'bar' } }));

      await client.fetch(`${baseUrl}path`, { headers: new Headers({ 'x-baz': 'bat' }) });

      assert.strictEqual(requests.length, 1);
      assert.strictEqual(requests[0].headers['x-foo'], 'bar');
      assert.strictEqual(requests[0].headers['x-baz'], 'bat');
    });

    it('evaluates default header function values on each request', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return new Response('ok');
      });
      let value = 0;
      client.configure(config => config.withDefaults({
        headers: { 'x-foo': () => String(++value) } as unknown as HeadersInit,
      }));

      await Promise.all([
        client.fetch(`${baseUrl}path1`),
        client.fetch(`${baseUrl}path2`),
      ]);

      assert.strictEqual(requests.length, 2);
      assert.strictEqual(requests[0].headers['x-foo'], '1');
      assert.strictEqual(requests[1].headers['x-foo'], '2');
    });

    it('uses the default content-type header', async function () {
      const { client, requests } = createTestClient(async (req, record) => {
        await record(req);
        return new Response('ok');
      });
      const contentType = 'application/octet-stream';
      // a lowercase default content-type is applied with a dev-mode console warning
      client.configure(config => config.withDefaults({ method: 'post', body: '{}', headers: { 'content-type': contentType } }));

      await client.fetch(`${baseUrl}path`);

      assert.strictEqual(requests.length, 1);
      assert.strictEqual(requests[0].headers['content-type'], contentType);
    });
  });
});
