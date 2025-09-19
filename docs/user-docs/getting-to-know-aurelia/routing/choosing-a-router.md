---
description: Compare @aurelia/router and @aurelia/router-direct so you can pick the best fit for your application.
---

# Choosing the right Aurelia router

Aurelia ships two routers. They share the same navigation primitives such as viewports, lifecycle hooks, and the `load` attribute, but differ in how you configure and reason about routes. The table below distills the trade-offs so you can adopt the router that matches your team’s preferences and app shape.

## Feature comparison

| Capability | `@aurelia/router` | `@aurelia/router-direct` | Notes |
| --- | --- | --- | --- |
| Authoring style | Declarative route tables with `@route`, hierarchical configuration | Component-owned routes via `static routes`/`@routes`, inline template instructions | Both support strongly typed navigation APIs. |
| Layout composition | Multiple named viewports, child routers, transition plans | Single or multiple viewports, favoring direct component control | Router-direct can mix direct and configured routes when needed. |
| Lifecycle hooks | Component lifecycle (`canLoad`, `loading`, etc.) plus global hooks via `IRouterEvents` | Same hook names, plus direct routing hooks and indicators for fine-grained control | See [Routing lifecycle](../../router/routing-lifecycle.md) and [Router hooks](../../router/router-hooks.md). |
| Navigation state | Central `IRouter`, `ICurrentRoute`, navigation model, transition history | Lightweight state via `Navigation` and `Navigator`, opt-in stateful history length | Router-direct keeps state scoped to the components that declare routes. |
| Title management | `buildTitle` function, per-route titles, navigation model integration | `TitleOptions` placeholders and `transformTitle`, component-level ownership | Either router supports i18n integration via custom title builders. |
| Hash vs pushState | `useUrlFragmentHash` default `false`; pushState ready | `useUrlFragmentHash` default `true`; switch off for pushState | Both respect `<base href>` when using pushState. |
| Advanced scenarios | Transition plans, navigation guards, error recovery, navigation model | Direct instruction syntax, swap-order control, navigation sync states | Choose based on whether you prefer centralized orchestration or per-component control. |

## Pick `@aurelia/router` when…

- You want a centrally managed route tree that mirrors Angular’s configured router or Aurelia 1’s classic router.
- Your layout uses multiple named viewports or nested shells that need to coordinate transitions.
- You rely on the navigation model (`IRouter.navigation`) to generate menus or breadcrumbs.
- You need to orchestrate error recovery or state restoration across feature areas; see [Router state management](../../router/router-state-management.md).
- You prefer to co-locate child route definitions with feature modules via the `@route` decorator while still driving a parent route table.

## Pick `@aurelia/router-direct` when…

- You want each feature component to declare its own routes with minimal bootstrap configuration.
- You are migrating an Aurelia 1 app and want a familiar mental model with inline instructions and `load`-driven navigation.
- You plan to mix direct routing and configured routes, letting legacy features live alongside new component-driven areas.
- You need fine-grained control over how viewports swap content (`swapOrder`, navigation sync states) without maintaining a large central tree.
- You prefer to opt into pushState or hash mode per app without touching a large configuration object.

## Mixing routers

Both routers can exist in the same workspace, even within the same solution, so long as each Aurelia app instance registers the configuration it needs. Common patterns include:

- Using `@aurelia/router` for the main shell and embedding micro frontends that depend on `@aurelia/router-direct`.
- Building documentation or marketing microsites with router-direct while keeping complex dashboards on the standard router.
- Gradually migrating from router-direct to the standard router (or vice versa) by bootstrapping separate Aurelia apps on different DOM roots.

## Next steps

- New to routing? Start with the [`@aurelia/router` overview](./aurelia-router.md) or the [`@aurelia/router-direct` overview](./router-direct.md).
- Need concrete examples? Walk through [Configuring routes](../../router/configuring-routes.md) and [Creating routes](../../router-direct/creating-routes.md).
- Looking for lifecycle coverage? Compare [Routing lifecycle](../../router/routing-lifecycle.md) with the router-direct [routing lifecycle](../../router-direct/routing-lifecycle.md).
