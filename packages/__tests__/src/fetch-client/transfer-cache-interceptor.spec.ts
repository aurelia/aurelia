import { HttpClient, IFetchFn, type ITransferCacheOptions, TransferCacheInterceptor } from '@aurelia/fetch-client';
import { Registration } from '@aurelia/kernel';
import { TransferState } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { isNode } from '../util.js';

describe('fetch-client/transfer-cache-interceptor.spec.ts', function () {
  const url = 'https://shop.example/api/products/1';
  const productJson = '{"name":"Espresso machine","price":499}';

  interface IHarness {
    readonly http: HttpClient;
    readonly requests: Request[];
  }

  function createClient(
    state: TransferState,
    respond?: (request: Request) => Response,
    options?: ITransferCacheOptions,
  ): IHarness {
    respond ??= () => new Response(productJson, { headers: { 'content-type': 'application/json' } });
    const requests: Request[] = [];
    const { container } = TestContext.create();
    container.register(Registration.instance(IFetchFn, (request: Request) => {
      requests.push(request);
      return Promise.resolve(respond!(request));
    }));
    const http = container.get(HttpClient);
    http.configure(c => c.withInterceptor(new TransferCacheInterceptor(state, options)));
    return { http, requests };
  }

  /** Records `init` on a server client and returns a client store seeded from the serialized state. */
  async function record(respond?: (request: Request) => Response, init?: RequestInit, options?: ITransferCacheOptions) {
    const serverState = new TransferState(void 0, true);
    const server = createClient(serverState, respond, options);
    const response = await server.http.fetch(url, init);
    return {
      serverState,
      serverResponse: response,
      clientState: new TransferState(JSON.parse(serverState.serialize()) as Record<string, unknown>),
    };
  }

  it('replays a recorded GET response on the client once', async function () {
    const { serverResponse, clientState } = await record();
    assert.strictEqual(await serverResponse.text(), productJson, 'recording leaves the server response readable');

    const client = createClient(clientState);
    const replayed = await client.http.fetch(url);

    assert.strictEqual(client.requests.length, 0);
    assert.strictEqual(replayed.status, 200);
    assert.strictEqual(replayed.headers.get('content-type'), 'application/json');
    assert.deepStrictEqual(await replayed.json(), { name: 'Espresso machine', price: 499 });

    await client.http.fetch(url);
    assert.strictEqual(client.requests.length, 1, 'later requests reach the network');
  });

  it('replays a HEAD response without a body', async function () {
    const { clientState } = await record(() => new Response(null, { headers: { 'content-type': 'application/json' } }), { method: 'HEAD' });

    const client = createClient(clientState);
    const replayed = await client.http.fetch(url, { method: 'HEAD' });

    assert.strictEqual(client.requests.length, 0);
    assert.strictEqual(replayed.status, 200);
    assert.strictEqual(await replayed.text(), '');
  });

  it('keys entries by method and URL', async function () {
    const { clientState } = await record();
    const client = createClient(clientState);

    await client.http.fetch(`${url}?page=2`);
    await client.http.fetch(url, { method: 'HEAD' });

    assert.strictEqual(client.requests.length, 2);
  });

  it('records only content-type and the listed headers', async function () {
    const { serverState } = await record(
      () => new Response(productJson, { headers: { 'content-type': 'application/json', etag: '"v1"', 'x-internal': 'secret' } }),
      void 0,
      { includeHeaders: ['etag'] },
    );

    const json = serverState.serialize();
    assert.includes(json, 'etag');
    assert.notIncludes(json, 'secret');
  });

  const skipped: [string, ((request: Request) => Response)?, RequestInit?, ITransferCacheOptions?][] = [
    ['POST requests', void 0, { method: 'POST', body: '{}' }],
    ['requests with an Authorization header', void 0, { headers: { authorization: 'Bearer token' } }],
    ['requests the filter rejects', void 0, void 0, { filter: request => !request.url.includes('/products/') }],
    ['error responses', () => new Response('missing', { status: 404 })],
    ['responses with Cache-Control: no-store', () => new Response(productJson, { headers: { 'cache-control': 'no-store' } })],
    ['responses with Cache-Control: private', () => new Response(productJson, { headers: { 'cache-control': 'private, max-age=60' } })],
    ['binary responses', () => new Response(new Uint8Array([0xff, 0xd8]), { headers: { 'content-type': 'image/jpeg' } })],
    ['binary types whose name contains xml', () => new Response(new Uint8Array([0x50, 0x4b]), { headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } })],
    ['bodies without a content type', () => new Response(new Uint8Array([0xff, 0xd8]))],
    // The stream never closes, so this test times out if the interceptor waits for its body.
    ['event streams', () => new Response(new ReadableStream({ start: controller => controller.enqueue(new TextEncoder().encode('data: 1\n\n')) }), { headers: { 'content-type': 'text/event-stream' } })],
  ];
  // Browsers drop these headers from scripted requests and responses, so only a server can see them.
  if (isNode()) {
    skipped.push(
      ['requests with a Cookie header', void 0, { headers: { cookie: 'session=1' } }],
      ['responses that set a cookie', () => new Response(productJson, { headers: { 'set-cookie': 'session=1' } })],
    );
  }
  for (const [name, respond, init, options] of skipped) {
    it(`does not record ${name}`, async function () {
      const { serverState } = await record(respond, init, options);

      assert.strictEqual(serverState.serialize(), '{}');
    });
  }

  for (const contentType of ['text/plain; charset=utf-8', 'application/problem+json', 'application/xml']) {
    it(`records ${contentType} responses`, async function () {
      const { clientState } = await record(() => new Response('<a/>', { headers: { 'content-type': contentType } }));
      const client = createClient(clientState);

      assert.strictEqual(await (await client.http.fetch(url)).text(), '<a/>');
      assert.strictEqual(client.requests.length, 0);
    });
  }

  it('records a 204 response without a content type', async function () {
    const { clientState } = await record(() => new Response(null, { status: 204 }));
    const client = createClient(clientState);

    const replayed = await client.http.fetch(url);

    assert.strictEqual(client.requests.length, 0);
    assert.strictEqual(replayed.status, 204);
  });

  it('replays the response URL so response interceptors can read it', async function () {
    const { clientState } = await record();
    const client = createClient(clientState);
    const urls: string[] = [];
    client.http.configure(c => c.withInterceptor({ response(response) { urls.push(response.url); return response; } }));

    const replayed = await client.http.fetch(url);

    assert.strictEqual(client.requests.length, 0);
    assert.strictEqual(replayed.url, url);
    assert.deepStrictEqual(urls, [url]);
  });

  it('replays the final URL of a redirected response', async function () {
    const finalUrl = 'https://shop.example/api/products/1/v2';
    const { serverState, clientState } = await record(() => {
      const response = new Response(productJson, { headers: { 'content-type': 'application/json' } });
      Object.defineProperty(response, 'url', { value: finalUrl });
      return response;
    });
    assert.includes(serverState.serialize(), finalUrl);

    const replayed = await createClient(clientState).http.fetch(url);

    assert.strictEqual(replayed.url, finalUrl);
  });

  it('does not replay a matching entry for a request with an Authorization header', async function () {
    const { clientState } = await record();
    const client = createClient(clientState);

    await client.http.fetch(url, { headers: { authorization: 'Bearer token' } });

    assert.strictEqual(client.requests.length, 1);
  });
});
