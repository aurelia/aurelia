---
description: Complete reference for route path expression syntax, including sibling routes, child routes, viewports, and parameters.
---

# Route Expression Syntax

The Aurelia router uses a powerful expression syntax for defining navigation paths. This reference documents all available syntax elements and their combinations.

## Quick Reference

| Syntax | Meaning | Example |
|--------|---------|---------|
| `component` | Navigate to component | `products` |
| `/component` | Absolute navigation | `/dashboard` |
| `a/b` | Child route (b is child of a) | `users/profile` |
| `a+b` | Sibling routes (a and b in parallel) | `list+detail` |
| `+a` | Append to current routes | `+sidebar` |
| `(a+b)` | Group for precedence | `a/(b+c)` |
| `@viewport` | Target specific viewport | `products@main` |
| `(params)` | Inline parameters | `product(id=42)` |
| `:param` | Path parameter (single segment) | `users/:id` |
| `*param` | Wildcard parameter (multiple segments) | `files/*path` |
| `?query` | Query string | `search?q=aurelia` |
| `#fragment` | URL fragment | `docs#section-1` |

## Grammar

The formal grammar for route expressions:

```
route           := [ '/' ] composite_segment [ '?' query ] [ '#' fragment ]

composite_segment := [ '+' ] scoped_segment { '+' scoped_segment }

scoped_segment  := segment_group [ '/' scoped_segment ]

segment_group   := '(' composite_segment ')' | segment

segment         := component [ '@' viewport ] [ '!' ]

component       := component_name [ '(' parameter_list ')' ]
                 | ':' parameter_name [ '(' parameter_list ')' ]
                 | '*' parameter_name [ '(' parameter_list ')' ]
                 | './'
                 | '../'

viewport        := viewport_name

parameter_list  := parameter { ',' parameter }

parameter       := parameter_name '=' parameter_value
                 | parameter_value

query           := key '=' value { '&' key '=' value }

fragment        := text
```

## Basic Navigation

### Component Names

Navigate to a component by its registered name:

```html
<a href="products">Products</a>
<a href="about">About</a>
```

```typescript
router.load('products');
router.load('about');
```

### Absolute vs Relative Paths

Paths starting with `/` are absolute (from root). Paths without `/` are relative to current context.

```html
<!-- Absolute: always navigates from root -->
<a href="/dashboard">Dashboard</a>

<!-- Relative: navigates from current route context -->
<a href="settings">Settings</a>
```

```typescript
// Absolute navigation
router.load('/dashboard');

// Relative navigation (respects current context)
router.load('settings', { context: this.routeContext });
```

## Child Routes (Hierarchical Navigation)

Use `/` to navigate to child routes:

```html
<!-- users is parent, profile is child -->
<a href="users/profile">User Profile</a>

<!-- Three levels deep -->
<a href="admin/users/42/edit">Edit User 42</a>
```

```typescript
router.load('users/profile');
router.load('admin/users/42/edit');
```

This creates a hierarchical route tree where each segment is a child of the previous one.

## Sibling Routes (Parallel Navigation)

Use `+` to load multiple components in parallel viewports:

```html
<!-- Load list in one viewport, detail in another -->
<a href="list+detail">Show Both</a>

<!-- Three siblings -->
<a href="header+content+footer">Full Layout</a>
```

```typescript
router.load('list+detail');

// Equivalent object syntax:
router.load([
  { component: 'list', viewport: 'left' },
  { component: 'detail', viewport: 'right' }
]);
```

### Append to Current Routes

Start with `+` to add to existing routes without replacing:

```html
<!-- Add sidebar to current view -->
<a href="+sidebar">Show Sidebar</a>

<!-- Add two panels -->
<a href="+panel1+panel2">Show Panels</a>
```

## Grouping with Parentheses

Parentheses control precedence when combining `/` and `+`:

Consider this viewport structure:
```
viewport-a
├── viewport-a1
└── viewport-a2
viewport-b
└── viewport-b1
```

Without grouping, `a/a1+a2+b/b1` would be parsed as:
```
a
└── a1
a2 (sibling of a, not child)
b
└── b1
```

With grouping, `a/(a1+a2)+b/b1` correctly parses as:
```
a
├── a1
└── a2
b
└── b1
```

```html
<!-- Correct: a1 and a2 are both children of a -->
<a href="a/(a1+a2)+b/b1">Complex Layout</a>

<!-- Nested grouping -->
<a href="layout/(header+content/(sidebar+main)+footer)">Full App</a>
```

## Viewport Targeting

Use `@` to specify which viewport should receive the component:

```html
<!-- Load products into the 'main' viewport -->
<a href="products@main">Products</a>

<!-- Load different components into different viewports -->
<a href="products@main+cart@sidebar">Products with Cart</a>
```

```typescript
router.load('products@main');

// Equivalent object syntax:
router.load({ component: 'products', viewport: 'main' });
```

### Combining with Child Routes

```html
<!-- Products in main viewport, then details as child -->
<a href="products@main/details">Product Details</a>

<!-- Complex nested viewport targeting -->
<a href="dashboard@main/analytics@content+summary@sidebar">Dashboard View</a>
```

## Inline Parameters

Pass parameters directly in the path using parentheses:

```html
<!-- Single parameter -->
<a href="product(id=42)">Product 42</a>

<!-- Multiple parameters -->
<a href="product(id=42,color=red)">Red Product 42</a>

<!-- Parameter without key (positional) -->
<a href="product(42)">Product 42</a>
```

```typescript
router.load('product(id=42)');

// Equivalent object syntax:
router.load({ component: 'product', params: { id: '42' } });
```

### With Viewport Targeting

```html
<a href="product(id=42)@main">Product in Main</a>
<a href="product(id=42)@main+cart(items=3)@sidebar">Product and Cart</a>
```

## Dynamic Path Parameters

### Single-Segment Parameters (`:param`)

Matches exactly one path segment:

```typescript
// Route configuration
@route({
  routes: [
    { path: 'users/:id', component: UserDetail },
    { path: 'users/:id/posts/:postId', component: PostDetail }
  ]
})
```

```html
<!-- Matches users/123, users/abc, etc. -->
<a href="users/123">User 123</a>

<!-- Matches users/123/posts/456 -->
<a href="users/123/posts/456">Post 456</a>
```

### Multi-Segment Parameters (`*param`)

Matches one or more path segments (wildcard):

```typescript
// Route configuration
@route({
  routes: [
    { path: 'files/*path', component: FileViewer }
  ]
})
```

```html
<!-- Matches files/docs, files/docs/readme.md, files/src/app/main.ts -->
<a href="files/docs/readme.md">View Readme</a>
```

### Optional Parameters (`:param?`)

Parameters can be made optional in route configuration:

```typescript
@route({
  routes: [
    { path: 'search/:query?', component: Search }
  ]
})
```

```html
<!-- Both work -->
<a href="search">Search (no query)</a>
<a href="search/aurelia">Search for Aurelia</a>
```

### Constrained Parameters

Use regex constraints in route configuration:

```typescript
@route({
  routes: [
    // Only match numeric IDs
    { path: 'orders/:id{{^\\d+$}}', component: OrderDetail }
  ]
})
```

## Query Strings

Append query parameters with `?`:

```html
<a href="search?q=aurelia&page=2">Search Results</a>
<a href="products?category=electronics&sort=price">Electronics</a>
```

```typescript
// Using path string
router.load('search?q=aurelia&page=2');

// Using options (preferred)
router.load('search', {
  queryParams: { q: 'aurelia', page: '2' }
});
```

### Combining with Other Syntax

```html
<!-- Query with child routes -->
<a href="users/123/posts?sort=date">User's Posts</a>

<!-- Query with siblings -->
<a href="list+detail?id=42">List and Detail</a>

<!-- Query with viewports -->
<a href="products@main?category=books">Books</a>
```

## URL Fragments

Append hash fragments with `#`:

```html
<a href="docs#installation">Jump to Installation</a>
<a href="article/123#comments">Article Comments</a>
```

```typescript
router.load('docs', { fragment: 'installation' });
```

### Combining Query and Fragment

```html
<a href="docs?version=2#api-reference">API Reference for v2</a>
```

```typescript
router.load('docs', {
  queryParams: { version: '2' },
  fragment: 'api-reference'
});
```

## Relative Navigation

### Current Directory (`./`)

Navigate relative to current route:

```html
<a href="./">Current Route</a>
<a href="./sibling">Sibling Component</a>
```

### Parent Directory (`../`)

Navigate up one level:

```html
<a href="../">Parent Route</a>
<a href="../sibling">Parent's Sibling</a>
<a href="../../">Grandparent</a>
```

```typescript
// Navigate to parent's sibling
router.load('../settings', { context: this.routeContext });
```

## Scope Modifier (`!`)

The `!` suffix marks a segment as "unscoped", preventing child routes from inheriting its context:

```html
<a href="modal!+content">Modal doesn't scope content</a>
```

This is an advanced feature used in specific multi-viewport scenarios.

## Reserved Characters

The following characters have special meaning and cannot be used literally in component or viewport names:

| Character | Meaning |
|-----------|---------|
| `/` | Child route separator |
| `+` | Sibling route separator |
| `@` | Viewport separator |
| `(` `)` | Grouping / parameters |
| `?` | Query string start |
| `#` | Fragment start |
| `=` | Parameter value assignment |
| `,` | Parameter separator |
| `!` | Scope modifier |

To use these characters in parameter values, URL-encode them:
- `/` → `%2F`
- `+` → `%2B`
- `@` → `%40`

## Complete Examples

### E-commerce Application

```html
<!-- Product listing with filters -->
<a href="products?category=electronics&sort=price">Electronics by Price</a>

<!-- Product detail with related products sidebar -->
<a href="product(id=123)@main+related(productId=123)@sidebar">Product 123</a>

<!-- Checkout flow -->
<a href="checkout/shipping">Shipping</a>
<a href="checkout/payment">Payment</a>
<a href="checkout/review">Review Order</a>
```

### Dashboard Application

```html
<!-- Multi-pane dashboard -->
<a href="dashboard/(metrics+charts)@main+alerts@sidebar">Full Dashboard</a>

<!-- Drill-down from list to detail -->
<a href="reports/sales/2024/q1">Q1 2024 Sales Report</a>

<!-- Modal over current view -->
<a href="+settings@modal">Open Settings</a>
```

### Documentation Site

```html
<!-- Documentation with section anchor -->
<a href="docs/router/configuration#base-path">Router Base Path</a>

<!-- API reference with version -->
<a href="api/router?version=2.0#IRouter">IRouter Interface</a>

<!-- File browser -->
<a href="files/src/components/app.ts">View App Component</a>
```

## Programmatic Equivalents

Every path expression can be written as an object or array:

```typescript
// Path: products(id=42)@main/details
router.load({
  component: 'products',
  params: { id: '42' },
  viewport: 'main',
  children: [{ component: 'details' }]
});

// Path: list+detail
router.load([
  { component: 'list' },
  { component: 'detail' }
]);

// Path: dashboard/(chart+table)@main
router.load({
  component: 'dashboard',
  viewport: 'main',
  children: [
    { component: 'chart' },
    { component: 'table' }
  ]
});
```

## Tips and Best Practices

1. **Use route IDs for complex paths**: Instead of hardcoding paths, use route IDs with the `load` attribute:
   ```html
   <a load="route: product-detail; params.bind: { id: item.id }">View</a>
   ```

2. **Prefer object syntax for dynamic navigation**: It's more readable and type-safe:
   ```typescript
   router.load({ component: ProductDetail, params: { id } });
   ```

3. **Use relative navigation in nested routes**: Keeps child routes decoupled from parents:
   ```typescript
   router.load('../settings', { context: this.routeContext });
   ```

4. **Validate parameters in `canLoad`**: Don't rely solely on path constraints:
   ```typescript
   canLoad(params) {
     if (!params.id || isNaN(Number(params.id))) {
       return 'not-found';
     }
     return true;
   }
   ```
