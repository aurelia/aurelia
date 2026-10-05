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

  it('does not replay a matching entry for a request with an Authorization header', async function () {
    const { clientState } = await record();
    const client = createClient(clientState);

    await client.http.fetch(url, { headers: { authorization: 'Bearer token' } });

    assert.strictEqual(client.requests.length, 1);
  });
});
