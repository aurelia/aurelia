---
description: Start new applications with @aurelia/router and identify documentation for existing router-direct applications.
---

# Choosing the right Aurelia router

Use **`@aurelia/router` for new applications**. Define routes on the layouts that host them, load pages on demand, and use guards to check whether navigation can proceed. Links can select a layout's child route or resolve an address against the current application URL.

A layout defines its children using `@route` and renders them through `<au-viewport>`. The root application only needs to know how to reach that layout, so each feature can keep its route configuration nearby. [The router overview](./aurelia-router.md) shows how this fits together.

## Existing router-direct applications

If your application imports `@aurelia/router-direct`, use its [existing documentation](./router-direct.md). Check the package name before copying examples: the two routers share names such as `load` and `<au-viewport>`, but have different configuration and navigation APIs.

The application-URL APIs `IRouter.navigate`, `IRouter.createHref`, and `UrlCustomAttribute` belong to `@aurelia/router`.

## Get started with @aurelia/router

- [Router overview](./aurelia-router.md): see how routes fit into your application's layouts.
- [Getting started](../../router/getting-started.md): register the router and add your first route.
- [Child routing](../../router/child-routing.md): build a feature with its own pages and navigation.
