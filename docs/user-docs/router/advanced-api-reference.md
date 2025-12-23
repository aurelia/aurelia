---
description: Low-level and advanced APIs for @aurelia/router (router-lite).
---

# Advanced router API reference

This page documents low-level router APIs that are useful for diagnostics, dynamic link generation, and advanced integrations.

## Instruction trees (`ViewportInstructionTree`)

Many advanced APIs revolve around the `ViewportInstructionTree` type (often abbreviated as “VIT”). Router events expose instruction trees, and you can also create them yourself.

### Create an instruction tree

```ts
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

const router = resolve(IRouter);

const instructions = router.createViewportInstructions('users');
```

### Convert an instruction tree to a path or URL

`ViewportInstructionTree` has two key helpers:

- `toPath()` returns an instruction path (no leading `/`, siblings separated by `+`).
- `toUrl(isFinalInstruction, parser, isRooted)` returns a URL string.

```ts
import { IRouter, IRouterEvents, type NavigationStartEvent } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class NavigationLogger {
  private readonly router = resolve(IRouter);

  public constructor() {
    resolve(IRouterEvents).subscribe('au:router:navigation-start', (event: NavigationStartEvent) => {
      // Instruction path (example: 'users+details@right')
      console.log('toPath:', event.instructions.toPath());

      // URL string (example: '/users+details@right')
      console.log(
        'toUrl:',
        event.instructions.toUrl(false, this.router.options._urlParser, true),
      );
    });
  }
}
```

`toUrl` parameters:

- `isFinalInstruction`: pass `true` when the instruction tree is final/absolute; pass `false` to include parent segments when the instruction tree is relative to a routing context.
- `parser`: use `router.options._urlParser` to match your router configuration (hash vs pushState).
- `isRooted`: pass `true` to generate a rooted URL (leading `/` or `#/` depending on the parser).

## Path generation (`router.generatePath`)

Use `generatePath` when you want a URL string **without navigating**.

```ts
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class LinkBuilder {
  private readonly router = resolve(IRouter);

  public userHref(userId: string) {
    return this.router.generatePath({ component: 'users', params: { id: userId } });
  }
}
```

Notes:

- The **first** argument is a navigation instruction (or instruction array).
- The **second** argument (optional) is a **routing context** for relative path generation (for example an `IRouteContext`, a routeable component instance, or an `HTMLElement` inside a routed component).

```ts
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class ChildViewModel {
  private readonly router = resolve(IRouter);

  public siblingHref() {
    // Generate relative to the current routeable component instance.
    return this.router.generatePath('../sibling', this);
  }
}
```

## Active state checks (`router.isActive`)

To determine whether a link/instruction is currently active, use `router.isActive`.

```ts
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class NavBar {
  private readonly router = resolve(IRouter);

  public isUsersActive() {
    return this.router.isActive('users', this);
  }
}
```

If you are building navigation menus, also see the navigation model (`IRouteContext.routeConfigContext.navigationModel`) and the `load` custom attribute’s `activeClass` option.

## Route tree and transitions

The router keeps a live route tree and transition state for diagnostics:

- `router.routeTree` is the active `RouteTree`.
- `router.currentTr` is the current `Transition`.
- `router.isNavigating` indicates whether a transition is currently running.

```ts
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class RouterDebugPanel {
  private readonly router = resolve(IRouter);

  public log() {
    console.log('isNavigating:', this.router.isNavigating);
    console.log('currentTr:', this.router.currentTr);
    console.log('routeTree:', this.router.routeTree);
  }
}
```

## Managed browser history state (`AuNavId` / `ManagedState`)

When the router writes to the browser history, it stores a small managed state object containing an `au-nav-id` field (exported as `AuNavId`). This lets the router detect back/forward navigations later.

If you want to persist additional metadata per history entry, extend the **current** entry using `window.history.replaceState`, and always merge with existing state so `au-nav-id` remains intact:

```ts
import { IRouterEvents, type NavigationEndEvent } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class HistoryMetadataService {
  public constructor() {
    resolve(IRouterEvents).subscribe('au:router:navigation-end', (_event: NavigationEndEvent) => {
      window.history.replaceState(
        {
          ...(window.history.state ?? {}),
          lastVisitedAt: Date.now(),
        },
        document.title,
      );
    });
  }
}
```

On a later Back/Forward navigation, the restored state is surfaced via `NavigationStartEvent.managedState`.

