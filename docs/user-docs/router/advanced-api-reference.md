---
description: Inspect router instruction trees, generate paths with an explicit context, and correlate navigation with browser history.
---

# Advanced router API reference

The public navigation APIs cover most application code. Use this page when you need to inspect instruction trees, generate contextual paths, or correlate transitions with browser history. For application URL references and browser-ready links, use [`navigate()` and `createHref()`](application-url-navigation.md).

## Instruction trees (`ViewportInstructionTree`)

Router events expose the instructions for a transition. An instruction tree retains information that a string alone cannot carry, including the selected routing context. You can construct one through the router:

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

`toPath()` supplies a diagnostic instruction path. It omits query and fragment information, so it is not a faithful snapshot of a whole navigation request.

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

`RouterOptions._urlParser` is internal and absent from the published types. Do not use private parser mutation as a configuration recipe. For ordinary browser links from application references, `createHref()` applies the router's publication rules for you.

## Path generation (`router.generatePath`)

`generatePath()` formats route instructions without navigating. It returns a string or a promise of a string when route configuration needs loading. Its result is relative to the **context selected by the instruction prefixes**.

The starting context is the root for `IRouter.generatePath()` unless a context is supplied. `IContextRouter.generatePath()` starts at its bound context. A leading `../` selects a parent and is consumed; it does not remain in the generated text.

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

`generateRootedPath()` returns `parent/child/42` in history mode and `/#/parent/child/42` in hash mode for this example. These are established router instruction forms, not universally browser-ready hrefs. In particular, the history form does not contain a leading slash that would independently select the root. Consume it through the root router or an explicit root context.

For a same-component link, passing the original `../c2` instruction and its parameters directly to `load` avoids this intermediate conversion. The attribute keeps the selected instruction context for clicks and produces the browser href separately. See [path generation in the navigation guide](navigating.md#path-generation) for the full contract.

Do not feed hash-form generated instructions into `navigate()` as though they were application URL references. The [application URL guide](application-url-navigation.md) distinguishes those values from `createHref()` output.

## Active state checks (`router.isActive`)

`isActive()` checks route instructions within a selected context. This is useful when building navigation UI whose state follows route identity:

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

`router.routeTree`, `router.currentTr`, and `router.isNavigating` expose the current tree, transition, and navigation status. Inspect them for diagnostics; changing their internals is not a supported way to navigate or cancel work. Use guards for a navigation decision and [router events](router-events.md) for notifications.

## Managed browser history state (`AuNavId` / `ManagedState`)

When the router writes a history entry, it includes an `au-nav-id` marker. Supply application metadata through the navigation's `state` option:

```typescript
await router.navigate('/reports', {
  state: { openedFrom: 'dashboard' },
});
```

The same option is available to `load`. The router carries the caller's state without adding its marker to the original application object. On Back/Forward, the restored state is available through `NavigationStartEvent.managedState`.

If you deliberately amend an existing browser entry with `history.replaceState`, merge with its current state so the router's marker survives. A `historyStrategy: 'none'` navigation writes no entry. See [router state management](router-state-management.md) for reading and managing per-entry metadata.
