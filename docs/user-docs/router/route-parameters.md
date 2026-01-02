---
description: Declare, read, and validate route parameters in Aurelia's router, including required, optional, wildcard, and constrained segments.
---

# Route Parameters Guide

Route parameters let you map dynamic pieces of a URL to runtime data. This guide covers how to declare each parameter style, consume values inside components, and coordinate parent/child segments.

## 1. Declare parameterized paths

Use the `path` field inside `@route` (or route configs) to describe parameters.

| Syntax | Meaning | Example |
| --- | --- | --- |
| `:id` | Required segment | `/users/42` |
| `:id?` | Optional segment | `/users` and `/users/42` |
| `*rest` | Wildcard remainder | `/files/src/app/main.ts` |
| `:id{{^\\d+$}}` | Constrained segment (regex) | `/orders/1001` (numbers only) |

```typescript
import { route } from '@aurelia/router';
import { FileViewer } from './file-viewer';
import { ProjectDetail } from './project-detail';
import { UserDetail } from './user-detail';
import { UserEditor } from './user-editor';

@route({
  routes: [
    { id: 'user-detail', path: 'users/:id', component: UserDetail },
    { id: 'user-edit', path: 'users/:id/edit', component: UserEditor },
    { id: 'company-project-detail', path: 'companies/:companyId/projects/:projectId', component: ProjectDetail },
    { id: 'file-viewer', path: 'files/*path', component: FileViewer },
  ]
})
export class AdminLayout {}
```

### Destructure params inside lifecycle hooks

Each lifecycle hook receives a `Params` object. The router always supplies a string value (or `undefined` if optional and missing), so add your own parsing as needed.

```typescript
import { IRouteViewModel, Params } from '@aurelia/router';

export class UserDetail implements IRouteViewModel {
  userId = '';

  canLoad(params: Params) {
    this.userId = params.id ?? '';
    return !!this.userId;
  }
}
```

For asynchronous preparation, use `loading` and throw to fail the navigation (or return `false` from `canLoad`) if something looks wrong.

## 2. Access parent and child parameters together

Nested routes often need both parent and child IDs (for example `/companies/10/projects/17`). Resolve `IRouteContext` and use `getRouteParameters` to aggregate values.

```typescript
import { IRouteContext } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class ProjectDetail {
  private readonly routeContext = resolve(IRouteContext);

  get identifiers() {
    return this.routeContext.getRouteParameters({
      mergeStrategy: 'parent-first',
    });
  }
}
```

Callers can opt in to query parameters too:

```typescript
this.routeContext.getRouteParameters({ includeQueryParams: true });
```

## 3. Work with query parameters alongside path params

Even though query parameters are not part of the path definition, you can treat them as a cohesive set.

```typescript
import { IRouter, ICurrentRoute } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class FilterPanel {
  private readonly router = resolve(IRouter);
  private readonly current = resolve(ICurrentRoute);

  apply(filters: Record<string, string>) {
    return this.router.load(this.current.path, {
      queryParams: filters,
    });
  }
}
```

Use `ICurrentRoute` to observe query changes reactively (see [Router state management](./router-state-management.md#managed-history-entries-au-nav-id-and-managedstate)).

## 4. Generate links with parameters

The `load` attribute on `<a>` elements handles interpolation for you. Bind `params` to an object so that the router formats the URL consistently. When you use `route: ...` with `params.bind`, the value must be a **route id** (not a path pattern).

```html
<a load="route: user-detail; params.bind: { id: user.id }">Open profile</a>
<a load="route: company-project-detail; params.bind: { companyId, projectId }"></a>
```

If you prefer to write a literal path, skip `route:` and provide the full string yourself:

```html
<a load="users/${user.id}">Open profile</a>
```

When generating programmatic instructions, pass `params` alongside the component:

```typescript
router.load({ component: ProjectDetail, params: { companyId: '10', projectId: '17' } });
```

## 5. Validate and coerce parameters

Guard logic belongs in the `canLoad` hook. You can redirect by returning a string instruction or a `ViewportInstruction`.

```typescript
import { IRouteViewModel, Params } from '@aurelia/router';

export class ReportLoader implements IRouteViewModel {
  canLoad(params: Params) {
    const date = params.date;
    if (!date || Number.isNaN(Date.parse(date))) {
      return 'reports/today';
    }

    return true;
  }
}
```

For stricter validation, pair regex-constrained paths with `canLoad` type checks so users get feedback before hitting your backend.

## 6. Test parameterized routes

Unit tests can render a component, navigate to a parameterized path, and assert how parameters flow through the lifecycle.

```typescript
import { customElement } from '@aurelia/runtime-html';
import { createFixture, assert } from '@aurelia/testing';
import { RouterConfiguration, IRouter, IRouteViewModel, Params, route } from '@aurelia/router';

@customElement({ name: 'user-detail', template: 'User ${userId}' })
class UserDetail implements IRouteViewModel {
  userId = '';

  canLoad(params: Params) {
    this.userId = params.id ?? '';
    return true;
  }
}

@route({
  routes: [{ path: 'users/:id', component: UserDetail }],
})
class App {}

const { appHost, container, startPromise, stop } = createFixture(
  '<au-viewport></au-viewport>',
  App,
  [RouterConfiguration],
);
await startPromise;

const router = container.get(IRouter);
await router.load('users/10');
assert.html.textContent(appHost, 'User 10');

await stop(true);
```

You can also mock `IRouteContext` or `ICurrentRoute` to simulate specific parameter sets without spinning up the full router.

## Outcome recipes

### Bookmarkable search filters

Goal: encode search term, page number, and filter chips in the URL so users can share the view.

1. Define the base route `/search` and keep filters in the query string (`?q=aurelia&page=2&tag=forms`).
2. Use `ICurrentRoute.query` to read the current filters in `attached()` and hydrate your form.
3. When filters change, call `router.load(this.current.path, { queryParams: newFilters })` to update the URL without reloading the whole app.

Checklist:
- Refreshing `/search?q=router&page=3` shows the same filter state.
- `router.load` uses `historyStrategy: 'replace'` when only filters change to avoid polluting history (configure via navigation options if needed).

### Parent + child identifiers

Goal: address `/companies/:companyId/projects/:projectId` and display both IDs in deeply nested children.

1. Parent route declares `companies/:companyId` and renders a `<au-viewport>` for projects.
2. Child route declares `projects/:projectId`.
3. Inside any descendant component call `routeContext.getRouteParameters({ mergeStrategy: 'parent-first' })` to get both IDs.

Checklist:
- Navigating between different projects preserves the company context.
- `routeContext.getRouteParameters()` returns `{ companyId: '10', projectId: '17' }` at every depth.

### Redirect invalid params

Goal: keep `/reports/:date` constrained to valid ISO dates.

1. Constrain the route with `:date{{^\\d{4}-\\d{2}-\\d{2}$}}` to block obviously bad paths.
2. Inside `canLoad`, parse the date and return `'reports/today'` if invalid.
3. Emit a toast notification through a shared service to explain the redirect.

Checklist:
- `/reports/2024-13-01` never renders the detail view; users land on `/reports/today`.
- Valid dates continue to the report screen.

## Related resources

- [Configuring routes](./configuring-routes.md#path-and-parameters)
- [Routing lifecycle](./routing-lifecycle.md#canload)
- [Navigating](./navigating.md#using-navigation-options)
- [Child routing playbook](./child-routing.md)
