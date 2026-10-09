---
description: Define routes on your layouts and choose how links find their destinations.
---

# @aurelia/router

Aurelia's router connects URLs to your application's components. A layout defines the pages it hosts and stays on screen as you move between them. Each page can load the data it needs and decide whether a navigation may proceed.

Links can use that layout as their starting point. An administration menu's Reports link then leads to the same page, even while a nested detail page is displayed. A control on the detail page can use the current URL to open a related page. You choose which starting point each link needs.

## Routes belong with their layouts

Define a feature's child routes on the component that hosts them:

```typescript
// admin-layout.ts
import { route } from '@aurelia/router';
import { ReportsPage } from './reports-page';
import { ItemDetailsPage } from './item-details-page';
import { ItemSummaryPage } from './item-summary-page';

@route({
  routes: [
    { path: 'reports', component: ReportsPage, title: 'Reports' },
    { path: 'items/:id/details', component: ItemDetailsPage, title: 'Item details' },
    { path: 'items/:id/summary', component: ItemSummaryPage, title: 'Item summary' },
  ],
})
export class AdminLayout {}
```

```html
<!-- admin-layout.html -->
<nav>
  <a load="reports">Reports</a>
</nav>
<au-viewport></au-viewport>
```

If the application mounts this layout at `admin`, its reports page is available at `/admin/reports`. The `load="reports"` link selects a route owned by `AdminLayout`. Opening `/admin/items/42/details` does not change where that menu link leads.

Keep each feature's child routes beside its layout. The root application only needs a route to that layout, which can be loaded on demand. For a split view, a layout can host several [named viewports](../../router/viewports.md#named-viewports).

## Choose what a destination is relative to

| Your intention | In a template | In code |
| --- | --- | --- |
| Open a route owned by this layout or component | `load="reports"` | `IContextRouter.load('reports')` |
| Resolve an address against the current application URL | `url="summary"` | `IRouter.navigate('summary')` |
| Open another document or leave the application | Native `href`; use `external` for an internal-looking address | Browser navigation APIs |

Use `load` to select a route by ID, supply its parameters, or target a named viewport. It can also mark the active menu item. The router-managed `href` attribute accepts contextual routing instructions with the same starting point as `load`.

Use `url` to navigate from the current application address. At `/admin/items/42/details`, `url="summary"` leads to `/admin/items/42/summary`, while `url="/admin/reports"` always selects the application root's `/admin/reports`. Write these references without a deployment prefix or outer hash-routing marker; the router adds them when it builds the browser link.

The `url` attribute is opt-in. Add `UrlCustomAttribute` alongside your router registration:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration, UrlCustomAttribute } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration, UrlCustomAttribute)
  .app(MyApp)
  .start();
```

Once bound, `load` and `url` write real `href` values to anchors, so visitors can copy a link or open it in another tab. The router handles ordinary in-app clicks. The browser handles modified clicks, downloads, and links targeting another browsing context. Mark links to separate documents with `external`:

```html
<a href="/downloads/guide.pdf" external>Download the guide</a>
```

Read [Navigation](../../router/navigating.md) for contextual links and route instructions, or [Application URL navigation](../../router/application-url-navigation.md) for current-location references, query changes, and browser-ready hrefs.

## Control what happens during a transition

A routed component can load the data it needs in `loading`, reject or redirect an incoming navigation in `canLoad`, and ask about unsaved work in `canUnload`. These hooks can be asynchronous. Shared hooks let a feature apply the same policy across several pages.

Build menus from the navigation model and read the completed route through `ICurrentRoute`. Typed events from `IRouterEvents` let you show a loading indicator during navigation or record a page view when it finishes. [Transition plans](../../router/transition-plans.md) control whether a component is reused, has its routing hooks invoked again, or is replaced.

## Find your next guide

| Task | Guide |
| --- | --- |
| Add routing to an application | [Getting started](../../router/getting-started.md) |
| Build a layout with child pages | [Routes and nested layouts tutorial](../../getting-started/extended-tutorial/step-2-routing-and-layout.md) · [Child routing](../../router/child-routing.md) |
| Define paths, parameters, redirects, and lazy routes | [Configuring routes](../../router/configuring-routes.md) |
| Coordinate multiple viewports | [Viewports](../../router/viewports.md) |
| Load data or guard navigation | [Routing lifecycle](../../router/routing-lifecycle.md) · [Shared router hooks](../../router/router-hooks.md) |
| Generate menus and observe navigation | [Navigation model](../../router/navigation-model.md) · [Current route](../../router/current-route.md) · [Router events](../../router/router-events.md) |
| Deploy under a base path or use hash routing | [Router configuration](../../router/router-configuration.md) |
| Find an API or diagnose a problem | [Quick reference](../../router/README.md) · [Troubleshooting](../../router/troubleshooting.md) |

If you are maintaining an application built with `@aurelia/router-direct`, see [Choosing the right Aurelia router](./choosing-a-router.md) for the distinction between the packages.
