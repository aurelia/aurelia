---
description: Navigate from the current application URL and create links that work in history and hash mode.
---

# Application URL navigation

Use `router.navigate()` or the `url` attribute when the destination follows the current application URL. They work from a service, a global toolbar, or a component without requiring that caller to select a routing context. A sibling page, a new query, or a fixed application address can all be expressed as URL references.

Contextual navigation remains useful for a different job: a layout linking to its own child routes. Inside an `/admin` layout, while `/admin/items/42/details` is displayed:

| Intention | Link | Application destination |
| --- | --- | --- |
| Open the layout's Reports child | `load="reports"` | `/admin/reports` |
| Open a sibling of the displayed page | `url="summary"` | `/admin/items/42/summary` |
| Open a fixed application address | `url="/admin/reports"` | `/admin/reports` |

These examples assume the corresponding routes are configured. `load` keeps the layout as its reference point as descendants navigate. A relative `url` link follows the changing application location. Both are useful; choose the reference point that expresses the destination you intend.

The `url` attribute requires explicit registration, shown below. For contextual instructions, route identities, active navigation menus, and targeted viewports, see [Navigating](navigating.md).

## Declarative links

Register `UrlCustomAttribute` alongside your router configuration. It is opt-in and is not installed by `RouterConfiguration` alone.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration, UrlCustomAttribute } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration, UrlCustomAttribute)
  .app(MyApp)
  .start();
```

You can then write application-URL links:

```html
<a url="summary">Summary of the displayed item</a>
<a url="/admin/reports">Reports</a>
<a url.bind="destination">Open destination</a>
```

The attribute writes a real `href`. When navigation succeeds, it refreshes relative destinations using the new application URL. A normal click follows the destination captured when that link was updated; it does not reinterpret the original relative text midway through another navigation. Modified clicks, downloads, canceled clicks, and targets belonging to another browsing context retain native browser behavior.

Use one router navigation owner per element. Combining `url` with `load` or a router-managed `href` raises [AUR3274](../developer-guides/error-messages/router/aur3274.md). The `url` attribute generates its own `href`; you do not author both. It has no active-route output. Use `load` and its [active status](navigating.md#active-status) for route-aware menu styling.

## Navigate from code

Resolve `IRouter` and pass an application URL reference:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class ItemToolbar {
  private readonly router = resolve(IRouter);

  async showSummary(): Promise<void> {
    try {
      const completed = await this.router.navigate('summary');
      if (!completed) {
        // A guard canceled the navigation; the router keeps the current page.
        return;
      }
    } catch (error) {
      // Replace this with the application's error reporting.
      console.error('Could not open the summary.', error);
    }
  }
}
```

`navigate()` participates in the usual router lifecycle and returns `Promise<boolean>`. A guard veto returns `false`. Invalid input can throw synchronously before a transition starts, and transition failures can reject the promise; `try` around `await` handles both. A canceled router navigation is not a request to fall back to native document navigation.

Behavior options control history, caller state, title, title separator, and the transition plan:

```typescript
await router.navigate('/reports?period=month', {
  historyStrategy: 'replace',
  state: { openedFrom: 'summary' },
});
```

The reference contains the path, query, and fragment. `INavigationBehaviorOptions` has no `context`, `queryParams`, or `fragment` option. Use [contextual `load`](navigating.md) when the destination requires a route owner or structured component instruction.

## Understand the reference point

An **application URL** describes the router's location inside the application. It excludes the deployment prefix and the outer hash-routing marker. For an application deployed under `/app/`, these browser addresses represent the same application location:

```text
History mode: /app/users/members?page=1
Hash mode:    /app/#/users/members?page=1
Application: /users/members?page=1
```

From that application location:

| Reference | Resolved application reference |
| --- | --- |
| `admins` | `/users/admins` |
| `../about` | `/about` |
| `/home` | `/home` |
| `?page=2` | `/users/members?page=2` |
| `#details` | `/users/members?page=1#details` |
| `./` | `/users/` |
| `/` | `/` |

A leading `/` starts at the application root, so pass `/users/admins`, not `/app/users/admins`. Relative references use URL-segment resolution. Contextual `../` instead selects a parent routing context, which may consume several URL segments.

The base is the **last successfully completed router location**. Pending, canceled, or failed navigation does not become the base. Successful navigation with `historyStrategy: 'none'` does become the base even though it leaves the address bar unchanged.

Navigation normalizes the resolved reference into the router's canonical location. A trailing slash or trailing `/index.html` is not retained as a directory marker for the next relative navigation. For example, after successfully navigating to `/users/`, the next reference `admins` resolves from canonical `/users` to `/admins`. To address a child explicitly, use `/users/admins` or the appropriate contextual instruction. The `/users/` entry in the table describes reference resolution before that navigation normalization.

Reference resolution retains the established incoming-address interpretation, including route IDs and viewport syntax. It does not introduce path-first precedence. A route ID that shadows another route's literal path can therefore affect links and direct entry; [AUR3179](../developer-guides/error-messages/router/aur3179.md) explains the collision. [AUR3180](../developer-guides/error-messages/router/aur3180.md) covers raw routing punctuation in static path text. Structured parameter values are encoded by the router; do not pre-encode them.

Relative references operate on the whole application address. They do not select an individual named viewport as their base. Use contextual or structured `load` for a targeted viewport update.

## Create a browser-facing href

`createHref()` resolves an application reference and returns a browser-ready href synchronously:

```typescript
const href = router.createHref('/reports?period=month');
```

It does not navigate, run guards, or check that the route exists. The output applies the deployment and hash/history publication rules, including encoding from the configured URL serializer. It is a snapshot; use the `url` attribute when a relative link should update after navigation.

A browser href and an application reference are different values. Do not pass the output back into `navigate()`:

```typescript
const destination = '/reports?period=month';
const href = router.createHref(destination); // For a browser link.
await router.navigate(destination);         // For application navigation.
```

If you bind a created href to an anchor, mark it `external` to keep the registered `href` attribute from interpreting it again as contextual instructions:

```html
<a href.bind="href" external>Open reports as a document</a>
```

This example uses native document navigation on an ordinary click. Use `<a url="/reports?period=month">` for router-handled navigation with the same browser-link affordances, after registering `UrlCustomAttribute`.

## Refresh a page when its query changes

A query-only reference replaces the query string. Copy existing query parameters when some must survive:

```typescript
const query = new URLSearchParams(currentRoute.query);
query.set('page', '2');
await router.navigate(`?${query}`, { transitionPlan: 'invoke-lifecycles' });
```

The transition-plan override matters when `loading()` owns data acquisition. A query change updates `ICurrentRoute`, but the default reuse behavior does not rerun `loading()` for an otherwise unchanged route. A route-level `transitionPlan` does not override that same-path/parameters reuse check; the per-navigation option above does.

Here is a routed results page whose backend returns an array of `{ id, name }` objects. It keeps filters in the query, refreshes data during navigation, and handles cancellation separately from errors:

```typescript
import { resolve } from '@aurelia/kernel';
import { ICurrentRoute, IRouter } from '@aurelia/router';
import type { IRouteViewModel, Params, RouteNode } from '@aurelia/router';

interface Report {
  id: string;
  name: string;
}

export class Reports implements IRouteViewModel {
  private readonly router = resolve(IRouter);
  private readonly currentRoute = resolve(ICurrentRoute);
  reports: Report[] = [];
  page = 1;
  navigationError = '';

  async loading(_params: Params, next: RouteNode): Promise<void> {
    const requestedPage = Number(next.queryParams.get('page') ?? '1');
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage : 1;
    const query = new URLSearchParams(next.queryParams);
    query.set('page', String(page));
    const response = await fetch(`/api/reports?${query}`);
    if (!response.ok) throw new Error(`Reports request failed: ${response.status}`);
    const reports: Report[] = await response.json();
    this.reports = reports;
    this.page = page;
  }

  async goToPage(page: number): Promise<void> {
    const query = new URLSearchParams(this.currentRoute.query);
    query.set('page', String(page));
    this.navigationError = '';
    try {
      if (!await this.router.navigate(`?${query}`, {
        transitionPlan: 'invoke-lifecycles',
      })) return;
    } catch {
      this.navigationError = 'The requested page could not be loaded.';
    }
  }
}
```

```html
<p if.bind="navigationError" role="alert">${navigationError}</p>
<ul>
  <li repeat.for="report of reports">${report.name}</li>
</ul>
<button type="button" disabled.bind="page <= 1"
        click.trigger="goToPage(page - 1)">Previous</button>
<button type="button" click.trigger="goToPage(page + 1)">Next</button>
```

Use your application's data service and response validation at the HTTP boundary. The example reports failures from its own pagination actions; errors during initial entry need the application's [navigation error handling](error-handling.md).

The override above applies to these method calls. It does not make later Back/Forward events or declarative `url` links invoke `loading()`. When data must follow every successful query change, use the [query-driven results recipe](outcome-recipes.md#query-parameter-state-management). The `url` attribute has no transition-plan option. Choose one owner for refreshing the data so the same query does not trigger duplicate requests.

A fragment-only reference such as `#details` changes the router fragment. It does not automatically scroll to an element. An application that uses fragments for scrolling must implement that behavior after the intended content is available.

## Keep the hosting document in hash mode

An application can be hosted at a particular HTML document, such as `/app/shell.html?theme=dark`. If hash navigation must keep that document path and query on clicks, reloads, and new tabs, opt in to `preserveHashDocument`:

```typescript
Aurelia.register(
  RouterConfiguration.customize({
    useUrlFragmentHash: true,
    preserveHashDocument: true,
  }),
  UrlCustomAttribute,
).app(MyApp).start();
```

Using the same imports as the registration example above, this configuration can publish a Reports destination as:

```text
/app/shell.html?theme=dark#/reports?period=month
```

`theme=dark` belongs to the hosting document. `period=month` belongs to the route. With the option enabled, publication preserves the current document's pathname and query and replaces its hash; it does not turn the document query into route query parameters. A document with no hash starts at the application's default route.

The default is `false`, preserving the existing publication behavior based on `basePath` or the base href. The option has no effect in history mode. Use the same configuration when entering the app directly, not only when creating a link. A server request normally contains no fragment, so this option does not give the server information about the browser's hash route. See [router configuration](router-configuration.md) for deployment details.

## Leave other documents to the browser

Use native links for downloads, other pages, and external sites:

```html
<a href="/downloads/guide.pdf" external>Download the guide</a>
<a href="https://example.com/help" external>Help center</a>
```

Use `location.assign()` or `location.replace()` for programmatic document navigation. Scheme-qualified and protocol-relative references, such as `https://example.com/help` and `//example.com/help`, are rejected by `navigate()`, `createHref()`, and `url` with [AUR3273](../developer-guides/error-messages/router/aur3273.md). The new operations navigate within the application; they do not select another hosting document.
