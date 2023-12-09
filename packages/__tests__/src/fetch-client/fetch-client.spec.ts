import { DI, IContainer, resolve } from '@aurelia/kernel';
import { HttpClient, HttpClientConfiguration, IHttpClient, json } from '@aurelia/fetch-client';
import { assert, createFixture } from '@aurelia/testing';
import { isNode } from '../util.js';

describe('fetch-client/fetch-client.spec.ts', function () {
  if (isNode()) {
    return;
  }

  describe('configure', function () {
    let container: IContainer;
    let client: IHttpClient;

    beforeEach(function () {
      container = DI.createContainer();
      client = container.invoke(HttpClient);
    });

    it('accepts plain objects', function () {
      const defaults = {};
      client.configure(defaults);

      assert.strictEqual(client.isConfigured, true, `client.isConfigured`);
      assert.strictEqual(client.defaults, defaults, `client.defaults`);
    });

    it('accepts configuration callbacks', function () {
      const defaults = { foo: true };
      const baseUrl = '/test';
      const interceptor = {};

      client.configure(config => {
        assert.instanceOf(config, HttpClientConfiguration, `config`);

        return config
          .withDefaults(defaults as RequestInit)
          .withBaseUrl(baseUrl)
          .withInterceptor(interceptor);
      });

      assert.strictEqual(client.isConfigured, true, `client.isConfigured`);
      assert.strictEqual((client.defaults as { foo: boolean }).foo, true, `(client.defaults as {foo: boolean}).foo`);
      assert.strictEqual(client.baseUrl, baseUrl, `client.baseUrl`);
      assert.strictEqual(client.interceptors.indexOf(interceptor), 0, `client.interceptors.indexOf(interceptor)`);
    });

    it('accepts configuration override', function () {
      const defaults = { foo: true };

      client.configure(config => config.withDefaults(defaults as RequestInit));

      client.configure(config => {
        assert.strictEqual((config.defaults as { foo: boolean }).foo, true, `(config.defaults as {foo: boolean}).foo`);

        return config;
      });
    });

    it('rejects invalid configs', function () {
      assert.throws(() => client.configure(1 as RequestInit), void 0, `() => client.configure(1 as RequestInit)`);
    });

    it('applies standard configuration', function () {
      client.configure(config => config.useStandardConfiguration());

      assert.strictEqual(client.defaults.credentials, 'same-origin', `client.defaults.credentials`);
      assert.strictEqual(client.interceptors.length, 1, `client.interceptors.length`);
    });

    it('rejects error responses', function () {
      client.configure(config => config.rejectErrorResponses());

      assert.strictEqual(client.interceptors.length, 1, `client.interceptors.length`);
    });

    it('throws if an interceptor returns neither Request nor Response', function () {
      client.configure(config => config.withInterceptor({
        request: () => ({  } as any)
      }));
      return assert.rejects(() => client.fetch('/a'), /An invalid result was returned by the interceptor chain/);
    });
  });

  describe('fetch', function () {
    const originalFetchFn = window.fetch;
    let mockFetchFn: any;
    let client: IHttpClient;
    let callCount: number;

    beforeEach(function () {
      callCount = 0;
      window.fetch = function (...args: any[]) {
        callCount++;
        return mockFetchFn?.(...args as Parameters<typeof fetch>);
      };
      mockFetchFn = function (request: Request) {
        return {
          // request,
          method: request.method,
          url: request.url.replace(location.origin, ''),
          headers: getRequestHeaders(request),
        };
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

    it('errors on missing fetch implementation', function () {
      window.fetch = undefined;
      assert.throws(() => createFixture('', class App { http = resolve(IHttpClient); }));
    });

    it('works when injecting IHttpClient', async function () {
      assert.deepStrictEqual(
        await client.fetch('/a'),
        { method: 'GET', url: '/a', headers: {} }
      );
    });

    it('works when injecting HttpClient', async function () {
      ({ component: { http: client } } = createFixture('${message}', class App {
        http = resolve(HttpClient);
      }));
      assert.deepStrictEqual(
        await client.fetch('/a'),
        { method: 'GET', url: '/a', headers: {} }
      );
    });

    it('makes requests with full url string inputs', async function () {
      assert.deepStrictEqual(
        await client.fetch('http://example.com/some/cool/path'),
        { method: 'GET', url: 'http://example.com/some/cool/path', headers: {} }
      );
    });

    it('makes requests with Request as input', async function () {
      assert.deepStrictEqual(
        await client.fetch(new Request('/a')),
        { method: 'GET', url: '/a', headers: {} }
      );
    });

    it('makes proper requests with json() inputs', async function () {
      assert.deepStrictEqual(
        await client.fetch('http://example.com/some/cool/path', {
          method: 'post',
          body: json({ test: 'object' })
        }),
        { method: 'POST', url: 'http://example.com/some/cool/path', headers: { 'content-type': 'application/json' } }
      );
      assert.deepStrictEqual(callCount, 1);
    });

    it('makes request and aborts with an AbortController signal', function () {
      window.fetch = originalFetchFn;
      ({ component: { http: client } } = createFixture('${message}', class App {
        http = resolve(IHttpClient);
      }));
      const controller = new AbortController();

      const promise = client
        .fetch('http://jsonplaceholder.typicode.com/users', { signal: controller.signal })
        .then(
          () => { throw new Error('Invalid path'); },
          (error: Error) => {
            assert.strictEqual(error instanceof Error, true, `result instanceof Error`);
            assert.strictEqual(error.name, 'AbortError', `result.name`);
          }
        );

      controller.abort();
      return promise;
    });

    describe('shortcut methods', function () {
      it('sends get', async function () {
        assert.deepStrictEqual(
          await client.get('/a'),
          { method: 'GET', url: '/a', headers: {} }
        );
      });

      it('sends post', async function () {
        assert.deepStrictEqual(
          await client.post('/a'),
          { method: 'POST', url: '/a', headers: {} }
        );
      });

      it('sends put', async function () {
        assert.deepStrictEqual(
          await client.put('/a'),
          { method: 'PUT', url: '/a', headers: {} }
        );
      });

      it('send patch', async function () {
        assert.deepStrictEqual(
          await client.patch('/a'),
          { method: 'PATCH', url: '/a', headers: {} }
        );
      });

      it('sends delete', async function () {
        assert.deepStrictEqual(
          await client.delete('/a'),
          { method: 'DELETE', url: '/a', headers: {} }
        );
      });
    });

    describe('with baseUrl configured', function () {
      it('compute final url with string inputs', async function () {
        client.configure(config => config.withBaseUrl('http://example.com/'));
        assert.deepStrictEqual(
          await client.fetch('some/cool/path'),
          { method: 'GET', url: 'http://example.com/some/cool/path', headers: {} }
        );
      });

      // fetch client shouldn't try to reconfigure url of a request object
      it('disegards baseUrl of Request inputs', async function () {
        client.configure(config => config.withBaseUrl('http://example.com/'));
        assert.deepStrictEqual(
          await client.fetch(new Request('some/cool/path')),
          { method: 'GET', url: '/some/cool/path', headers: {} }
        );
      });
    });

    function getRequestHeaders(request: Request) {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return headers;
    }
  });
});
