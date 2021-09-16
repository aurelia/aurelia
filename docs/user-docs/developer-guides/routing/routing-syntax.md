# Routing basics

You will most commonly use routes to navigate to sections in your application, but also pass in information such as ID or slug values in the URL. Configured routing is the kind of routing you might be familiar with if you have worked with Express.js or most other router libraries which all use familiar syntax.

When working with configured routes, there are more things you can configure with routes. You can add optional parameters as well as wildcard parameters into your routes.

## Defining routes

To register routes you can either use the `@route` decorator or you can use the static property routes `static routes` to register one or more routes in your application. If you worked with Aurelia 1, these methods replace `configureRouter` method.

### Static property

If you have a lot of routes, the static property might be preferable from a cleanliness perspective.

```typescript
export class MyApp {
  static routes = [
    {
      path: ['', 'home'],
      component: import('./components/home-page'),
      title: 'Home',
    }
}
```

### Route decorator

The syntax for routes stays the same using the decorator, just how they are defined changes slightly.

```typescript
import { route } from '@aurelia/router'; 

@route({
    routes: [
      {
        path: ['', 'home'],
        component: import('./components/home-page'),
        title: 'Home',
      }
    ]
})
export class MyApp {

}
```

## Routing structure

All routes are objects which contain properties denoting the route, the component to render, the title and other properties which allow you to configure the route.

### Default route

A route is denoted as default \(the router will render this if nothing matches another route\) if the `path` value is empty or contains an array with an empty value.

```typescript
{
  path: '',
  component: import('./components/home-page'),
  title: 'Homepage',
}
```

### No parameters

```typescript
{
  path: 'contact-us',
  component: import('./components/contact-us'),
  title: 'Contact Us',
}
```

### With parameters

In the following example, `productId` is a required parameter and a value needs to be provided.

```typescript
{
  path: 'products/view/:productId',
  component: () => import('./components/product-detail'),
  title: 'View Product',
}
```

### With optional parameters

A route can have optional parameters that are not required. A parameter is denoted as optional by adding a `?` to the end of the parameter.

```typescript
{
  path: 'products/view/:productId?',
  component: () => import('./components/product-detail'),
  title: 'View Product',
}
```

