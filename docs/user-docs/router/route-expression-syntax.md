---
description: Reference for contextual routing instructions, including child and sibling routes, named viewports, parameters, and reserved characters.
---

# Route Expression Syntax

Routing expressions describe which routes to load, how they nest, and which viewports receive them. Use them with `load`, the router-managed `href` attribute, `IRouter.load()`, or `IContextRouter.load()`.

Expressions start from a **routing context**. For references relative to the current application URL, use [`navigate()` or `url`](./application-url-navigation.md). Those APIs also recognize serialized viewport syntax. Their `../` follows URL segments; in a contextual instruction, it selects a parent routing context.

## Quick Reference

| Syntax | Meaning | Example |
| --- | --- | --- |
| `route` | Resolve a route ID or path in the selected context | `products` |
| `/route` | Select the application routing root | `/dashboard` |
| `./route` | Stay in the current routing context | `./settings` |
| `../route` | Select the parent routing context | `../settings` |
| `..` or `../` | Select the parent context and its default route | `../` |
| `a/b` | Continue a path; route configuration determines where a child context begins | `users/42/settings` |
| `a+b` | Load sibling routes | `list+detail` |
| `(a+b)` | Group sibling instructions under a parent | `dashboard/(chart+table)` |
| `@viewport` | Target a named viewport | `products@main` |
| `(params)` | Supply inline parameters | `product(id=42)` |
| `?query` | Set query parameters for the navigation | `search?q=aurelia` |
| `#fragment` | Set the route fragment | `docs#section-1` |

The `:id`, `:id?`, and `*path` forms belong in **route configuration**. Navigate with the actual values: a route configured as `users/:id` accepts a path such as `users/42`.

## Grammar

The following grammar shows the principal authoring forms. A name or parameter value must escape reserved punctuation; see [reserved characters](#reserved-characters). Query and fragment data are parsed separately from the routing expression.

```text
route             := [ '/' ] composite_segment [ '?' query ] [ '#' fragment ]
composite_segment := scoped_segment { '+' scoped_segment }
scoped_segment    := segment_group [ '/' scoped_segment ]
segment_group     := '(' composite_segment ')' | segment
segment           := component [ '@' viewport_name ]
component         := component_name [ '(' parameter_list ')' ] | '.' | '..'
parameter_list    := parameter { ',' parameter }
parameter         := parameter_name '=' parameter_value | parameter_value
```

An empty instruction selects the context's default route. Leading `.` and `..` segments select the context before the remaining instruction is resolved. The parser also accepts a leading `+` and a `!` suffix, but they do not provide append or unscoped-navigation behavior; see the sections below.

## Basic Navigation

### Component Names

A string can identify a configured route by ID or by path:

```html
<a load="products">Products</a>
<a href="about">About</a>
```

```typescript
await contextRouter.load('products'); // IContextRouter: this component's context
await router.load('about');          // IRouter: the root context
```

Route IDs take precedence when an ID can resolve the instruction. Avoid giving one route an ID that is another route's literal path in the same context. Development warning **AUR3179** reports single-segment collisions the router can identify. The ID still takes precedence. See [configuring routes](./configuring-routes.md).

### Absolute vs Relative Paths

A leading `/` selects the routing root. Without it, template attributes use their owning context; `IRouter.load()` uses the root unless a context is supplied.

```html
<a load="/dashboard">Dashboard</a>
<a load="settings">This layout's settings</a>
```

```typescript
await router.load('settings', { context: routeContext });
```

This leading `/` is an application-root instruction. It does not include the deployment prefix or the outer hash-routing marker.

## Child Routes (Hierarchical Navigation)

Use `/` to continue through a route and its descendants:

```html
<a load="users/profile">User profile</a>
<a load="admin/users/42/edit">Edit user 42</a>
```

Route configuration determines where each component begins. For example, `users/:id/edit` can be the path of a single route. When a route owns child routes, the router resolves the rest of the path in that child's routing context.

## Sibling Routes (Parallel Navigation)

Use `+` to load routes into sibling viewports in the same context:

```html
<a load="list@left+detail@right">Show list and detail</a>
```

```typescript
await contextRouter.load([
  { component: 'list', viewport: 'left' },
  { component: 'detail', viewport: 'right' },
]);
```

Viewport names are optional when route configuration or the available viewports determine the target. Explicit names keep the intended layout clear when several viewports could accept the same component. See [named viewports](./viewports.md#named-viewports).

### Append to Current Routes

A leading `+`, as in `+sidebar`, is accepted by the parser but does not enable a separate append operation. To update a particular sibling viewport, target it from the context that owns it:

```html
<a load="settings@sidebar">Settings</a>
```

Use one composed instruction or instruction array when several viewports should change together. The router updates the viewports that instruction targets.

## Grouping with Parentheses

`/` binds more tightly than `+`. Without grouping, `a/a1+a2+b/b1` describes:

```text
a
└── a1
a2
b
└── b1
```

To make both `a1` and `a2` children of `a`, write `a/(a1+a2)+b/b1`:

```text
a
├── a1
└── a2
b
└── b1
```

```html
<a load="dashboard@main/(chart@top+table@bottom)+alerts@sidebar">
  Dashboard with alerts
</a>
```

Attach a viewport name to the component it targets: `dashboard@main/(chart+table)`, not `dashboard/(chart+table)@main`.

## Viewport Targeting

`@` names the viewport that receives a route:

```html
<a load="products@main">Products</a>
<a load="products@main+cart@sidebar">Products with cart</a>
```

```typescript
await contextRouter.load({ component: 'products', viewport: 'main' });
```

### Combining with Child Routes

```html
<!-- Products goes into main; details goes into a viewport owned by Products. -->
<a load="products@main/details">Product details</a>

<!-- Analytics is a child of dashboard; summary is a sibling of dashboard. -->
<a load="dashboard@main/analytics@content+summary@sidebar">Dashboard</a>
```

Names select viewports within the relevant routing context. Other contexts can reuse those names.

## Inline Parameters

Append parameter values to the route name, before any viewport name:

```html
<a load="product(id=42)">Product 42</a>
<a load="product(id=42,color=red)">Red product 42</a>
<a load="product(42)">Product 42, positional parameter</a>
```

Named parameters show which value belongs to each parameter. You can also supply them as an object:

```typescript
await contextRouter.load({ component: 'product', params: { id: '42' } });
```

### With Viewport Targeting

```html
<a load="product(id=42)@main+cart(items=3)@sidebar">Product and cart</a>
```

Bind `params` for dynamic values so the router can encode any instruction punctuation they contain:

```html
<a load="route: product; params.bind: { id: productId }">View product</a>
```

## Dynamic Path Parameters

These forms declare the path a route recognizes. For details and lifecycle access, see [route parameters](./route-parameters.md).

### Single-Segment Parameters (`:param`)

```typescript
@route({
  routes: [
    { id: 'user', path: 'users/:id', component: UserDetail },
    { id: 'post', path: 'users/:id/posts/:postId', component: PostDetail },
  ],
})
```

Navigate with a path such as `users/123`, or let the route ID and parameters construct it:

```html
<a load="route: post; params.bind: { id: userId, postId: postId }">View post</a>
```

### Multi-Segment Parameters (`*param`)

A wildcard captures the remaining path, including `/` separators:

```typescript
{ path: 'files/*path', component: FileViewer }
```

```html
<a load="files/docs/readme.md">View readme</a>
```

### Optional Parameters (`:param?`)

In route configuration, `?` makes a parameter optional:

```typescript
{ path: 'search/:query?', component: Search }
```

Both `search` and `search/aurelia` match. In a navigation instruction, `?` starts the query string instead.

### Constrained Parameters

A route can constrain a dynamic segment:

```typescript
{ path: 'orders/:id{{^\\d+$}}', component: OrderDetail }
```

The doubled backslash belongs to the TypeScript string. The application must still check that the order exists and that the user may access it.

## Query Strings

Append a query with `?`, or pass `queryParams` as a navigation option:

```html
<a load="search?q=aurelia&page=2">Search results</a>
```

```typescript
await router.load('search', {
  queryParams: { q: 'aurelia', page: 2 },
});
```

A query change updates `ICurrentRoute.query`, but does not automatically rerun `loading()` on a reused component. When that hook owns the refresh, use a per-navigation `transitionPlan: 'invoke-lifecycles'`. A route-level transition plan alone does not override unchanged-path, unchanged-parameter reuse.

### Combining with Other Syntax

A query applies to the whole navigation, including sibling viewports:

```html
<a load="products@main+filters@sidebar?category=books">Books</a>
```

For query-only updates that retain selected existing parameters, see [application URL navigation](./application-url-navigation.md).

## URL Fragments

A `#` separates the fragment from the route address. For contextual navigation in either URL mode, pass it as a separate navigation option:

```typescript
await router.load('docs', { fragment: 'installation' });
```

The fragment is available on the `RouteNode` passed to lifecycle hooks, and on the completed navigation event's `finalInstructions`. The router does not automatically scroll to an element with that ID. Implement scrolling or focus behavior where the page owns the corresponding content.

In hash-routing mode, the route fragment is distinct from the outer `#/` used to carry the application address. A scalar contextual instruction containing `#` is interpreted as hash-form routing input, so `load('docs#installation')` is not a mode-independent way to navigate to `docs` with a fragment. Keep the fields separate as above, or use an [application URL reference](./application-url-navigation.md) with `navigate('/docs#installation')`.

### Combining Query and Fragment

```typescript
await router.load('docs', {
  queryParams: { version: '2' },
  fragment: 'api-reference',
});
```

## Relative Navigation

### Current Routing Context (`./`)

`settings` and `./settings` start in the same routing context. An empty instruction or `./` selects its default route.

```html
<a load="./">Overview</a>
<a load="./settings">Settings</a>
```

### Parent Routing Context (`../`)

Each leading `../` selects an ancestor context. Excess ascent stops at the root:

```html
<a load="../">Parent's default route</a>
<a load="../settings">Settings owned by the parent</a>
<a load="../../reports">Reports owned by the grandparent</a>
```

`..` also selects the parent default. These prefixes are meaningful at the start of a contextual instruction; do not use arbitrary internal `..` segments as if the expression were a filesystem path.

For a compound route such as `items/:id/details`, one `../` leaves the component's routing context even though its path consumes several segments. [`navigate('../summary')`](./application-url-navigation.md) instead resolves one URL segment up from the last completed application location.

In hash mode, legacy scalar strings that contain a hash are also interpreted as hash-form routing input. For parent navigation with a fragment, keep the fields separate: `contextRouter.load('..', { fragment: 'details' })`.

## Scope Modifier (`!`)

The parser accepts a `!` suffix, but it does not change the runtime instruction's scope. Do not use it to escape a context or prevent child-context creation. Choose a parent or root context explicitly, and use [named viewports](./viewports.md#named-viewports) to select sibling destinations.

## Reserved Characters

The expression parser reserves the following punctuation:

| Characters | Role |
| --- | --- |
| `/` | Path and child-instruction separator |
| `+` | Sibling-instruction separator |
| `@` | Viewport selector |
| `(` `)` | Grouping or inline parameters |
| `?` `#` | Query and fragment delimiters |
| `=` `,` | Inline parameter syntax |
| `!` | Accepted suffix; no scope-changing behavior |
| `&` `'` `~` `;` | Reserved; cannot appear unescaped in names or inline values |

Structured `params` take **original values**. The router encodes the values for serialization and decodes them on recognition. Pre-encoding changes the value: literal `%2B` is different from `+`.

```typescript
await router.load({
  component: 'document',
  params: { key: 'draft(100%)' },
});
```

When authoring a literal expression, encode data that would otherwise be syntax: `+` as `%2B`, `@` as `%40`, `(` as `%28`, and `/` inside a parameter value as `%2F`. `encodeURIComponent` alone leaves some router terminals unescaped, including parentheses, apostrophes, `!`, and `~`; structured parameters avoid that extra work.

Static configured paths need the same distinction. To give a route a literal `a+b` address segment, configure an encoded path such as `a%2Bb`, with a separate route ID if useful:

```typescript
{ id: 'comparison', path: 'a%2Bb', component: Comparison }
```

Development warning **AUR3180** reports unescaped router punctuation in static path segments. It does not rewrite the path or add an encoded alias: that address might already belong to another route. Check existing route definitions and bookmarks before changing it.

## Complete Examples

### E-commerce Application

```html
<a load="products?category=electronics&sort=price">Electronics by price</a>
<a load="product(id=123)@main+related(productId=123)@sidebar">Product 123</a>
<a load="checkout/shipping">Shipping</a>
```

### Dashboard Application

```html
<a load="dashboard@main/(metrics+charts)+alerts@sidebar">Dashboard</a>
<a load="settings@modal">Open settings in the modal viewport</a>
```

The application supplies the modal presentation and focus behavior; `@modal` selects the viewport.

### Documentation Site

```html
<a load="docs/router/configuration">Router configuration</a>
<a load="api/router?version=2">Router API for v2</a>
<a href="/downloads/router-guide.pdf" external>Download the guide</a>
```

## Programmatic Equivalents

Put each route's `params`, `viewport`, and `children` together in a structured instruction:

```typescript
// products(id=42)@main/details
await contextRouter.load({
  component: 'products',
  params: { id: '42' },
  viewport: 'main',
  children: [{ component: 'details' }],
});

// dashboard@main/(chart+table)
await contextRouter.load({
  component: 'dashboard',
  viewport: 'main',
  children: [
    { component: 'chart' },
    { component: 'table' },
  ],
});
```

## Tips and Best Practices

Use route IDs and structured parameters when links should follow route configuration. Use explicit viewport names when a layout has several possible targets. Keep the selected routing context with any generated path; [path generation](./navigating.md#path-generation) explains why generating `../sibling` consumes the parent prefix and affects where the result must be replayed.
