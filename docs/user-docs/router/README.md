# Router Quick Reference

Find a routing task, copy the relevant pattern, and follow its link for the full contract. New to the router? Start with the [overview](../getting-to-know-aurelia/routing/aurelia-router.md) or [getting started](./getting-started.md).

## Table of Contents
- [Getting Started](#getting-started)
- [Navigation](#navigation)
- [Route Parameters](#route-parameters)
- [Route Protection](#route-protection)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Advanced Topics](#advanced-topics)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### How do I install and configure the router?

```sh
npm i @aurelia/router
```

```typescript
// main.ts
import Aurelia from 'aurelia';
import { RouterConfiguration, UrlCustomAttribute } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration.customize({
    useUrlFragmentHash: false,
    activeClass: 'active',
  }), UrlCustomAttribute)
  .app(MyApp)
  .start();
```
`RouterConfiguration` registers `load`, router-managed `href`, and `<au-viewport>`. `UrlCustomAttribute` is a separate, optional registration required for the `url` links shown below. Path-based routing is the default; configure your server to serve the application for route URLs.

[Full configuration options →](./router-configuration.md)

### How do I define routes?
```typescript
import { route } from '@aurelia/router';
import { Home } from './home';
import { About } from './about';
import { UserDetail } from './user-detail';

@route({
  routes: [
    { id: 'home', path: '', component: Home, title: 'Home' },
    { path: 'about', component: About, title: 'About' },
    { id: 'user-detail', path: 'users/:id', component: UserDetail }
  ]
})
export class MyApp {}
```
[Configuring routes →](./configuring-routes.md)

### How do I set up a viewport?
```html
<!-- In your root component template -->
<nav>
  <a load="home">Home</a>
  <a load="about">About</a>
</nav>

<au-viewport></au-viewport>
```
[Viewports documentation →](./viewports.md)

### How do I use hash-based routing instead of clean URLs?
```typescript
RouterConfiguration.customize({
  useUrlFragmentHash: true  // URLs like /#/about
})
```
[Hash vs PushState routing →](./router-configuration.md#choose-between-hash-and-pushstate-routing-using-useurlfragmenthash)

---

## Navigation

### How do I create navigation links?

Choose the reference point that matches the destination:

| Destination | Template | Code |
| --- | --- | --- |
| A route owned by the current layout or component | `load` | `IContextRouter.load()` |
| An address relative to the current application URL, or rooted at `/` | `url` | `IRouter.navigate()` |
| Another document | Native `href`; add `external` to bypass routing | Browser APIs |

```html
<!-- A child route of the layout that owns this link -->
<a load="about">About</a>

<!-- Route ID with a parameter -->
<a load="route: user-detail; params.bind: { id: userId }">User profile</a>

<!-- Application-root URL; requires UrlCustomAttribute -->
<a url="/users/42">User 42</a>

<!-- Another document, even though its address is on this site -->
<a href="/downloads/guide.pdf" external>Guide</a>
```
Router-managed `href="about"` is also supported; it uses contextual routing instructions like `load`. Once bound, `load` and `url` materialize browser hrefs, preserving copy-link and open-in-new-tab behavior. Use one navigation attribute per element.

[Contextual navigation →](./navigating.md) · [Application URL navigation →](./application-url-navigation.md)

### How do I navigate programmatically?
```typescript
import { IContextRouter, IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  private readonly contextRouter = resolve(IContextRouter);
  private readonly router = resolve(IRouter);

  // In the layout that defines the user-detail route:
  openUser(id: string) {
    return this.contextRouter.load(
      { component: 'user-detail', params: { id } },
      { queryParams: { tab: 'profile' } },
    );
  }

  // Resolve relative to the last completed application URL:
  openAddress(reference: string) {
    return this.router.navigate(reference);
  }
}
```
[Using the Router API →](./navigating.md#using-the-router-api)

### How do I highlight the active link?
```typescript
// Configure active class globally
RouterConfiguration.customize({
  activeClass: 'active'
})
```
```html
<!-- The configured class is applied automatically -->
<a load="home">Home</a>

<!-- Read the active state when you also need it in the view model -->
<a load="route: home; active.bind: isHomeActive">Home</a>
```
`active` is a bindable of `load`, so its binding belongs inside the `load` value. The `url` attribute does not expose active-route state.

[Active CSS class →](./router-configuration.md#configure-active-class)

### How do I navigate to parent routes from nested components?
```html
<!-- Select a route owned by the parent routing context -->
<a load="../sibling">Go to sibling route</a>
```
Each leading `../` traverses a routing context. It does not remove one URL segment: a single route can consume several segments. Use `url` or `navigate` when you intend URL-segment resolution.

[Ancestor navigation →](./navigating.md#navigate-in-current-and-ancestor-routing-context)

### How do I pass query parameters?
```typescript
// Programmatically
router.load('search', {
  queryParams: { q: 'aurelia', page: 1 }
});
// Result: /search?q=aurelia&page=1
```
[Query parameters →](./navigating.md#using-navigation-options)

### How do I handle external links?

Absolute URLs, protocol-relative URLs, and links with schemes such as `mailto:` retain native browser navigation:

```html
<a href="https://example.com">External site</a>
<a href="mailto:test@example.com">Email</a>
<a href="tel:+1234567890">Phone</a>
<a href="//cdn.example.com/file.pdf">Protocol-relative</a>
```

For an internal-looking address that belongs to another document or endpoint, use `external`. This bypasses both contextual href generation and click interception:

```html
<a href="/api/download" external>API endpoint</a>
<a href="/old-page.html" external>Legacy HTML page</a>
```

Modified clicks, downloads, and links targeting another browsing context also retain browser click behavior. Their router-managed hrefs are still generated unless the link is marked external. Likewise, `useHref: false` disables href click interception but does not disable href generation.

[Bypassing the router →](./navigating.md#bypassing-the-href-custom-attribute)

---

## Route Parameters

### How do I define route parameters?
```typescript
@route({
  routes: [
    { path: 'users/:id', component: UserDetail },           // Required
    { path: 'posts/:id?', component: PostDetail },          // Optional
    { path: 'files/*path', component: FileViewer },         // Wildcard
    { path: 'items/:id{{^\\d+$}}', component: ItemDetail }, // Constrained
  ]
})
```
[Path and parameters →](./configuring-routes.md#path-and-parameters)

### How do I access route parameters in my component?
```typescript
import { IRouteViewModel, Params } from '@aurelia/router';

export class UserDetail implements IRouteViewModel {
  userId = '';

  canLoad(params: Params) {
    if (params.id === undefined) return false;
    this.userId = params.id;
    return true;
  }
}
```
[Lifecycle hooks →](./routing-lifecycle.md)

### How do I get all parameters including from parent routes?
```typescript
import { IRouteContext } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class NestedComponent {
  private readonly routeContext = resolve(IRouteContext);

  attached() {
    const allParams = this.routeContext.getRouteParameters<{
      companyId: string;
      projectId: string;
      userId: string;
    }>({ includeQueryParams: true });
  }
}
```
[Aggregate parameters →](./navigating.md#aggregate-parameters-with-getrouteparameters)
[Route parameters guide →](./route-parameters.md)

### How do I constrain parameters with regex?
```typescript
{
  path: 'users/:id{{^\\d+$}}',  // Only numbers
  component: UserDetail
}
```
[Constrained parameters →](./configuring-routes.md#constrained-parameters)

---

## Route Protection

### How do I protect routes (authentication)?
```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';
import { IRouteViewModel, Params, RouteNode } from '@aurelia/router';

@lifecycleHooks()
export class AuthHook {
  canLoad(viewModel: IRouteViewModel, params: Params, next: RouteNode) {
    const isLoggedIn = !!localStorage.getItem('authToken');

    if (!isLoggedIn) {
      return 'login';  // Redirect to login
    }

    return true;  // Allow navigation
  }
}
```
[Router hooks →](./router-hooks.md)

### How do I implement authorization (role-based access)?
```typescript
@lifecycleHooks()
export class AuthorizationHook {
  canLoad(viewModel: IRouteViewModel, params: Params, next: RouteNode) {
    const requiredPermission = next.data?.permission;

    if (requiredPermission && !this.hasPermission(requiredPermission)) {
      return 'forbidden';
    }

    return true;
  }

  private hasPermission(permission: string): boolean {
    // Check user permissions
    return true;
  }
}
```
```typescript
// In route configuration
{
  path: 'admin',
  component: AdminPanel,
  data: { permission: 'admin' }
}
```
[Router hooks example →](./router-hooks.md#example-1-authentication-and-authorization)

### How do I prevent navigation away from unsaved forms?
```typescript
import { IRouteViewModel, RouteNode } from '@aurelia/router';

export class EditForm implements IRouteViewModel {
  private isDirty = false;

  canUnload(next: RouteNode | null, current: RouteNode) {
    if (this.isDirty) {
      return confirm('You have unsaved changes. Leave anyway?');
    }
    return true;
  }
}
```
[canUnload hook →](./routing-lifecycle.md#canunload)

### How do I redirect based on conditions?
```typescript
export class Dashboard implements IRouteViewModel {
  canLoad(params: Params) {
    const userRole = this.authService.getRole();

    if (userRole === 'admin') {
      return 'admin/dashboard';
    } else if (userRole === 'user') {
      return 'user/dashboard';
    }

    return 'login';
  }
}
```
[Redirect from canLoad →](./routing-lifecycle.md#redirect-to-another-view-from-canload)

---

## Lifecycle Hooks

### How do I load data before showing a component?
```typescript
import { IRouteViewModel, Params } from '@aurelia/router';
import type { User } from './user';

export class UserDetail implements IRouteViewModel {
  user: User | null = null;

  async loading(params: Params) {
    if (params.id === undefined) throw new Error('A user ID is required');
    const response = await fetch(`/api/users/${encodeURIComponent(params.id)}`);
    if (!response.ok) throw new Error(`Could not load user: ${response.status}`);
    this.user = await response.json();
  }
}
```
[loading hook →](./routing-lifecycle.md#loading)

### How do I run code after a component is fully loaded?
```typescript
export class Dashboard implements IRouteViewModel {
  loaded(params: Params) {
    // Track page view
    analytics.track('page_view', { page: 'dashboard' });

    // Scroll to top
    window.scrollTo(0, 0);
  }
}
```
[loaded hook →](./routing-lifecycle.md#loaded)

### When do lifecycle hooks run?
| Hook | When | Use For |
|------|------|---------|
| `canLoad` | Before activation | Guards, redirects, param validation |
| `loading` | After approval, before render | Data fetching, state setup |
| `loaded` | After render | Analytics, scroll, post-render effects |
| `canUnload` | Before deactivation | Unsaved changes warnings |
| `unloading` | Before removal | Cleanup, save drafts |

[Hook summary →](./routing-lifecycle.md#hook-summary)

### What's the difference between component hooks and router hooks?
- **Component hooks** (`IRouteViewModel`): Implemented on the component itself
- **Router hooks** (`@lifecycleHooks()`): Shared across multiple components

```typescript
// Component hook
export class MyComponent implements IRouteViewModel {
  canLoad(params: Params) {
    // Runs only for this component
  }
}

// Router hook (shared)
@lifecycleHooks()
export class AuthHook {
  canLoad(viewModel: IRouteViewModel, params: Params) {
    // Runs for all components where this is registered
  }
}
```
[Router hooks vs component hooks →](./router-hooks.md#anatomy-of-a-lifecycle-hook)

---

## Advanced Topics

### How do I handle 404 / unknown routes?
```typescript
@route({
  routes: [
    { path: 'home', component: Home },
    { path: 'about', component: About },
    { path: 'not-found', component: NotFound }
  ],
  fallback: 'not-found'  // Redirect unknown routes here
})
export class MyApp {}
```
[Fallback configuration →](./configuring-routes.md#fallback-redirecting-the-unknown-path)

### How do I create route aliases / redirects?
```typescript
@route({
  routes: [
    { path: '', redirectTo: 'home' },
    { path: 'about-us', redirectTo: 'about' },
    { path: 'home', component: Home },
    { path: 'about', component: About }
  ]
})
```
[Redirects →](./configuring-routes.md#redirect-to-another-path)

### How do I work with multiple viewports (sibling routes)?
```html
<au-viewport name="left"></au-viewport>
<au-viewport name="right"></au-viewport>
```
```html
<!-- Load components into both viewports -->
<a load="products@left+details/42@right">Products + Details</a>
```
```typescript
// Programmatically
router.load([
  { component: Products, viewport: 'left' },
  { component: Details, params: { id: 42 }, viewport: 'right' }
]);
```
[Sibling viewports →](./viewports.md#sibling-viewports)

### How do I implement nested/child routes?
```typescript
@route({
  routes: [
    {
      path: 'users/:id',
      component: UserLayout,
      // Child routes defined in UserLayout
    }
  ]
})
export class MyApp {}

// In UserLayout
@route({
  routes: [
    { path: '', component: UserProfile },
    { path: 'posts', component: UserPosts },
    { path: 'settings', component: UserSettings }
  ]
})
export class UserLayout {}
```
```html
<!-- UserLayout template -->
<h2>User: ${userId}</h2>
<nav>
  <a load="posts">Posts</a>
  <a load="settings">Settings</a>
</nav>
<au-viewport></au-viewport>
```
[Hierarchical routing →](./viewports.md#hierarchical-routing)
[Child routing playbook →](./child-routing.md)

### How do I lazy load routes?
```typescript
@route({
  routes: [
    { path: 'home', component: Home },
    // Dynamic import for lazy loading
    { path: 'admin', component: () => import('./admin/admin-panel') }
  ]
})
```
[Using inline import() →](./configuring-routes.md#using-inline-import)

### How do I set/change the page title?
```typescript
// Set a route node title part in route configuration
{
  path: 'about',
  component: About,
  title: 'About Us'
}

// Set a document title override for one navigation
router.load('about', { title: 'Custom Title' });

// Set a route node title part after loading data
loading(params, next) {
  next.title = `About ${params.id}`;
}

// Custom title building
RouterConfiguration.customize({
  buildTitle(transition) {
    const title = transition.routeTree.root.getTitle(' - ');
    return title ? `${title} | My App` : 'My App';
  }
})
```
[Setting titles →](./configuring-routes.md#setting-the-title) | [Customizing titles →](./router-configuration.md#customizing-title)

### How do I generate URLs without navigating?

Use `createHref` when you have an application URL reference and need a browser-ready address:

```typescript
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class ShareLink {
  private readonly router = resolve(IRouter);

  userHref() {
    return this.router.createHref('/users/42');
  }
}
```
The result includes the deployment base and configured hash form. `createHref` is synchronous and does not check whether the route exists. Its output is for the browser; do not pass it back to `navigate`, which accepts application references.

To generate a path from a route ID, component, or structured instruction, use the [path-generation APIs](./navigating.md#path-generation). Those paths are relative to the selected routing context and are not universally browser-ready hrefs. For ordinary in-app links, `load` or `url` performs the appropriate generation for you.

[Application URL href generation →](./application-url-navigation.md)

### How do I work with base paths (multi-tenant apps)?
```typescript
RouterConfiguration.customize({
  basePath: '/tenant1/app'  // All routes will be prefixed
})
```
```html
<base href="/tenant1/app/">
```
[Base path configuration →](./router-configuration.md#configuring-basepath)

### How do I handle browser back/forward buttons?
```typescript
// The router handles this automatically with historyStrategy

// To control history behavior per navigation:
router.load('page', {
  historyStrategy: 'replace'  // Don't create history entry
});

router.load('page', {
  historyStrategy: 'push'  // Create history entry (default)
});
```
[History strategy →](./router-configuration.md#configure-browser-history-strategy)

### How do I access the current route information?
```typescript
import { ICurrentRoute } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  private readonly currentRoute = resolve(ICurrentRoute);

  // Use in bindings or read it after navigation (for example in event handlers).
  logCurrentRoute() {
    console.log('Current path:', this.currentRoute.path);
    console.log('Parameters:', this.currentRoute.parameterInformation);
  }
}
```
[Current route →](./current-route.md)

---

## Troubleshooting

### My routes don't work with clean URLs (no hash)

If in-app navigation works but a reload or direct entry returns a server 404, configure the host to serve the application's entry document for route URLs. Set `<base href="/">` for an application at the origin root, or use the matching deployment prefix for an application hosted below it. Keep server endpoints and static files outside the SPA fallback.

Hash routing (`useUrlFragmentHash: true`) is another option when the host cannot provide that fallback.

[PushState configuration →](./router-configuration.md#choose-between-hash-and-pushstate-routing-using-useurlfragmenthash)

### A document link is being interpreted as a route

An address such as `/api/download` looks like a contextual routing instruction to the registered `href` attribute. Mark it external to retain the authored address and browser navigation:

```html
<a href="/api/download" external>API endpoint</a>
<a href="/static/old-page.html" external>Legacy page</a>
```

[Bypassing href →](./navigating.md#bypassing-the-href-custom-attribute)

### Navigation isn't working from nested components

First identify which layout owns the destination route. A layout's link to its own child uses `load="child"`; a routed child's link to a sibling selects the parent context:

```html
<a load="../sibling">Sibling route</a>
```
If you mean an address relative to the current application URL instead, use `url` or `navigate`. See [Choosing the reference point](./application-url-navigation.md).

[Ancestor navigation →](./navigating.md#navigate-in-current-and-ancestor-routing-context)

### My lifecycle hooks aren't being called

Define the hook on the component activated by the router. `implements IRouteViewModel` supplies TypeScript checking; it does not register or enable hooks at runtime. For a shared `@lifecycleHooks()` class, check its registration.

Also check reuse: changing only the query updates `ICurrentRoute` without automatically rerunning `loading`. A page can react to current query state, or the navigation can explicitly request `transitionPlan: 'invoke-lifecycles'` when its `loading` hook owns the refresh. See [Query-driven navigation](./application-url-navigation.md).

[Lifecycle hooks →](./routing-lifecycle.md)

### Route parameters aren't updating when navigating between same routes

By default, changed path parameters cause the router to replace the component. If you configured `invoke-lifecycles` to reuse it, read the new parameters in `loading`; the constructor will not run again. A custom plan returning `none` suppresses that refresh. Query-only changes follow the reuse rule described above.

[Transition plans →](./transition-plans.md)

### How do I debug routing issues?
```typescript
import { IRouterEvents } from '@aurelia/router';
import { type IDisposable, resolve } from '@aurelia/kernel';

export class MyApp {
  private readonly events = resolve(IRouterEvents);
  private subscriptions: IDisposable[] = [];

  binding() {
    this.subscriptions = [
      this.events.subscribe('au:router:navigation-end', event => {
        console.log('Navigation completed:', event.finalInstructions);
      }),
      this.events.subscribe('au:router:navigation-error', event => {
        console.error('Navigation failed:', event.error);
      }),
    ];
  }

  unbinding() {
    for (const subscription of this.subscriptions) subscription.dispose();
    this.subscriptions = [];
  }
}
```
[Router events →](./router-events.md)

---

## Complete Documentation

### Getting Started
- [Getting Started](./getting-started.md)
- [Router Configuration](./router-configuration.md)

### Routes and Navigation
- [Configuring Routes](./configuring-routes.md)
- [Route Parameters Guide](./route-parameters.md)
- [Route Expression Syntax](./route-expression-syntax.md)
- [Navigation](./navigating.md)
- [Application URL Navigation](./application-url-navigation.md)
- [Viewports](./viewports.md)
- [Child Routing Playbook](./child-routing.md)

### Lifecycle and Guards
- [Lifecycle Hooks](./routing-lifecycle.md)
- [Router Hooks](./router-hooks.md)
- [Transition Plans](./transition-plans.md)

### State and Events
- [Current Route](./current-route.md)
- [Navigation Model](./navigation-model.md)
- [Router Events](./router-events.md)

### Advanced Topics
- [Error Handling](./error-handling.md)
- [Testing Guide](./testing-guide.md)

### Reference
- [API Reference](./api-reference.md)
- [Troubleshooting](./troubleshooting.md)
