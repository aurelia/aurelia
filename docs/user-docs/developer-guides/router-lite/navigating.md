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

### Navigate in current routing context

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

## Using the Router API

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

## Handling unknown components

If you are using the router to render components in your application, there might be situations where a component attempts to be rendered that does not exist. This can happen while using direct routing (not configured routing)

{% hint style="warning" %}
This section is not for catch-all/404 routes. If you are using configured routing, you are looking for the [section on catch-all routes here](creating-routes.md#catch-all-404-not-found-route).
{% endhint %}

To add in fallback behavior, we can do this two ways. The `fallback` attribute on the `<au-viewport>` element or in the router `customize` method (code).

### Create the fallback component

Let's create the `missing-page` component (this is required or the fallback behavior will not work). First, we'll create the view-model for our `missing-page` component.

{% code title="missing-page.ts" %}
```typescript
export class MissingPage {
  public static parameters = ['id'];
  public missingComponent: string ;

  public load(parameters: {id: string}): void {
    this.missingComponent = parameters.id;
  }
}
```
{% endcode %}

For the `fallback` component, an ID gets passed as a parameter which is the value from the URL. If you were to attempt to visit a non-existent route called "ROB" the `missingComponent` value would be ROB.

Now, the HTML.

{% code title="missing-page.html" %}
```html
<h3>Ouch! I couldn't find '${missingComponent}'!</h3>
```
{% endcode %}

### Programmatically

By using the `fallback` property on the `customize` method when we register the router, we can pass a component.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';
import { MissingPage } from './missing-page';

Aurelia
  .register(RouterConfiguration.customize({
    fallback: MissingPage,
  }))
  .app(MyApp)
  .start();
```

### Attribute

Sometimes the `fallback` attribute can be the prefered approach to registering a fallback. Import your fallback component and pass the name to the `fallback` attribute. Same result, but it doesn't require touching the router registration.

{% code title="my-app.html" %}
```html
<import from="./missing-page"></import>

<au-viewport fallback="missing-page"></au-viewport>
```
{% endcode %}

## Redirecting

Depending on the scenario, you will want to redirect users in your application. Unlike using the `load` API on the router where we manually route (for example, after logging in) redirection allows us to redirect inside router hooks.

Please see the [Routing Lifecycle](routing-lifecycle.md#canload) section to learn how to implement redirection inside of your components.
