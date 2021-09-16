# Common routing tasks

This section details common scenarios and tasks using the router in your Aurelia applications.

## Prerequisites

Before proceeding, this section assumes you are familiar with the following topics:

* A basic understanding of Aurelia fundamentals, specifically view and view models
* An understanding of [routing basics](routing-syntax.md)
* An understanding of [custom router hooks](router-hooks.md) and the `lifecyclehooks` API
* An understanding of [router lifecycle hooks](lifecycle-hooks.md)

## Passing information between routes

Quite a common scenario in routing is passing contextual information to the route, usually in the form of a slug or ID. When the route loads, you might want to pull out one or more values from the route and make an API request.

In the following example, we create a route for a product page that accepts an ID parameter. Required parameters are denoted by a colon `:` followed by the parameter name, which in this case is called `id`.

```typescript
@route({
  routes: [
    { id: 'home', path: '', component: import('./home'), title: 'Home' },
    { path: 'product/:id', component: import('./product'), title: 'Product' }
  ]
})
export class MyApp {

}
```

Inside of our product component, we can access this parameter value and get the value. The first argument of the `load` lifecycle hook with be the parameters from the URL.

{% code title="product-page.ts" %}
```typescript
import { Params } from 'aurelia';

export class ProductPage {
    load(params: Params) {
        console.log(params.id);
    }
}
```
{% endcode %}

## Redirecting routes

The router allows you to redirect to other parts of your application using the `redirectTo` property. By specifying the path in the `redirectTo` property, the route will navigate to the specified value.

```typescript
@route({
  routes: [
    { path: '', redirectTo: 'products' },
    { path: 'products', component: import('./products'), title: 'Products' },
    { path: 'product/:id', component: import('./product'), title: 'Product' }
  ]
})
export class MyApp {

}
```

