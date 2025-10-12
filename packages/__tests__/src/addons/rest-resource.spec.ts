import { assert } from '@aurelia/testing';
import {
  restResource,
  getRestResourceDefinition,
  RestResourceClient,
  RestResourceDefaults,
  type RestResponse,
  type RestResourcePolicy,
} from '@aurelia/addons';
import type { IHttpClient } from '@aurelia/fetch-client';

import { isNode } from '../util.js';

interface Widget {
  id: number;
  name: string;
}

@restResource<Widget>({
  resource: 'widgets',
  baseUrl: 'https://api.example.test/api',
  idKey: 'id',
  cache: { ttl: 1000, operations: ['list', 'getOne'] },
  defaultQuery: { locale: 'en' },
})
class WidgetResource {}

interface RecordedRequest {
  request: Request;
  bodyText: string | null;
}

describe('addons/rest-resource.spec.ts', function () {
  if (isNode()) {
    return;
  }

  let client: RestResourceClient<Widget>;
  let requests: RecordedRequest[];
  let db: Map<number, Widget>;
  let nextId: number;

  const jsonResponse = (value: unknown, init: ResponseInit = { status: 200 }): Response =>
    new Response(
      JSON.stringify(value),
      {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init.headers ?? {}),
        },
      }
    );

  const emptyResponse = (status: number = 204): Response =>
    new Response(null, { status });

  beforeEach(function () {
    requests = [];
    db = new Map<number, Widget>([
      [1, { id: 1, name: 'Alpha' }],
      [2, { id: 2, name: 'Beta' }],
    ]);
    nextId = 3;
    const stubFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init);
      const url = new URL(request.url);
      const bodyText = request.method === 'GET' || request.method === 'DELETE'
        ? null
        : await request.clone().text();

      requests.push({ request, bodyText });

      const pathname = url.pathname;

      if (request.method === 'GET' && pathname === '/api/widgets') {
        const values = Array.from(db.values());
        if (url.searchParams.get('format') === 'broken') {
          return new Response('not json', {
            status: 200,
            headers: {
              'content-type': 'application/json',
            },
          });
        }
        return jsonResponse(values);
      }

      if (request.method === 'GET' && pathname.startsWith('/api/widgets/')) {
        const id = Number(pathname.split('/').pop());
        const entity = db.get(id);
        if (entity == null) {
          return jsonResponse({ message: 'Not found' }, { status: 404 });
        }
        return jsonResponse(entity);
      }

      if (request.method === 'POST' && pathname === '/api/widgets') {
        const payload = bodyText != null && bodyText.length > 0 ? JSON.parse(bodyText) : {};
        const entity: Widget = { id: nextId++, ...payload };
        db.set(entity.id, entity);
        return jsonResponse(entity, { status: 201 });
      }

      if ((request.method === 'PATCH' || request.method === 'PUT') && pathname.startsWith('/api/widgets/')) {
        const id = Number(pathname.split('/').pop());
        const entity = db.get(id);
        if (entity == null) {
          return jsonResponse({ message: 'Not found' }, { status: 404 });
        }
        const payload = bodyText != null && bodyText.length > 0 ? JSON.parse(bodyText) : {};
        Object.assign(entity, payload);
        return jsonResponse(entity);
      }

      if (request.method === 'DELETE' && pathname.startsWith('/api/widgets/')) {
        const id = Number(pathname.split('/').pop());
        db.delete(id);
        return emptyResponse();
      }

      throw new Error(`Unhandled request: ${request.method} ${request.url}`);
    };

    const http = { fetch: stubFetch } as unknown as IHttpClient;
    const definition = getRestResourceDefinition<Widget>(WidgetResource);
    const defaults = new RestResourceDefaults();
    client = new RestResourceClient<Widget>(http, definition, defaults);
  });

  it('normalizes metadata from decorator', function () {
    const definition = getRestResourceDefinition(WidgetResource);

    assert.strictEqual(definition.resource, 'widgets');
    assert.strictEqual(definition.endpoints.getOne, 'widgets/:id');
    assert.strictEqual(definition.baseUrl, 'https://api.example.test/api');
    assert.strictEqual(definition.defaultQuery!.locale, 'en');
  });

  it('performs list requests with default query parameters', async function () {
    const result = await client.list();

    assert.deepStrictEqual(result, Array.from(db.values()));
    assert.strictEqual(requests.length, 1);

    const url = new URL(requests[0].request.url);
    assert.strictEqual(url.pathname, '/api/widgets');
    assert.strictEqual(url.searchParams.get('locale'), 'en');
  });

  it('caches getOne responses when configured', async function () {
    const first = await client.getOne(1);
    const second = await client.getOne(1);

    assert.deepStrictEqual(second, first);
    assert.strictEqual(requests.length, 1, 'should reuse cached response');

    await client.getOne(1, { skipCache: true });
    assert.strictEqual(requests.length, 2, 'skipCache bypasses cache');
  });

  it('invalidates caches on mutation', async function () {
    await client.getOne(1);
    assert.strictEqual(requests.length, 1, 'initial getOne triggers fetch');

    await client.update(1, { name: 'Gamma' });

    const updateRequest = requests.find(r => r.request.method === 'PATCH');
    assert.notStrictEqual(updateRequest, undefined, 'PATCH request captured');
    assert.deepStrictEqual(JSON.parse(updateRequest!.bodyText!), { name: 'Gamma' });

    const afterUpdate = await client.getOne(1);
    assert.strictEqual(afterUpdate.name, 'Gamma');

    const getCount = requests.filter(r => r.request.method === 'GET').length;
    assert.strictEqual(getCount, 2, 'cache invalidated after mutation');
  });

  it('serializes create payloads as JSON and returns created entity', async function () {
    const created = await client.create({ name: 'Delta' });

    assert.strictEqual(created.id, 3);
    assert.strictEqual(created.name, 'Delta');
    assert.strictEqual(db.size, 3);

    const postRequest = requests.find(r => r.request.method === 'POST');
    assert.notStrictEqual(postRequest, undefined);
    assert.deepStrictEqual(JSON.parse(postRequest!.bodyText!), { name: 'Delta' });
    assert.strictEqual(postRequest!.request.headers.get('content-type'), 'application/json');
  });

  it('returns detailed RestResponse when requested', async function () {
    const first = await client.list({ returnResponse: true }) as RestResponse<Widget[]>;
    assert.strictEqual(first.status, 200);
    assert.strictEqual(first.fromCache, false);
    assert.strictEqual(first.headers.get('content-type'), 'application/json');

    const second = await client.list({ returnResponse: true }) as RestResponse<Widget[]>;
    assert.strictEqual(second.fromCache, true);
    assert.deepStrictEqual(second.data, first.data);
  });

  it('supports the fluent request builder', async function () {
    const response = await client
      .request('widgets/:id')
      .param('id', 2)
      .method('GET')
      .send<Widget>();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.id, 2);
    assert.strictEqual(response.data.name, 'Beta');

    const lastRequest = requests.at(-1)!;
    const url = new URL(lastRequest.request.url);
    assert.strictEqual(url.pathname, '/api/widgets/2');
    assert.strictEqual(url.searchParams.get('locale'), 'en');
  });

  it('allows customizing queries through the request builder', async function () {
    await client
      .request('widgets')
      .queryParam('search', 'Alpha')
      .send<Widget[]>();

    const lastRequest = requests.at(-1)!;
    const url = new URL(lastRequest.request.url);
    assert.strictEqual(url.searchParams.get('search'), 'Alpha');
  });

  it('executes batch requests and preserves order', async function () {
    const responses = await client.batch([
      { endpoint: 'widgets' },
      { endpoint: 'widgets/:id', params: { id: 2 } },
      {
        endpoint: 'widgets',
        map: response => ({ count: (response.data as Widget[]).length }),
      },
    ]);

    assert.strictEqual(responses.length, 3);
    assert.strictEqual(responses[0].status, 200);
    assert.deepStrictEqual((responses[1].data as Widget).id, 2);
    assert.strictEqual((responses[2].data as { count: number }).count, 2);

    const getRequests = requests.filter(r => r.request.method === 'GET');
    assert.ok(getRequests.length >= 3, 'expected at least three GET calls');
  });

  it('creates async state wrappers around client operations', async function () {
    const state = client.toAsyncState((id: number) => client.getOne(id));

    assert.strictEqual(state.status, 'idle');
    assert.strictEqual(state.loading, false);

    const value = await state.execute(1);
    assert.strictEqual(value.id, 1);
    assert.strictEqual(state.status, 'success');
    assert.strictEqual(state.value?.id, 1);

    await assert.rejects(() => state.execute(999));
    assert.strictEqual(state.status, 'error');
    assert.ok(state.error, 'error should be captured');

    state.reset();
    assert.strictEqual(state.status, 'idle');
    assert.strictEqual(state.value?.id, undefined);
  });

  it('applies request and response policies', async function () {
    const seen: string[] = [];
    const policy: RestResourcePolicy = {
      onRequest(ctx) {
        const headers = new Headers(ctx.request.init?.headers ?? undefined);
        headers.set('x-policy', 'true');
        ctx.setRequest({
          init: { ...(ctx.request.init ?? {}), headers },
          query: { ...(ctx.request.query ?? {}), policy: 'active' },
        });
        seen.push(`request:${ctx.url}`);
      },
      onResponse(ctx) {
        if (Array.isArray(ctx.data)) {
          ctx.setData(ctx.data.map(item => ({ ...item, name: `${(item as Widget).name}!` })));
        }
        seen.push(`response:${ctx.response.status}`);
      },
      onError(ctx) {
        seen.push(`error:${String(ctx.error)}`);
      },
    };

    const clientWithPolicy = client.withPolicies(policy);
    const response = await clientWithPolicy.list({ returnResponse: true }) as RestResponse<Widget[]>;

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data[0].name.endsWith('!'), true);
    const requestRecord = requests.find(r => r.request.headers.get('x-policy') === 'true');
    assert.notStrictEqual(requestRecord, undefined);
    const url = new URL(requestRecord!.request.url);
    assert.strictEqual(url.searchParams.get('policy'), 'active');
    assert.strictEqual(seen.some(entry => entry.startsWith('request:')), true);
    assert.strictEqual(seen.some(entry => entry.startsWith('response:')), true);
  });

  it('invokes error policies when requests fail', async function () {
    const errors: unknown[] = [];
    const policy: RestResourcePolicy = {
      onError(ctx) {
        errors.push(ctx.error);
      },
    };

    const clientWithPolicy = client.withPolicies(policy);
    await assert.rejects(() => clientWithPolicy.getOne(999));
    assert.strictEqual(errors.length, 1);
  });

  it('invokes error policies when the serializer throws', async function () {
    const errors: unknown[] = [];
    const policy: RestResourcePolicy = {
      onError(ctx) {
        errors.push(ctx.error);
      },
    };

    const clientWithPolicy = client.withPolicies(policy);

    await assert.rejects(() => clientWithPolicy.list({ query: { format: 'broken' } }));
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0] instanceof Error, 'serializer failure should surface as Error');
  });

  it('applies stacked policies that mutate headers, body, and query data', async function () {
    const seenHeaders: string[] = [];
    const combined = client.withPolicies(
      {
        onRequest(ctx) {
          const headers = new Headers(ctx.request.init?.headers ?? undefined);
          headers.set('x-policy-one', '1');
          ctx.setRequest({
            init: { ...(ctx.request.init ?? {}), headers },
            body: { ...(ctx.request.body as Record<string, unknown>), policy: 'stacked' },
            query: { ...(ctx.request.query ?? {}), trace: 'true' },
          });
        },
        onResponse(ctx) {
          ctx.setData({ ...(ctx.data as Record<string, unknown>), marker: 'mutated' });
        },
      },
      {
        onRequest(ctx) {
          const headers = new Headers(ctx.request.init?.headers ?? undefined);
          headers.set('x-policy-two', '2');
          ctx.setRequest({
            init: { ...(ctx.request.init ?? {}), headers },
          });
          seenHeaders.push(headers.get('x-policy-one') ?? '');
        },
      },
    );

    const created = await combined.create({ name: 'Policy' });

    assert.strictEqual((created as any).marker, 'mutated');
    assert.strictEqual((created as any).policy, 'stacked');
    const postRequest = requests.find(r => r.request.method === 'POST');
    assert.notStrictEqual(postRequest, undefined);
    assert.strictEqual(postRequest!.request.headers.get('x-policy-one'), '1');
    assert.strictEqual(postRequest!.request.headers.get('x-policy-two'), '2');
    const body = JSON.parse(postRequest!.bodyText ?? '{}') as Record<string, unknown>;
    assert.strictEqual(body.policy, 'stacked');
    const url = new URL(postRequest!.request.url);
    assert.strictEqual(url.searchParams.get('trace'), 'true');
    assert.strictEqual(seenHeaders[0], '1');
  });
});
