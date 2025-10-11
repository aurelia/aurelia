# Rest Resource Add-on

The `RestResource` add-on bundles a light abstraction over `@aurelia/fetch-client`. It lets you describe REST endpoints once and reuse a strongly typed client that handles URL creation, JSON serialization, caching, and cache invalidation.

## Installation

```bash
npm install @aurelia/addons @aurelia/fetch-client
```

> `@aurelia/fetch-client` already ships inside the main Aurelia bundle, but adding it explicitly keeps your package manifests honest.

## Register the plugin

Register `RestResourceConfiguration` during Aurelia start-up. This makes the `IRestResourceFactory` service available through dependency injection.

```ts
import { RestResourceConfiguration } from '@aurelia/addons';

Aurelia
  .register(RestResourceConfiguration)
  .app(MyApp)
  .start();
```

You can override global defaults (base URL, default request init, cache store, serializer) by calling `RestResourceConfiguration.customize({ ... })` instead of `register`.

## Describe a resource

Use the `@restResource` decorator to attach metadata to a class. The class does not need to implement anything—it merely becomes an identifier you can use later.

```ts
import { restResource } from '@aurelia/addons';

interface TodoDto {
  id: number;
  title: string;
  completed: boolean;
}

@restResource<TodoDto>({
  baseUrl: 'https://api.example.dev/v1',
  resource: 'todos',
  idKey: 'id',
  cache: { ttl: 30_000, operations: ['list', 'getOne'] },
  defaultQuery: { locale: 'en-US' },
})
export class TodoResource {}
```

Options available on the decorator (or in a plain config object):

| Option | Description |
| --- | --- |
| `baseUrl` | Prepended before every endpoint. Combine it with `resource` to match your API shape. |
| `resource` | The resource path segment (defaults to the kebab-cased class name). |
| `idKey` | Name of the identifier placeholder used in endpoints (defaults to `"id"`). |
| `endpoints` | Override the default route templates (`list`, `getOne`, `create`, `update`, `replace`, `patch`, `delete`, `getMany`). |
| `defaultInit` | Base `RequestInit` merged into every request. Headers are merged intelligently. |
| `defaultQuery` | Query parameters automatically appended to every call. |
| `cache` | Enable in-memory caching: provide `ttl` (milliseconds) and `operations` (default `['list','getOne']` when set). Use `null` to disable even if global defaults provide a cache store. |
| `serializer` | Custom serializer implementing `IRestResourceSerializer`—ideal when responding data does not arrive as JSON. |
| `policies` | Array of request/response policies executed for this resource. |

> You can skip the decorator and pass the same object straight to the factory: `factory.create({ resource: 'todos', baseUrl: '...' })`.

## Resolve the client

Inject `IRestResourceFactory` and ask it to create a client for your resource.

```ts
import { IRestResourceFactory } from '@aurelia/addons';
import { inject } from '@aurelia/kernel';

@inject(IRestResourceFactory)
export class TodosService {
  private readonly resource = this.factory.create<TodoDto>(TodoResource);

  public constructor(private readonly factory: IRestResourceFactory) {}

  public list() {
    return this.resource.list();
  }

  public get(id: number) {
    return this.resource.getOne(id);
  }
}
```

The client exposes the following helpers:

| Method | Signature | Notes |
| --- | --- | --- |
| `list` | `(options?: RestResourceClientListOptions)` | Appends `defaultQuery` + `options.query`. Cached when enabled. |
| `getOne` | `(id, options?: RestResourceClientGetOptions)` | Reuses cached responses unless `skipCache` is set. |
| `getMany` | `(ids[], options?)` | Sends comma-separated IDs as `ids=1,2,3` by default. |
| `create` | `(payload, options?)` | Issues `POST`, serializes JSON by default. |
| `update` | `(id, payload, options?)` | Issues `PATCH`. Invalidates cache entries for `list`, `getOne`, `getMany`. |
| `replace` | `(id, payload, options?)` | Issues `PUT`. Also invalidates caches. |
| `delete` | `(id, options?)` | Issues `DELETE` and clears caches. |
| `invalidate` | `(operation?: RestResourceOperation)` | Manually drop cache entries; omit the argument to clear all tracked keys. |

Every request method accepts `init` to tweak headers, credentials, etc., and `signal` to use your own `AbortController`.

Pass `returnResponse: true` in any options bag to receive a `RestResponse` wrapper containing the parsed data, status code, headers, `etag`, and a `fromCache` flag.

### Skipping cache on demand

```ts
await todosService.resource.getOne(5, { skipCache: true });
```

### Adding query parameters

```ts
await todosService.resource.list({
  query: { page: 2, filter: 'assigned' },
});
```

## Inspecting HTTP metadata

```ts
const response = await todosService.resource.getOne(7, { returnResponse: true });

console.log(response.status);               // 200
console.log(response.headers.get('etag'));
console.log(response.fromCache);            // true when served from cache
console.log(response.data.title);           // parsed body
```

The `fromCache` flag flips to `true` whenever the cached representation is served from the in-memory cache.

## Fluent request builder

For ad-hoc scenarios, the fluent builder returned by `client.request()` mirrors the ergonomics of mature REST clients:

```ts
const response = await todosService.resource
  .request('todos/:id/comments')
  .param('id', 7)
  .query({ page: 1, pageSize: 10 })
  .method('GET')
  .send<CommentDto[]>();

console.log(response.data);
```

- Query parameters and headers are merged on top of the resource defaults.
- `.body()` and `.method()` let you craft POST/PUT/PATCH calls; `.send()` always resolves to a `RestResponse<T>`.
- `.operation('reports')` tags the serializer context, useful when pairing with a custom `IRestResourceSerializer`.

## Policies & interceptors

Policies offer a declarative way to decorate every request/response without mutating the underlying `HttpClient`. Register global policies when bootstrapping:

```ts
const authPolicy: RestResourcePolicy = {
  onRequest(context) {
    const headers = new Headers(context.request.init?.headers ?? undefined);
    headers.set('authorization', `Bearer ${tokenStore.current}`);
    context.setRequest({ init: { ...(context.request.init ?? {}), headers } });
  },
  onError(context) {
    logger.error('REST error', context.operation, context.error);
  },
};

Aurelia.register(RestResourceConfiguration.customize({ policies: [authPolicy] }));
```

Scoped policies can be attached to a specific resource instance:

```ts
const audit = todosService.resource.withPolicies({
  async onResponse(context) {
    analytics.track('todos-response', { status: context.response.status });
  },
});

await audit.list();
```

The fluent builder accepts request-specific policies via `.policy(policy)` and `batch([...])` entries also honour a `policies` array. Policies run alongside (and in addition to) any fetch-client interceptors you have configured globally.

## Async state helpers

To streamline `async/await` flows in view-models, wrap any client call with `toAsyncState`:

```ts
const todosState = todosService.resource.toAsyncState((id: number) => todosService.resource.getOne(id));

await todosState.execute(42);

if (todosState.status === 'success') {
  this.todo = todosState.value;
}
```

Options include `initialValue`, `onSuccess`, `onError`, and `immediate` execution (with optional `immediateArgs`). The returned object exposes reactive `status`, `loading`, `value`, `error`, and `reset` members—ideal for binding to loading spinners or error banners.

## Batching multiple requests

`batch` executes several endpoints in parallel and returns an array of `RestResponse` objects:

```ts
const [list, detail] = await todosService.resource.batch([
  { endpoint: 'todos' },
  { endpoint: 'todos/:id', params: { id: 7 } },
]);

console.log(list.data.length, detail.data.title);
```

Each batch item accepts the same options as the fluent builder (method, params, query, body, headers, custom parser) plus an optional `map` function to project the response data.

## Caching behaviour

Caching is opt-in. Provide a `cache` object to the decorator/config:

```ts
cache: {
  ttl: 60_000,              // expire entries after one minute
  operations: ['list']      // cache only list responses
}
```

A global cache store can be supplied through `RestResourceConfiguration.customize({ cache: new MemoryRestResourceCache() })`. You can still disable caching for a specific resource with `cache: null`.

## Working with plain configs

The factory also accepts plain objects:

```ts
const anonymous = factory.create<TodoDto>({
  baseUrl: 'https://api.example.dev/v1',
  resource: 'todos',
  cache: { ttl: 5_000 },
});
```

This is handy when generating clients dynamically (e.g., from OpenAPI metadata).

## Custom serializers

Implement `IRestResourceSerializer` to change how payloads are posted or read. For example, to unwrap `{ data: ... }` responses:

```ts
import type { IRestResourceSerializer, RestResourceSerializerContext } from '@aurelia/addons';

class JsonApiSerializer implements IRestResourceSerializer {
  public prepareRequest(init, _context) {
    return {
      ...init.init,
      headers: {
        ...Object.fromEntries(new Headers(init.init?.headers ?? {})),
        'content-type': 'application/vnd.api+json',
      },
      body: init.body != null ? JSON.stringify({ data: init.body }) : init.init?.body,
    };
  }

  public async read(response: Response, _context: RestResourceSerializerContext) {
    if (response.status === 204) {
      return null;
    }
    const payload = await response.json();
    return payload.data;
  }
}
```

Attach it per resource:

```ts
@restResource({
  resource: 'articles',
  serializer: new JsonApiSerializer(),
})
class ArticlesResource {}
```

Or swap it globally:

```ts
Aurelia.register(RestResourceConfiguration.customize({
  serializer: new JsonApiSerializer(),
}));
```

## Interceptors and HttpClient integration

All calls are delegated to the standard `HttpClient`. Any interceptors or defaults you configure on `IHttpClient` (e.g., auth headers or retry policies) continue to run.

Because the client computes fully qualified URLs, it happily coexists with global `HttpClient.baseUrl` settings—you can share the same `HttpClient` instance with other parts of your app.
