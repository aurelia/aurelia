---
description: Decide when to choose @aurelia/router-direct and find the key guides for the direct routing APIs.
---

# @aurelia/router-direct

`@aurelia/router-direct` is an alternative router that centers routing around components instead of global configuration. It keeps route definitions close to the feature they belong to, similar to Angular's standalone components or nested routing in React Router, while staying familiar to developers coming from the classic Aurelia 1 router.

> Not sure which router you need? Read [Choosing the right Aurelia router](./choosing-a-router.md).

## Highlights

- **Component-driven configuration**: declare routes on the component (`static routes` or `@routes`) so each feature owns its navigation contract without a central route table.
- **Minimal bootstrap work**: register `RouterConfiguration` once and start routing; most scenarios avoid extra setup or nested configuration objects.
- **Template-friendly navigation**: pair component routes with the `load` attribute and `<au-viewport>` for intuitive markup semantics.
- **Familiar lifecycle**: still supports navigation hooks, events, and animation triggers so you can guard routes or animate transitions.

## Learning path

1. [Getting started](../../router-direct/getting-started.md)
2. [Creating routes](../../router-direct/creating-routes.md)
3. [Navigation patterns](../../router-direct/navigating.md)
4. [Lifecycle hooks](../../router-direct/routing-lifecycle.md) and [route events](../../router-direct/route-events.md)
5. [Animations and advanced recipes](../../router-direct/router-animation.md) · [Router recipes](../../router-direct/router-recipes.md)
6. [Differences from v1](../../router-direct/differences-from-v1.md) for migration notes

## When to use which router

Choose `@aurelia/router-direct` when:

- You want each feature component to own its routes via `static routes`/`@routes`.
- You prefer minimal bootstrap configuration over a centralized route table.
- You are migrating from Aurelia v1 and want a closer mental model with fewer new concepts.

Stay with `@aurelia/router` when you want a centrally managed route tree, multi-viewport coordination, or explicit navigation state management. Both routers can coexist within a solution; use whichever fits each project best.

## Related resources

- Compare configuration styles in the [developer routing guides](../../developer-guides/routing/configured-routing.md).
- Explore animation possibilities with `au-animate` in [Router animation](../../router-direct/router-animation.md).
