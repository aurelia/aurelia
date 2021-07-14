# Common routing tasks

This section details common scenarios and tasks using the router in your Aurelia applications.

## Prerequisites

Before proceeding, this section assumes you are familiar with the following topics:

* A basic understanding of Aurelia fundamentals, specifically view and view models
* An understanding of [routing syntax](routing-syntax.md)
* An understanding of [custom router hooks](router-hooks.md) and the `lifecyclehooks` API
* An understanding of [router lifecycle hooks](lifecycle-hooks.md)

## Creating configured routes using @route

If you are not using the direct router to navigate to components directly, you will be configuring your routes. The `@route` decorator allows us to configure routes in our components using familiar syntax.

In the following fictitious example, we have three routes. The first route for the homepage is a default route \(denoted by its empty path value\) the other two routes are for a login and register page.

```typescript

@route({
  routes: [
    { id: 'home', path: '', component: import('./home'), title: 'Home' },
    { path: 'login', component: import('./auth'), title: 'Sign in' },
    { path: 'register', component: import('./auth'), title: 'Sign up' }
  ]
})
export class MyApp {

}
```

If you do not want to configure routes using the `@route` decorator, Aurelia also allows you to add a static property to your view model to achieve the same thing.

As you will soon see, the route syntax remains the same, the only difference is the static property called `routes` defined in our view model.

```typescript
export class MyApp {
  static routes = [
    { id: 'home', path: '', component: import('./home'), title: 'Home' },
    { path: 'login', component: import('./auth'), title: 'Sign in' },
    { path: 'register', component: import('./auth'), title: 'Sign up' }
  ];
}
```

## Passing information between routes with configured routing

Quite a common scenario in routing is passing contextual information to the route, usually in the form of a slug or ID. When the route loads, you might want to pull out one or more values from the route and make an API request.

{% hint style="warning" %}
Using direct routing? Please see the section below titled, "**Passing information between routes using direct routing**" as this section applies to configured routing only.
{% endhint %}

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

## Passing information between routes with direct routing

Unlike configured routing, direct routing by default does not rely on preconfigured routes. This means parameters can be specified at the time of routing without having to tell the router about them. 

When working with parameters and the direct router, there are some things you need to be aware of.

Take the following example:

```text
<a load="product-page(123)">View product</a>
```

This will tell the router to load the product page component and pass in 123 as a value. Notice how we don't even have to specify a parameter name? In the component, we still use `load` to get the parameters, but now we have an array of parameters.

To access what is clearly a product ID, we can reference the parameters which are now an array in our component:

```typescript
import { Params } from 'aurelia';

export class ProductPage {
    load(params: any[]) {
        console.log(params[0]);
    }
}
```

### Naming direct router parameters inline

If you want your parameters to be named instead of zero-indexed, the direct router supports naming your parameters two different ways.

You can name your parameters on the `load` instruction itself:

```markup
<a load="product-page(id=123)">View product</a>
```

You would then be able to access parameters and reference them by their key, in this case it would be `id`.

### Naming direct router parameters inside of the component

You can also tell the router what the name of your route parameters are inside of the routable component itself using `static parameters`.

```typescript
import { Params } from 'aurelia';

export class ProductPage {
    static parameters = ['id'];

    load(params: Params) {
        console.log(params.id);
    }
}
```

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

