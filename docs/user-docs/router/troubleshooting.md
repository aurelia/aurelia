---
description: Find out why a link opens the wrong page, query changes leave stale data, or a route fails after deployment.
---

# Router Troubleshooting Guide

When a link opens the wrong page, check how its destination is resolved. `load` and router-managed `href` select routes from the owning routing context. `url` and `IRouter.navigate()` resolve references against the last completed application URL. A native `href` addresses a browser document. The same relative text can mean something different in each case.

## A sidebar link changes destination on deeper pages

Suppose an admin layout owns a `reports` child route. Its sidebar should keep opening `/admin/reports` while the user browses `/admin/items/42/details`.

Use a contextual link in the admin layout:

```html
<a load="reports">Reports</a>
```

With `<a url="reports">`, the sidebar follows the current application URL. At `/admin/items/42/details`, that reference resolves to `/admin/items/42/reports`. Use this form when the destination should change with the displayed URL.

For a fixed application-root destination, use `<a url="/admin/reports">` after [registering `UrlCustomAttribute`](#a-url-link-has-no-href). Keep `load` for layout-owned menus, especially when you need its active-route state. See [Choosing a navigation API](navigating.md).

## A programmatic `../` behaves differently from a template link

A `load` attribute starts from its owning routing context. A call through `IRouter.load()` starts at the root unless you supply `context`.

For navigation owned by the current routed component, resolve `IContextRouter`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IContextRouter } from '@aurelia/router';

export class StepPage {
  private readonly router = resolve(IContextRouter);

  previousStep() {
    return this.router.load('../1');
  }
}
```

Here `..` selects the parent **routing context**. It does not remove one URL segment: a single route can consume several segments. Traversal above the routing root stays at the root.

If you intended URL-segment navigation, use `IRouter.navigate('../1')`. If you are replaying a generated path, check its selected context: generation consumes leading `../` prefixes, so replaying the result from the original child context can target the wrong route. See [Generating paths](navigating.md#path-generation).

## The query changes, but the page does not reload its data

A query-only navigation updates `ICurrentRoute.query`. It usually reuses the current component without calling `loading` again, because the route path and route parameters have not changed.

To call `loading` again for this navigation, set `transitionPlan` to `'invoke-lifecycles'`:

```typescript
import { resolve } from '@aurelia/kernel';
import { ICurrentRoute, IRouter, type Params, type RouteNode } from '@aurelia/router';

export class ProductList {
  private readonly router = resolve(IRouter);
  private readonly currentRoute = resolve(ICurrentRoute);
  page = 1;

  loading(_params: Params, next: RouteNode) {
    this.page = Number(next.queryParams.get('page') ?? '1');
    // Return your data-loading promise here so navigation waits for it.
  }

  goToPage(page: number) {
    const query = new URLSearchParams(this.currentRoute.query);
    query.set('page', String(page));
    return this.router.navigate(`?${query}`, {
      transitionPlan: 'invoke-lifecycles',
    });
  }
}
```

Copying the current query retains filters and sort order. A reference such as `?page=2` replaces the entire query; it does not merge with it.

A route-level `transitionPlan` alone does not override reuse when the path and route parameters are unchanged. The per-navigation option above does. For pages that must also refresh after declarative links and query-only Back/Forward navigation, react to completed query changes as shown in [Query parameter state management](outcome-recipes.md#query-parameter-state-management).

## A `url` link has no `href`

Register `UrlCustomAttribute` alongside `RouterConfiguration`. The router configuration includes `load`, `href`, and `au-viewport`; `url` needs this separate registration:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration, UrlCustomAttribute } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration, UrlCustomAttribute)
  .app(MyApp)
  .start();
```

```html
<a url="/admin/reports">Reports</a>
```

Also inspect the bound value: a `null` or `undefined` value removes the rendered `href`. An invalid reference can fail while the attribute binds or updates, before any navigation starts.

## `useHref: false` still rewrites my link

`useHref` controls click interception by the router's `href` attribute. It does not disable that attribute's conversion of contextual instructions into browser URLs.

Use `external` for a native link whose address the browser should use unchanged, including another document on the same origin:

```html
<a href="/downloads/guide.pdf" external>Download the guide</a>
<a href="/account/sign-out" external>Sign out</a>
```

The `load` and `url` attributes have their own click handling; `useHref: false` does not disable them. See [Router configuration](router-configuration.md).

## A click reloads the document or appears to do nothing

Inspect the rendered `href`, then check who owns the click:

- `external` or `data-external` leaves navigation to the browser.
- A modified click, a `download` link, or a target for another browsing context retains native browser behavior.
- An earlier handler calling `preventDefault()` prevents the router from taking over the click.
- A guard returning `false` cancels routing. It does not request a native navigation instead.

Choose how each link should navigate. Combining `url` with `load` or a router-managed `href` produces **AUR3274**:

```html
<a load="reports">Layout-owned route</a>
<a url="/admin/reports">Application URL</a>
<a href="/downloads/guide.pdf" external>Browser document</a>
```

The `url` example requires the registration shown above. To inspect guard decisions and transition failures, use [Router event monitoring](#router-event-monitoring).

## Clicking works, but reload or opening a new tab fails

The browser starts from the published URL on reload. It cannot reuse the instruction tree or route context retained by an existing link. Check which of these situations applies.

### The server returns a 404 before Aurelia starts

For history routing, the host must serve the application document for application routes such as `/admin/reports`. Configure the server's SPA fallback without routing asset and API requests to that document. Verify the deployment prefix as well: an app hosted at `/portal/` needs matching router base configuration.

Hash routing keeps the application route in the fragment, which the browser does not send to the server. The document before the `#` must still exist.

### Hash links open the wrong document

If the app runs in a specific document, such as `/portal/shell.html?tenant=acme`, enable document preservation:

```typescript
RouterConfiguration.customize({
  useUrlFragmentHash: true,
  preserveHashDocument: true,
});
```

A link to application route `/reports` then retains the document pathname and query, producing `/portal/shell.html?tenant=acme#/reports`. The `tenant` value belongs to the document query; it is not a route query parameter.

`preserveHashDocument` defaults to `false` and only affects hash routing. With the default, the router builds URLs from the configured base path. Apply the same configuration on fresh loads and new tabs. See [Router configuration](router-configuration.md) for deployment options.

### A route ID shadows another route's path

Consider these routes in the same context:

```typescript
{ id: 'reports', path: 'archive', component: Archive },
{ id: 'reports-page', path: 'reports', component: Reports },
```

The literal `reports` can select the first route by ID, including on incoming URL recognition. A structured instruction selecting `reports-page` can display the second component, but its published `/reports` URL still encounters that ambiguity on reload.

The development warning **AUR3179** reports ID/path collisions the router can detect. Give the archive route a non-conflicting ID, and update links that use it. The warning does not change route precedence or repair the configuration. An ID matching one of its own route's path aliases is fine.

### A static path contains routing punctuation

The router uses `+` for sibling instructions, `@` for viewport selection, and parentheses for grouping or parameters. Raw static paths containing that syntax can be selected through structured instructions yet mean something else when read back as a URL. **AUR3180** warns about these configurations during development.

For a literal plus sign, configure and link to an encoded static path such as `a%2Bb`; alternatively choose a path without routing punctuation. Make the change deliberately: `a+b` and `a%2Bb` may already be configured as different routes. The router does not automatically rename or reassign them.

## `navigate()` rejects a full URL or the result of `createHref()`

`navigate()` and `createHref()` accept application URL references. They reject full URLs and protocol-relative URLs, even for the application's own origin.

```typescript
await router.navigate('/admin/reports');
const href = router.createHref('/admin/reports');
```

The first call navigates. The second produces a browser-ready address with deployment and hash-routing details applied. Use that output as a native browser link; do not pass it back to `navigate()` or through the router-managed `href` attribute as another contextual instruction.

**AUR3273** is an input-validation error and can throw synchronously. Put the call itself inside `try` when handling it:

```typescript
try {
  const completed = await router.navigate(reference);
  if (!completed) {
    // A guard canceled navigation. Keep the current view.
  }
} catch (error) {
  // Handle an invalid reference or a failed transition.
  console.error(error);
}
```

See [Application URL navigation](application-url-navigation.md) for accepted references and the URLs they produce.

## The fragment changes, but the page does not scroll

`router.navigate('#details')` updates router fragment state. It does not implement scrolling to an element with `id="details"`.

If the fragment represents a section in your application, read it from the destination `RouteNode` during a lifecycle hook or from `NavigationEndEvent.finalInstructions.fragment`. Scroll once that section has rendered, allowing for any content it loads asynchronously. Your application handles section scrolling in both history and hash routing.

## A route does not match, or its viewport stays empty

Check the route in the context that owns it:

1. Verify the configured path, including required parameters such as `products/:id`, and the destination actually supplied to navigation.
2. Ensure the owning layout has an `<au-viewport>`. For named viewports, match the configured or explicit viewport name. See [Viewports](viewports.md).
3. When selecting components by name, ensure they are registered in the relevant resource scope. Direct component references or lazy imports in route configuration avoid relying on a global name lookup.
4. Inspect `canLoad` and `canUnload` results and exceptions from component creation or lifecycle hooks. A TypeScript `IRouteViewModel` annotation does not register hooks or alter their runtime behavior.

Read destination parameters from the `params` argument to `loading`, and destination query data from `next.queryParams`. `ICurrentRoute` describes completed navigation; it is not the pending destination inside `canLoad` or `loading`.

`RouterConfiguration` starts the router as part of application activation. A normal Aurelia application does not need an extra `router.start(true)` call.

## Debugging techniques

### Enable router logging

Register a logger with a console sink during development:

```typescript
import Aurelia from 'aurelia';
import { ConsoleSink, LoggerConfiguration, LogLevel } from '@aurelia/kernel';

// Add alongside your application registrations.
Aurelia.register(
  LoggerConfiguration.create({
    level: LogLevel.trace,
    sinks: [ConsoleSink],
  }),
);
```

### Router event monitoring

In the application shell, subscribe while bound and release subscriptions when unbound:

```typescript
import { resolve, type IDisposable } from '@aurelia/kernel';
import { IRouterEvents } from '@aurelia/router';

export class MyApp {
  private readonly events = resolve(IRouterEvents);
  private subscriptions: IDisposable[] = [];

  binding() {
    this.subscriptions = [
      this.events.subscribe('au:router:navigation-start', event => console.log('Start', event)),
      this.events.subscribe('au:router:navigation-end', event => console.log('End', event)),
      this.events.subscribe('au:router:navigation-cancel', event => console.log('Cancel', event)),
      this.events.subscribe('au:router:navigation-error', event => console.error('Error', event)),
    ];
  }

  unbinding() {
    for (const subscription of this.subscriptions) subscription.dispose();
    this.subscriptions = [];
  }
}
```

Compare the attempted instructions with the completed event's `finalInstructions`, especially when redirects are involved. Keep `try`/`catch` at programmatic call sites as well: errors before a transition starts do not emit a navigation-error event. See [Router Error Handling](error-handling.md).

### Slow navigation

Separate download time from work done by lifecycle hooks. Lazy imports defer component code until it is needed, while promises returned from `canLoad`, `loading`, and activation hooks keep navigation waiting. Moving an awaited request from `canLoad` to `loading` changes its purpose, but does not make that request non-blocking.

Use `loading` when data must be ready before displaying the page. To show the page sooner, let it activate while data loads. It can show a loading message and offer retry if the request fails. The [outcome recipes](outcome-recipes.md) show both data loading and query-driven refresh.
