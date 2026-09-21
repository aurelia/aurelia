---
description: Build route-driven applications with nested layouts, named viewports, and navigation that follows your intent.
---

# @aurelia/router

Aurelia's router connects URLs to your application's components. Each feature can own its routes, layout, navigation, and loading behavior. A parent layout stays in place as its child pages change; multiple named viewports let a single address describe a split view. Route guards and asynchronous lifecycle hooks coordinate the transition before the new view is shown.

Navigation can follow the same ownership. A menu in an administration layout can link to that layout's reports page regardless of which detail page is open. Elsewhere, a control can deliberately navigate relative to the current application URL. Aurelia supports both, with an explicit choice of reference point.

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

The same model extends to nested feature areas, lazy-loaded components, and [named viewports](../../router/viewports.md#named-viewports). You can keep child routes beside their layout instead of maintaining every route in one root table.

## Choose what a destination is relative to

| Your intention | In a template | In code |
| --- | --- | --- |
| Open a route owned by this layout or component | `load="reports"` | `IContextRouter.load('reports')` |
| Resolve an address against the current application URL | `url="summary"` | `IRouter.navigate('summary')` |
| Open another document or leave the application | Native `href`; use `external` for an internal-looking address | Browser navigation APIs |

`load` supports route IDs, parameters, named viewports, and active-link state. The router-managed `href` attribute is also supported as shorthand for contextual routing instructions; it follows the same reference point as `load`.

Use `url` when URL relationships are what you intend. At `/admin/items/42/details`, `url="summary"` leads to `/admin/items/42/summary`, while `url="/admin/reports"` always selects the application root's `/admin/reports`. The router adds your deployment prefix and, when configured, the outer hash-routing marker. These application references do not include either one.

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

Once bound, `load` and `url` write real `href` values to anchors, so visitors can copy a link or open it in another tab. They handle ordinary in-app clicks while preserving native modified-click, target, and download behavior. For a separate document, make that ownership explicit:

```html
<a href="/downloads/guide.pdf" external>Download the guide</a>
```

Read [Navigation](../../router/navigating.md) for contextual links and route instructions, or [Application URL navigation](../../router/application-url-navigation.md) for current-location references, query changes, and browser-ready hrefs.

## Control what happens during a transition

A routed component can load the data it needs in `loading`, reject or redirect an incoming navigation in `canLoad`, and ask about unsaved work in `canUnload`. These hooks can be asynchronous. Shared hooks let a feature apply the same policy across several pages.

The router also exposes current route information, a navigation model for menus, and typed events through `IRouterEvents`. These give loading indicators, titles, analytics, and other application services a common account of navigation. [Transition plans](../../router/transition-plans.md) control whether a component is reused, has its routing hooks invoked again, or is replaced.

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
