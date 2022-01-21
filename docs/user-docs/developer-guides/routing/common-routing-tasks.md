# Routing fundamentals

This section details common scenarios and tasks using the router in your Aurelia applications. These basic concepts allow you to set route titles, pass data between routes and do other things you might commonly do with a router.

It is highly recommended that you familiarize yourself with other parts of the router documentation before consulting this section, as we will introduce concepts that you might not be familiar with just yet that are mentioned in other sections of the router documentation.

## Setting The Title

While you would in many cases set the title of a route in your route configuration object using the `title` property, sometimes you want the ability to specify the title property from within the routed component itself.

You can achieve this from within the `canLoad` and `load` methods in your component. By setting the `next.title` property, you can override or transform the title.

```typescript
import { IRouteViewModel, Params, RouteNode } from "aurelia";

export class ProductPage implements IRouteViewModel {

    load(params: Params, next: RouteNode, current: RouteNode) {
        next.title = 'COOL PRODUCT';
    }
}
```

## Passing information between routes

We went over creating routes with support for parameters in the creating routes section, but there is an additional property you can specify on a route called `data` which allows you to associate metadata with a route.

```typescript
@route({
  routes: [
    { 
      id: 'home', 
      path: '', 
      component: import('./home'), 
      title: 'Home' 
    },
    { 
      path: 'product/:id', 
      component: import('./product'), 
      title: 'Product',
      data: {
          requiresAuth: false
      }
    }
  ]
})
export class MyApp {

}
```

This data property will be available in the routable component and can be a great place to store data associated with a route such as roles and auth permissions. In some instances, the route parameters can be used to pass data, but for other use cases, you should use the data property.

## Loading data inside of components

A common router scenario is you want to route to a specific component, say a component that displays product information based on the ID in the URL. You make a request to the API to get the information and display it.

There are two asynchronous lifecycles that are perfect for dealing with loading data: `canLoad` and `load` - both supporting returning a promise (or async/await).

If the component you are loading absolutely requires the data to exist on the server and be returned, the `canLoad` lifecycle method is the best place to do it. Using our example of a product page, if you couldn't load product information the page would be useful, right?

From the inside of `canLoad` you can redirect the user elsewhere or return false to throw an error.

```typescript
import { IRouteViewModel, Params } from "aurelia";

export class MyComponent implements IRouteViewModel {
    async canLoad(params: Params) {
        this.product = await this.api.getProduct(params.productId);
    }
}
```

Similarly, if you want the view to still load even if we can't get the data, you would use the `load` lifecycle callback.

```typescript
import { IRouteViewModel, Params } from "aurelia";

export class MyComponent implements IRouteViewModel {
    async load(params: Params) {
        this.product = await this.api.getProduct(params.productId);
    }
}
```

When you use `load` and `async` the component will wait for the data to load before rendering.
