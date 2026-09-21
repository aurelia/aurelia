---
description: Start new applications with @aurelia/router and identify documentation for existing router-direct applications.
---

# Choosing the right Aurelia router

Use **`@aurelia/router` for new applications**. It is Aurelia's maintained router and supports configured routes, component-owned child routes, multiple viewports, lazy loading, navigation guards, and both contextual and application-URL navigation.

You do not need a different router to keep routes close to a feature. With `@aurelia/router`, a layout defines its own children using `@route` and renders them through `<au-viewport>`. The root application only needs to know how to reach that layout. [The router overview](./aurelia-router.md) introduces this model.

## Existing router-direct applications

`@aurelia/router-direct` is a separate package with its own configuration and APIs. Its [documentation](./router-direct.md) remains available for applications that already use it. Check the package imported by your application before copying examples: the two routers share names such as `load` and `<au-viewport>`, but their options and navigation contracts are not interchangeable.

The application-URL APIs `IRouter.navigate`, `IRouter.createHref`, and `UrlCustomAttribute` described in the maintained router documentation belong to `@aurelia/router`.

## Start with the maintained router

- [Router overview](./aurelia-router.md): layout ownership and navigation choices.
- [Getting started](../../router/getting-started.md): registration, routes, and the first viewport.
- [Child routing](../../router/child-routing.md): feature-owned navigation and nested layouts.
