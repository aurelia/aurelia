---
description: Learn about viewports in Aurelia router and how to create complex layouts with hierarchical and sibling viewports.
---

# Viewports

{% hint style="info" %}
**Bundler note:** These examples import '.html' files as raw strings (showing '?raw' for Vite/esbuild). Configure your bundler as described in [Importing external HTML templates with bundlers](../components/components.md#importing-external-html-templates-with-bundlers) so the imports resolve to strings on Webpack, Parcel, etc.
{% endhint %}

Viewports are the foundation of Aurelia's routing system. The `<au-viewport>` element serves as the "outlet" where the router renders routed components. Understanding viewports is essential for creating complex application layouts with multiple content areas, nested routing, and dynamic UI structures.

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
  name="main"                    <!-- Viewport identifier -->
  used-by="specific-component"   <!-- Reserve for specific component -->
  default="home-component"       <!-- Default component to load -->
  fallback="not-found">          <!-- Fallback for unknown routes -->
</au-viewport>
```

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Unique identifier for targeting this viewport |
| `used-by` | `string` | Restricts viewport to specific component type |
| `default` | `string` | Component to load when viewport is empty |
| `fallback` | `string \| function` | Handles unknown routes or components |

## Hierarchical routing

As seen in the ["Getting started"-tutorial](./getting-started.md), a component can define a set of children routes (using [either the `@route` decorator or the static properties](./configuring-routes.md#route-configuration-basics)).
The child routes can also in turn define children routes of there own.
Such route configuration are commonly known as hierarchical route configuration.

To understand it better, let us consider an example.
We want to show a list of products, as links, and when a product link is clicked, we display the details of the product.

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

To this end we want a viewport on the root component which is used to host the list component.
The list component itself houses anther viewport, or more accurately a child viewport, which is then used to host the product details.

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

The route configuration for the root component consists of a single root for the list component and it also houses a single viewport.
The `Products` component defines its own child route configuration and houses a child viewport.
This is shown below.

{% tabs %}
{% tab title="products.ts" %}
```typescript
import { route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
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

The `IProductService` injected to the `Products` is just some service used to populate the product list and has very little relevance to the discussion related to the router.
And the extra style is added to display the list and the details side by side.
And that's pretty much all you need for a simple hierarchical routing configuration.
You can see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-hierarchical-viewport?ctl=1&embed=1&file=src/my-app.ts" %}

If you open the example in a new tab, you can see how the URL paths are constructed.
For example, when you click a product link, the URL is `/42/details` or `/products/42/details`.
This also means that when you try to navigate to that URL directly, the product details will be loaded from the start.
It essentially creates shareable URLs.

## Sibling viewports

Two viewports are called siblings if they are under one parent routing hierarchy.
Let us recreate the previous example but using sibling viewports this time.

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

To this end, we want to viewports, housed side-by-side on the root component.
We show the products' list on one viewport and the details of the selected product on the other one.

To this end, let us start with the routing configuration on the root component.

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

Two routes, one for the list another for the details, are configured on the route.
Next we need 2 viewports to on the root component.
Let us get that done.

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

Even though we are not yet done, you can check out our work so far in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-sibling-viewport-duplicate?ctl=1&embed=1&file=src/my-app.html" %}

If you run the example, you can immediately see a "problem" that both the viewports are loading the products' list.
Although it is not an error per se, with natural use-case in mind, you probably like to avoid that.
Let us fix this "problem" first.

This is happening due to the default value of the [`default` attribute](#specify-a-default-component-for-a-viewport) of the `<au-viewport>` that is set to `''` (empty string).
This default value enables loading the component associated with the empty path without any additional configuration.
This default behavior makes sense as the usage of a single viewport at every routing hierarchy might be prevalent.

However, we need a way to prevent this duplication.
To this end, we can bind `null` to the `default` attribute of a viewport, which instructs the router that this particular viewport should be left out when it is empty (that is no component is targeted to be loaded in this viewport).

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

You can see in the live example below that this fixes the duplication issue.

{% embed url="https://stackblitz.com/edit/router-lite-sibling-viewport-no-duplicate?ctl=1&embed=1&file=src/my-app.html" %}

We still need a way to load the product details on the second viewport.
Note that till now, the two viewports cannot be referentially differentiated from one another; that is if you want to load a component specifically on the first or on the second viewport, there is no way to do this for now.
To this end, we need to [name the viewports](#named-viewports).

{% code title="my-app.html" %}
```diff
  <div class="content">
-   <au-viewport></au-viewport>
-   <au-viewport default.bind="null"></au-viewport>
+   <au-viewport name="list" default="products"></au-viewport>
+   <au-viewport name="details" default.bind="null"></au-viewport>
  </div>
```
{% endcode %}

Although we name the viewports semantically, it is not necessary, and you are free to choose viewport names, as you like.
Lastly, we need to use the [`load` attribute](./navigating.md#using-the-load-custom-attribute) in the `Products` component to construct the URL, or more accurately the routing instruction correctly, such that the details of the product is loaded on the `details` viewport.

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

Using the `load` attribute we are instructing the router to load the `Product` (using the route-id `details`) component, with the `id` parameter of the route set to the `id` of the current `item` in the repeater, in the `details` viewport.
With the `context.bind:null`, we are instructing the router to perform this routing instruction on the root routing context (refer [the documentation](./navigating.md#using-the-load-custom-attribute) for the `load` attribute for more details).
Now, when someone clicks a product link the associated details are loaded in the `details` viewport.
You can see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-sibling-viewport?ctl=1&embed=1&file=src/products.html" %}

If you open the example in a new tab, you can see how the URL paths are constructed.
For example, when you click a product link, the URL is `/details/42@details+products@list`.

## Named viewports

As seen in [the sibling viewports example](#sibling-viewports), viewports can be named.
It is particularly useful when there are multiple [sibling viewports](#sibling-viewports) present.
Note that specifying a value for the `name` attribute of viewport is optional, and the default value is simply `'default'`.

In the following example, we have the `main` viewport for our main content and then another viewport called `sidebar` for our sidebar content.

```html
<main>
    <au-viewport name="main"></au-viewport>
</main>
<aside>
    <au-viewport name="sidebar"></au-viewport>
</aside>
```

### Using viewport name for routing instructions

The names can be used to instruct the router to load a specific component to a specific named viewport.
To this end the path syntax is as follows:

```
{path}@{viewport-name}
```

The live example below shows this.

{% embed url="https://stackblitz.com/edit/router-lite-named-viewport?ctl=1&embed=1&file=src/my-app.html" %}

Note the `load` attributes in the `anchor` elements.

```html
<a load="products@list+details/${id}@details">Load products@list+details/${id}@details</a>
<a load="details/${id}@details">Load details/${id}@details</a>
```

In the example, clicking the first anchor loads the `products` component in the `list` viewport and the details of the product with #{`id`} into the `details` viewport.
The second anchor facilitates loading only the the details of the product with #{`id`} into the `details` viewport.

{% hint style="info" %}
For more details about navigating and instructions for router, please refer the [documentation](./navigating.md).
{% endhint %}

### Specifying a viewport name on a route

By default, the routes/components are loaded into the first available viewport, when there is no viewport instruction is present.
However, the routes can also be configured, such that a configured route is allowed to be loaded only in a certain viewport.
This is useful when you know that a certain component needs to be loaded in a certain viewport, because in that case you can use the simple `{path}` instruction instead of the more verbose alternative, the `{path}@{viewport-name}` instruction.
To this end, use the `viewport` option of the [route configuration](./configuring-routes.md).

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

In this example, we are specifying that the `Products` component needs to be loaded into the `list` viewport and the `Product` component need to be loaded into the `details` viewport.
You can also see this in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-named-viewport-route-config?ctl=1&embed=1&file=src/my-app.ts" %}

Note the `anchor`s in the example that show that the viewport names can now be dropped from the routing instructions.

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

The `used-by` attribute on the `au-viewport` component can be thought of as (almost) the parallel of the [`viewport` configuration option](#specifying-a-viewport-name-on-a-route) on route configuration.
Using this property on a viewport, you can "reserve" a viewport for particular component(s).
In other words, you are instructing the router that no other components apart from those specified can be loaded into a viewport with `used-by` set.

```html
<au-viewport used-by="ce-two"></au-viewport>
<au-viewport used-by="ce-one"></au-viewport>
```

In this example, we are instructing the router to reserve the first viewport for `ce-two` custom element and the reserve the second viewport for `ce-one` custom element.
You can see this in the live example below, by clicking the links and observing how the components are loaded into the reserved viewports.

{% embed url="https://stackblitz.com/edit/router-lite-viewport-used-by?ctl=1&embed=1&file=src/my-app.ts" %}

You can reserve a viewport for more than one component.
To this end, you can use comma-separated values for the `used-by` attribute.

```html
<au-viewport used-by="ce-one,ce-two"></au-viewport>
<au-viewport used-by="ce-one"></au-viewport>
```

The live example below shows this in action

{% embed url="https://stackblitz.com/edit/router-lite-viewport-used-by-multiple-values?ctl=1&embed=1&file=src/my-app.ts" %}

Although the `used-by` attribute feels like a markup alternative of the [`viewport` configuration option](#specifying-a-viewport-name-on-a-route) on route configuration, there is a subtle difference.
Having the `used-by` property on a particular viewport set to `X` component, does not prevent a preceding viewport without any value for the `used-by` property to load the `X` component.
This is shown in action in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-viewport-used-by-with-default?ctl=1&embed=1&file=src/my-app.ts" %}

Note how clicking the links load the components also in the first viewport without any value for the `used-by`.

## Specify a default component for a viewport

When no route is loaded into a viewport, a 'default' route is loaded into the viewport.
For every viewport, such defaults can be configured using the `default` attribute.
It is optional to specify a value for this attribute and the empty string (`''`) is used as the default value for this property.
This explains why the route with empty path (when exists) is loaded into a viewport without the `default` attribute set, as seen in the [sibling viewports example](#sibling-viewports).

Another path can be used to override the default value of the `default` attribute.
The following example shows four viewports with varied values for the `default` attribute.
Whereas the first viewport might be the usual viewport with empty path, the other three specifies different default values.
These components are loaded into the viewport, by default when the application is started.

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

Note that `default` attribute can also be bound to `null`, to instruct the router not to load any component into ths viewport when no component is scheduled (either by explicit instruction of implicit availability check) to be loaded into the viewport.
This is useful when you have more than one viewports and you want to load the empty path (assuming it is configured) in a particular viewport.
In that case, you can bind `null` to the `default` attribute of the other viewport.
To see examples of this, please refer to the [sibling viewport](#sibling-viewports) section.

## Specify a fallback component for a viewport

If a route cannot be recognized, a fallback route is looked for and loaded (when configured) into the viewport.
Such fallback can be configured using the `fallback` property of the [route configuration](./configuring-routes.md#fallback-redirecting-the-unknown-path).
`au-viewport` also offers a similar `fallback` attribute, using which a fallback component can be configured for a particular viewport.
The `fallback` attribute is similar to its route configuration counterpart, with only one difference.
The `fallback` attribute in the `au-viewport`, when configured, always takes precedence over the `fallback` route configuration option.
This is shown in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-viewport-fallback?ctl=1&embed=1&file=src/my-app.html" %}

A function for the value of `fallback` is also supported.
An example looks like as follows, where the example redirects the user to `NF1` component if an attempt to load a path `/foo` is made.
Every other attempt to load an unknown path is results loading the `NF2` component.

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

Create complex dashboard layouts with multiple independent content areas:

```typescript
// dashboard.ts
import { route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';

@route({
  routes: [
    { path: 'overview', component: import('./overview'), viewport: 'main' },
    { path: 'analytics', component: import('./analytics'), viewport: 'main' },
    { path: 'settings', component: import('./settings'), viewport: 'main' },

    // Sidebar components
    { path: 'nav', component: import('./navigation'), viewport: 'sidebar' },
    { path: 'user-info', component: import('./user-info'), viewport: 'sidebar' },

    // Modal/overlay components
    { path: 'notifications', component: import('./notifications'), viewport: 'overlay' },
    { path: 'help', component: import('./help-overlay'), viewport: 'overlay' },
  ]
})
@customElement({
  name: 'dashboard',
  template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <au-viewport name="sidebar" default="nav"></au-viewport>
      </aside>

      <main class="main-content">
        <au-viewport name="main" default="overview"></au-viewport>
      </main>

      <div class="overlay-container">
        <au-viewport name="overlay" fallback=""></au-viewport>
      </div>
    </div>
  `
})
export class Dashboard {}
```

```css
/* dashboard.css */
.dashboard-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 1fr;
  height: 100vh;
  position: relative;
}

.sidebar {
  background: #f5f5f5;
  border-right: 1px solid #ddd;
}

.main-content {
  padding: 1rem;
  overflow-y: auto;
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

.overlay-container > * {
  pointer-events: auto;
}
```

### Conditional Viewport Rendering

Show different viewport configurations based on user permissions or application state:

```typescript
import { resolve } from '@aurelia/kernel';
import { customElement, observable } from '@aurelia/runtime-html';
import { route, IRouter } from '@aurelia/router';

interface UserService {
  currentUser: { role: string; permissions: string[] } | null;
  hasPermission(permission: string): boolean;
}

@route({
  routes: [
    { path: 'admin', component: import('./admin-panel'), viewport: 'admin' },
    { path: 'user', component: import('./user-panel'), viewport: 'user' },
    { path: 'public', component: import('./public-content'), viewport: 'main' },
  ]
})
@customElement({
  name: 'conditional-app',
  template: `
    <div class="app-container">
      <nav>
        <a href="public">Public</a>
        <a href="user" if.bind="isLoggedIn">User Area</a>
        <a href="admin" if.bind="isAdmin">Admin</a>
      </nav>

      <!-- Admin layout -->
      <div if.bind="isAdmin" class="admin-layout">
        <au-viewport name="admin" fallback="access-denied"></au-viewport>
      </div>

      <!-- User layout -->
      <div else-if.bind="isLoggedIn" class="user-layout">
        <au-viewport name="user" fallback="user-home"></au-viewport>
      </div>

      <!-- Public layout -->
      <div else class="public-layout">
        <au-viewport name="main" default="public"></au-viewport>
      </div>
    </div>
  `
})
export class ConditionalApp {
  private readonly userService: UserService = resolve(UserService);
  private readonly router: IRouter = resolve(IRouter);

  get isLoggedIn(): boolean {
    return this.userService.currentUser !== null;
  }

  get isAdmin(): boolean {
    return this.userService.hasPermission('admin');
  }
}
```

### Dynamic Viewport Creation

Create viewports dynamically based on configuration or user preferences:

```typescript
import { customElement, observable } from '@aurelia/runtime-html';
import { route } from '@aurelia/router';

interface PanelConfig {
  id: string;
  name: string;
  component: string;
  defaultSize: number;
}

@customElement({
  name: 'dynamic-layout',
  template: `
    <div class="dynamic-container">
      <div class="panel-controls">
        <button repeat.for="config of availablePanels"
                click.trigger="togglePanel(config)"
                class="\${activePanels.includes(config.id) ? 'active' : ''}">
          \${config.name}
        </button>
      </div>

      <div class="panels-container"
           style="grid-template-columns: \${gridTemplate}">
        <div repeat.for="panelId of activePanels"
             class="panel">
          <au-viewport name="\${panelId}"
                       default="\${getPanelComponent(panelId)}">
          </au-viewport>
        </div>
      </div>
    </div>
  `
})
export class DynamicLayout {
  @observable activePanels: string[] = ['main'];

  availablePanels: PanelConfig[] = [
    { id: 'main', name: 'Main Content', component: 'main-content', defaultSize: 2 },
    { id: 'sidebar', name: 'Sidebar', component: 'sidebar-content', defaultSize: 1 },
    { id: 'details', name: 'Details', component: 'details-panel', defaultSize: 1 },
    { id: 'tools', name: 'Tools', component: 'tools-panel', defaultSize: 1 },
  ];

  get gridTemplate(): string {
    return this.activePanels
      .map(id => this.getPanelSize(id) + 'fr')
      .join(' ');
  }

  togglePanel(config: PanelConfig): void {
    const index = this.activePanels.indexOf(config.id);
    if (index === -1) {
      this.activePanels.push(config.id);
    } else if (this.activePanels.length > 1) { // Keep at least one panel
      this.activePanels.splice(index, 1);
    }
  }

  getPanelComponent(panelId: string): string {
    return this.availablePanels.find(p => p.id === panelId)?.component || '';
  }

  getPanelSize(panelId: string): number {
    return this.availablePanels.find(p => p.id === panelId)?.defaultSize || 1;
  }
}
```

### Layout with Auxiliary Content Areas

Create layouts with auxiliary content areas that can show contextual information or tools:

```typescript
import { resolve } from '@aurelia/kernel';
import { customElement, observable } from '@aurelia/runtime-html';
import { route, IRouter } from '@aurelia/router';

@route({
  routes: [
    // Main content routes
    { path: 'documents', component: import('./documents'), viewport: 'main' },
    { path: 'projects', component: import('./projects'), viewport: 'main' },

    // Auxiliary content routes
    { path: 'document-tools', component: import('./document-tools'), viewport: 'tools' },
    { path: 'project-tools', component: import('./project-tools'), viewport: 'tools' },
    { path: 'inspector', component: import('./property-inspector'), viewport: 'sidebar' },
    { path: 'outline', component: import('./document-outline'), viewport: 'sidebar' },
  ]
})
@customElement({
  name: 'workspace-app',
  template: `
    <div class="workspace-layout">
      <header class="toolbar">
        <nav>
          <a href="documents">Documents</a>
          <a href="projects">Projects</a>
        </nav>
        <div class="tool-controls">
          <button click.trigger="showTools('document-tools')">Doc Tools</button>
          <button click.trigger="showSidebar('inspector')">Inspector</button>
          <button click.trigger="showSidebar('outline')">Outline</button>
        </div>
      </header>

      <main class="main-content">
        <au-viewport name="main" default="documents"></au-viewport>
      </main>

      <aside class="tools-panel \${showToolsPanel ? 'visible' : 'hidden'}">
        <au-viewport name="tools" fallback=""></au-viewport>
      </aside>

      <aside class="sidebar-panel \${showSidebarPanel ? 'visible' : 'hidden'}">
        <au-viewport name="sidebar" fallback=""></au-viewport>
      </aside>
    </div>
  `
})
export class WorkspaceApp {
  private readonly router: IRouter = resolve(IRouter);
  @observable showToolsPanel: boolean = false;
  @observable showSidebarPanel: boolean = false;

  async showTools(toolsRoute: string): Promise<void> {
    await this.router.load(toolsRoute);
    this.showToolsPanel = true;
  }

  async showSidebar(sidebarRoute: string): Promise<void> {
    await this.router.load(sidebarRoute);
    this.showSidebarPanel = true;
  }

  async hideTools(): Promise<void> {
    this.showToolsPanel = false;
  }

  async hideSidebar(): Promise<void> {
    this.showSidebarPanel = false;
  }
}
```

```css
/* modal.css */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.modal-backdrop.hidden {
  opacity: 0;
  pointer-events: none;
}

.modal-backdrop.visible {
  opacity: 1;
  pointer-events: auto;
}

.modal-container {
  background: white;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
```

### Responsive Viewport Layouts

Adapt viewport layouts based on screen size:

```typescript
import { customElement, observable } from '@aurelia/runtime-html';
import { route } from '@aurelia/router';

@route({
  routes: [
    { path: 'content', component: import('./main-content'), viewport: 'main' },
    { path: 'sidebar', component: import('./sidebar'), viewport: 'sidebar' },
    { path: 'mobile-menu', component: import('./mobile-menu'), viewport: 'mobile' },
  ]
})
@customElement({
  name: 'responsive-layout',
  template: `
    <div class="responsive-container \${layoutClass}">
      <!-- Desktop/Tablet Layout -->
      <div if.bind="!isMobile" class="desktop-layout">
        <aside class="sidebar">
          <au-viewport name="sidebar" default="sidebar"></au-viewport>
        </aside>
        <main class="main-content">
          <au-viewport name="main" default="content"></au-viewport>
        </main>
      </div>

      <!-- Mobile Layout -->
      <div if.bind="isMobile" class="mobile-layout">
        <header class="mobile-header">
          <button click.trigger="toggleMobileMenu()" class="menu-btn">
            ☰ Menu
          </button>
        </header>

        <main class="mobile-main">
          <au-viewport name="main" default="content"></au-viewport>
        </main>

        <div class="mobile-menu \${showMobileMenu ? 'open' : 'closed'}">
          <au-viewport name="mobile" default="mobile-menu"></au-viewport>
        </div>
      </div>
    </div>
  `
})
export class ResponsiveLayout {
  @observable isMobile: boolean = false;
  @observable showMobileMenu: boolean = false;

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  get layoutClass(): string {
    return this.isMobile ? 'mobile' : 'desktop';
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.showMobileMenu = false;
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
```

## Best Practices for Viewports

### Viewport Naming Conventions

Use consistent, descriptive names for your viewports:

```typescript
// ✅ Good naming
<au-viewport name="main-content"></au-viewport>
<au-viewport name="sidebar-navigation"></au-viewport>
<au-viewport name="modal-overlay"></au-viewport>
<au-viewport name="user-profile-details"></au-viewport>

// ❌ Avoid generic names when you have multiple viewports
<au-viewport name="viewport1"></au-viewport>
<au-viewport name="content"></au-viewport>
<au-viewport name="area"></au-viewport>
```

### Performance Considerations

1. **Lazy load viewport content** when possible:
```typescript
// Use dynamic imports for non-critical viewports
{ path: 'admin', component: () => import('./admin-panel'), viewport: 'admin' }
```

2. **Limit active viewports** to prevent memory issues:
```typescript
// Use fallback="" for optional viewports
<au-viewport name="optional-panel" fallback=""></au-viewport>
```

3. **Use appropriate transition plans** to control re-rendering:
```typescript
// Prevent unnecessary re-creation of components
{ path: 'cached-content', component: CachedComponent, transitionPlan: 'invoke-lifecycles' }
```

### Error Handling

Always provide appropriate fallbacks for viewports:

```typescript
@customElement({
  template: `
    <au-viewport name="main"
                 fallback="error-component"
                 default="home-component">
    </au-viewport>
  `
})
export class RobustApp {
  // Fallback function for complex error handling
  getFallback(instruction: ViewportInstruction, node: RouteNode): string {
    console.error('Failed to load component:', instruction.component);

    // Different fallbacks based on the failed component
    if (typeof instruction.component === 'string') {
      return instruction.component.includes('admin') ? 'admin-error' : 'general-error';
    }

    return 'general-error';
  }
}
```
