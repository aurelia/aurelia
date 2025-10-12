---
description: Reach for this quick reference whenever you need the most common @aurelia/router patterns without digging through the full guide set.
---

# Router quick reference

New to routing and just want the answers? This page distills the essentials of `@aurelia/router` so you can wire up navigation, sub-routes, and programmatic redirects without bouncing across multiple docs.

> Migrating from `@aurelia/router-direct`? Switch imports to `@aurelia/router`. The same component-owned route tables, direct `load` instructions, and navigation hooks work unchanged—see the migration notes at the end of this page.

## TL;DR setup

1. Install the router: `npm i @aurelia/router`
2. Register it at startup
3. Annotate components with `@route`

```ts
// src/main.ts
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { AppRoot } from './app-root';

Aurelia
  .register(RouterConfiguration)
  .app(AppRoot)
  .start();

// src/app-root.ts
import { customElement } from '@aurelia/runtime-html';
import { route } from '@aurelia/router';
import template from './app-root.html';
import { Dashboard } from './dashboard';
import { Reports } from './reports';

@route({
  routes: [
    { path: ['', 'dashboard'], component: Dashboard, title: 'Dashboard' },
    { path: 'reports', component: Reports, title: 'Reports' },
  ],
})
@customElement({ name: 'app-root', template })
export class AppRoot {}
```

## Common tasks at a glance

| Task | Snippet | Notes |
| --- | --- | --- |
| Render a link | `<a href="reports">Reports</a>` | Works in the current routing context. |
| Bind params in markup | `<a load="route: user; params.bind: { id: user.id }">Profile</a>` | Prefer `load` when you want bound parameters. |
| Navigate from code | `await router.load('reports')` | Inject `IRouter` and call `load`. Returns `true` on success. |
| Navigate relative to a child route | `await router.load('../settings', { context: this })` | `context: this` anchors navigation to the active component. |
| Append query params | `router.load('search', { queryParams: { q: term } })` | The router builds `?q=...` for you. |
| Jump to multiple viewports | `router.load('users+chart')` | Targets named `<au-viewport>` elements. |
| Check active route | `router.isActive('reports', this)` | Pass a component (or `null` for the root) to scope the check. |

## Programmatic navigation essentials

- Inject `IRouter` (or resolve it) inside your component.
- `router.load(...)` accepts strings, arrays, component types, or structured instructions.
- Supply `INavigationOptions` for extras like fragments, query params, history strategy, or navigation context.

```ts
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';
import { Orders } from './orders';

export class AccountActions {
  constructor(private readonly router: IRouter = resolve(IRouter)) {}

  async goToOrders(id: string) {
    await this.router.load(
      { component: Orders, parameters: { id } },
      { queryParams: { tab: 'history' } },
    );
  }
}
```

> `router.load` resolves relative to the current routing context. Pass `context: null` to force an absolute navigation from the app root.

## Navigating inside nested layouts

Sub-routes often live under their own router context. Use these patterns to move between siblings or parents:

- Prefix the instruction with `../` (or `../../`) when using `href`/`load` in markup: `<a href="../settings">Back to settings</a>`
- When navigating from code, pass either the component instance (`context: this`) or a DOM element inside it to `router.load` so the router can find the correct ancestor.
- To grab the parent router explicitly, inject `IRouter` and call `router.getContext(this).parent?.router`.

```ts
await this.router.load('../reports', { context: this }); // sibling under the same parent
await this.router.load('analytics', { context: this, fragment: 'summary' }); // child route with fragment
```

## Build links that feel native

- `href` keeps markup simple and respects modifier keys (Ctrl/Cmd + click).
- `load` adds structure: bind parameters, target named viewports (`load="dashboard@left+metrics@right"`), or mix string and object instructions.
- For menus, combine `router.isActive` with conditional classes: `<a class.bind="router.isActive('reports', this) ? 'active' : ''">Reports</a>`

## Observe the current route

Need the active title, parameters, or breadcrumbs? Inject `ICurrentRoute`.

```ts
import { ICurrentRoute } from '@aurelia/router';

export class ShellNav {
  constructor(private readonly currentRoute: ICurrentRoute) {}

  get breadcrumb() {
    return this.currentRoute.title;
  }
}
```

## Which router should I choose?

For new Aurelia 2 applications, use `@aurelia/router`. It offers the convention-friendly defaults, navigation model, and tooling the broader docs assume.

## Next steps

- Walk through the [Getting started guide](./getting-started.md) for a paced tutorial.
- Deep-dive into [Navigating](./navigating.md) to explore every `href`/`load` pattern.
- Configure advanced behaviors in [Router configuration](./router-configuration.md) and [Router state management](./router-state-management.md).
- Troubleshoot issues with the [Router troubleshooting guide](./troubleshooting.md).

## Migration notes (`@aurelia/router-direct` → `@aurelia/router`)

- **Imports**: replace every `@aurelia/router-direct` import with `@aurelia/router`. `RouterConfiguration` (or `RouterRegistration`) is registered the same way.
- **Component routes**: `static routes`, `static title`, `@route`, and `getRouteConfig()` are fully supported; no code changes beyond the import rename.
- **Navigation instructions**: string instructions (`'parent@left+child(id=1)'`), arrays, and component references behave identically. Options such as `context`, `queryParams`, and `transitionPlan` share the same shapes.
- **Hooks & lifecycle**: keep your existing `router.addHooks(...)`, `canLoad`, `loading`, `canUnload`, `unloading`, and navigation-coordinator code—only the import path changes.
- **Compatibility option**: if you relied on query-string-to-params coercion, enable `treatQueryAsParameters` in `RouterConfiguration.customize`. It remains for legacy parity and will be removed in a future major release.
