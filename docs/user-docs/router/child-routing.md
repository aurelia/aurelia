---
description: Build deeply nested navigation trees with Aurelia's router, including layouts, sibling viewports, and relative navigation.
---

# Child Routing Playbook

Child routing lets each routed component own its own navigation tree. Use it to build dashboards with nested layouts, multi-step forms, or resource detail pages that include tabs or auxiliary panels. This guide walks through the patterns you will use most often.

## 1. Define parent and child routes

Every routed component can declare a `routes` array inside the `@route` decorator. Parent components stay slim—most of the structure lives in the child components.

```typescript
import { route } from '@aurelia/router';
import { UsersPage } from './users/users-page';
import { ReportsPage } from './reports/reports-page';

@route({
  routes: [
    { path: '', component: UsersPage, title: 'Users' },
    { path: 'reports', component: ReportsPage, title: 'Reports' },
  ]
})
export class AdminLayout {}
```

Each child component can keep nesting:

```typescript
import { route } from '@aurelia/router';
import { UserOverview } from './user-overview';
import { UserSettings } from './user-settings';

@route({
  routes: [
    { path: ':id', component: UserOverview, title: 'Overview' },
    { path: ':id/settings', component: UserSettings, title: 'Settings' },
  ]
})
export class UsersPage {}
```

When the router loads `AdminLayout`, it automatically instantiates the nested layout components and surfaces their routes inside the `<au-viewport>` declared in each template.

## 2. Render child viewports in parent templates

Every component that declares child routes must include at least one `<au-viewport>` in its view:

```html
<!-- admin-layout.html -->
<nav>
  <a load="">Users</a>
  <a load="reports">Reports</a>
</nav>

<au-viewport></au-viewport>
```

```html
<!-- users-page.html -->
<section class="users">
  <aside>
    <user-list></user-list>
  </aside>
  <main>
    <au-viewport></au-viewport>
  </main>
</section>
```

You can name child viewports to run siblings in parallel:

```html
<au-viewport name="main"></au-viewport>
<au-viewport name="details"></au-viewport>
```

Then target them with multi-viewport instructions such as `href="orders@main+profile@details"` or `router.load([{ component: Orders, viewport: 'main' }, { component: Profile, viewport: 'details' }])`. See [Viewports](./viewports.md#sibling-viewports) for more combinations.

## 3. Share layout data across child routes

Load shared data once in the parent and expose it through a service that both parent and children resolve from DI.

```typescript
import { singleton } from '@aurelia/kernel';

type AdminSummary = {
  totalUsers: number;
  activeUsers: number;
};

@singleton()
export class AdminStatsStore {
  private readonly fallback: AdminSummary = { totalUsers: 0, activeUsers: 0 };
  private _value: AdminSummary | null = null;

  set(summary: AdminSummary) {
    this._value = summary;
  }

  get value() {
    return this._value ?? this.fallback;
  }
}
```

```typescript
import { IRouteViewModel, Params } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class AdminLayout implements IRouteViewModel {
  private readonly store = resolve(AdminStatsStore);

  async loading(_params: Params) {
    const summary = await fetch('/api/admin/summary').then(res => res.json());
    this.store.set(summary);
  }
}
```

```typescript
import { resolve } from '@aurelia/kernel';

export class UsersPage {
  private readonly store = resolve(AdminStatsStore);

  get stats() {
    return this.store.value;
  }
}
```

Because the store is a singleton, each child route can read the latest summary without manually passing data down the tree.

## 4. Navigate within the current hierarchy

Relative navigation keeps nested layouts decoupled from the app root. Always resolve `IRouteContext` (or pass `context` through `router.load`) when a child needs to target a sibling or parent.

```typescript
import { IRouter, IRouteContext } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class UserTabs {
  private readonly router = resolve(IRouter);
  private readonly context = resolve(IRouteContext);

  openSettings(id: string) {
    return this.router.load(`${id}/settings`, {
      context: this.context,
    });
  }
}
```

You can achieve the same thing in templates:

```html
<a href="../">Back to list</a>
<a href="../${user.id}/settings">Settings</a>
```

The `../` prefix climbs up one routing context before evaluating the rest of the path.

## 5. Combine child routes with parameters

Child routes can declare their own parameters and still reuse parent parameters. The router merges them automatically when you call `IRouteContext.getRouteParameters({ includeQueryParams: true })` or receive the `Params` argument in lifecycle hooks. See the [Route parameters guide](./route-parameters.md) for a complete walkthrough.

> `getRouteParameters` is provided by `@aurelia/router`. If you are on `@aurelia/router-lite`, use the `params` hook argument and `routeContext.parent?.params` to reach ancestor values.

## 6. Lazy-load nested modules

You can reference dynamic imports inside any `component` slot. The router will `await` the module before instantiating the component.

```typescript
@route({
  routes: [
    {
      path: 'reports',
      component: () => import('./reports/reports-index').then(m => m.ReportsIndex),
      title: 'Reports',
    },
  ],
})
export class AdminLayout {}
```

This works at every level of the tree, so you pay the cost only when users actually navigate there.

## 7. Test nested layouts in isolation

Create the parent component via the testing harness, call `router.load` with a path that exercises the child routes, and then assert against the rendered DOM. Because every child route uses a real component (not a string lookup), you get high-confidence integration coverage:

```typescript
const { appHost, router } = await createFixture(AdminLayout).startApp();
await router.load('reports/daily');
expect(appHost.querySelector('reports-daily')).not.toBeNull();
```

## Scenario recipes

### Tabs inside a detail page

**Outcome:** `/users/:id` loads a layout with tabs (`overview`, `activity`, `settings`) without re-rendering the outer chrome.

1. Parent layout defines `routes` for each tab and keeps the `<au-viewport>` inside the main column.
2. Tabs use `href="tabName"` so navigation stays relative to the current user context.
3. Store the selected tab in a store or read it from `ICurrentRoute.fragment` if you also want anchor links.

Validation checklist:
- Navigating from `overview` to `settings` preserves the `:id` value.
- Browser back button cycles tabs without losing the parent layout.
- A deep link to `/users/42/settings` opens the settings tab immediately.

### Protected admin area with nested guards

**Outcome:** Block access to admin child routes unless the parent layout validates the session, while letting each child enforce its own role.

1. Implement `canLoad` on the parent layout to check authentication. Return `'login'` to redirect unauthorized users.
2. Register additional router hooks (or per-view-model `canLoad`) on children for permissions such as `reports:read`.
3. Use `IRouterEvents` to show a toast whenever a guard cancels navigation.

Validation checklist:
- Visiting `/admin/reports` while logged out redirects to `/login`.
- Visiting `/admin/users` with insufficient role triggers the child guard and surfaces an error message.
- Successful navigation still shows the admin shell.

### Multi-pane dashboards

**Outcome:** A dashboard shows a list in the left viewport and detail in the right viewport, both driven by routing.

1. Parent template declares `<au-viewport name="list">` and `<au-viewport name="detail">`.
2. Route instructions load both panes simultaneously, e.g. `router.load([{ component: ReportsList, viewport: 'list' }, { component: ReportsDetail, params: { id }, viewport: 'detail' }])`.
3. Child components navigate using `context: resolve(IRouteContext)` to avoid resetting the other viewport.

Validation checklist:
- Loading `/dashboard` shows default list + placeholder detail.
- Clicking a row updates only the detail viewport.
- Sharing `/dashboard@detail=report/weekly` opens the same detail for other users.

## Related resources

- [Configuring routes](./configuring-routes.md)
- [Viewports](./viewports.md)
- [Routing lifecycle](./routing-lifecycle.md)
- [Route parameters](./route-parameters.md)
- [Navigating](./navigating.md#navigate-in-current-and-ancestor-routing-context)
