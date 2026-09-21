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
- `currentRoute.url` is the router's serialized URL form, including query and fragment and the outer hash marker when hash routing is enabled. It omits the origin and deployment prefix. It is not universally an application reference accepted by `navigate()` or a browser-ready href.

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

- Programmatic navigations through `load` or `navigate` can supply application metadata with the `state` option. The router preserves it when writing the accepted transition's history entry, including guard redirects.
- Browser-driven navigations (Back/Forward) reuse whatever was stored in `history.state` and surface it via `NavigationStartEvent.managedState`.

### Persist extra metadata in history entries

For metadata belonging to a new navigation, pass `state` in that navigation's options. If you need to amend the active browser entry after navigation, preserve its `au-nav-id` field when calling `window.history.replaceState`. The example below deliberately updates the active entry after each successful navigation:

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

## Scroll snapshots with `IStateManager`

`IStateManager.saveState(controller)` takes an explicit, in-memory scroll snapshot for descendants of a component's host. Its default implementation records descendants with a positive scroll offset on either axis and retains references to those elements. Call `restoreState(controller)` while the same elements are available and their content can accommodate the saved positions. Restoration consumes the snapshot; saving again replaces the previous snapshot for that host.

This utility does not capture the host's own scroll position or document scrolling. Router transitions do not invoke it automatically, and a recreated page does not inherit positions saved for its previous DOM elements. Both methods accept a component controller; `ICustomElementController` is a TypeScript interface, not a dependency injection token.

For Back/Forward restoration across recreated pages, keep numeric offsets in application state associated with the relevant history entry. Restore them to the new elements after the scrollable content has rendered. Separate visits to the same URL may need separate saved positions. Preserve the router's `au-nav-id` field when amending browser history state, as shown above.
