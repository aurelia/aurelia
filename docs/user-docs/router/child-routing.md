---
description: Build deeply nested navigation trees with Aurelia's router, including layouts, sibling viewports, and relative navigation.
---

# Child Routing Playbook

Child routing lets a layout own both the viewports it renders and the routes that fill them. A sidebar can navigate among those routes while a nested page changes independently. The same layout can then move elsewhere in the application without rewriting its local links.

## 1. Define parent and child routes

A routed component declares its children with the `routes` array in `@route`. Suppose the application root configures `{ path: 'admin', component: AdminLayout }`. The admin layout can own its Users and Reports sections:

```typescript
import { route } from '@aurelia/router';
import { UsersPage } from './users/users-page';
import { ReportsPage } from './reports/reports-page';

@route({
  routes: [
    { path: ['', 'users'], component: UsersPage, title: 'Users' },
    { path: 'reports', component: ReportsPage, title: 'Reports' },
  ]
})
export class AdminLayout {}
```

Each child component can keep nesting:

```typescript
import { route } from '@aurelia/router';
import { UserIndex } from './user-index';
import { UserOverview } from './user-overview';
import { UserSettings } from './user-settings';

@route({
  routes: [
    { path: '', component: UserIndex, title: 'Users' },
    { id: 'overview', path: ':id', component: UserOverview, title: 'Overview' },
    { id: 'settings', path: ':id/settings', component: UserSettings, title: 'Settings' },
  ]
})
export class UsersPage {}
```

`UserIndex` can show the initial selection prompt beside the user list. The router renders the matching child inside its parent's `<au-viewport>`. For `/admin/users/42/settings`, `AdminLayout` contains `UsersPage`, which contains `UserSettings`. The path `:id/settings` belongs to one route; its two URL segments do not create two routing contexts.

## 2. Render child viewports in parent templates

Every component that declares child routes must include at least one `<au-viewport>` in its view:

```html
<!-- admin-layout.html -->
<nav>
  <a load="users">Users</a>
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

Target them from their owning layout with an instruction such as `load="orders@main+profile@details"`, or use `IContextRouter.load()` with an array:

```typescript
await contextRouter.load([
  { component: Orders, viewport: 'main' },
  { component: Profile, viewport: 'details' },
]);
```

Viewport names are local to the selected routing context. See [Viewports](./viewports.md#sibling-viewports) for a complete example.

## 3. Share layout data across child routes

The parent can load data shared by its child pages. A service lets those pages read the same data without making the URL or template carry the entire model:

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
import { AdminStatsStore } from './admin-stats-store';

export class AdminLayout implements IRouteViewModel {
  private readonly store = resolve(AdminStatsStore);

  async loading(_params: Params) {
    const response = await fetch('/api/admin/summary');
    if (!response.ok) throw new Error('Could not load the admin summary.');
    this.store.set(await response.json());
  }
}
```

```typescript
import { resolve } from '@aurelia/kernel';
import { AdminStatsStore } from './admin-stats-store';

export class UsersPage {
  private readonly store = resolve(AdminStatsStore);

  get stats() {
    return this.store.value;
  }
}
```

This singleton is application-wide. That is appropriate if the application has one shared admin summary. If separate layout instances need independent data, scope the service to their containers instead; see [dependency injection](../getting-to-know-aurelia/dependency-injection-di/overview.md).

The parent remains active while navigation changes only its descendants. Its `loading()` hook is not a refresh mechanism for every child or query change; choose an explicit refresh policy when the data requires one.

## 4. Navigate within the current hierarchy

Contextual navigation expresses who owns the destination. The `load="reports"` link in `AdminLayout` continues to target `/admin/reports` even while `/admin/users/42/settings` is active.

Resolve `IContextRouter` to use the same reference point in a component's code:

```typescript
import { resolve } from '@aurelia/kernel';
import { IContextRouter } from '@aurelia/router';

export class UsersPage {
  private readonly router = resolve(IContextRouter);

  openSettings(id: string) {
    return this.router.load({ component: 'settings', params: { id } });
  }
}
```

The equivalent link in `UsersPage` is:

```html
<a load="route: settings; params.bind: { id: user.id }">Settings</a>
```

From inside `UserSettings`, select its parent context to open a sibling route owned by `UsersPage`:

```html
<a load="../">Back to the user list</a>
<a load="route: ../overview; params.bind: { id: user.id }">Overview</a>
```

Each leading `../` climbs one routing context, regardless of how many URL segments that component's route consumed. Ascent stops at the root. `..` also selects the parent's default route.

If the destination is intentionally relative to the current application URL, use [`navigate()` or `url`](./application-url-navigation.md). Those APIs follow URL-segment rules. Layout menus generally benefit from keeping their destination tied to the owning layout, using `load`.

## 5. Combine child routes with parameters

Child routes can declare their own parameters and read parameters from ancestors. `IRouteContext.getRouteParameters()` aggregates the current context and ancestor values; `{ includeQueryParams: true }` also includes the query. It returns a snapshot, so read it again when a reused component needs updated values.

The `Params` argument in a routing lifecycle hook contains the incoming node's parameters, plus query values when configured. It is not an automatic merge of every ancestor's parameters. The hook's `next` route node and its parent nodes describe the incoming hierarchy. See [route parameters](./route-parameters.md) for access and merge options.

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

Create the parent component as the fixture root, then navigate through its configured children. This verifies the route hierarchy without mounting the entire application:

```typescript
import { createFixture } from '@aurelia/testing';
import { RouterConfiguration, IRouter } from '@aurelia/router';

const { appHost, container, startPromise, stop } = createFixture(
  '<au-viewport></au-viewport>',
  AdminLayout,
  [RouterConfiguration],
);
await startPromise;

const router = container.get(IRouter);
await router.load('users/42/settings');
expect(appHost.querySelector('user-settings')).not.toBeNull();

await stop(true);
```

## Scenario recipes

### Tabs inside a detail page

**Outcome:** `/users/:id` loads a layout with tabs (`overview`, `activity`, `settings`) without re-rendering the outer chrome.

1. Parent layout defines `routes` for each tab and keeps the `<au-viewport>` inside the main column.
2. Tabs use `load="tabName"` in that layout, so navigation stays relative to its routing context.
3. Bind `load`'s `active` output or use the navigation model for selected-tab styling. The tab route itself identifies the selection; a fragment is separate application state and does not automatically scroll or select a tab.

Validation checklist:

- Navigating from `overview` to `settings` preserves the `:id` value.
- Browser back button cycles tabs without losing the parent layout.
- A deep link to `/users/42/settings` opens the settings tab immediately.

### Protected admin area with nested guards

**Outcome:** Block access to admin child routes unless the parent layout validates the session, while letting each child enforce its own role.

1. Implement `canLoad` on the parent layout to check authentication. Return `'/login'` to redirect to the application-root login route.
2. Register additional router hooks (or per-view-model `canLoad`) on children for permissions such as `reports:read`.
3. Use `IRouterEvents` to show a toast whenever a guard cancels navigation.

Validation checklist:

- Visiting `/admin/reports` while logged out redirects to `/login`.
- Visiting `/admin/users` with insufficient role triggers the child guard and surfaces an error message.
- Successful navigation still shows the admin shell.

### Multi-pane dashboards

**Outcome:** A dashboard shows a list in the left viewport and detail in the right viewport, both driven by routing.

1. Parent template declares `<au-viewport name="list">` and `<au-viewport name="detail">`.
2. Route instructions load both panes simultaneously, e.g. `contextRouter.load([{ component: ReportsList, viewport: 'list' }, { component: ReportsDetail, params: { id }, viewport: 'detail' }])`.
3. Detail actions target the named detail viewport from the dashboard's routing context. An action inside the rendered list component must select that parent context first.

Validation checklist:

- Loading `/dashboard` shows default list + placeholder detail.
- Clicking a row updates only the detail viewport.
- Copying the resulting browser URL and opening it directly restores both panes.

## Related resources

- [Configuring routes](./configuring-routes.md)
- [Viewports](./viewports.md)
- [Routing lifecycle](./routing-lifecycle.md)
- [Route parameters](./route-parameters.md)
- [Navigating](./navigating.md#navigate-in-current-and-ancestor-routing-context)
