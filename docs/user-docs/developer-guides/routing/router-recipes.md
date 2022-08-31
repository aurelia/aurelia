# Router Recipes

While the docs do a great job explaining the intricacies of the router, sometimes you just need a code snippet and brief explanation to do something. You will find code snippets for basic things, from creating routes to working with router hooks.

## Create a routeable component

A component that is loaded as part of a route definition. The `IRouteableComponent`&#x20;

```typescript
import { IRouteableComponent } from '@aurelia/router';

export class MyComponent implements IRouteableComponent {

}
```

## Creating a route

As outlined in the [Creating Routes](creating-routes.md) section, routes can be specified using the `routes` decorator or the `static routes` property.

```typescript
export class MyApp {
    static routes = [
        {
            path: '/products',
            component: () => import('./products-page'),
            title: 'Products'
        }
    ];
}
```

## Creating a route with parameters

A parameter is denoted by the prefixed colon `:` followed by the parameter's name. In this example, our parameter is called `productId`, which is required for the route to load.

```typescript
export class MyApp {
    static routes = [
        {
            path: '/products/view/:productId',
            component: () => import('./view-product'),
            title: 'Products'
        }
    ];
}
```

You can have more than one parameter (as many as you like):

```typescript
export class MyApp {
    static routes = [
        {
            path: '/products/view/:productId/:section',
            component: () => import('./view-product'),
            title: 'Products'
        }
    ];
}
```

## Creating a route with custom configuration values

Routes support a custom `data` property allowing you to decorate your routes. Some use cases might include marking a route as requiring a user to be authenticated or an icon.

```typescript
export class MyApp {
    static routes = [
        {
            path: '/products/view/:productId',
            component: () => import('./view-product'),
            title: 'Products',
            data: {
                icon: 'fa-light fa-alicorn'
            }
        }
    ];
}
```

## Creating a route with a custom viewport

In applications with multiple viewports, some routes might be loaded into specific viewports. You can use the `viewport` property on routes to specify which route.

```
export class MyApp {
    static routes = [
        {
            path: '/products/view/:productId',
            component: () => import('./view-product'),
            title: 'Products',
            viewport: 'sidebar'
        }
    ];
}
```

## Loading data inside of a routeable component

Inside components displayed by routes, the best place is to load data inside `canLoad` or `load` hooks. If your view depends on the data being loaded (like a product detail page), use `canLoad` otherwise, use `load`. The first argument is any parameters passed through the route.

```typescript
import { IRouteableComponent } from '@aurelia/router';

export class ViewProduct implements IRouteableComponent {
    async canLoad(params) {
        this.product = this.api.loadProduct(params.productId);
    }
}
```
