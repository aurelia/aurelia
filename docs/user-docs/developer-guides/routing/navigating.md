# Navigating

This section details how you can use the load method on the router instance or load attribute to navigate to other parts of your application. Many of the following apply to both configured and direct routing modes.

### Router instance

To use the `load` method, you have to first inject the router into your component. This can be done easily by using the `IRouter` decorator on your component constructor method. The following code will add a property to your component called `router` which we can reference.

```typescript
import { IRouter, IRouteViewModel } from 'aurelia';

export class MyComponent implements IRouteViewModel {
    constructor(@IRouter private router: IRouter) {

    }
}
```

### Navigating without options

The `load` method can accept a simple string value allowing you to navigate to another component without needing to supply any configuration options.

```typescript
import { IRouter, IRouteViewModel } from 'aurelia';

export class MyComponent implements IRouteViewModel {
    constructor(@IRouter private router: IRouter) {

    }

    async viewProducts() {
        await this.router.load('/products');
    }
}
```

You could also use the string value method to pass parameter values and do something like this where our route expects a product ID and we pass 12:

```typescript
import { IRouter, IRouteViewModel } from 'aurelia';

export class MyComponent implements IRouteViewModel {
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
import { IRouter, IRouteViewModel } from 'aurelia';

export class MyComponent implements IRouteViewModel {
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

### HTML load attribute

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

In the above example, we provide the route (`id`) value. But, then also provide an object of parameters. These parameter values correspond to any parameters configured in your route definition. In our case, our route looks like this:

```typescript
{
    id: 'profile',
    path: 'profile/:name',
    component: () => import('./view-profile'),
    title: 'View Profile'
},
```
