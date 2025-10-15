---
description: Understand the @aurelia/router package, its core concepts, and how to navigate the rest of the routing documentation.
---

# Router overview

Aurelia ships a single, fully featured router that gives you a declarative, component-first navigation system with strong type safety, multi-viewport layouts, and deep integration with dependency injection. If you have used Angular's router or the classic Aurelia 1 router, the mental model will feel familiar: define a route table, map URLs to components, nest layouts, guard navigation, lazy-load feature areas, and respond to lifecycle events. The Aurelia router stays HTML-friendly and convention-driven, letting you compose navigation without wrapper modules or excessive configuration.

## Highlights

- **Structured route tree** lets you describe nested layouts, auxiliary viewports, and fallback routes in one place while still co-locating child routes with their components via `@route`.
- **Viewport-first layouts** allow flexible page composition: declare multiple `<au-viewport>` elements, name them, and target them from route definitions. This makes responsive shells and split views straightforward.
- **Lifecycle hooks and events** mirror the intent of Angular guards (`canLoad`, `canActivate`, etc.) while using Aurelia conventions (`canLoad`, `loading`, `canUnload`, `unloading`). Hooks execute in well-defined order and support async work.
- **Navigation state management** gives you centralized insight into route activation, title building, and analytics hooks, ideal for larger apps.
- **Progressive enhancement** via the `load` and `href` attributes keeps markup readable and usable even before hydration.

Refer to the package README for release notes and API exports: [`packages/router/README.md`](../../../../packages/router/README.md).

## Choose the right guide

Need the shortcuts before the tour? Keep the [router quick reference](../../router/quick-reference.md) open beside you—it covers the everyday patterns this section builds on.

Work through the topics in this order when you are new to the router:

1. **Fundamentals**
   - [Getting started](../../router/getting-started.md)
   - [Router configuration](../../router/router-configuration.md)
   - [Defining routes and viewports](../../router/configuring-routes.md) · [Viewports in depth](../../router/viewports.md)
2. **Navigation patterns**
   - [Imperative navigation](../../router/navigating.md)
   - [Build menus with the navigation model](../../router/navigation-model.md)
   - [Accessing the active route](../../router/current-route.md)
3. **Lifecycle, hooks, and events**
   - [Routing lifecycle](../../router/routing-lifecycle.md)
   - [Router hooks](../../router/router-hooks.md)
   - [Router events](../../router/router-events.md)
4. **Advanced scenarios**
   - [Transition plans](../../router/transition-plans.md)
   - [Router state management](../../router/router-state-management.md)
   - [Error handling](../../router/error-handling.md)
   - [Advanced API reference](../../router/advanced-api-reference.md)
5. **Support resources**
   - [Testing guide](../../router/testing-guide.md)
   - [Troubleshooting](../../router/troubleshooting.md)

Keep the [live StackBlitz examples](https://stackblitz.com/@Sayan751/collections/router-lite) handy while you read; most topics embed a runnable demo.

## Feature map

| Capability | How to use it | Related doc |
|------------|---------------|-------------|
| Configure base path, hash vs pushState, title building | `RouterConfiguration.customize` and `RouterOptions` | [Router configuration](../../router/router-configuration.md) |
| Map URLs to components with strong typing | `@route` decorator inside your component | [Defining routes](../../router/configuring-routes.md) |
| Compose multiple viewports or named layouts | `<au-viewport>` and named viewports | [Viewports](../../router/viewports.md) |
| Control navigation flow | Lifecycle hooks (`canLoad`, `loading`, `canUnload`, `unloading`) | [Routing lifecycle](../../router/routing-lifecycle.md) |
| Listen for navigation changes | `Router.addEventListener(...)` or DI inject `IRouterEvents` | [Router events](../../router/router-events.md) |
| Persist and observe route state | Inject `ICurrentRoute` / `IRouter` | [Router state management](../../router/router-state-management.md) |
| Customize transitions | Provide a `transitionPlan` or set per-route strategies | [Transition plans](../../router/transition-plans.md) |

## Where to go next

- Explore targeted recipes in the [developer guides](../../developer-guides/routing/configured-routing.md).
- Pair routing with state management via [the store plugin](../../aurelia-packages/store/README.md) or your preferred data layer.
- Review the [router package CHANGELOG](../../../../packages/router/CHANGELOG.md) when upgrading between versions.
- Migrating from `@aurelia/router-direct`? Start with [component-owned route definitions](../../router/configuring-routes.md#component-owned-route-definitions-router-direct-parity) for a side-by-side mapping.
