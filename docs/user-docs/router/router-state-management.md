---
description: Track current route details and persist per-entry UI state with @aurelia/router.
---

# Router state management

This page covers router-provided state services and patterns for keeping UI state in sync with navigation.

## Current route (`ICurrentRoute`)

`ICurrentRoute` exposes the active instruction path, URL, title, query params, and hierarchical parameter information.

Important notes:

- `ICurrentRoute` is updated on `au:router:navigation-end`, so reading it inside `binding()`, `bound()`, `attaching()`, or `attached()` of a newly routed component will show the **previous** route. See [Current route](./current-route.md#timing-considerations) for details.
- `currentRoute.path` is an **instruction path** (no leading `/` and siblings separated by `+`).
- `currentRoute.url` is a rooted URL string (includes query + fragment), but it does **not** include the origin (and it does not include any `base#href` prefix).

```ts
import { ICurrentRoute } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  public readonly currentRoute = resolve(ICurrentRoute);
}
```

## Managed History Entries (`AuNavId` and `ManagedState`)

Every time the router writes to the browser history it attaches an `au-nav-id` marker under the exported `AuNavId` constant. The router uses this managed state to detect backward versus forward navigation whenever a future `popstate` or `hashchange` event fires. Because the managed state flows through the router events API, you can read (or extend) it for diagnostics and per-entry state.

### Inspect managed state during navigation

```ts
import { IRouterEvents, type NavigationStartEvent } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class NavigationCorrelationService {
  public constructor() {
    resolve(IRouterEvents).subscribe('au:router:navigation-start', (event: NavigationStartEvent) => {
      if (event.managedState) {
        console.log('History entry id:', event.managedState['au-nav-id']);
        console.log('Restored filters:', event.managedState['filters']);
      }
    });
  }
}
```

- Programmatic navigations (`router.load`) start with an empty managed state.
- Browser-driven navigations (Back/Forward) reuse whatever was stored in `history.state` and surface it via `NavigationStartEvent.managedState`.

### Persist extra metadata in history entries

You may attach your own keys to the active history entry as long as you keep the `au-nav-id` field intact. A common pattern is to listen for `NavigationEndEvent`, merge your metadata, and call `window.history.replaceState`:

```ts
import { IRouterEvents, type NavigationEndEvent } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class HistoryMetadataService {
  public constructor() {
    resolve(IRouterEvents).subscribe('au:router:navigation-end', (_event: NavigationEndEvent) => {
      window.history.replaceState(
        {
          ...(window.history.state ?? {}),
          filters: { tab: 'inbox' },
          updatedAt: Date.now(),
        },
        document.title,
      );
    });
  }
}
```

When the user later taps the browser buttons, the router emits a `NavigationStartEvent` whose `managedState` contains the same metadata, allowing you to restore filter selections, scroll positions, or analytics context.

## Preserve Scroll Positions with `IStateManager`

The router ships an `IStateManager` service that captures scroll offsets for every descendant element inside a routed component. Pair it with lifecycle hooks to remember where the user left off when they revisit the same view.

### Component-level usage

```ts
import { IRouteViewModel, IStateManager } from '@aurelia/router';
import { ICustomElementController } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

export class ArticleList implements IRouteViewModel {
  private readonly controller = resolve(ICustomElementController);
  private readonly stateManager = resolve(IStateManager);

  canUnload() {
    this.stateManager.saveState(this.controller);
    return true;
  }

  loading() {
    this.stateManager.restoreState(this.controller);
  }
}
```

### Share scroll persistence across multiple routes

```ts
import { IRouteViewModel, IStateManager } from '@aurelia/router';
import { ICustomElementController } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

export abstract class ScrollAwareRoute implements IRouteViewModel {
  protected readonly controller = resolve(ICustomElementController);
  protected readonly stateManager = resolve(IStateManager);

  canUnload() {
    this.stateManager.saveState(this.controller);
    return true;
  }

  loading() {
    this.stateManager.restoreState(this.controller);
  }
}

export class ArticleList extends ScrollAwareRoute {}
export class ArticleDetail extends ScrollAwareRoute {}
```

