# Router Quick Reference

Navigate your Aurelia 2 application with confidence using this task-focused quick reference.

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
```typescript
// Install
npm i @aurelia/router

// Configure in main.ts
import { RouterConfiguration } from '@aurelia/router';

Aurelia
  .register(RouterConfiguration.customize({
    useUrlFragmentHash: false,  // Clean URLs (default)
    historyStrategy: 'push',     // Browser history
  }))
  .app(MyApp)
  .start();
```
[Full configuration options →](./router-configuration.md)

### How do I define routes?
```typescript
import { route } from '@aurelia/router';

@route({
  routes: [
    { path: '', component: Home, title: 'Home' },
    { path: 'about', component: About, title: 'About' },
    { path: 'users/:id', component: UserDetail }
  ]
})
export class MyApp {}
```
[Configuring routes →](./configuring-routes.md)

### How do I set up a viewport?
```html
<!-- In your root component template -->
<nav>
  <a href="home">Home</a>
  <a href="about">About</a>
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
```html
<!-- Using href (simple) -->
<a href="about">About</a>
<a href="users/42">User 42</a>

<!-- Using load (structured) -->
<a load="route: users; params.bind: {id: userId}">User Profile</a>
```
[Navigation methods →](./navigating.md)

### How do I navigate programmatically?
```typescript
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  private readonly router = resolve(IRouter);

  navigateToUser(id: number) {
    this.router.load(`users/${id}`);

    // Or with options
    this.router.load('users', {
      params: { id },
      queryParams: { tab: 'profile' }
    });
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
<!-- Use with load attribute -->
<a load="home" active.bind="isHomeActive">Home</a>

<!-- Or use the configured active class -->
<a load="home">Home</a>  <!-- Gets 'active' class automatically -->
```
[Active CSS class →](./router-configuration.md#configure-active-class)

### How do I navigate to parent routes from nested components?
```html
<!-- Using href with ../ prefix -->
<a href="../sibling">Go to sibling route</a>

<!-- Using load with context -->
<a load="route: sibling; context.bind: parentContext">Sibling</a>
```
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

**Good news**: External links work automatically! The router automatically ignores:

```html
<!-- These automatically bypass the router (no special attributes needed!) -->
<a href="https://example.com">External site</a>
<a href="mailto:test@example.com">Email</a>
<a href="tel:+1234567890">Phone</a>
<a href="//cdn.example.com/file.pdf">Protocol-relative</a>
<a href="ftp://files.example.com">FTP</a>

<!-- Also bypassed: -->
<a href="/internal" target="_blank">New tab</a>
<a href="/internal" target="other">Named target</a>
```

**Only use `external` attribute for edge cases:**
```html
<!-- When URL looks internal but should bypass router -->
<a href="/api/download" external>API endpoint</a>
<a href="/old-page.html" external>Legacy HTML page</a>
```

**How it works**: The router uses the `URL` constructor to check if a link is external. Any URL that can be parsed without a base (like `https://`, `mailto:`, etc.) is automatically treated as external.

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
  userId: string;

  canLoad(params: Params) {
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
[Router hooks example →](./router-hooks.md#example-authentication-and-authorization)

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

export class UserDetail implements IRouteViewModel {
  user: User | null = null;

  async loading(params: Params) {
    this.user = await fetch(`/api/users/${params.id}`)
      .then(r => r.json());
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
<a href="products@left+details/42@right">Products + Details</a>
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
  <a href="posts">Posts</a>
  <a href="settings">Settings</a>
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
// In route configuration
{
  path: 'about',
  component: About,
  title: 'About Us'
}

// Programmatically
router.load('about', { title: 'Custom Title' });

// Custom title building
RouterConfiguration.customize({
  buildTitle(transition) {
    const titles = transition.routeTree.root.children.map(c => c.title);
    return `${titles.join(' - ')} | My App`;
  }
})
```
[Setting titles →](./configuring-routes.md#setting-the-title) | [Customizing titles →](./router-configuration.md#customizing-title)

### How do I generate URLs without navigating?
```typescript
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

const router = resolve(IRouter);

// Generate path
const userPath = await router.generatePath({
  component: 'users',
  params: { id: 42 }
});
// Result: "/users/42"

// Use in template
<a href.bind="userPath">View User</a>
```
[Path generation →](./navigating.md#path-generation)

### How do I work with base paths (multi-tenant apps)?
```typescript
RouterConfiguration.customize({
  basePath: '/tenant1/app'  // All routes will be prefixed
})
```
```html
<base href="/tenant1/app">
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

  attached() {
    console.log('Current path:', this.currentRoute.path);
    console.log('Parameters:', this.currentRoute.parameterInformation);
  }
}
```
[Current route →](./configuring-routes.md#retrieving-the-current-route-and-query-parameters)

---

## Troubleshooting

### My routes don't work with clean URLs (no hash)
**Problem**: Getting 404 errors when refreshing or accessing routes directly

**Solution**:
1. Ensure `<base href="/">` is in your HTML
2. Configure server for SPA routing (return index.html for all routes)
3. Or use hash routing: `useUrlFragmentHash: true`

[PushState configuration →](./router-configuration.md#choose-between-hash-and-pushstate-routing-using-useurlfragmenthash)

### External links are triggering the router (rare)
**Problem**: External links somehow being handled by router

**This should NOT happen** - the router automatically ignores external links like `https://`, `mailto:`, `tel:`, etc.

**If it's happening:**
1. Check your link format - is it truly external?
2. You probably don't need the `external` attribute anymore
3. Links with protocol (`https://`, `mailto:`) are automatically bypassed

**Only needed for edge cases:**
```html
<!-- Internal-looking URLs that should bypass router -->
<a href="/api/download" external>API endpoint</a>
<a href="/static/old-page.html" external>Legacy page</a>
```

[Bypassing href →](./navigating.md#bypassing-the-href-custom-attribute)

### Navigation isn't working from nested components
**Problem**: Links to sibling routes not working

**Solution**: Use `../` prefix for parent context
```html
<a href="../sibling">Sibling Route</a>
```
[Ancestor navigation →](./navigating.md#navigate-in-current-and-ancestor-routing-context)

### My lifecycle hooks aren't being called
**Problem**: `canLoad`, `loading`, etc. not executing

**Solution**: Implement the `IRouteViewModel` interface
```typescript
import { IRouteViewModel } from '@aurelia/router';

export class MyComponent implements IRouteViewModel {
  canLoad(params: Params) { /* ... */ }
}
```
[Lifecycle hooks →](./routing-lifecycle.md)

### Route parameters aren't updating when navigating between same routes
**Problem**: Navigating from `/users/1` to `/users/2` doesn't update component

**Solution**: Configure transition plan
```typescript
{
  path: 'users/:id',
  component: UserDetail,
  transitionPlan: 'invoke-lifecycles'  // Re-invoke hooks
}
```
[Transition plans →](./transition-plans.md)

### How do I debug routing issues?
```typescript
import { IRouterEvents } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyApp {
  constructor() {
    const events = resolve(IRouterEvents);

    events.subscribe('au:router:navigation-start', (evt) => {
      console.log('Navigation started:', evt);
    });

    events.subscribe('au:router:navigation-end', (evt) => {
      console.log('Navigation ended:', evt);
    });

    events.subscribe('au:router:navigation-error', (evt) => {
      console.error('Navigation error:', evt);
    });
  }
}
```
[Router events →](./router-events.md)

---

## Complete Documentation

- [Getting Started](./getting-started.md)
- [Router Configuration](./router-configuration.md)
- [Configuring Routes](./configuring-routes.md)
- [Child Routing Playbook](./child-routing.md)
- [Route Parameters Guide](./route-parameters.md)
- [Navigation](./navigating.md)
- [Viewports](./viewports.md)
- [Lifecycle Hooks](./routing-lifecycle.md)
- [Router Hooks](./router-hooks.md)
- [Transition Plans](./transition-plans.md)
- [Navigation Model](./navigation-model.md)
- [Router Events](./router-events.md)
- [Error Handling](./error-handling.md)
- [Testing Guide](./testing-guide.md)
- [Troubleshooting](./troubleshooting.md)
