---
description: Navigate from the current application URL and create links that work in history and hash mode.
---

# Application URL navigation

Use `router.navigate()` or the `url` attribute to resolve a destination from the current application URL. A toolbar can replace the last path segment or change the query string without selecting a routing context.

A layout can use `load` to link to its own child routes. The choice depends on where the link should start. Inside an `/admin` layout, while `/admin/items/42/details` is displayed:

| Intention | Link | Application destination |
| --- | --- | --- |
| Open the layout's Reports child | `load="reports"` | `/admin/reports` |
| Open a sibling of the displayed page | `url="summary"` | `/admin/items/42/summary` |
| Open a fixed application address | `url="/admin/reports"` | `/admin/reports` |

These examples assume the corresponding routes are configured. The `load` link keeps pointing to the layout's Reports page as you browse its descendants. A relative `url` link follows the changing application address.

Register the `url` attribute as shown below. See [Navigating](navigating.md) for links that use route IDs or a particular routing context.

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

The attribute writes a real `href` and refreshes relative destinations after each successful navigation. A normal click uses the destination calculated when the link was last updated, even if another navigation is pending. The click handler does not resolve the original relative text again. It respects canceled clicks and leaves modified clicks, downloads, and links to another browsing context to the browser.

Put one routing attribute on each element. The `url` attribute generates its own `href`; authoring it alongside `load` or a router-managed `href` raises [AUR3274](../developer-guides/error-messages/router/aur3274.md). To highlight the active menu item, use `load` and its [active status](navigating.md#active-status). The `url` attribute has no active-route output.

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

`navigate()` runs through the usual router lifecycle and returns `Promise<boolean>`. When a guard cancels navigation, the result is `false`; respect that decision to stay on the current page. Falling back to document navigation would bypass the guard. Invalid input can throw synchronously before a transition starts, and transition failures can reject the promise. Put the call inside `try` and await its result to handle both.

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

A leading `/` starts at the application root. For the deployment above, pass `/users/admins`; the router adds `/app/` to the browser link. Relative URL references work segment by segment. Contextual `../` selects a parent routing context, which may cover several URL segments.

The base is the **last successfully completed router location**. Pending, canceled, or failed navigation does not become the base. Successful navigation with `historyStrategy: 'none'` does become the base even though it leaves the address bar unchanged.

After navigation, the router uses a canonical address with any trailing slash or `/index.html` removed. For example, successful navigation to `/users/` establishes `/users` as the next base, so a subsequent `admins` reference resolves to `/admins`. To address a child explicitly, use `/users/admins` or the appropriate contextual instruction. The `/users/` entry in the table shows the resolved reference before this normalization.

The router recognizes the resolved address using its existing route-ID and viewport rules. Route IDs can take precedence over literal paths, so an ID that shadows another route's path can affect links and direct entry; [AUR3179](../developer-guides/error-messages/router/aur3179.md) explains the collision. [AUR3180](../developer-guides/error-messages/router/aur3180.md) covers raw routing punctuation in static path text. Pass original values in structured parameters and let the router encode them; pre-encoding changes the values.

Relative references use the whole application address as their base. To update a particular named viewport, use contextual or structured `load`.

## Create a browser-facing href

`createHref()` resolves an application reference and returns a browser-ready href synchronously:

```typescript
const href = router.createHref('/reports?period=month');
```

The returned href includes the deployment prefix and any hash-routing marker, with encoding handled by the configured URL serializer. `createHref()` only builds that string: it does not navigate, run guards, or check whether the route exists. Use the `url` attribute when a relative link should update after navigation.

Keep the application reference for `navigate()` and use the generated href in browser links. Passing the href back to `navigate()` can fail because it contains browser-address details:

```typescript
const destination = '/reports?period=month';
const href = router.createHref(destination); // For a browser link.
await router.navigate(destination);         // For application navigation.
```

If you bind a created href to an anchor, mark it `external` to keep the registered `href` attribute from interpreting it again as contextual instructions:

```html
<a href.bind="href" external>Open reports as a document</a>
```

An ordinary click on this link loads the document through the browser. To let the router handle the click, register `UrlCustomAttribute` and use `<a url="/reports?period=month">`. Visitors can still copy that link or open it in a new tab.

## Refresh a page when its query changes

A query-only reference replaces the query string. To keep existing filters while changing the page number, copy the current query first:

```typescript
const query = new URLSearchParams(currentRoute.query);
query.set('page', '2');
await router.navigate(`?${query}`, { transitionPlan: 'invoke-lifecycles' });
```

If the page fetches its data in `loading()`, request that hook with the per-navigation `transitionPlan` shown above. A query change updates `ICurrentRoute`, but by default the router reuses an otherwise unchanged route without rerunning `loading()`. A `transitionPlan` set on the route does not override this reuse rule; set it on the navigation call.

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

In your application, fetch through your data service and validate the server response before using it. This example reports failures from its own pagination actions. Handle errors during initial entry through the application's [navigation error handling](error-handling.md).

The override applies to these method calls. Later Back/Forward events and declarative `url` links still follow the default reuse rule, and `url` has no transition-plan option. To refresh data after every successful query change, use the [query-driven results recipe](outcome-recipes.md#query-parameter-state-management). Choose one place to trigger the fetch so the same query does not start duplicate requests.

A fragment-only reference such as `#details` changes the router fragment. To scroll to an element, add that behavior in your application after the intended content is available; the router does not scroll automatically.

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

Using the imports from the registration example above, this configuration produces a Reports link such as:

```text
/app/shell.html?theme=dark#/reports?period=month
```

Here, `theme=dark` belongs to the hosting document and `period=month` belongs to the route. With the option enabled, the router keeps the current document's pathname and query and replaces its hash. Document query values do not become route query parameters. Opening a document with no hash starts at the application's default route.

The option defaults to `false`, which builds addresses from `basePath` or the base href. It has no effect in history mode. Apply the configuration at startup so it also governs direct visits and reloads. A normal HTTP request contains no fragment, so the server cannot read the browser's hash route from it. See [router configuration](router-configuration.md) for deployment details.

## Leave other documents to the browser

Use native links for downloads, other pages, and external sites:

```html
<a href="/downloads/guide.pdf" external>Download the guide</a>
<a href="https://example.com/help" external>Help center</a>
```

Use `location.assign()` or `location.replace()` to open another document from code. `navigate()`, `createHref()`, and `url` accept references within the application. Scheme-qualified and protocol-relative references, such as `https://example.com/help` and `//example.com/help`, raise [AUR3273](../developer-guides/error-messages/router/aur3273.md).
