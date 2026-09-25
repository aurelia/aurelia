---
description: Learn about viewports in Aurelia router and how to create complex layouts with hierarchical and sibling viewports.
---

# Viewports

{% hint style="info" %}
**Bundler note:** These examples import '.html' files as raw strings (showing '?raw' for Vite/esbuild). Configure your bundler as described in [Importing external HTML templates with bundlers](../components/components.md#importing-external-html-templates-with-bundlers) so the imports resolve to strings on Webpack, Parcel, etc.
{% endhint %}

An `<au-viewport>` is where the router renders a routed component. A layout can have a single viewport for its page or several viewports for panels that navigate independently. Routed components can declare their own viewports too, so a nested page can change within the same layout.

## Viewport Concepts Overview

| Concept | Description | Use Case |
|---------|-------------|----------|
| **Single Viewport** | One content area | Simple page navigation |
| **Hierarchical Viewports** | Parent-child relationships | Master-detail layouts, nested navigation |
| **Sibling Viewports** | Multiple viewports at same level | Multi-panel dashboards, split layouts |
| **Named Viewports** | Explicitly named outlets | Target specific content areas |

## Viewport Configuration Options

The `<au-viewport>` element supports several configuration attributes:

```html
<au-viewport
  name="main"
  used-by="home-page,not-found"
  default="home"
  fallback="not-found">
</au-viewport>
```

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Identifier within the owning routing context; defaults to `default` |
| `used-by` | `string` | Comma-separated custom element names that this viewport accepts |
| `default` | `string` or bound `null` | Default route; `default.bind="null"` leaves an untargeted viewport empty |
| `fallback` | `string \| function` | Handles unknown routes or components |

## Hierarchical routing

As shown in the [getting started tutorial](./getting-started.md), a component can define child routes with [the `@route` decorator or static properties](./configuring-routes.md#route-configuration-basics). Each child can define routes of its own, forming a hierarchy.

In this example, clicking a link in a product list displays that product's details:

```
+--------------------------------------------------------------------+
|                                                                    |
|   Root-Viewport                                                    |
|   +                                                                |
|   |                                                                |
|   |  +---------------------------------------------------------+   |
|   +->+                                                         |   |
|      |   Products                                              |   |
|      |                                                         |   |
|      |   +-------------+     Child-Viewport                    |   |
|      |                       +                                 |   |
|      |   +-------------+     |                                 |   |
|      |                       |  +--------------------------+   |   |
|      |   +-------------+     +->+                          |   |   |
|      |                          |    Product details       |   |   |
|      |   +-------------+        |                          |   |   |
|      |                          |                          |   |   |
|      |   +-------------+        |                          |   |   |
|      |                          |                          |   |   |
|      |   +-------------+        |                          |   |   |
|      |                          |                          |   |   |
|      |   +-------------+        |                          |   |   |
|      |                          +--------------------------+   |   |
|      +---------------------------------------------------------+   |
+--------------------------------------------------------------------+

```

The root component's viewport hosts the list. A child viewport inside the list hosts the product details.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import { route } from '@aurelia/router';
import template from './my-app.html?raw';
import { Products } from './products';

@route({
  routes: [
    { path: '', redirectTo: 'products' },
    {
      path: 'products',
      component: Products,
    },
  ],
})
@customElement({ name: 'my-app', template })
export class MyApp {}
```
{% endtab %}
{% tab title="my-app.html" %}
```html
<nav>
  <a load="products">Products</a>
</nav>

<au-viewport></au-viewport> <!-- the root viewport -->
```
{% endtab %}
{% endtabs %}

The root configures one route and one viewport for `Products`. The `Products` component then defines the child route and viewport for the details:

{% tabs %}
{% tab title="products.ts" %}
```typescript
import { route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { Product } from './product';
import { IProductService, ProductDetail } from './product-service';
import template from './products.html?raw';

// child route configuration
@route({
  routes: [
    {
      id: 'product',
      path: ':id/details',
      component: Product,
    },
  ],
})
@customElement({ name: 'pro-ducts', template })
export class Products {
  promise: Promise<ProductDetail[]> = resolve(IProductService).getAll();
}
```
{% endtab %}
{% tab title="products.html" %}
```html
<style>
  div.content {
    display: flex;
    gap: 1rem;
    padding: 1rem;
  }
</style>

<div class="content">
  <div promise.bind="promise">
    <span pending>Fetching products...</span>
    <div then.bind="data">
      Fetched ${data.length} products
      <ul>
        <li repeat.for="item of data">
          <a href="${item.id}/details">${item.title}</a>
        </li>
      </ul>
    </div>
  </div>

  <au-viewport></au-viewport> <!-- the child viewport -->
</div>
```
{% endtab %}
{% endtabs %}

The routing pieces are the route configuration and the two viewports. `IProductService` supplies the sample data, and the styles place the list and details side by side. Try the complete example below:

{% embed url="https://stackblitz.com/edit/router-lite-hierarchical-viewport?ctl=1&embed=1&file=src/my-app.ts" %}

Open the example in a new tab to see the URL change. Selecting product 42 produces `/products/42/details`. A direct visit to that address opens the same product details, so users can share the link.

## Sibling viewports

Sibling viewports share a parent routing context. Let's adapt the previous product example so the list and details are displayed in two viewports owned by the root:

```
+--------------------------------------------------------------------+
|                                                                    |
|   Viewport#1                      Viewport#2                       |
|   +                               +                                |
|   |                               |                                |
|   |  +------------------------+   |  +------------------------+    |
|   +->+                        |   +->+                        |    |
|      |   Products' List       |      |    Product details     |    |
|      |                        |      |                        |    |
|      |                        |      |                        |    |
|      |   +-------------+      |      |                        |    |
|      |                        |      |                        |    |
|      |   +-------------+      |      |                        |    |
|      |                        |      |                        |    |
|      |   +-------------+      |      |                        |    |
|      |                        |      |                        |    |
|      |   +-------------+      |      |                        |    |
|      |                        |      |                        |    |
|      +------------------------+      +------------------------+    |
+--------------------------------------------------------------------+
```

The root component owns two viewports: one for the product list and one for the selected product's details. It configures both routes:

{% code title="my-app.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import { route } from '@aurelia/router';
import template from './my-app.html?raw';
import { Products } from './products';
import { Product } from './product';

@route({
  routes: [
    {
      id: 'products',
      path: ['', 'products'],
      component: Products,
    },
    {
      id: 'details',
      path: 'details/:id',
      component: Product,
    },
  ],
})
@customElement({ name: 'my-app', template })
export class MyApp {}
```
{% endcode %}

With both routes configured, the next step is to add two viewports to the root template:

{% code title="my-app.html" %}
```html
<style>
  div.content {
    display: flex;
    gap: 1rem;
    padding: 1rem;
  }
</style>

<nav>
  <a load="products">Products</a>
</nav>

<div class="content">
  <au-viewport></au-viewport>
  <au-viewport></au-viewport>
</div>
```
{% endcode %}

Before wiring up product selection, try this intermediate version. Both viewports show the product list, so the next step is to adjust their defaults:

{% embed url="https://stackblitz.com/edit/router-lite-sibling-viewport-duplicate?ctl=1&embed=1&file=src/my-app.html" %}

Each viewport's [`default` attribute](#specify-a-default-component-for-a-viewport) defaults to `''`, so both load the route configured for the empty path. In a layout with one viewport, this conveniently opens the default page without any extra viewport configuration. Here, we want only the first viewport to load the list.

Bind the second viewport's `default` to `null` to leave it empty until a navigation targets it:

{% code title="my-app.html" %}
```diff
  <div class="content">
-   <au-viewport></au-viewport>
-   <au-viewport></au-viewport>
+   <!-- instruct the router to load the products component by default -->
+   <au-viewport default="products"></au-viewport>
+   <au-viewport default.bind="null"></au-viewport>
  </div>
```
{% endcode %}

Run the updated example to check that the list appears once and the second viewport starts empty:

{% embed url="https://stackblitz.com/edit/router-lite-sibling-viewport-no-duplicate?ctl=1&embed=1&file=src/my-app.html" %}

The layout is ready, but the product links still need a way to select the second viewport. [Give each viewport a name](#named-viewports) so the links can target it explicitly:

{% code title="my-app.html" %}
```diff
  <div class="content">
    <!-- instruct the router to load the products component by default -->
-   <au-viewport default="products"></au-viewport>
-   <au-viewport default.bind="null"></au-viewport>
+   <au-viewport name="list" default="products"></au-viewport>
+   <au-viewport name="details" default.bind="null"></au-viewport>
  </div>
```
{% endcode %}

These names are application-defined. Finally, use the [`load` attribute](./navigating.md#using-the-load-custom-attribute) in `Products` to open the selected product in `details`:

{% code title="products.html" %}
```diff
  <ul>
    <li repeat.for="item of data">
-     <a href="#">${item.title}</a>
+     <a load="route.bind:{component:'details', params: {id: item.id}, viewport:'details'}; context.bind:null">${item.title}</a>
    </li>
  </ul>
```
{% endcode %}

Each link loads the `details` route with the current item's `id`, targeting the `details` viewport. `context.bind:null` selects the root context, which owns both viewports. See the [`load` documentation](./navigating.md#using-the-load-custom-attribute) for more about choosing a context.

In the completed example below, select a product to load its details beside the list:

{% embed url="https://stackblitz.com/edit/router-lite-sibling-viewport?ctl=1&embed=1&file=src/products.html" %}

Open the example in a new tab to see the generated URL. Selecting product 42 produces `/details/42@details+products@list`.

## Named viewports

The `name` attribute identifies a viewport within its routing context, as shown in [the sibling viewports example](#sibling-viewports). Names are useful when several [sibling viewports](#sibling-viewports) can accept a route. The attribute is optional and defaults to `'default'`.

This layout names its viewports `main` and `sidebar`:

```html
<main>
    <au-viewport name="main"></au-viewport>
</main>
<aside>
    <au-viewport name="sidebar"></au-viewport>
</aside>
```

### Using viewport name for routing instructions

An instruction can target a viewport by name:

```
{path}@{viewport-name}
```

The live example below shows this.

{% embed url="https://stackblitz.com/edit/router-lite-named-viewport?ctl=1&embed=1&file=src/my-app.html" %}

The example's links use these `load` instructions:

```html
<a load="products@list+details/${id}@details">Load products@list+details/${id}@details</a>
<a load="details/${id}@details">Load details/${id}@details</a>
```

The first link targets both sibling viewports. The second targets only `details`. Both are written in the component that owns those viewports.

A link inside the rendered `Products` component starts in that component's context. Select the parent context to reach the sibling details viewport:

```html
<a load="route.bind: { component: '../details', params: { id: item.id }, viewport: 'details' }">
  ${item.title}
</a>
```

The parameter object keeps dynamic values separate from `@` and `+` syntax. To target sibling viewports programmatically, use `IContextRouter.load()` in their owner, or select the owning context explicitly. Viewport names are local to that context.

[Application URL navigation](./application-url-navigation.md) uses the complete application URL as its base. To update a particular panel, use an instruction from the context that owns it.

{% hint style="info" %}
See [Navigating](./navigating.md) for the supported instruction forms.
{% endhint %}

### Specifying a viewport name on a route

Put `viewport` in the route configuration when a route belongs in a particular region of the layout. Links can then name the route without repeating its viewport. When neither the instruction nor the route selects a viewport, the router chooses an available viewport that accepts the component.

```typescript
import { route } from '@aurelia/router';
import { Products } from './products';
import { Product } from './product';

@route({
  routes: [
    {
      id: 'products',
      path: 'products',
      component: Products,
      viewport: 'list',
    },
    {
      id: 'details',
      path: 'details/:id',
      component: Product,
      viewport: 'details',
    },
  ],
})
export class MyApp {}
```

This configuration loads `Products` into `list` and `Product` into `details`:

{% embed url="https://stackblitz.com/edit/router-lite-named-viewport-route-config?ctl=1&embed=1&file=src/my-app.ts" %}

The links can now omit the viewport names:

```html
<nav>
  <!-- clicking this will load the products into the 'list' viewport -->
  <a load="products">products</a>
  <!-- clicking this will load the products into the 'list' viewport and the details of product #3 into the 'details' viewport -->
  <a load="products+details/3">products+details/3</a>
  <!-- same as above; but shows that the sibling order does not matter -->
  <a load="details/4+products">details/4+products</a>
</nav>
```

## Reserve viewports for components using `used-by`

Set `used-by` to restrict which components a viewport accepts. It complements the route's [`viewport` option](#specifying-a-viewport-name-on-a-route), which specifies where that route loads:

```html
<au-viewport used-by="ce-two"></au-viewport>
<au-viewport used-by="ce-one"></au-viewport>
```

The first viewport accepts only `ce-two`, and the second accepts only `ce-one`. Click the links in the example to see which viewport loads each component:

{% embed url="https://stackblitz.com/edit/router-lite-viewport-used-by?ctl=1&embed=1&file=src/my-app.ts" %}

To accept several components, separate their names with commas:

```html
<au-viewport used-by="ce-one,ce-two"></au-viewport>
<au-viewport used-by="ce-one"></au-viewport>
```

The live example below uses both names:

{% embed url="https://stackblitz.com/edit/router-lite-viewport-used-by-multiple-values?ctl=1&embed=1&file=src/my-app.ts" %}

`used-by` restricts this viewport; the component can still load into another viewport that accepts it. In this example, the first viewport has no `used-by` restriction and can load either component. Set the route's [`viewport` option](#specifying-a-viewport-name-on-a-route) to choose its default target.

{% embed url="https://stackblitz.com/edit/router-lite-viewport-used-by-with-default?ctl=1&embed=1&file=src/my-app.ts" %}

Clicking either link loads its component into the first available viewport.

## Specify a default component for a viewport

An empty viewport loads its `default` route when no navigation instruction targets it. The attribute defaults to `''`, so it loads the route for the empty path if one is configured. The [sibling viewports example](#sibling-viewports) shows this behavior.

Set `default` to another path to choose a different initial component. These four viewports load their respective defaults when the application starts:

```html
<div class="content">

  <!-- loads the empty route -->
  <au-viewport></au-viewport>

  <!-- loads the ce-two with parameter -->
  <au-viewport default="foo/42"></au-viewport>

  <!-- loads the ce-one -->
  <au-viewport default="ce-one"></au-viewport>

  <!-- loads the ce-two without parameter -->
  <au-viewport default="foo"></au-viewport>

</div>
```

The example below shows this in action.

{% embed url="https://stackblitz.com/edit/router-lite-viewport-default?ctl=1&embed=1&file=src/my-app.ts" %}

Bind `default` to `null` to leave an untargeted viewport empty. With multiple viewports, this lets you choose which one initially loads the route for the empty path. See [sibling viewports](#sibling-viewports) for an example.

## Specify a fallback component for a viewport

When the router cannot recognize a route, it loads a fallback if one is configured. You can set `fallback` in the [route configuration](./configuring-routes.md#fallback-redirecting-the-unknown-path) or on an individual `<au-viewport>`. The viewport attribute takes precedence:

{% embed url="https://stackblitz.com/edit/router-lite-viewport-fallback?ctl=1&embed=1&file=src/my-app.html" %}

`fallback` also accepts a function. This example selects `NF1` for the unknown path `/foo` and `NF2` for every other unknown path:

```typescript
import { customElement } from '@aurelia/runtime-html';
import {
  IRouteContext,
  ITypedNavigationInstruction_string,
  route,
  RouteNode,
  ViewportInstruction,
} from '@aurelia/router';
import template from './my-app.html?raw';

@customElement({ name: 'ce-a', template: 'a' })
class A {}

@customElement({ name: 'n-f-1', template: 'nf1' })
class NF1 {}

@customElement({ name: 'n-f-2', template: 'nf2' })
class NF2 {}

@route({
  routes: [
    { id: 'r1', path: ['', 'a'], component: A },
    { id: 'r2', path: ['nf1'], component: NF1 },
    { id: 'r3', path: ['nf2'], component: NF2 },
  ],
})
@customElement({
  name: 'my-app',
  template: `<nav>
  <a href="a">A</a>
  <a href="foo">Foo</a>
  <a href="bar">Bar</a>
</nav>

<au-viewport fallback.bind></au-viewport>`
})
export class MyApp {
  fallback(vi: ViewportInstruction, _rn: RouteNode, _ctx: IRouteContext): string {
    return (vi.component as ITypedNavigationInstruction_string).value === 'foo' ? 'r2' : 'r3';
  }
}
```

You can also see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-fallback-using-function-vafyn8?ctl=1&embed=1&file=src/my-app.html" %}

## Advanced Viewport Patterns

### Multi-Panel Dashboard Layout

Give each route an explicit viewport when a dashboard has several regions. Defaults establish the initial layout; a viewport with `default.bind="null"` stays empty until targeted.

```typescript
import { route } from '@aurelia/router';

@route({
  routes: [
    { path: 'navigation', component: () => import('./dashboard-nav'), viewport: 'sidebar' },
    { path: 'overview', component: () => import('./overview'), viewport: 'main' },
    { path: 'analytics', component: () => import('./analytics'), viewport: 'main' },
    { path: 'help', component: () => import('./help-panel'), viewport: 'help' },
  ],
})
export class Dashboard {}
```

```html
<nav aria-label="Dashboard">
  <a load="overview">Overview</a>
  <a load="analytics">Analytics</a>
  <a load="help">Help</a>
</nav>

<div class="dashboard-layout">
  <aside><au-viewport name="sidebar" default="navigation"></au-viewport></aside>
  <main><au-viewport name="main" default="overview"></au-viewport></main>
  <aside><au-viewport name="help" default.bind="null"></au-viewport></aside>
</div>
```

Opening Analytics targets `main`, as specified in its route configuration. These links begin in the dashboard's routing context.

### Conditional Viewport Rendering

An instruction needs an available viewport that can accept its target. When `if.bind` removes a viewport, make sure the condition is true and the viewport has rendered before navigating into it.

Keep the viewport in place when different pages occupy the same region. Enforce access in [routing guards](./routing-lifecycle.md); hiding a link or conditionally rendering a viewport does not protect the route.

### Dynamic Viewport Creation

Use named viewports when users should be able to reopen a set of panels from its URL or with Back/Forward. Use [dynamic composition](../getting-to-know-aurelia/dynamic-composition.md) when the application controls which panels are open independently of navigation.

When creating viewports through a repeater or conditional template, give them stable names in the owning context and wait until they are available before navigating into them. Test a direct visit to the resulting URL: the application must recreate the viewports needed to display it.

### Layout with Auxiliary Content Areas

Target auxiliary content in the same navigation as its main page when the two should change together:

```typescript
await contextRouter.load([
  { component: 'documents', viewport: 'main' },
  { component: 'document-tools', viewport: 'tools' },
  { component: 'outline', viewport: 'sidebar' },
]);
```

A tools-only action can target just `tools` from the same owning context:

```typescript
await contextRouter.load({ component: 'inspector', viewport: 'tools' });
```

CSS can hide a panel while keeping its routed component alive. `default.bind="null"` prevents an empty, untargeted viewport from loading its default route; it does not clear an already loaded panel. Decide whether closing the region should also navigate, then check that Back/Forward behaves as expected.

### Responsive Viewport Layouts

When desktop and mobile show the same routed content, keep the viewports in place and rearrange them with CSS:

```html
<div class="workspace-layout">
  <main><au-viewport name="main" default="content"></au-viewport></main>
  <aside><au-viewport name="sidebar" default="summary"></au-viewport></aside>
</div>
```

```css
.workspace-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: 1rem;
}

@media (max-width: 48rem) {
  .workspace-layout {
    grid-template-columns: 1fr;
  }
}
```

If mobile needs a different route layout, test direct entry into each layout and resize the window while a child is active. Removing and recreating a viewport runs component lifecycles, which may affect the page's state.

## Best Practices for Viewports

### Viewport Naming Conventions

Choose names that identify regions in the owning layout, such as `main`, `list`, `details`, or `tools`. Each layout can use those same names in its own context. Use explicit names when several viewports can accept a route, and `used-by` to limit which components a viewport accepts.

### Performance Considerations

Lazy-load components whose code is not needed at startup. Use [transition plans](./transition-plans.md) to control whether revisiting a route reuses or replaces its component. A component hidden by CSS is still alive; setting `fallback=""` does not release it.

Use `default.bind="null"` for optional viewports that should begin empty:

```html
<au-viewport name="optional-panel" default.bind="null"></au-viewport>
```

### Error Handling

A viewport fallback handles an unrecognized route. It is not a general catch for errors thrown while fetching data or activating a component.

```html
<au-viewport name="main" default="home" fallback="not-found"></au-viewport>
```

Register the fallback destination in the relevant route context. See [error handling](./error-handling.md) for help recovering from a failed or canceled navigation.
