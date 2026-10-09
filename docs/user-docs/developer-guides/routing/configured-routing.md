---
description: Map application paths to components with @aurelia/router.
---

# Configured routing

Define a layout's routes with the `@route` decorator from `@aurelia/router`. The application root usually owns the top-level routes. A feature layout can define child routes with the same decorator.

```typescript
// my-app.ts
import { route } from '@aurelia/router';

@route({
  routes: [
    { id: 'home', path: '', component: () => import('./home'), title: 'Home' },
    { path: 'login', component: () => import('./login'), title: 'Sign in' },
    { path: 'register', component: () => import('./register'), title: 'Sign up' },
  ],
})
export class MyApp {}
```

The template contains a viewport and links to the routes:

```html
<!-- my-app.html -->
<nav>
  <a load="home">Home</a>
  <a load="login">Sign in</a>
  <a load="register">Sign up</a>
</nav>
<au-viewport></au-viewport>
```

`path` defines the URL that selects a component. Here, the empty path makes Home the default page at the application root. Its `id: 'home'` lets the link refer to the route by name without changing that URL to `/home`. The functions containing `import()` load the page modules when needed.

Register `RouterConfiguration` when starting the application, as shown in [Getting started](../../router/getting-started.md). For a feature that owns another viewport, continue with [Component configured routing](./component-configured-routing.md). The full [route configuration guide](../../router/configuring-routes.md) covers parameters, aliases, redirects, and fallback routes.
