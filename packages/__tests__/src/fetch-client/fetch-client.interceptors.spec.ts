import { IHttpClient, IFetchInterceptor } from '@aurelia/fetch-client';
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
  let fetchCallCount: number;
  let mockFetch: typeof window.fetch | undefined;

  beforeEach(function () {
    fetchCallCount = 0;
    mockResponse = new Response(null, { status: 200 });
    mockFetch = undefined;
    window.fetch = function (...args: any[]) {
      fetchCallCount++;
      if (mockFetch) {
        return mockFetch.apply(this, args);
      }
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

  it('runs on request', async function () {
    let i = 0;
    const interceptor: IFetchInterceptor = {
      request(r) {
        i = 1;
        return r;
      },
      requestError(r) {
        throw r;
      }
    };
    client.configure(c => c.withInterceptor(interceptor));

    await client.fetch('path');
    assert.strictEqual(i, 1);
  });

  it('pipes requets through interceptors', async function () {
    const requests = [];
    client.configure(c => c.withInterceptor({
      request(r) {
        requests.push(r);
        return r;
      }
    }).withInterceptor({
      request(r) {
        requests.push(r);
        return r;
      }
    }));

    const request = new Request('/path');
    await client.fetch(request);
    const [r1, r2] = requests;
    assert.strictEqual(r1, r2);
    assert.strictEqual(r1, request);
  });

  it('runs requestError', async function () {
    let i = 0;
    client.configure(c => {
      c.withInterceptor({
        request: () => { throw new Error(); }
      });
      c.withInterceptor({
        requestError() {
          i = 1;
          return mockResponse;
        }
      });
    });

    await client.fetch('/a');
    assert.strictEqual(i, 1);
  });

  it('run on response', async function () {
    let i = 0;
    client.configure(c => c.withInterceptor({
      response(r) {
        i = 1;
        assert.strictEqual(r, mockResponse);
        return r;
      }
    }));

    await client.fetch('path');
    assert.strictEqual(i, 1);
  });

  it('does not reject error responses 400 by default', function () {
    mockResponse = new Response(null, { status: 400 });
    return assert.doesNotReject(() => client.fetch('/a'));
  });

  it('does not reject error responses 500 by default', function () {
    mockResponse = new Response(null, { status: 500 });
    return assert.doesNotReject(() => client.fetch('/a'));
  });

  it('rejects error responses 400 when configured', function () {
    client.configure(config => config.rejectErrorResponses());
    mockResponse = new Response(null, { status: 400 });
    return assert.rejects(() => client.fetch('/a'));
  });

  it('rejects error responses 500', function () {
    client.configure(config => config.rejectErrorResponses());
    mockResponse = new Response(null, { status: 500 });
    return assert.rejects(() => client.fetch('/a'));
  });

  it('run on response error', async function () {
    mockResponse = new Response(null, { status: 400 });
    let i = 0;
    let error: unknown;
    client.configure(c => c.rejectErrorResponses().withInterceptor({
      responseError(e: any) {
        i = 1;
        error = e;
        return mockResponse;
      }
    }));

    await client.fetch('/path');
    assert.strictEqual(i, 1);
    assert.instanceOf(error, Response);
  });

  it('runs responseError when fetch returns a rejected promise', async function () {
    mockResponse = Promise.reject(new Error('test'));
    let i = 0;
    let error: unknown;
    client.configure(c => c.withInterceptor({
      responseError(e: any) {
        i = 1;
        error = e;
        return e;
      }
    }));
    await client.fetch('/path');
    assert.strictEqual(i, 1);
    assert.instanceOf(error, Error);
  });

  it('runs response error when fetch is aborted', async function () {
    let i = 0;
    client.configure(c => c.withInterceptor({
      responseError() {
        i = 1;
        return new Response(null, { status: 333 });
      }
    }));
    mockFetch = originalFetchFn;

    const controller = new AbortController();
    const result = client.fetch('/path', { signal: controller.signal });
    controller.abort();
    assert.strictEqual((await result).status, 333);
    assert.strictEqual(i, 1);
  });

  it('allows short circuit of request by returning response in interceptor', async function () {
    client.configure(c => c.withInterceptor({
      request: () => mockResponse
    }));
    assert.strictEqual(await client.fetch('/a'), mockResponse);
    assert.strictEqual(fetchCallCount, 0);
  });

  it('reruns request when request is returned in response interceptor', async function () {
    let i = 1;
    client.configure(c => c.withInterceptor({
      response: (r) => {
        if (i-- > 0) {
          return new Request('/a1') as any;
        }
        return r;
      }
    }));

    await client.fetch('/a');
    assert.strictEqual(fetchCallCount, 2);
  });

  it('reruns request when request is returned in responseError interceptor', async function () {
    mockResponse = new Response(null, { status: 400 });
    let i = 0;
    client.configure(c => c.rejectErrorResponses().withInterceptor({
      responseError(e: any) {
        i++;
        if (e === mockResponse) {
          mockResponse = new Response(null, { status: 200 });
          return new Request('/a');
        }
        return e;
      }
    }));

    await client.fetch('chrome://path');
    assert.strictEqual(fetchCallCount, 2);
    assert.strictEqual(i, 1);
  });

  it('short circuits request interceptors when response is returned in a request interceptor chain', async function () {
    client.configure(c => c.withInterceptor({
      request: () => mockResponse
    }).withInterceptor({
      request: () => { throw new Error('should not run'); }
    }));

    await client.fetch('/a');
  });

  it('short circuits response interceptors when a request is returned in a response interceptor chain', async function () {
    let i = 0;
    client.configure(c => c.withInterceptor({
      response: () => i++ === 0 ? new Request('/a') : mockResponse
    }).withInterceptor({
      response: () => {
        if (i === 1) {
          throw new Error('should not run');
        } else {
          return mockResponse;
        }
      }
    }));

    await client.fetch('/a');
    assert.strictEqual(fetchCallCount, 2);
    assert.strictEqual(i, 2);
  });
});
