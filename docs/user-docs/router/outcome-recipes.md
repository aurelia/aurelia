---
description: Advanced routing patterns for authentication, data preloading, guards, and complex navigation scenarios using @aurelia/router.
---

# Router Outcome Recipes

These recipes solve complex routing challenges like authentication flows, data preloading, and navigation state management using `@aurelia/router`. Use them when you need more than basic routing.

## 1. Global authentication guard for all routes

**Goal:** Implement centralized authentication checks that run automatically for all routes using the `@lifecycleHooks()` decorator.

### Steps

1. Create an authentication service to track user state:
   ```typescript
   import { observable } from '@aurelia/runtime';

   export interface User {
     id: string;
     name: string;
     email: string;
     roles: string[];
   }

   export class AuthService {
     @observable isAuthenticated = false;
     currentUser: User | null = null;

     constructor() {
       const token = localStorage.getItem('auth_token');
       if (token) {
         this.validateToken(token);
       }
     }

     async login(email: string, password: string): Promise<boolean> {
       try {
         const response = await fetch('/api/auth/login', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, password })
         });

         if (!response.ok) {
           return false;
         }

         const { token, user } = await response.json();
         localStorage.setItem('auth_token', token);
         this.currentUser = user;
         this.isAuthenticated = true;

         return true;
       } catch {
         return false;
       }
     }

     logout() {
       localStorage.removeItem('auth_token');
       this.currentUser = null;
       this.isAuthenticated = false;
     }

     hasRole(role: string): boolean {
       return this.currentUser?.roles.includes(role) ?? false;
     }

     private async validateToken(token: string) {
       try {
         const response = await fetch('/api/auth/validate', {
           headers: { 'Authorization': `Bearer ${token}` }
         });

         if (response.ok) {
           const user = await response.json();
           this.currentUser = user;
           this.isAuthenticated = true;
         } else {
           localStorage.removeItem('auth_token');
         }
       } catch {
         localStorage.removeItem('auth_token');
       }
     }
   }
   ```

2. Create a global lifecycle hook with `@lifecycleHooks()` decorator:
   ```typescript
   import { lifecycleHooks } from '@aurelia/runtime-html';
   import {
     IRouteViewModel,
     IRouter,
     Params,
     RouteNode,
     NavigationInstruction
   } from '@aurelia/router';
   import { resolve } from '@aurelia/kernel';
   import { AuthService } from './auth-service';

   @lifecycleHooks()
   export class GlobalAuthGuard {
     private auth = resolve(AuthService);
     private router = resolve(IRouter);

     // List of routes that don't require authentication
     private publicRoutes = ['login', 'register', 'forgot-password', ''];

     canLoad(
       viewModel: IRouteViewModel,
       params: Params,
       next: RouteNode,
       current: RouteNode | null
     ): boolean | NavigationInstruction {
       const routePath = next.route.path;

       // Check if route is public
       const isPublicRoute = this.publicRoutes.some(path =>
         routePath === path || routePath?.startsWith(`${path}/`)
       );

       if (isPublicRoute) {
         return true;
       }

       // Check authentication for protected routes
       if (!this.auth.isAuthenticated) {
         // Store intended destination
         sessionStorage.setItem('returnUrl', next.path);

         // Redirect to login
         return 'login';
       }

       // Check role-based access if route has role requirements
       const requiredRole = next.route.data?.requiredRole;
       if (requiredRole && !this.auth.hasRole(requiredRole)) {
         return 'unauthorized';
       }

       return true;
     }
   }
   ```

3. Register the global guard in your app startup:
   ```typescript
   import Aurelia from 'aurelia';
   import { RouterConfiguration } from '@aurelia/router';
   import { GlobalAuthGuard } from './global-auth-guard';
   import { AuthService } from './auth-service';
   import { MyApp } from './my-app';

   Aurelia
     .register(
       RouterConfiguration,
       AuthService,
       GlobalAuthGuard  // Registered globally - runs for ALL routes
     )
     .app(MyApp)
     .start();
   ```

4. Configure your routes with role metadata:
   ```typescript
   import { route } from '@aurelia/router';

   @route({
     routes: [
       {
         path: '',
         component: () => import('./pages/home'),
         title: 'Home'
       },
       {
         path: 'login',
         component: () => import('./pages/login'),
         title: 'Login'
       },
       {
         path: 'dashboard',
         component: () => import('./pages/dashboard'),
         title: 'Dashboard'
         // No role needed - just requires authentication
       },
       {
         path: 'admin',
         component: () => import('./pages/admin'),
         title: 'Admin Panel',
         data: { requiredRole: 'admin' }
       }
     ]
   })
   export class MyApp {}
   ```

5. Implement post-login redirect:
   ```typescript
   import { IRouter } from '@aurelia/router';
   import { resolve } from '@aurelia/kernel';
   import { AuthService } from './auth-service';

   export class Login {
     private router = resolve(IRouter);
     private auth = resolve(AuthService);

     email = '';
     password = '';
     error = '';

     async submit() {
       const success = await this.auth.login(this.email, this.password);

       if (success) {
         // Redirect to intended destination or home
         const returnUrl = sessionStorage.getItem('returnUrl') || 'dashboard';
         sessionStorage.removeItem('returnUrl');
         await this.router.load(returnUrl);
       } else {
         this.error = 'Invalid credentials';
       }
     }
   }
   ```

### Checklist

- Global guard runs automatically for ALL routes
- No need to extend base class or add guard to each component
- Public routes are whitelisted and bypass auth
- Protected routes redirect to login when unauthenticated
- Role-based access works via route metadata
- Single source of truth for authentication logic
- Post-login redirect returns user to intended page

### When to use this approach

**Use global lifecycle hooks when:**
- Most routes require authentication (only a few public routes)
- You want centralized auth logic in one place
- You need consistent behavior across the entire app
- You want to avoid repeating guard code in components

**Use component-level hooks when:**
- Only specific routes need protection
- Each route has unique authorization logic
- You want fine-grained control per component
- You need access to component-specific data

## 2. Data preloading with loading states

**Goal:** Load required data before showing a route, display loading state during fetch, and handle errors gracefully using the `loading` lifecycle hook.

### Steps

1. Create a component with data preloading in `loading` hook:
   ```typescript
   import { IRouteViewModel, Params, RouteNode } from '@aurelia/router';
   import { IHttpClient } from '@aurelia/fetch-client';
   import { resolve } from '@aurelia/kernel';
   import { observable } from '@aurelia/runtime';

   interface Product {
     id: string;
     name: string;
     price: number;
     description: string;
   }

   interface Review {
     id: string;
     rating: number;
     comment: string;
   }

   export class ProductDetail implements IRouteViewModel {
     private http = resolve(IHttpClient);

     @observable loadingState: 'loading' | 'loaded' | 'error' = 'loading';
     loadError: string | null = null;

     product: Product | null = null;
     reviews: Review[] = [];
     relatedProducts: Product[] = [];

     async loading(params: Params, next: RouteNode, current: RouteNode | null) {
       this.loadingState = 'loading';
       this.loadError = null;

       try {
         // Load all data in parallel
         const [productRes, reviewsRes, relatedRes] = await Promise.all([
           this.http.fetch(`/api/products/${params.id}`),
           this.http.fetch(`/api/products/${params.id}/reviews`),
           this.http.fetch(`/api/products/${params.id}/related`)
         ]);

         if (!productRes.ok || !reviewsRes.ok || !relatedRes.ok) {
           throw new Error('Failed to load product data');
         }

         this.product = await productRes.json();
         this.reviews = await reviewsRes.json();
         this.relatedProducts = await relatedRes.json();

         this.loadingState = 'loaded';
       } catch (error) {
         this.loadError = error.message || 'Failed to load product details';
         this.loadingState = 'error';
         // Re-throw to prevent navigation
         throw error;
       }
     }

     async retryLoad(params: Params) {
       await this.loading(params, null as any, null);
     }
   }
   ```

2. Show loading state in the template:
   ```html
   <div class="product-detail">
     <div if.bind="loadingState === 'loading'" class="loading-overlay">
       <div class="spinner"></div>
       <p>Loading product details...</p>
     </div>

     <div if.bind="loadingState === 'error'" class="error">
       <p>${loadError}</p>
       <button click.trigger="retryLoad({ id: product?.id })">Retry</button>
     </div>

     <div if.bind="loadingState === 'loaded'">
       <h1>${product.name}</h1>
       <p class="price">$${product.price}</p>
       <p>${product.description}</p>

       <section class="reviews">
         <h2>Reviews (${reviews.length})</h2>
         <div repeat.for="review of reviews" class="review">
           <span class="rating">${review.rating} stars</span>
           <p>${review.comment}</p>
         </div>
       </section>

       <section class="related">
         <h2>You May Also Like</h2>
         <div class="product-grid">
           <div repeat.for="item of relatedProducts" class="product-card">
             <a load="route: product-detail; params.bind: { id: item.id }">
               ${item.name}
             </a>
           </div>
         </div>
       </section>
     </div>
   </div>
   ```

3. Create a reusable preloading base class for consistency:
   ```typescript
   import { IRouteViewModel, Params, RouteNode } from '@aurelia/router';
   import { observable } from '@aurelia/runtime';

   export type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

   export abstract class PreloadingViewModel implements IRouteViewModel {
     @observable loadState: LoadState = 'idle';
     loadError: string | null = null;

     // Override this to define what data to preload
     protected abstract fetchData(params: Params, next: RouteNode): Promise<void>;

     async loading(params: Params, next: RouteNode, current: RouteNode | null) {
       this.loadState = 'loading';
       this.loadError = null;

       try {
         await this.fetchData(params, next);
         this.loadState = 'loaded';
       } catch (error) {
         this.loadError = error.message || 'Failed to load data';
         this.loadState = 'error';
         throw error; // Prevent navigation on error
       }
     }

     protected async retry(params: Params, next: RouteNode) {
       await this.loading(params, next, null);
     }
   }
   ```

   ```typescript
   // Use the base class
   import { PreloadingViewModel } from './preloading-viewmodel';
   import { resolve } from '@aurelia/kernel';
   import { IHttpClient } from '@aurelia/fetch-client';
   import { Params, RouteNode } from '@aurelia/router';

   export class Dashboard extends PreloadingViewModel {
     private http = resolve(IHttpClient);

     dashboardData: any = null;

     protected async fetchData(params: Params, next: RouteNode) {
       const response = await this.http.fetch('/api/dashboard');
       this.dashboardData = await response.json();
     }
   }
   ```

### Checklist

- Data loads before route is fully activated
- Loading indicator shows during data fetch
- Failed data loads prevent navigation and show errors
- Users can retry failed loads
- Multiple data sources can be loaded in parallel
- Throwing errors in `loading` prevents navigation

## 3. Preventing navigation with unsaved changes

**Goal:** Warn users before navigating away from forms with unsaved changes using the `canUnload` lifecycle hook.

### Steps

1. Create a form component with change tracking:
   ```typescript
   import { IRouteViewModel, RouteNode } from '@aurelia/router';
   import { observable } from '@aurelia/runtime';
   import { resolve } from '@aurelia/kernel';
   import { IHttpClient } from '@aurelia/fetch-client';

   export class EditProfile implements IRouteViewModel {
     private http = resolve(IHttpClient);

     @observable hasUnsavedChanges = false;
     private originalData: any = null;

     user = {
       name: '',
       email: '',
       bio: ''
     };

     loading(params: any) {
       // Load user data
       this.loadUserData();
     }

     private async loadUserData() {
       const response = await this.http.fetch('/api/user/profile');
       this.user = await response.json();
       this.originalData = { ...this.user };
     }

     // Track changes
     userChanged() {
       this.hasUnsavedChanges = JSON.stringify(this.user) !== JSON.stringify(this.originalData);
     }

     canUnload(next: RouteNode, current: RouteNode): boolean | Promise<boolean> {
       if (this.hasUnsavedChanges) {
         return confirm('You have unsaved changes. Are you sure you want to leave?');
       }
       return true;
     }

     async save() {
       try {
         await this.http.fetch('/api/user/profile', {
           method: 'PUT',
           body: JSON.stringify(this.user)
         });

         // Update original data after successful save
         this.originalData = { ...this.user };
         this.hasUnsavedChanges = false;

         return true;
       } catch {
         return false;
       }
     }
   }
   ```

2. Bind form inputs to track changes:
   ```html
   <form class="edit-profile">
     <div class="unsaved-indicator" if.bind="hasUnsavedChanges">
       You have unsaved changes
     </div>

     <div class="form-group">
       <label for="name">Name</label>
       <input
         id="name"
         value.bind="user.name"
         input.trigger="userChanged()"
       >
     </div>

     <div class="form-group">
       <label for="email">Email</label>
       <input
         id="email"
         type="email"
         value.bind="user.email"
         input.trigger="userChanged()"
       >
     </div>

     <div class="form-group">
       <label for="bio">Bio</label>
       <textarea
         id="bio"
         value.bind="user.bio"
         input.trigger="userChanged()"
       ></textarea>
     </div>

     <button click.trigger="save()">Save Changes</button>
   </form>
   ```

3. Create a reusable mixin for unsaved changes:
   ```typescript
   import { IRouteViewModel, RouteNode } from '@aurelia/router';

   export interface UnsavedChangesOptions {
     message?: string;
     checkChanges: () => boolean;
   }

   export function withUnsavedChangesGuard(
     options: UnsavedChangesOptions
   ): ClassDecorator {
     return function <T extends { new(...args: any[]): IRouteViewModel }>(target: T) {
       const originalCanUnload = target.prototype.canUnload;

       target.prototype.canUnload = function(next: RouteNode, current: RouteNode) {
         const hasChanges = options.checkChanges.call(this);

         if (hasChanges) {
           const message = options.message || 'You have unsaved changes. Are you sure you want to leave?';
           const userConfirmed = confirm(message);

           if (!userConfirmed) {
             return false;
           }
         }

         // Call original canUnload if it exists
         if (originalCanUnload) {
           return originalCanUnload.call(this, next, current);
         }

         return true;
       };

       return target;
     };
   }
   ```

   ```typescript
   // Use the decorator
   @withUnsavedChangesGuard({
     checkChanges: function(this: EditProfile) {
       return this.hasUnsavedChanges;
     },
     message: 'Discard unsaved changes?'
   })
   export class EditProfile implements IRouteViewModel {
     hasUnsavedChanges = false;
     // ... rest of implementation
   }
   ```

### Checklist

- Users are warned before navigating away with unsaved changes
- Confirmation dialog is shown on navigation attempt
- Saving clears the unsaved changes flag
- Navigation is prevented if user cancels
- Works with browser back button

## 4. Query parameter state management

**Goal:** Sync component state with URL query parameters using router state management for shareable, bookmarkable views.

### Steps

1. Create a component that reads and writes query parameters:
   ```typescript
   import { IRouteViewModel, Params, RouteNode, IRouter } from '@aurelia/router';
   import { resolve } from '@aurelia/kernel';
   import { IHttpClient } from '@aurelia/fetch-client';
   import { observable } from '@aurelia/runtime';

   export class ProductList implements IRouteViewModel {
     private router = resolve(IRouter);
     private http = resolve(IHttpClient);

     products: any[] = [];

     @observable filters = {
       search: '',
       category: 'all',
       minPrice: 0,
       maxPrice: 1000,
       sortBy: 'name',
       page: 1
     };

     loading(params: Params) {
       // Initialize from query parameters
       this.filters.search = params.q || '';
       this.filters.category = params.category || 'all';
       this.filters.minPrice = parseInt(params.minPrice) || 0;
       this.filters.maxPrice = parseInt(params.maxPrice) || 1000;
       this.filters.sortBy = params.sortBy || 'name';
       this.filters.page = parseInt(params.page) || 1;
     }

     async attached() {
       await this.loadProducts();
     }

     async updateFilters(updates: Partial<typeof this.filters>) {
       // Update local state
       Object.assign(this.filters, updates);

       // Reset to page 1 when filters change
       if (!('page' in updates)) {
         this.filters.page = 1;
       }

       // Sync to URL
       await this.syncToUrl();

       // Reload data
       await this.loadProducts();
     }

     private async syncToUrl() {
       const params: any = {};

       // Only include non-default values in URL
       if (this.filters.search) params.q = this.filters.search;
       if (this.filters.category !== 'all') params.category = this.filters.category;
       if (this.filters.minPrice > 0) params.minPrice = this.filters.minPrice;
       if (this.filters.maxPrice < 1000) params.maxPrice = this.filters.maxPrice;
       if (this.filters.sortBy !== 'name') params.sortBy = this.filters.sortBy;
       if (this.filters.page > 1) params.page = this.filters.page;

       // Build query string
       const queryString = new URLSearchParams(params).toString();
       const path = queryString ? `products?${queryString}` : 'products';

       // Update URL without triggering navigation
       await this.router.load(path, { replace: true });
     }

     private async loadProducts() {
       const queryString = new URLSearchParams(this.filters as any).toString();
       const response = await this.http.fetch(`/api/products?${queryString}`);
       this.products = await response.json();
     }

     getShareableUrl(): string {
       return window.location.href;
     }

     async copyUrlToClipboard() {
       await navigator.clipboard.writeText(this.getShareableUrl());
       // Show success notification
     }
   }
   ```

2. Create a template with filter controls:
   ```html
   <div class="product-list">
     <div class="filters">
       <input
         type="text"
         value.bind="filters.search"
         input.trigger="updateFilters({ search: filters.search }) & debounce:500"
         placeholder="Search products..."
       >

       <select
         value.bind="filters.category"
         change.trigger="updateFilters({ category: filters.category })"
       >
         <option value="all">All Categories</option>
         <option value="electronics">Electronics</option>
         <option value="clothing">Clothing</option>
         <option value="books">Books</option>
       </select>

       <select
         value.bind="filters.sortBy"
         change.trigger="updateFilters({ sortBy: filters.sortBy })"
       >
         <option value="name">Name</option>
         <option value="price-asc">Price: Low to High</option>
         <option value="price-desc">Price: High to Low</option>
       </select>

       <button click.trigger="copyUrlToClipboard()">
         Share Filters
       </button>
     </div>

     <div class="product-grid">
       <div repeat.for="product of products" class="product-card">
         <h3>${product.name}</h3>
         <span class="price">$${product.price}</span>
       </div>
     </div>

     <div class="pagination">
       <button
         click.trigger="updateFilters({ page: filters.page - 1 })"
         disabled.bind="filters.page === 1"
       >
         Previous
       </button>

       <span>Page ${filters.page}</span>

       <button
         click.trigger="updateFilters({ page: filters.page + 1 })"
       >
         Next
       </button>
     </div>
   </div>
   ```

### Checklist

- Component state syncs to URL query parameters
- Browser back/forward buttons restore filter state
- Users can bookmark filtered views
- Query parameters can be shared via URL
- Default values are omitted from URL
- URL updates without full page reload

## Router pattern cheat sheet

| Pattern | Key Hook | Use When |
| --- | --- | --- |
| Global authentication | `@lifecycleHooks()` + `canLoad` | Protecting most/all routes from unauthenticated access |
| Data preloading | `loading` hook with Promise.all | Data must be ready before showing component |
| Unsaved changes | `canUnload` hook with confirmation | Preventing data loss from navigation |
| Relative nested navigation | `router.load(target, { context: resolve(IRouteContext) })` | Programmatic sibling/parent navigation from a child component |
| Restore per-entry UI state | `IRouterEvents` + `window.history.replaceState` | Rehydrate filters/scroll positions when users hit Back |
| Multi-panel dashboards | Named `<au-viewport>` + `router.load('route@viewport')` | Keep sidebar, main, and overlay panes in sync |
| Conditional fallback routing | `fallback()` returning route IDs | Redirect unknown/disabled paths to supported components |
| Route-driven menus | `resolve(IRouteContext).routeConfigContext.navigationModel` | Auto-build nav bars from configured routes |
| Query parameters | `loading` hook + router.load | Shareable/bookmarkable filtered views |

## Best practices

1. **Use `replace: true` for filter updates**: Prevents excessive browser history entries
2. **Preload in parallel**: Load multiple data sources with `Promise.all` in `loading` hook
3. **Throw errors to prevent navigation**: In `loading` hook, throw to stop navigation on data load failure
4. **Return route name from `canLoad`**: Redirect by returning a string route name instead of calling `router.load()`
5. **Store return URLs**: Use sessionStorage for post-login redirects
6. **Debounce query parameter updates**: Prevent excessive URL changes from text input
7. **Use route metadata**: Store auth requirements in `data` property of routes
8. **Handle async properly**: All lifecycle hooks can return Promises

## See also

- [Router hooks reference](./router-hooks.md) - Complete lifecycle hook documentation
- [Router events](./router-events.md) - Subscribe to navigation events
- [Routing lifecycle](./routing-lifecycle.md) - Understanding the routing lifecycle
- [Error handling patterns](../advanced-scenarios/error-handling-patterns.md) - Navigation error handling
- [Testing guide](./testing-guide.md) - Testing router hooks
