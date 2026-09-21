---
description: Apply authentication guards, preload route data, protect unsaved work, and keep query-driven pages in sync.
---

# Router Outcome Recipes

These recipes connect routing decisions to application behavior. Use `load` when selecting routes owned by a component or layout, and `navigate` when changing the application URL. The choice of API does not change the need to handle guards, data loading, and component reuse.

## Global authentication guard

A shared `canLoad` hook can enforce route metadata without repeating the check in every page. This recipe uses an application `AuthService` with three members: `ensureSession()` waits for the initial session check, `isAuthenticated` reports the result, and `hasRole(role)` checks the current user's roles. Keep session acquisition and login behavior in that service.

```typescript
// global-auth-guard.ts
import { resolve } from '@aurelia/kernel';
import { lifecycleHooks } from '@aurelia/runtime-html';
import type { IRouteViewModel, NavigationInstruction, Params, RouteNode } from '@aurelia/router';
import { AuthService } from './auth-service';

@lifecycleHooks()
export class GlobalAuthGuard {
  private readonly auth = resolve(AuthService);

  async canLoad(
    _viewModel: IRouteViewModel,
    _params: Params,
    next: RouteNode,
  ): Promise<boolean | NavigationInstruction> {
    if (next.data.requiresAuth !== true) return true;

    await this.auth.ensureSession();
    if (!this.auth.isAuthenticated) return '/login';

    const role = next.data.requiredRole;
    if (typeof role === 'string' && !this.auth.hasRole(role)) {
      return '/unauthorized';
    }
    return true;
  }
}
```

Declare the policy on the routes that require it. Leave the redirect destinations accessible so they do not redirect back into the same check:

```typescript
// my-app.ts
import { route } from '@aurelia/router';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';
import { Admin } from './pages/admin';
import { Unauthorized } from './pages/unauthorized';

@route({
  routes: [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'unauthorized', component: Unauthorized },
    { path: 'dashboard', component: Dashboard, data: { requiresAuth: true } },
    {
      path: 'admin',
      component: Admin,
      data: { requiresAuth: true, requiredRole: 'admin' },
    },
  ],
})
export class MyApp {}
```

Register the guard and shared service at application scope:

```typescript
// main.ts
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { AuthService } from './auth-service';
import { GlobalAuthGuard } from './global-auth-guard';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration, AuthService, GlobalAuthGuard)
  .app(MyApp)
  .start();
```

A globally registered lifecycle hook is available to routed components throughout the application. It runs when `canLoad` is invoked; unchanged routes can be reused without rerunning that hook. Handle session expiry in the authentication layer as well. Route guards control navigation, while the server still authorizes access to protected data and operations.

Returning an instruction lets the router coordinate the redirect. Calling `router.load('login')` and returning `false` instead starts a second request while canceling the first. A failed session request should follow the application's error policy, rather than silently becoming an unauthenticated result.

If login must resume the original destination, retain a complete navigation request or a validated root-relative application URL. `next.path` is a route pattern, not a complete return address. The [retry discussion](error-handling.md#retain-the-request-for-retry) explains which information needs to survive.

## Data preloading

Return a promise from `loading` when the page needs data before it is displayed. Fetch independent resources concurrently, and assign them after all required requests succeed:

```typescript
import type { IRouteViewModel, Params } from '@aurelia/router';

interface Product {
  id: string;
  name: string;
}

interface Review {
  id: string;
  comment: string;
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export class ProductDetail implements IRouteViewModel {
  product: Product | null = null;
  reviews: Review[] = [];

  async loading(params: Params) {
    const id = encodeURIComponent(params.id ?? '');
    const [product, reviews] = await Promise.all([
      readJson<Product>(`/api/products/${id}`),
      readJson<Review[]>(`/api/products/${id}/reviews`),
    ]);
    this.product = product;
    this.reviews = reviews;
  }
}
```

The router waits for this promise. A loading indicator inside the new page cannot show before that page activates; put navigation progress in the surrounding shell when preloading is required. An error from this hook rejects navigation and follows the configured [route recovery behavior](error-handling.md#what-route-restoration-restores).

Only await the data that must precede the view. If reviews are optional, the page can activate with the product and load reviews afterward, with its own pending and retry states. If the entire destination should display an error in place, catch the request failure and allow `loading` to finish, as shown in [component-level recovery](error-handling.md#let-a-destination-show-its-own-error).

## Preventing navigation with unsaved changes

Compare the editable data with the last saved value in `canUnload`. The guard applies to router navigation, including routing through browser history:

```typescript
import type { IRouteViewModel } from '@aurelia/router';

interface Profile {
  name: string;
  email: string;
  bio: string;
}

export class EditProfile implements IRouteViewModel {
  profile: Profile = { name: '', email: '', bio: '' };
  private saved: Profile = { ...this.profile };
  saving = false;
  error = '';

  get hasUnsavedChanges() {
    return this.profile.name !== this.saved.name
      || this.profile.email !== this.saved.email
      || this.profile.bio !== this.saved.bio;
  }

  async loading() {
    const response = await fetch('/api/user/profile');
    if (!response.ok) throw new Error(`Profile request failed: ${response.status}`);
    this.profile = await response.json() as Profile;
    this.saved = { ...this.profile };
  }

  canUnload(): boolean {
    return !this.hasUnsavedChanges
      || window.confirm('Discard your unsaved profile changes?');
  }

  async save() {
    if (this.saving) return;
    const submitted = { ...this.profile };
    this.saving = true;
    this.error = '';
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitted),
      });
      if (!response.ok) throw new Error(`Saving failed: ${response.status}`);
      this.saved = submitted;
    } catch (error) {
      this.error = 'Your changes could not be saved.';
      console.error(error);
    } finally {
      this.saving = false;
    }
  }
}
```

```html
<p if.bind="hasUnsavedChanges">You have unsaved changes.</p>
<p if.bind="error" role="alert">${error}</p>

<label for="profile-name">Name</label>
<input id="profile-name" value.bind="profile.name">

<label for="profile-email">Email</label>
<input id="profile-email" type="email" value.bind="profile.email">

<label for="profile-bio">Bio</label>
<textarea id="profile-bio" value.bind="profile.bio"></textarea>

<button type="button" disabled.bind="saving" click.trigger="save()">Save changes</button>
```

The saved baseline is the submitted snapshot. If the user continues editing while Save is in progress, those later edits remain unsaved. Adapt the baseline to the server's returned representation if saving normalizes fields.

Returning `false` leaves navigation canceled. It does not fall through to a native browser load. Closing the tab, refreshing the document, or following a native document link is outside the router guard; applications that need protection there should handle the browser's separate unload behavior.

## Query parameter state management

Filters and pagination often need to survive bookmarks, declarative links, and Back/Forward. Make the completed query the source for displayed results. A query-only navigation may reuse the component without invoking `loading`, so this recipe listens for navigation completion as well as reading the first destination.

```typescript
import { resolve, type IDisposable } from '@aurelia/kernel';
import { ICurrentRoute, IRouter, IRouterEvents, type Params, type RouteNode } from '@aurelia/router';

interface Product {
  id: string;
  name: string;
}

export class ProductList {
  private readonly router = resolve(IRouter);
  private readonly currentRoute = resolve(ICurrentRoute);
  private readonly events = resolve(IRouterEvents);
  private subscription: IDisposable | undefined;
  private initialQuery = new URLSearchParams();
  private queryKey: string | undefined;
  private requestId = 0;

  products: Product[] = [];
  searchDraft = '';
  page = 1;
  pending = false;
  error = '';
  navigationError = '';

  loading(_params: Params, next: RouteNode) {
    this.initialQuery = new URLSearchParams(next.queryParams);
  }

  binding() {
    this.subscription = this.events.subscribe('au:router:navigation-end', event => {
      void this.refresh(event.finalInstructions.queryParams);
    });
  }

  attached() {
    void this.refresh(this.initialQuery);
  }

  unbinding() {
    this.subscription?.dispose();
    this.subscription = undefined;
    ++this.requestId; // Ignore a response arriving after the page leaves.
    this.queryKey = undefined;
  }

  search() {
    const query = new URLSearchParams(this.currentRoute.query);
    const search = this.searchDraft.trim();
    if (search) query.set('q', search);
    else query.delete('q');
    query.delete('page');
    return this.changeQuery(query);
  }

  goToPage(page: number) {
    const query = new URLSearchParams(this.currentRoute.query);
    query.set('page', String(Math.max(1, page)));
    return this.changeQuery(query);
  }

  private async changeQuery(query: URLSearchParams) {
    this.navigationError = '';
    try {
      await this.router.navigate(`?${query}`);
    } catch (error) {
      this.navigationError = 'The filters could not be changed. Submit the search or page selection again.';
      console.error(error);
    }
  }

  retry() {
    this.queryKey = undefined;
    return this.refresh(this.currentRoute.query);
  }

  private async refresh(query: Readonly<URLSearchParams>) {
    const key = query.toString();
    if (key === this.queryKey) return;
    this.queryKey = key;
    const requestId = ++this.requestId;

    const page = Number(query.get('page') ?? '1');
    this.page = Number.isInteger(page) && page > 0 ? page : 1;
    this.searchDraft = query.get('q') ?? '';
    this.products = [];
    this.pending = true;
    this.error = '';

    try {
      const response = await fetch(`/api/products?${key}`);
      if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
      const products = await response.json() as Product[];
      if (requestId === this.requestId) this.products = products;
    } catch (error) {
      if (requestId === this.requestId) {
        this.error = 'The products could not be loaded.';
        console.error(error);
      }
    } finally {
      if (requestId === this.requestId) this.pending = false;
    }
  }
}
```

```html
<label for="product-search">Search products</label>
<input id="product-search" value.bind="searchDraft">
<button type="button" click.trigger="search()">Search</button>

<p if.bind="navigationError" role="alert">${navigationError}</p>
<p if.bind="pending" role="status">Loading products...</p>
<p if.bind="error" role="alert">${error}</p>
<button if.bind="error" type="button" disabled.bind="pending" click.trigger="retry()">Retry</button>

<ul>
  <li repeat.for="product of products">${product.name}</li>
</ul>

<button type="button" disabled.bind="page === 1" click.trigger="goToPage(page - 1)">Previous</button>
<span>Page ${page}</span>
<button type="button" click.trigger="goToPage(page + 1)">Next</button>
```

The first refresh uses `next.queryParams`, because the destination is not yet reflected in `ICurrentRoute` during `loading`. The completion event then supplies query data for later navigation, including Back/Forward. Comparing query strings avoids fetching twice for initial activation or for an unrelated navigation with the same query. The request counter prevents a slower response from replacing results for a newer query.

The two errors have different retry targets. A navigation failure leaves the last successful query current; the user can submit the requested search or page selection again. A product-fetch failure belongs to that successful query, so the Retry button fetches it again without creating another navigation.

Copying `ICurrentRoute.query` before changing one field preserves other filters. The example uses the normal push history behavior, making successful query changes revisit-able. For frequent edits where only the latest state should occupy the history entry, pass `{ historyStrategy: 'replace' }` to `navigate`. This still performs router navigation; it changes how the result is recorded in browser history.

If a page instead requires every fetch to finish inside `loading`, programmatic calls can use `{ transitionPlan: 'invoke-lifecycles' }`. That option applies to those calls; it does not make subsequent declarative links or browser history events invoke `loading` for an unchanged path. See [Application URL navigation](application-url-navigation.md) for that alternative.

## Related guides

- [Routing lifecycle](routing-lifecycle.md) explains when hooks run and which phases navigation waits for.
- [Router events](router-events.md) describes attempted and completed navigation information.
- [Router Error Handling](error-handling.md) covers cancellation, restoration, and retaining requests for retry.
- [Viewports](viewports.md) covers targeting several visible regions in one navigation.
