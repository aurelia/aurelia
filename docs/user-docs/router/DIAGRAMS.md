# Router Architecture Diagrams

Visual explanations of Aurelia 2's router architecture and concepts.

## Table of Contents
1. [Route Matching Pipeline](#1-route-matching-pipeline)
2. [Navigation Flow](#2-navigation-flow)
3. [Lifecycle Hook Execution Order](#3-lifecycle-hook-execution-order)
4. [Component vs Router Hooks](#4-component-vs-router-hooks)
5. [Viewport Hierarchy](#5-viewport-hierarchy)
6. [History Strategy](#6-history-strategy)
7. [Transition Plans](#7-transition-plans)
8. [Route Parameter Flow](#8-route-parameter-flow)

---

## 1. Route Matching Pipeline

How the router resolves a URL to components:

```
┌──────────────────────────────────────────────────────────┐
│ User navigates to: /products/42/reviews                  │
└──────────────────┬───────────────────────────────────────┘
                   ↓
        ┌──────────────────────┐
        │ 1. Parse URL         │
        │ Path: /products/42/  │
        │       reviews        │
        │ Fragment: #section2  │
        │ Query: ?sort=date    │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │ 2. Match Routes      │
        │ - Check path pattern │
        │ - Extract params     │
        │ - Apply constraints  │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │ 3. Build Route Tree  │
        │ Root                 │
        │  └─ Products (:id)   │
        │      └─ Reviews      │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │ 4. Execute Hooks     │
        │ - canLoad (guard)    │
        │ - loading (data)     │
        │ - canUnload (prev)   │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │ 5. Render Components │
        │ - Swap viewports     │
        │ - loaded hooks       │
        │ - Update title       │
        └──────────────────────┘

Route Configuration Match Example:

routes: [
  {
    path: 'products/:id',           ✓ Matches /products/42
    component: ProductDetail,
    routes: [
      { path: 'reviews', ... }      ✓ Matches /reviews
    ]
  },
  {
    path: 'products/:id{{^\\d+$}}', ✓ Only if :id is numeric
    component: ProductDetail
  }
]
```

**Key Points**:
- Routes are matched top-to-bottom in configuration order
- First matching route wins
- Parameters are extracted during matching
- Constraints (`{{regex}}`) are validated
- Hierarchical routes build a route tree

[Route matching documentation →](./configuring-routes.md)

---

## 2. Navigation Flow

How different navigation methods work:

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVIGATION METHODS                      │
└─────────────────────────────────────────────────────────────┘

METHOD 1: href attribute (Declarative)
─────────────────────────────────────────
<a href="products/42">             ┌──────────────┐
    ─────────────────────────────>│ href handler │
                                   └──────┬───────┘
                                          ↓
                               ┌──────────────────┐
                               │ Parse URL string │
                               └──────────┬───────┘
                                          ↓
                                   Navigate to URL

Context: Current route context by default
Use ../  to navigate to parent context


METHOD 2: load attribute (Structured)
──────────────────────────────────────────
<a load="route: products;          ┌──────────────┐
         params.bind: {id: 42}">───>│ load handler │
                                   └──────┬───────┘
                                          ↓
                               ┌──────────────────────┐
                               │ Build instruction    │
                               │ from structured data │
                               └──────────┬───────────┘
                                          ↓
                                   Navigate to route

Context: Current by default, can bind custom context
Active: Supports .active bindable for styling


METHOD 3: IRouter.load() (Programmatic)
────────────────────────────────────────────
router.load('products/42', {       ┌──────────────┐
  queryParams: { ... },            │ IRouter.load │
  context: this                    └──────┬───────┘
});                                       ↓
                               ┌──────────────────────┐
                               │ Full JavaScript API  │
                               │ - Error handling     │
                               │ - Async/await        │
                               │ - Options object     │
                               └──────────┬───────────┘
                                          ↓
                                   Navigate to route

Context: Root by default (different from href/load!)
Returns: Promise<boolean> for success/failure


ALL METHODS CONVERGE
────────────────────────────────────────────
                    ↓
         ┌────────────────────┐
         │ Router Core Engine │
         └──────────┬─────────┘
                    ↓
         ┌────────────────────┐
         │ Route Matching     │
         │ Hook Execution     │
         │ Component Loading  │
         └────────────────────┘
```

**Decision Guide**:
- Use `href` for simple, static links
- Use `load` when you need parameter binding or active state
- Use `IRouter.load()` for conditional/programmatic navigation

[Navigation documentation →](./navigating.md)

---

## 3. Lifecycle Hook Execution Order

Complete sequence when navigating from ComponentA to ComponentB:

```
┌────────────────────────────────────────────────────────┐
│ Navigation: /page-a  →  /page-b                        │
└────────────────────────────────────────────────────────┘

PHASE 1: CAN UNLOAD (Current Component)
════════════════════════════════════════
ComponentA (current)
  ↓
┌─────────────────────────────────┐
│ 1. canUnload()                  │ → Return false to cancel navigation
│    - Check unsaved changes      │   Return true to allow
│    - User confirmation          │
└─────────────────┬───────────────┘
                  ↓
         [Navigation Cancelled?] ─── No ──→ Continue
                  │
                 Yes
                  ↓
            Stay on page A


PHASE 2: CAN LOAD (Next Component)
══════════════════════════════════════
ComponentB (next)
  ↓
┌─────────────────────────────────┐
│ 2. Router hooks: canLoad()      │ → Return false to block
│    - Authentication checks       │   Return NavigationInstruction to redirect
│    - Authorization               │   Return true to allow
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 3. Component: canLoad()         │ → Component-level validation
│    - Parameter validation        │
│    - Conditional logic           │
└─────────────────┬───────────────┘
                  ↓
         [Navigation Allowed?] ─── No ──→ Show fallback or redirect
                  │
                 Yes
                  ↓
            Continue to load


PHASE 3: UNLOADING (Current Component)
═══════════════════════════════════════
ComponentA (current)
  ↓
┌─────────────────────────────────┐
│ 4. Router hooks: unloading()    │
│    - Global cleanup             │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 5. Component: unloading()       │
│    - Save drafts                │
│    - Cleanup subscriptions      │
│    - Log analytics              │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 6. Component detached           │ ← Standard Aurelia lifecycle
│    - DOM removal                │
└─────────────────────────────────┘


PHASE 4: LOADING (Next Component)
══════════════════════════════════════
ComponentB (next)
  ↓
┌─────────────────────────────────┐
│ 7. Router hooks: loading()      │
│    - Shared data loading        │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 8. Component: loading()         │
│    - Fetch component data       │
│    - Initialize state           │
│    - Show loading UI            │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 9. Component attached           │ ← Standard Aurelia lifecycle
│    - DOM insertion              │
└─────────────────┬───────────────┘
                  ↓
         Swap viewport content
         (ComponentA → ComponentB)
                  ↓
┌─────────────────────────────────┐
│ 10. Component: loaded()         │
│     - Post-render effects       │
│     - Scroll to top             │
│     - Track page view           │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 11. Update browser history      │
│     Update document title       │
└─────────────────────────────────┘
                  ↓
           Navigation Complete


TIMING DIAGRAM (with async operations)
═══════════════════════════════════════════

Time  ComponentA              ComponentB
────  ──────────              ──────────
  0ms canUnload() ────────┐
                          │
100ms                     └─> [approved]
                              canLoad() ──────┐
                                              │
200ms                                         └─> [approved]
      unloading() ───────┐
                         │
250ms                    └─> [cleanup done]
                             loading() ──────┐
                                             │ ← async data fetch
400ms                                        └─> [data loaded]
      [detached]
                             [attached]
                             loaded() ───────┐
                                             │
410ms                                        └─> [done]
      ████████ (visible)    ░░░░░░░░ (hidden)
      ░░░░░░░░ (hidden)     ████████ (visible)
```

**Important Notes**:
1. All hooks can be async (return Promise)
2. Router waits for each hook to complete before proceeding
3. Returning `false` from guard hooks stops navigation
4. Router hooks run before component hooks
5. `unloading` and `loading` happen in parallel for performance

[Lifecycle hooks documentation →](./routing-lifecycle.md)

---

## 4. Component vs Router Hooks

Two ways to implement lifecycle logic:

```
┌─────────────────────────────────────────────────────────────┐
│               COMPONENT HOOKS (Local)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  export class ProductDetail implements IRouteViewModel {    │
│    canLoad(params: Params): boolean {                       │
│      // 'this' refers to component instance                 │
│      return this.validateProduct(params.id);                │
│    }                                                         │
│  }                                                           │
│                                                              │
│  ✓ Use for component-specific logic                         │
│  ✓ Direct access to component state via 'this'              │
│  ✓ Runs only for this component                             │
│  ✗ Cannot share logic across components                     │
└─────────────────────────────────────────────────────────────┘

                              ↓↑

┌─────────────────────────────────────────────────────────────┐
│              ROUTER HOOKS (Shared/Global)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  @lifecycleHooks()                                           │
│  export class AuthHook {                                     │
│    canLoad(                                                  │
│      viewModel: IRouteViewModel,  ← component instance      │
│      params: Params,                                         │
│      next: RouteNode                                         │
│    ): boolean {                                              │
│      // 'this' is the hook instance, not the component      │
│      return this.authService.isAuthenticated();             │
│    }                                                         │
│  }                                                           │
│                                                              │
│  // Register globally                                        │
│  Aurelia.register(AuthHook);                                 │
│                                                              │
│  ✓ Share logic across all components                        │
│  ✓ Centralized cross-cutting concerns                       │
│  ✓ Access component via viewModel parameter                 │
│  ✗ Extra indirection to access component state              │
└─────────────────────────────────────────────────────────────┘


EXECUTION ORDER (both registered)
══════════════════════════════════════════════════════════════

Navigation triggered
        ↓
┌─────────────────────┐
│ 1. Router Hooks     │ ← Runs first (global checks)
│    canLoad()        │
└──────────┬──────────┘
           ↓
    [return false?] ─── Yes ──→ Navigation blocked
           │
          No
           ↓
┌─────────────────────┐
│ 2. Component Hook   │ ← Runs second (local checks)
│    canLoad()        │
└──────────┬──────────┘
           ↓
    [return false?] ─── Yes ──→ Navigation blocked
           │
          No
           ↓
   Navigation continues


COMMON PATTERNS
═══════════════════════════════════════════════════════════

Pattern 1: Authentication (Router Hook)
────────────────────────────────────────
@lifecycleHooks()
class AuthHook {
  canLoad(...) {
    if (!isLoggedIn) return 'login';
    return true;
  }
}
→ Applies to all routes
→ Centralized auth logic


Pattern 2: Data Loading (Component Hook)
─────────────────────────────────────────
class ProductDetail implements IRouteViewModel {
  async loading(params: Params) {
    this.product = await fetchProduct(params.id);
  }
}
→ Component-specific data
→ Direct state access


Pattern 3: Mixed Approach (Both)
─────────────────────────────────────────
@lifecycleHooks()
class PermissionHook {
  canLoad(vm, params, next) {
    const requiredPermission = next.data?.permission;
    return this.hasPermission(requiredPermission);
  }
}

class AdminPanel implements IRouteViewModel {
  canLoad(params) {
    // Additional component-specific checks
    return this.validateContext(params);
  }
}
→ Global permission check first
→ Then component-specific validation
```

**Decision Guide**:
- **Router hooks** for: Authentication, authorization, logging, analytics
- **Component hooks** for: Data fetching, validation, component state
- **Both** when you need layered checks (global + local)

[Router hooks →](./router-hooks.md) | [Component hooks →](./routing-lifecycle.md)

---

## 5. Viewport Hierarchy

How viewports nest and relate to each other:

```
SIMPLE (SINGLE VIEWPORT)
════════════════════════════════════

<my-app>
  <nav>...</nav>
  <au-viewport></au-viewport>  ← Single viewport
</my-app>

Route: /products
         ↓
┌────────────────┐
│ <my-app>       │
│   <nav>        │
│   ┌──────────┐ │
│   │ Products │ │ ← Loaded into viewport
│   └──────────┘ │
│ </my-app>      │
└────────────────┘


HIERARCHICAL (NESTED VIEWPORTS)
═══════════════════════════════════════════════

<my-app>
  <au-viewport></au-viewport>        ← Root viewport
    ↓
    <products-page>
      <au-viewport></au-viewport>    ← Child viewport
        ↓
        <product-detail>
        </product-detail>
    </products-page>
</my-app>

Route: /products/42/reviews
         ↓
┌─────────────────────────────────────┐
│ Root Component (my-app)             │
│ ┌─────────────────────────────────┐ │
│ │ Products (viewport: default)    │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Product 42 (viewport: deflt)│ │ │
│ │ │ ┌─────────────────────────┐ │ │ │
│ │ │ │ Reviews (viewport: def) │ │ │ │
│ │ │ └─────────────────────────┘ │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Route Tree:
Root
 └─ products
     └─ 42 (product-detail)
         └─ reviews


SIBLING VIEWPORTS (MULTIPLE VIEWPORTS)
═══════════════════════════════════════════════

<my-app>
  <div class="layout">
    <au-viewport name="left"></au-viewport>
    <au-viewport name="right"></au-viewport>
  </div>
</my-app>

Route: products@left+details/42@right
         ↓
┌───────────────────────────────────────┐
│ Root Component                        │
│ ┌───────────────┬─────────────────┐   │
│ │ Products      │ Product Details │   │
│ │ (left)        │ (right)         │   │
│ │               │ ID: 42          │   │
│ │ - Item 1      │                 │   │
│ │ - Item 2      │ Description...  │   │
│ │ - Item 3      │                 │   │
│ └───────────────┴─────────────────┘   │
└───────────────────────────────────────┘

Route Configuration:
routes: [
  { path: 'products', component: ProductList },
  { path: 'details/:id', component: ProductDetail }
]

Navigation:
<a href="products@left+details/42@right">Load both</a>
router.load([
  { component: ProductList, viewport: 'left' },
  { component: ProductDetail, params: { id: 42 }, viewport: 'right' }
]);


COMPLEX (NESTED + SIBLING)
═══════════════════════════════════════════════

<my-app>
  <au-viewport></au-viewport>           ← Root
    ↓
    <dashboard>
      <au-viewport name="main"></au-viewport>
      <au-viewport name="sidebar"></au-viewport>
        ↓                    ↓
        <content>       <sidebar-content>
          <au-viewport></au-viewport>  ← Nested in main
        </content>
    </dashboard>
</my-app>

Route: /dashboard/content@main+sidebar@sidebar/nested
         ↓
┌──────────────────────────────────────────┐
│ Root (my-app)                            │
│ ┌──────────────────────────────────────┐ │
│ │ Dashboard                            │ │
│ │ ┌─────────────────┬────────────────┐ │ │
│ │ │ Main            │ Sidebar        │ │ │
│ │ │ ┌─────────────┐ │                │ │ │
│ │ │ │ Nested Comp │ │ Sidebar Content│ │ │
│ │ │ └─────────────┘ │                │ │ │
│ │ └─────────────────┴────────────────┘ │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Key Concepts**:
- **Default viewport**: `<au-viewport></au-viewport>` (no name)
- **Named viewport**: `<au-viewport name="aside"></au-viewport>`
- **Target viewport**: Use `@viewportName` in navigation
- **Hierarchical**: Nested components each have their own viewport
- **Sibling**: Multiple viewports at the same level

[Viewports documentation →](./viewports.md)

---

## 6. History Strategy

How router interacts with browser history:

```
STRATEGY: 'push' (default)
══════════════════════════════════════════

User Journey:
  /home  →  /about  →  /contact

Browser History Stack:
┌─────────────┐
│  /contact   │ ← Current (length: 3)
├─────────────┤
│  /about     │   [Back button goes here]
├─────────────┤
│  /home      │
└─────────────┘

Code:
router.load('contact', { historyStrategy: 'push' });

✓ Each navigation adds new entry
✓ Back button works as expected
✓ Forward button available after going back
✗ History grows unbounded


STRATEGY: 'replace'
══════════════════════════════════════════

User Journey:
  /home  →  /about  →  /contact (replace)

Browser History Stack:
┌─────────────┐
│  /contact   │ ← Current (length: 2)
├─────────────┤
│  /home      │   [Back button goes here]
└─────────────┘
     ↑
 /about was replaced by /contact

Code:
router.load('contact', { historyStrategy: 'replace' });

✓ No history pollution
✓ Good for redirects/corrections
✓ Prevents "back" to intermediate states
✗ Can't navigate back to replaced pages


STRATEGY: 'none'
══════════════════════════════════════════

User Journey:
  /home  →  /about  →  /contact (none)

Browser History Stack:
┌─────────────┐
│  /home      │ ← Current (length: 1)
└─────────────┘

URL bar shows: /contact
But history still has: /home

Code:
router.load('contact', { historyStrategy: 'none' });

✓ No history interaction at all
✓ Good for modal-style navigation
✗ Back button goes to previous app page, not /about
✗ URL and history out of sync


COMPARISON
══════════════════════════════════════════════════════════

Use Case                           | Strategy
─────────────────────────────────────────────────────────
Normal navigation                  | 'push'
Login redirect                     | 'replace'
Fixing invalid route               | 'replace'
Multi-step form (same logical page)| 'replace'
Modal / overlay content            | 'none'
Wizard steps (want back to work)   | 'push'
Correcting user typos in URL       | 'replace'


REAL-WORLD EXAMPLE: Login Flow
═══════════════════════════════════

// User tries to access protected route
canLoad() {
  if (!isLoggedIn) {
    // Redirect to login WITH replace
    // So after login, "back" doesn't go to login page
    router.load('login', { historyStrategy: 'replace' });
    return false;
  }
}

// After successful login
login() {
  authenticate();
  // Navigate to dashboard WITH replace
  // So "back" from dashboard doesn't go to login
  router.load('dashboard', { historyStrategy: 'replace' });
}

History progression:
1. User at /home
2. Tries /admin → redirected to /login (replace)
   History: [/home, /login]
3. After login → /admin (replace)
   History: [/home, /admin]
4. Back button → goes to /home (skips /login)


REAL-WORLD EXAMPLE: Wizard
═══════════════════════════════════

// Multi-step form
wizard.nextStep() {
  currentStep++;
  // Use push so back button works
  router.load(`wizard/step${currentStep}`, {
    historyStrategy: 'push'
  });
}

History: /wizard/step1 → /wizard/step2 → /wizard/step3
Back button goes through steps correctly


REAL-WORLD EXAMPLE: Search Filters
══════════════════════════════════════

// User adjusts filters
applyFilters() {
  // Use replace to update URL without history spam
  router.load('search', {
    queryParams: { ...filters },
    historyStrategy: 'replace'
  });
}

Without replace:
/search → /search?cat=A → /search?cat=A&sort=price
         → /search?cat=A&sort=price&page=2
         → /search?cat=A&sort=price&page=3
[User hits back 4 times to go back!]

With replace:
/search → /search?cat=A&sort=price&page=3
[User hits back once to go back!]
```

**Decision Guide**:
- **push**: Normal navigation, want history
- **replace**: Redirects, corrections, interim states
- **none**: Modals, overlays, no history needed

[History strategy documentation →](./router-configuration.md#configure-browser-history-strategy)

---

## 7. Transition Plans

What happens when navigating to the same component with different parameters:

```
Scenario: Navigate from /users/1 to /users/2
(Same component, different parameter)


TRANSITION PLAN: 'replace' (default)
════════════════════════════════════════

/users/1 (ComponentA, id=1)
    ↓
router.load('/users/2')
    ↓
┌──────────────────────────────┐
│ 1. Unload current instance   │
│    - unloading() called      │
│    - detaching() called      │
│    - Component destroyed     │
└────────────┬─────────────────┘
             ↓
┌──────────────────────────────┐
│ 2. Create new instance       │
│    - New component instance  │
│    - canLoad() called        │
│    - loading() called        │
│    - attached() called       │
│    - loaded() called         │
└────────────┬─────────────────┘
             ↓
/users/2 (ComponentA, id=2) ← Different instance

Timeline:
ComponentA(id=1)  ComponentA(id=2)
  unloading()
  detaching()
  [destroyed]
                  canLoad()
                  loading()
                  attached()
                  loaded()

✓ Clean slate, no stale state
✓ Simple mental model
✗ Slower (full recreation)
✗ Loses component state
✗ Re-runs constructor, bound, etc.


TRANSITION PLAN: 'invoke-lifecycles'
════════════════════════════════════════

/users/1 (ComponentA, id=1)
    ↓
router.load('/users/2')
    ↓
┌──────────────────────────────┐
│ 1. Keep existing instance    │
│    - Same component object   │
│    - No destruction          │
└────────────┬─────────────────┘
             ↓
┌──────────────────────────────┐
│ 2. Re-invoke hooks           │
│    - canLoad() called        │
│    - loading() called        │
│    - loaded() called         │
│    (NO attach/detach)        │
└────────────┬─────────────────┘
             ↓
/users/2 (ComponentA, id=2) ← Same instance!

Timeline:
ComponentA(id=1)
  canLoad(id=2)
  loading(id=2)
  loaded(id=2)
ComponentA(id=2)

✓ Faster (reuses instance)
✓ Can preserve component state
✓ Smoother transitions/animations
✗ Must handle state updates correctly
✗ Potential for stale data bugs


COMPARISON
══════════════════════════════════════════════════════════

Aspect                  | replace          | invoke-lifecycles
────────────────────────────────────────────────────────────────
Instance                | New              | Reused
Speed                   | Slower           | Faster
State                   | Fresh            | Preserved*
Lifecycle hooks         | All              | Subset
DOM                     | Removed/readded  | Stays
Use for                 | Default behavior | Param-only changes

* Preserved state can be a pro or con depending on use case


CONFIGURATION
═══════════════════════════════════════════════════════════

Global configuration:
@route({
  transitionPlan: 'invoke-lifecycles',  ← All routes
  routes: [...]
})

Per-route configuration:
{
  path: 'users/:id',
  component: UserDetail,
  transitionPlan: 'invoke-lifecycles'   ← Just this route
}

Per-navigation override:
router.load('users/2', {
  transitionPlan: 'invoke-lifecycles'   ← Just this navigation
});


REAL-WORLD EXAMPLE: User Profile Tabs
═══════════════════════════════════════════════════════════

Component:
class UserProfile implements IRouteViewModel {
  userId: string;
  userData: User;
  selectedTab = 'overview';  ← Component state

  loading(params: Params) {
    if (this.userId !== params.id) {
      // Different user - fetch new data
      this.userId = params.id;
      this.userData = await fetchUser(params.id);
    }
    // Update tab from URL
    this.selectedTab = params.tab || 'overview';
  }
}

Routes:
{
  path: 'users/:id/:tab?',
  component: UserProfile,
  transitionPlan: 'invoke-lifecycles'  ← Preserve state
}

Navigation:
/users/123/overview → /users/123/posts
└─ Same user, keep loaded data, just update tab

/users/123/posts → /users/456/posts
└─ Different user, fetch new data in loading()


WHEN TO USE EACH
═══════════════════════════════════════════════════════════

Use 'replace' when:
✓ You want clean state each time
✓ Component has complex initialization
✓ Different params mean completely different data
✓ You don't trust yourself to handle reuse correctly

Use 'invoke-lifecycles' when:
✓ Only parameters change (same logical entity)
✓ You want to preserve UI state (scroll, selections)
✓ Performance matters (frequent navigation)
✓ You have good loading() logic that handles updates


COMMON PITFALL
═══════════════════════════════════════════════════════════

// ✗ BAD: Doesn't update when params change
class ProductDetail implements IRouteViewModel {
  product: Product;

  constructor() {
    this.product = fetchProduct(params.id);  ← params not available!
  }
}

// ✓ GOOD: Updates on every navigation
class ProductDetail implements IRouteViewModel {
  product: Product;

  loading(params: Params) {
    this.product = await fetchProduct(params.id);  ← Correct!
  }
}
```

**Rule of Thumb**:
- Default (`replace`): Safe, always works
- `invoke-lifecycles`: Optimize when parameters drive content, not fundamentally different pages

[Transition plans documentation →](./transition-plans.md)

---

## 8. Route Parameter Flow

How parameters flow from URL to component:

```
URL: /products/42/reviews?sort=date&page=2#reviews-section
     \_______/\__/\______/\__________________/\_____________/
         │     │     │            │                 │
      path   param  path      query            fragment


PARSING
═══════════════════════════════════════════════════════════

Router processes URL:
┌────────────────────────────────┐
│ Path segments: [products, 42,  │
│                 reviews]        │
│ Path params:   {id: '42'}      │
│ Query params:  {sort: 'date',  │
│                 page: '2'}     │
│ Fragment:      'reviews-section'│
└────────────────────────────────┘


ROUTE MATCHING
═══════════════════════════════════════════════════════════

Configuration:
{
  path: 'products/:id',
  component: ProductDetail,
  routes: [
    { path: 'reviews', component: Reviews }
  ]
}

Match result:
┌─────────────────────────────────────────┐
│ Route Tree:                             │
│   products (:id = '42')                 │
│     └─ reviews                          │
│                                         │
│ Params object:                          │
│   { id: '42' }                          │
│                                         │
│ Query object:                           │
│   { sort: 'date', page: '2' }          │
└─────────────────────────────────────────┘


ACCESS IN COMPONENT
═══════════════════════════════════════════════════════════

Method 1: Lifecycle hooks
──────────────────────────────────────────
class ProductDetail implements IRouteViewModel {
  productId: string;

  canLoad(params: Params, next: RouteNode) {
    // Path parameters
    this.productId = params.id;  // '42'

    // Query parameters
    const sort = next.queryParams.get('sort');  // 'date'
    const page = next.queryParams.get('page');  // '2'

    // Fragment
    const fragment = next.fragment;  // 'reviews-section'

    return true;
  }
}


Method 2: ICurrentRoute
──────────────────────────────────────────
import { ICurrentRoute } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

class ProductDetail {
  private readonly currentRoute = resolve(ICurrentRoute);

  attached() {
    // Current path
    console.log(this.currentRoute.path);  // 'products/42/reviews'

    // Parameters (includes all from parent routes)
    const params = this.currentRoute.parameterInformation[0].params;
    console.log(params.get('id'));  // '42'

    // Query string (need to parse)
    const url = this.currentRoute.url;
    const queryString = url.split('?')[1];  // 'sort=date&page=2'
  }
}


Method 3: getRouteParameters (aggregates hierarchy)
────────────────────────────────────────────────────
import { IRouteContext } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

class NestedComponent {
  private readonly context = resolve(IRouteContext);

  attached() {
    // Get all params from entire route hierarchy
    const allParams = this.context.getRouteParameters<{
      companyId: string;    // From /companies/:companyId
      projectId: string;    // From /projects/:projectId
      userId: string;       // From /users/:userId
    }>({
      includeQueryParams: true  // Also include ?foo=bar
    });

    console.log(allParams.companyId);  // Nearest definition wins
  }
}


PARAMETER TYPES
═══════════════════════════════════════════════════════════

All parameters are strings!
─────────────────────────────────────────
URL: /products/42?count=10&active=true

params.id      // '42' (string, not number!)
params.count   // '10' (string, not number!)
params.active  // 'true' (string, not boolean!)

Always convert:
const id = Number(params.id);
const count = parseInt(params.count, 10);
const active = params.active === 'true';


PARAMETER BINDING WITH load
═══════════════════════════════════════════════════════════

Template:
<a load="route: products; params.bind: {id: productId}">
  View Product
</a>

Component:
productId = 42;

Generated URL:
/products/42

With multiple params:
<a load="route: items;
         params.bind: {
           id: itemId,
           category: itemCategory,
           extra: 'value'
         }">
  View Item
</a>

Route: /items/:id/:category?
Generated: /items/42/electronics?extra=value
                 │        │           └─ query (not in path)
                 │        └─ matches :category
                 └─ matches :id


PROGRAMMATIC WITH OPTIONS
═══════════════════════════════════════════════════════════

router.load('products/42', {
  queryParams: {
    sort: 'price',
    page: 1
  },
  fragment: 'reviews'
});

Generated URL:
/products/42?sort=price&page=1#reviews


Or with structured instruction:
router.load({
  component: 'products',
  params: { id: 42 },
  children: [
    { component: 'reviews' }
  ]
}, {
  queryParams: { sort: 'date' }
});

Generated URL:
/products/42/reviews?sort=date


PARAMETER CONSTRAINTS
═══════════════════════════════════════════════════════════

Validate during routing:
{
  path: 'products/:id{{^\\d+$}}',  // Only digits
  component: ProductDetail
}

URL: /products/42      ✓ Matches
URL: /products/abc     ✗ Doesn't match, goes to fallback

Custom validation in component:
canLoad(params: Params) {
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return 'not-found';  // Redirect to 404
  }

  return true;
}
```

**Key Points**:
- All parameters are strings
- Path params come from URL segments
- Query params come from `?key=value`
- Access via lifecycle hooks or ICurrentRoute
- Always validate and convert types

[Path parameters →](./configuring-routes.md#path-and-parameters) | [Query parameters →](./navigating.md#using-navigation-options)

---

## Summary

These diagrams cover the core architectural concepts of Aurelia 2's router:

1. **Route Matching** - How URLs become components
2. **Navigation** - Three ways to navigate and their differences
3. **Lifecycle** - Complete hook execution sequence
4. **Hooks** - Component vs Router hooks
5. **Viewports** - Nested and sibling viewport patterns
6. **History** - Push vs Replace vs None strategies
7. **Transitions** - Replace vs invoke-lifecycles behavior
8. **Parameters** - How data flows from URL to component

For more details, see the complete [Router Documentation](./README.md).
