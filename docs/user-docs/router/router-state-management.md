---
description: Track current route details and persist per-entry UI state with @aurelia/router.
---

# Router state management

Read the current route to update your UI after navigation. Save per-entry state in browser history when users should recover it with Back or Forward.

## Current route (`ICurrentRoute`)

`ICurrentRoute` exposes the active instruction path, URL, title, query params, and hierarchical parameter information.

When reading this state:

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

The router adds an `au-nav-id` marker to every history entry it writes. Its key is exported as `AuNavId`. When a later `popstate` or `hashchange` event fires, this marker tells the router whether the user moved backward or forward. You can read the entry's state through router events and store your own data alongside the marker.

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

- Pass application metadata in the `state` option of `load` or `navigate`. The router saves it in the successful navigation's history entry, including after a guard redirect.
- On Back/Forward, read the restored `history.state` through `NavigationStartEvent.managedState`.

### Persist extra metadata in history entries

Pass `state` in the navigation options to save metadata with a new navigation. To update the active browser entry later, call `window.history.replaceState` and preserve its `au-nav-id` field. This example adds filter metadata after each successful navigation:

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

When the user returns with Back or Forward, read the saved metadata from `NavigationStartEvent.managedState` to restore the filters.

## Scroll snapshots with `IStateManager`

Call `IStateManager.saveState(controller)` to save scroll positions for descendants of a component's host. The default implementation stores an in-memory snapshot of descendants with a positive scroll offset on either axis, along with references to those elements. Call `restoreState(controller)` while the same elements are available and their content can accommodate the saved positions. Restoring consumes the snapshot; saving again replaces the previous snapshot for that host.

This utility does not capture the host's own scroll position or document scrolling. Router transitions do not invoke it automatically, and a recreated page does not inherit positions saved for its previous DOM elements. Both methods accept a component controller; `ICustomElementController` is a TypeScript interface, not a dependency injection token.

For Back/Forward restoration across recreated pages, keep numeric offsets in application state associated with the relevant history entry. Restore them to the new elements after the scrollable content has rendered. Separate visits to the same URL may need separate saved positions. Preserve the router's `au-nav-id` field when amending browser history state, as shown above.
