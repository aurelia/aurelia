---
description: Inspect router instruction trees, generate paths with an explicit context, and correlate navigation with browser history.
---

# Advanced router API reference

Use these APIs to inspect the router's work or generate paths from a particular routing context. For application URL references and browser-ready links, use [`navigate()` and `createHref()`](application-url-navigation.md).

## Instruction trees (`ViewportInstructionTree`)

Router events expose a transition's instruction tree, which includes the selected routing context. You can also construct a tree through the router:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class NavigationPreparation {
  private readonly router = resolve(IRouter);

  createUsersTarget() {
    return this.router.createViewportInstructions('users', null, null);
  }
}
```

The final two arguments are the navigation options and parent route path. The three-argument overload returns an instruction tree synchronously. An overload with `traverseChildren: true` can return a promise while traversing configured child routes.

### Convert an instruction tree to a path or URL

`toPath()` returns an instruction path for diagnostics. It omits the query and fragment; keep the tree when you need the whole navigation request.

For low-level serialization, `toUrl(isFinalInstruction, parser, isRooted)` accepts the exported `pathUrlParser` or `fragmentUrlParser`. Use an explicit parser to choose the serialized representation; neither supplies an origin or deployment prefix.

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouterEvents, pathUrlParser } from '@aurelia/router';
import type { IDisposable } from '@aurelia/kernel';

export class NavigationLogger {
  private readonly events = resolve(IRouterEvents);
  private subscription: IDisposable | undefined;

  binding(): void {
    this.subscription = this.events.subscribe('au:router:navigation-end', event => {
      console.log('Instruction path:', event.finalInstructions.toPath());
      console.log('Application path, query and fragment:',
        event.finalInstructions.toUrl(true, pathUrlParser, true));
    });
  }

  unbinding(): void {
    this.subscription?.dispose();
    this.subscription = undefined;
  }
}
```

- `isFinalInstruction: true` serializes a final tree. For a contextual tree that still needs its owning parent segments, use `false`.
- `parser` determines path or hash-form serialization.
- `isRooted: true` asks the parser for rooted output. The exact prefix depends on the chosen parser.

For browser links, `createHref()` applies the configured URL mode and deployment base to an application reference. `RouterOptions._urlParser` is internal and absent from the published types; changing it is unsupported.

## Path generation (`router.generatePath`)

`generatePath()` formats route instructions without navigating. It returns a string or a promise of a string when route configuration needs loading. Its result is relative to the **context selected by the instruction prefixes**.

`IRouter.generatePath()` starts at the root unless you supply a context. `IContextRouter.generatePath()` starts at its bound context. A leading `../` selects a parent, then disappears from the generated text.

For example, from the child of a `/parent` layout, suppose sibling route ID `c2` has path `child/:id`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IContextRouter, IRouteContext, IRouter } from '@aurelia/router';

export class ChildPage {
  private readonly localRouter = resolve(IContextRouter);
  private readonly context = resolve(IRouteContext);
  private readonly rootRouter = resolve(IRouter);

  async openSibling(): Promise<void> {
    const parent = this.context.parent;
    if (parent === null) return;
    const path = await this.localRouter.generatePath({
      component: '../c2', params: { id: '42' },
    });
    // path is 'child/42'; consume it from the selected parent context.
    await this.localRouter.load(path, { context: parent });
  }

  async openSiblingFromRoot(): Promise<void> {
    const path = await this.context.generateRootedPath({
      component: '../c2', params: { id: '42' },
    });
    await this.rootRouter.load(path);
  }
}
```

`generateRootedPath()` returns `parent/child/42` in history mode and `/#/parent/child/42` in hash mode for this example. Pass these router instructions to the root router or use an explicit root context. The history form has no leading slash to select the root on its own, and neither form is a general-purpose browser href.

For a link in the same component, pass the original `../c2` instruction and its parameters directly to `load`. The attribute uses the selected context for clicks and writes the browser href. See [path generation in the navigation guide](navigating.md#path-generation) for the full contract.

For `navigate()`, supply an application URL reference without the hash-routing wrapper. See the [application URL guide](application-url-navigation.md) for accepted inputs and the browser hrefs produced by `createHref()`.

## Active state checks (`router.isActive`)

Use `isActive()` to check whether a route is active within a selected context, for example when highlighting a navigation item:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class NavBar {
  private readonly router = resolve(IRouter);

  isUsersActive(): boolean {
    return this.router.isActive('users', this);
  }
}
```

For ordinary menus, the [navigation model](navigation-model.md) and the `load` attribute's active status can supply this behavior directly. The `url` attribute does not expose an active-route output.

## Route tree and transitions

Inspect `router.routeTree` to see the active routes, `router.currentTr` for the transition, and `router.isNavigating` to check whether navigation is in progress. Use guards to accept or cancel navigation and [router events](router-events.md) to observe it. Changing the tree or transition internals is unsupported.

## Managed browser history state (`AuNavId` / `ManagedState`)

When the router writes a history entry, it includes an `au-nav-id` marker. Supply application metadata through the navigation's `state` option:

```typescript
await router.navigate('/reports', {
  state: { openedFrom: 'dashboard' },
});
```

The same option is available to `load`. The router adds its marker to the history entry and leaves your original state object untouched. On Back/Forward, read the restored state through `NavigationStartEvent.managedState`.

When updating an existing browser entry with `history.replaceState`, merge with its current state to preserve the router's marker. A `historyStrategy: 'none'` navigation writes no entry. See [router state management](router-state-management.md) for reading and managing per-entry metadata.
