---
description: >-
  Learn how to navigate the router programmatically using the router load method
  and the HTML load attribute for creating in-page routes.
---

# Navigating

This section details how you can use the load method on the router instance or load attribute to navigate to other parts of your application.

### Programmatically using the load method

To use the `load` method, you have first to inject the router into your component. This can be done easily by using the `IRouter` decorator on your component constructor method. The following code will add a property to your component, which we can reference.

```typescript
import { IRouter, IRouteableComponent } from '@aurelia/router';

export class MyComponent implements IRouteableComponent {
    constructor(@IRouter private router: IRouter) {

    }
}
```

### Navigating without options

The `load` method can accept a simple string value allowing you to navigate to another component without needing to supply configuration options.

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

You could also use the string value method to pass parameter values and do something like this where our route expects a product ID, and we pass 12:

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

The router instance `load` method allows you to specify different properties on a per-use basis. The most common one is the `title` property, which allows you to modify the title as you navigate your route.

A list of available load options can be found below:

* `title` — Sets the title of the component being loaded
* `parameters` — Specify an object to be serialized to a query string and then set to the query string of the new URL.
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
            parameters: {
                prop1: 'val',
                tracking: 'asdasdjaks232'
            },
            fragment: 'jfjdjf'
        });
    }
}
```

### HTML load attribute

The router also allows you to decorate links and buttons in your application using a `load` attribute, which works the same way as the router instance `load` method.

If you have routes defined on a root level (inside of `my-app.ts`) you will need to add a forward slash in front of any routes you attempt to load. The following would work in the case of an application using configured routes.

```markup
<a load="/products/12">Product #12</a>
```

The load attribute can do more than accept a string value. You can also bind to the load attribute for more explicit routing. The following example is a bit redundant as specifying `route:product` would be the same as specifying `load="product"` , but if you're wanting more explicit routing, it conveys the intent better.

```html
<a load="route:product;">My Route</a>
```

And where things start to get interesting is when you want to pass parameters to a route. We use the `params` configuration property to specify parameters.

```html
<a load="route:profile; params.bind:{name: 'rob'}">View Profile</a>
```

In the above example, we provide the route (`id`) value (via `route: profile`). But, then also provide an object of parameters (via `params.bind: { name: 'rob' }`).&#x20;

These parameter values correspond to any parameters configured in your route definition. In our case, our route looks like this:

```typescript
{
    id: 'profile',
    path: 'profile/:name',
    component: () => import('./view-profile'),
    title: 'View Profile'
},
```

## Redirecting

Depending on the scenario, you will want to redirect users in your application. Unlike using the `load` API on the router where we manually route (for example, after logging in) redirection allows us to redirect inside router hooks.

Please see the [Routing Lifecycle](routing-lifecycle.md#canload) section to learn how to implement redirection inside your components.
