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
import { route } from '@aurelia/router-lite';
import template from './my-app.html';
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

This is happening due to the default value of the [`default` attribute](#default-attribute) of the `<au-viewport>` that is set to `''` (empty string).
This default value enables loading the component associated with the empty path without any additional configuration.
This default behavior makes sense as the usage of a single viewport at every routing hierarchy might be prevalent.

However, we need a way to prevent this duplication.
To this end, we can bind `null` to the `default` attribute of a viewport, which instructs the router-lite that this particular viewport should be left out when it is empty (that is no component is targeted to be loaded in this viewport).

{% code title="my-app.html" %}
```diff
  <div class="content">
-   <au-viewport></au-viewport>
-   <au-viewport></au-viewport>
+   <au-viewport default="products"></au-viewport> <!-- instruct the router to load the products component by default -->
+   <au-viewport default.bind="null"></au-viewport>
  </div>
```

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

Although we name the viewports semantically, it is not necessary, and you are free to choose names, as you like, for the viewports.
Lastly, we need to use the [`load` attribute](./navigating.md#html-load-attribute) in the `Products` component to construct the URL, or more accurately the routing instruction correctly, such that the details of the product is loaded on the `details` viewport.

{% code title="products.html" %}
```diff
  <ul>
    <li repeat.for="item of data">
-     <a href="#">${item.title}</a>
+     <a load="route.bind:{component:'details', params: {id: item.id}, viewport:'details'}; context.bind:null">${item.title}</a>
    </li>
  </ul>
```

Using the `load` attribute we are instructing the router-lite to load the `product` (route-id) component, with the `id` parameter of the route set to the `id` of the current `item` in the repeater, in the `details` viewport.
With the `context.bind:null`, we are instructing the router-lite to perform this routing instruction on the root routing context.
Now, when someone clicks a product link the associated details are loaded in the `details` viewport.
You can see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-sibling-viewport?ctl=1&embed=1&file=src/products.html" %}

If you open the example in a new tab, you can see how the URL paths are constructed.
For example, when you click a product link, the URL is `/details/42@details+products@list`.

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

## `default` attribute

TODO(Sayan)

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
