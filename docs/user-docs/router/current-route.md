---
description: Read the active route, observe completed navigation, and use incoming route data during lifecycle hooks.
---

# Current route

`ICurrentRoute` exposes the last successfully completed navigation. Resolve it in a component or service to read the active path, title, query, and route parameters. Its properties update together when the router publishes `au:router:navigation-end`. The service starts observing when first resolved; resolving it from a persistent shell lets it track navigation from startup.

```ts
import { resolve } from '@aurelia/kernel';
import { ICurrentRoute } from '@aurelia/router';

export class AppHeader {
  readonly currentRoute = resolve(ICurrentRoute);
}
```

```html
<span>${currentRoute.title}</span>
```

## Available information

```ts
interface ICurrentRoute {
  readonly path: string;
  readonly url: string;
  readonly title: string;
  readonly query: URLSearchParams;
  readonly parameterInformation: readonly ParameterInformation[];
}

interface ParameterInformation {
  readonly config: RouteConfig | null;
  readonly viewport: string | null;
  readonly params: Readonly<Params> | null;
  readonly children: readonly ParameterInformation[];
}
```

| Property | Meaning |
| --- | --- |
| `path` | The active route path, without query or fragment. |
| `url` | The route serialized in the configured URL mode, including query and fragment. Hash routing includes its `/#/` wrapper. This is not the full browser document URL and does not include the deployment base. |
| `title` | The title calculated for the completed navigation. |
| `query` | The current route's query parameters, published with completed navigation. |
| `parameterInformation` | Route configuration, viewport, and parameter information arranged in the same hierarchy as the active instructions. |

Treat these values as router-owned state. To edit query parameters for another navigation, make a copy with `new URLSearchParams(currentRoute.query)`.

For a browser-ready link, use [`router.createHref(reference)`](./application-url-navigation.md) with an application URL reference. For the actual address bar value, use the browser's `location.href`. Successful navigation with `historyStrategy: 'none'` updates `ICurrentRoute` while leaving the address bar unchanged.

## Timing considerations

While a page is loading or attaching, `ICurrentRoute` still describes the previous completed navigation. The incoming route is available directly to the page's router lifecycle hooks through their `params` and `next` arguments:

```ts
import type { IRouteViewModel, Params, RouteNode } from '@aurelia/router';

export class ProductPage implements IRouteViewModel {
  id = '';
  tab = 'overview';

  loading(params: Params, next: RouteNode): void {
    this.id = params.id ?? '';
    this.tab = next.queryParams.get('tab') ?? 'overview';
  }
}
```

Use this approach when preparing the page for the navigation in progress. A subscription to `navigation-start` created by the incoming page is too late to observe that navigation's start event. A timer is also unnecessary: lifecycle arguments identify the incoming route without depending on when unrelated work finishes.

## Observe completed navigation

A persistent shell or component can subscribe to `navigation-end` for work that needs the final route, including any redirects. Resolve `ICurrentRoute` before subscribing so its own update subscription runs first.

```ts
import { resolve, type IDisposable } from '@aurelia/kernel';
import { ICurrentRoute, IRouterEvents } from '@aurelia/router';

export class AppShell {
  private readonly currentRoute = resolve(ICurrentRoute);
  private readonly events = resolve(IRouterEvents);
  private subscription?: IDisposable;

  binding(): void {
    this.subscription = this.events.subscribe('au:router:navigation-end', () => {
      console.log('Active route:', this.currentRoute.url);
      console.log('Query:', this.currentRoute.query.toString());
    });
  }

  unbinding(): void {
    this.subscription?.dispose();
    this.subscription = undefined;
  }
}
```

For application-wide observation of attempts, cancellations, and failures, see [router events](./router-events.md).

## Query changes and component reuse

Changing only the query updates `ICurrentRoute`, but does not automatically rerun `loading()` on a reused page. A page whose content follows the query can observe `currentRoute.query`. If the page loads its data in router lifecycle hooks, request those hooks for that navigation:

```ts
const query = new URLSearchParams(currentRoute.query);
query.set('page', '2');

await router.navigate(`?${query}`, {
  transitionPlan: 'invoke-lifecycles',
});
```

This is a per-navigation override. A route-level `transitionPlan` alone does not override reuse when the path and route parameters are unchanged. See [application URL navigation](./application-url-navigation.md) for query-driven navigation examples.

A fragment such as `#details` also updates route state. Scrolling to a matching element is application behavior; the router does not do it automatically.
