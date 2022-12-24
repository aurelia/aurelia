---
description: Learn about viewports in Router-Lite and how to configure hierarchical routing.
---

# Viewports

The `<au-viewport>` element, or commonly referred to as viewport (not to confuse with `viewport` `meta`), is the "outlet", where the router-lite attaches/loads the components.
For a basic example of viewport, please refer the ["Getting started"-tutorial](./getting-started.md).
Most of the examples in the preceding sections show the usage of only a single viewport.
However, you can use multiple viewports with the sibling viewports and hierarchical routing.
These are useful to create different routing layouts.
In the subsequent sections, we first discuss about that.
Later in this part of the documentation, we focus on the different configuration options available for viewports.

## Hierarchical routing

As seen in the ["Getting started"-tutorial](./getting-started.md), a component can define a set of children routes (using [either the `@route` decorator or the static properties](configuring-routes.md#route-configuration-basics)).
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
import { route } from '@aurelia/router-lite';
import template from './my-app.html';
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
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';
import { Product } from './product';
import { IProductService, ProductDetail } from './product-service';
import template from './products.html';

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
  promise: Promise<ProductDetail[]>;
  public constructor(@IProductService productService: IProductService) {
    this.promise = productService.getAll();
  }
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

## Sibling viewports

Two viewports are called siblings if they are under one parent routing context.

{% embed url="https://stackblitz.com/edit/router-lite-sibling-viewport?ctl=1&embed=1&file=src/my-app.ts" %}

## Named viewports

The router allows you to add in multiple viewports into your application and render components into each of those viewport elements by their name. The `<au-viewport>` element supports a name attribute, which you'll want to use if you have more than one of them.

```markup
<main>
    <au-viewport name="main"></au-viewport>
</main>
<aside>
    <au-viewport name="sidebar"></au-viewport>
</aside>
```

In this example, we have the main viewport for our main content and then another viewport called `sidebar` for our sidebar content which is dynamically rendered. When using viewports, think of them like iframes, independent containers that can maintain their own states.

## Specifying a viewport on a route

Routes will load in the default viewport element by default if there are one or more viewports. However, routes can be told to load into a specific viewport.

```typescript
import { IRouteableComponent, routes } from "@aurelia/router";

@routes([
    {
        component: import('./my-component'),
        path: 'my-component',
        title: 'Your Component <3',
        viewport: 'sidebar'
    }
])
export class MyApp implements IRouteableComponent {
}

```

By specifying the `viewport` property on a route, we can tell it to load into a specific route.
