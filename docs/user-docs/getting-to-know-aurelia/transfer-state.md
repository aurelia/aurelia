---
description: >-
  Carry data loaded during a server render to the client so hydration reuses it
  instead of fetching it again and flashing back to a loading state.
---

# Transferring server state

A server-rendered page has already loaded its data. Without help, the client loses it: `hydrate()` runs the components again, they start from their initial state, and the page shows "Loading…" until the client fetches the same data a second time. `ITransferState` closes that gap. The server records what it loaded, embeds it in the page, and the client reads it back.

## Load data with `getOrLoad`

Resolve `ITransferState` and wrap the load in `getOrLoad`. Await it in `binding()` or `loading()`, so the view binds after the data arrives:

```typescript
import { resolve } from '@aurelia/kernel';
import { ITransferState } from '@aurelia/runtime-html';
import { IProductApi, type Product } from './product-api';

export class ProductPage {
  public product: Product | null = null;

  private readonly api = resolve(IProductApi);
  private readonly state = resolve(ITransferState);

  public async binding() {
    this.product = await this.state.getOrLoad('product:42', () => this.api.get(42));
  }
}
```

`getOrLoad` behaves differently on each side:

- **Server:** runs the loader and records its result under the key.
- **Client, value recorded:** returns the recorded value without calling the loader, then removes it.
- **Client, nothing recorded:** runs the loader. This is what happens in a plain single-page app, so the same component works with or without SSR.

Because the client reads each value once, a later visit to the page loads fresh data instead of reusing the server's copy. Include anything that identifies the data in the key, such as the product id, so two pages never share an entry by accident.

`has`, `get`, `set` and `remove` are available for values you manage yourself. `get(key, fallback)` returns `fallback` when the key is missing.

## Server setup

Register a recording store for each request, render, then embed the serialized state in the page next to your SSR manifest:

```typescript
import { Registration } from '@aurelia/kernel';
import { ITransferState, TransferState, transferStateId } from '@aurelia/runtime-html';

const state = new TransferState(undefined, /* isServer */ true);
container.register(Registration.instance(ITransferState, state));

// ...render the app, then:
const stateScript = `<script type="application/json" id="${transferStateId}">${state.serialize()}</script>`;
```

`serialize()` escapes `<`, so values containing `</script>` or `<!--` cannot end the element early. Values must survive `JSON.stringify`: dates become strings, and `Map`, `Set` and class instances lose their behavior.

{% hint style="warning" %}
Everything in the transfer state is visible in the page source. Do not record secrets, tokens or data that belongs to a different user than the one receiving the page.
{% endhint %}

## Client setup

Nothing to register. When nothing else has been registered, `ITransferState` resolves to a store seeded from the `<script id="au-state">` element. The script is read the first time the store is resolved. If the element is missing or holds invalid JSON, the store starts empty and components load their data as usual.

## Reuse HTTP responses

If your components load data through `@aurelia/fetch-client`, the `TransferCacheInterceptor` records responses on the server and replays them on the client, so you do not need to change each component:

```typescript
import { resolve } from '@aurelia/kernel';
import { IHttpClient, TransferCacheInterceptor } from '@aurelia/fetch-client';
import { ITransferState } from '@aurelia/runtime-html';

const http = resolve(IHttpClient);
http.configure(config => config
  .withBaseUrl('https://shop.example/api/')
  .withInterceptor(new TransferCacheInterceptor(resolve(ITransferState))));
```

The interceptor records a response only when it is safe to share and to replay:

- The request is a `GET` or `HEAD`. Responses are keyed by method and full URL, so the server and the client must request the same absolute URL.
- The request has no `Authorization` or `Cookie` header.
- The response is successful (2xx) and has a text, JSON or XML body.
- The response has no `Set-Cookie` header, and its `Cache-Control` is not `no-store` or `private`.

Only the `content-type` response header is recorded by default. Add others with `includeHeaders`, and keep requests out of the cache with `filter`:

```typescript
new TransferCacheInterceptor(state, {
  includeHeaders: ['etag'],
  filter: request => !request.url.includes('/cart'),
});
```

Each recorded response is replayed once. After that, the same request goes to the network.
