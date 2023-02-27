---
description: Learn about viewports in Router-Lite and how to configure hierarchical routing.
---

# Viewports

The `<au-viewport>` element, or commonly referred to as viewport (not to confuse with [`viewport` meta tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag)), is the "outlet", where the router-lite attaches/loads the components.
For a basic example of viewport, please refer the ["Getting started"-tutorial](./getting-started.md).
Most of the examples in the preceding sections show the usage of only a single viewport.
However, you can use multiple viewports with the sibling viewports and hierarchical routing.
These are useful to create different routing layouts.
In the subsequent sections, we first discuss about that.
Later in this part of the documentation, we focus on the different configuration options available for viewports.

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

This is happening due to the default value of the [`default` attribute](#specify-a-default-component-for-a-viewport) of the `<au-viewport>` that is set to `''` (empty string).
This default value enables loading the component associated with the empty path without any additional configuration.
This default behavior makes sense as the usage of a single viewport at every routing hierarchy might be prevalent.

However, we need a way to prevent this duplication.
To this end, we can bind `null` to the `default` attribute of a viewport, which instructs the router-lite that this particular viewport should be left out when it is empty (that is no component is targeted to be loaded in this viewport).

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

Using the `load` attribute we are instructing the router-lite to load the `Product` (using the route-id `details`) component, with the `id` parameter of the route set to the `id` of the current `item` in the repeater, in the `details` viewport.
With the `context.bind:null`, we are instructing the router-lite to perform this routing instruction on the root routing context (refer [the documentation](./navigating.md#using-the-load-custom-attribute) for the `load` attribute for more details).
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

```markup
<main>
    <au-viewport name="main"></au-viewport>
</main>
<aside>
    <au-viewport name="sidebar"></au-viewport>
</aside>
```

### Using viewport name for routing instructions

The names can be used to instruct the router-lite to load a specific component to a specific named viewport.
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
For more details about navigating and instructions for router-lite, please refer the [documentation](./navigating.md).
{% endhint %}

### Specifying a viewport name on a route

By default, the routes/components are loaded into the first available viewport, when there is no viewport instruction is present.
However, the routes can also be configured, such that a configured route is allowed to be loaded only in a certain viewport.
This is useful when you know that a certain component needs to be loaded in a certain viewport, because in that case you can use the simple `{path}` instruction instead of the more verbose alternative, the `{path}@{viewport-name}` instruction.
To this end, use the `viewport` option of the [route configuration](./configuring-routes.md).

```typescript
import { route } from '@aurelia/router-lite';
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

In this example, we are instructing the router-lite to reserve the first viewport for `ce-two` custom element and the reserve the second viewport for `ce-one` custom element.
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

Note that `default` attribute can also be bound to `null`, to instruct the router-lite not to load any component into ths viewport when no component is scheduled (either by explicit instruction of implicit availability check) to be loaded into the viewport.
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
} from '@aurelia/router-lite';
import template from './my-app.html';

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
