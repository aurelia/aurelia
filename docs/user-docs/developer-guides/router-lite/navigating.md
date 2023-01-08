---
description: Learn to navigate from one view to another using the Router-Lite.
---

# Navigating

This section details the various ways that you can use to navigate from one part of your application to another part.
For performing navigation the router-lite offers couple of alternatives, namely the `href` and the `load` custom attributes, and the `IRouter#load` method.

## Using the `href` custom attribute

You can use the `href` custom attribute with an `a` (anchor) tag, with a string value.
When the users click this link, the router-lite performs the navigation.
This can be seen in action in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-getting-started?ctl=1&embed=1&file=src/main.ts" %}

The example shows that there are two configured routes, `home` and `about`, and in markup there are two anchor tags that points to these routes.
Clicking those links the users can navigate to the desired components, as it is expected.

```html
<nav>
  <a href="home">Home</a>
  <a href="about">About</a>
</nav>
```

You can also use the parameterized routes with the `href` attribute, exactly the same way.
To this end, you need to put the parameter value in the path itself and use the parameterized path in the `href` attribute.
This is shown in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-href-with-bound-parameter?ctl=1&embed=1&file=src/my-app.ts" %}

The example shows two configured routes; one with an optional parameter.
The markup has three anchor tags as follows:

```html
<nav>
  <a href="home">Home</a>
  <a href="about">About</a>
  <a href="about/42">About/42</a>
</nav>
```

The last `href` attribute is an example of a parameterized route.

### Using route-id

While configuring routes, an [`id` for the route](./configuring-routes.md#advanced-route-configuration-options) can be set explicitly.
This `id` can also be used with the `href` attribute.
This is shown in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-href-route-id?ctl=1&embed=1&file=src/my-app.ts" %}

Note that the example set a route id that is different than the defined path.

```typescript
// my-app.ts
{
  id: 'r1',
  path: ['', 'c1'],
  component: ChildOne,
},
{
  id: 'r2',
  path: 'c2',
  component: ChildTwo,
},
```

These route-ids are later used in the markup as the values for the `href` attributes.

```html
<!-- my-app.html -->
<nav>
  <a href="r1">C1</a>
  <a href="r2">C2</a>
</nav>
```

{% hint style="warning" %}
Note that using the route-id of a parameterized route with the `href` attribute might be limiting or in some cases non-operational as with `href` attribute there is no way to specify the parameters for the route separately.
This case is handled by the [`load` attribute](#using-the-load-custom-attribute).
{% endhint %}

### Targeting viewports

You can target [named](./viewports.md#named-viewports) and/or [sibling](./viewports.md#sibling-viewports) viewports.
To this end, you can use the following syntax: `{path1}[@{viewport-name}][+{path2}[@{sibling-viewport-name}]]`.
The following live example, demonstrates that.

{% embed url="https://stackblitz.com/edit/router-lite-named-sibling-viewport-href?ctl=1&embed=1&file=src/my-app.html" %}

The example shows the following variations.

```html
<!-- Load the products' list in the first viewport and the details in the second viewport -->
<a href="products+details/${id}">Load products+details/${id}</a>

<!-- Load the details in the first viewport and the products' list in the second viewport -->
<a href="details/${id}+products">Load details/${id}+products</a>

<!-- Specifically target the named viewports -->
<a href="products@list+details/${id}@details">Load products@list+details/${id}@details</a>
<a href="products@details+details/${id}@list">Load products@details+details/${id}@list</a>

<!-- Load only the details in the specific named viewport -->
<a href="details/${id}@details">Load details/${id}@details</a>
```

Note that using the viewport name in the routing instruction is optional and when omitted, the router uses the first available viewport.

### Navigate in current and ancestor routing context

The navigation using `href` attribute always happens in the current routing context; that is, the routing instruction will be successful if and only the route is configured in the current routing parent.
This is shown in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-hierarchical-viewport-2mcxwj?ctl=1&embed=1&file=src/main.ts" %}

In the example, the root component has two child-routes (`c1`, `c2`) and every child component in turn has 2 child-routes (`gc11`, and `gc12` and `gc21`, and `gc22` respectively) of their own.
In this case, any `href` pointing to any of the immediate child-routes (and thus configured in the current routing parent) works as expected.
However, when an `href`, like below, is used to navigate from one child component to another child component, it does not work.

```html
 <a href="c2">c2 (doesn't work)</a>
```

In such cases, the router-lite offers the following syntax to make such navigation possible.

```html
<a href="../c2">../c2 (works)</a>
```

That is, you can use `../` prefix to instruct the router to point to the parent routing context.
The prefix can also be used multiple times to point to any ancestor routing context.
Naturally, this does not go beyond the root routing context.

Contextually, note that the [example involving route-id](#using-route-id) also demonstrates this behavior of navigating in the current context.
There the root uses `r1`, and `r2` as route identifiers, which are the same identifiers used in the children to identify their respective child-routes.
The route-ids are used in the markup with the `href` attributes.
Despite being the same route-ids, the navigation works because unless specified otherwise, the routing instructions are constructed under the current routing context.

### Bypassing the `href` custom attribute

By default the router-lite enables usage of the `href` custom attribute, as that ensure that router-lite handles the routing instructions by default.
There might be cases, where you want to avoid that.
If you want to globally deactivate the usage of `href`, then you can customize the router configuration by setting `false` to the [`useHref` configuration option](./router-configuration.md#enable-or-disable-the-usage-of-the-href-custom-attribute-using-usehref).

To disable/bypass the default handling of router-lite for any particular `href` attribute, you can avail many different ways as per your need and convenience.

- Using `external` or `data-external` attribute on the `a` tag.
- Using a non-null value for the `target`, other than the current window name, or `_self`.

Other than that, when clicking the link if either of the `alt`, `ctrl`, `shift`, `meta` key is pressed, the router-lite ignores the routing instruction.

Following example demonstrate these options.

{% embed url="https://stackblitz.com/edit/router-lite-bypassing-href?ctl=1&embed=1&file=src/my-app.html" %}

## Using the `load` custom attribute

Although the usage of `href` is the most natural choice, it has some limitations.
Firstly, it allows navigating in the [current routing context](#navigate-in-current-routing-context).
However, the bigger limitation might be that the `href` allows usage of only string values.
This might be bit sub-optimal when the routes have parameters, as in that case you need to know the order of the parameters, the parameterized and static segments etc. to correctly compose the string path.
In case the order of those segments are changed, it may cause undesired or unexpected results if your application.
Therefore, the router-lite offers another alternative namely the `load` attribute.

Besides supporting string-instructions like the `href` attribute, the `load` attribute also offers a way to compose the routing instructions in a more structured manner.
Before starting the discussion on the features supported exclusively by the `load` attribute, let us quickly review the following example of using string-instructions with the `load` attribute.

{% embed url="https://stackblitz.com/edit/router-lite-load-string-instructions?ctl=1&embed=1&file=src/my-app.html" %}

The example shows various instances of `load` attribute with various string instructions.

```html
<!-- my-app.html -->
<!-- instructions pointing to individual routes -->
<a load="c1">C1</a>
<a load="c2">C2</a>
<!-- instructions involving sibling viewports -->
<a load="c1+c2">C1+C2</a>
<a load="c1@vp2+c2@vp1">C1@vp2+C2@vp1</a>

<!-- child1 -->
<!-- instruction pointing to parent routing context -->
<a load="../c2">../c2</a>
```

The following sections discuss the various other ways routing instruction can be used with the `load` attribute.

### Binding the route-`params`

Using the bindable `params` property in the `load` custom attribute, you can bind the parameters for a parameterized route.
The complete URL is then constructed from the given route and the parameters.
Following is an example where the route-id is used with bound parameters.

{% embed url="https://stackblitz.com/edit/router-lite-load-params?ctl=1&embed=1&file=src/my-app.html" %}

The example above configures a route as follows.

```typescript
// my-app.ts
{
  id: 'r2',
  path: ['c2/:p1/foo/:p2?', 'c2/:p1/foo/:p2/bar/:p3'],
  component: ChildTwo,
}
```

The route-id is then used in the markup with the bound `params`, as shown in the example below.

```html
<!-- constructed path: /c2/1/foo/ -->
<a load="route: r2; params.bind: {p1: 1};">C2 {p1: 1}</a>

<!-- constructed path: /c2/2/foo/3 -->
<a load="route: r2; params.bind: {p1: 2, p2: 3};">C2 {p1: 2, p2: 3}</a>

<!-- constructed path: /c2/4/foo/?p3=5 -->
<a load="route: r2; params.bind: {p1: 4, p3: 5};">C2 {p1: 4, p3: 5}</a>

<!-- constructed path: /c2/6/foo/7/bar/8 -->
<a load="route: r2; params.bind: {p1: 6, p2: 7, p3: 8};">C2 {p1: 6, p2: 7, p3: 8}</a>

<!-- constructed path: /c2/9/foo/10/bar/11?p4=awesome&p5=possum -->
<a load="route: r2; params.bind: {p1: 9, p2: 10, p3: 11, p4: 'awesome', p5: 'possum'};">C2 {p1: 9, p2: 10, p3: 11, p4: 'awesome', p5: 'possum'}</a>
```

An important thing to note here is how the URL paths are constructed for each URL.
Based on the given set of parameters, a path is selected from the configured set of paths for the route, that maximizes the number of matched parameters at the same time meeting the parameter constraints.

For example, the third instance (params: `{p1: 4, p3: 5}`) creates the path `/c2/4/foo/?p3=5` (instance of `'c2/:p1/foo/:p2?'` path) even though there is a path with `:p3` configured.
This happens because the bound parameters-object is missing the `p2` parameter.

In other case, the fourth instance provides a value for `p2` as well as a value for `p3` that results in the construction of path `/c2/6/foo/7/bar/8` (instance of `'c2/:p1/foo/:p2/bar/:p3'`).
This case also demonstrates the aspect of "maximization of parameter matching" while path construction.

One last point to note here is that when un-configured parameters are included in the `params` object, those are converted into query string.

## Using the Router API

TODO

Router offers the `load` method that can be used to perform navigation.
To this end, you have to first inject the router into your component.
This can be done by using the `IRouter` decorator on your component constructor method as shown in the example below.

```typescript
import { IRouter, IRouteableComponent } from '@aurelia/router-lite';

export class MyComponent {
  public constructor(@IRouter private readonly router: IRouter) { }
}
```

Once you have an injected instance of the router, you can use the `load` method to perform navigation.
The `load` method supports many overloads, which are outlined below.

### Navigating without options

The `load` method can accept a simple string value allowing you to navigate to another component without needing to supply any configuration options.

```typescript
import { IRouter, IRouteableComponent } from '@aurelia/router';

export class MyComponent implements IRouteableComponent {
    constructor(@IRouter private router: IRouter) {

    }

    async viewProducts() {
        await this.router.load('/products');
    }
}
```

You could also use the string value method to pass parameter values and do something like this where our route expects a product ID and we pass 12:

```typescript
import { IRouter, IRouteableComponent } from '@aurelia/router';

export class MyComponent implements IRouteableComponent {
    constructor(@IRouter private router: IRouter) {

    }

    async viewProducts() {
        await this.router.load(`/products/12`);
    }
}
```

### Specifying load options

The router instance `load` method allows you to specify different properties on a per-use basis. The most common one being the `title` property to allow you to modify the title as you navigate to your route.

A list of available load options can be found below:

* `title` — Sets the title of the component being loaded
* `queryParams` — Specify an object to be serialized to a query string, and then set to the query string of the new URL.
* `fragment` — Specify the hash fragment for the new URL.

These option values can be specified as follows and when needed:

```typescript
import { IRouter, IRouteableComponent } from '@aurelia/router';

export class MyComponent implements IRouteableComponent {
    constructor(@IRouter private router: IRouter) {

    }

    async viewProduct() {
        await this.router.load('products', {
            title: 'My product',
            queryParams: {
                prop1: 'val',
                tracking: 'asdasdjaks232'
            },
            fragment: 'jfjdjf'
        });
    }
}
```

### HTML `load` attribute

The router also allows you to decorate links and buttons in your application using a `load` attribute which works the same way as the router instance `load` method.

If you have routes defined on a root level (inside of `my-app.ts`) you will need to add a forward slash in front of any routes you attempt to load. The following would work in the case of an application using configured routes.

```markup
<a load="/products/12">Product #12</a>
```

The load attribute can do more than just accept a string value. You can also bind to the load attribute as well for more explicit routing. The following example is a bit redundant as specifying `route:product` would be the same as specifying `load="product"` but if you're wanting more explicit routing, it conveys the intent better.

```html
<a load="route:product;">My Route</a>
```

And where things really start to get interesting is when you want to pass parameters to a route. We use the `params` configuration property to specify parameters.

```html
<a load="route:profile; params.bind:{name: 'rob'}">View Profile</a>
```

In the above example, we provide the route (`id`) value (via `route: profile`). But, then also provide an object of parameters (via `params.bind: { name: 'rob' }`). These parameter values correspond to any parameters configured in your route definition. In our case, our route looks like this:

```typescript
{
    id: 'profile',
    path: 'profile/:name',
    component: () => import('./view-profile'),
    title: 'View Profile'
},
```

## Redirection and unknown paths

For completeness it needs to be briefly discussed that apart from the explicit navigation instruction, there can be need to redirect the user to a different route or handle unknown routes gracefully.
Other sections of the router-lite documentation discusses these topics in detail.
Hence these topics aren't repeated here.
Please refer to the linked documentations for more details.

- [Redirection documentation](./configuring-routes.md#redirect-to-another-path)
- Fallback using the [route configuration](./configuring-routes.md#fallback-redirecting-the-unknown-path)
- Fallback using the [viewport attribute](./viewports.md#specify-a-fallback-component-for-a-viewport)
