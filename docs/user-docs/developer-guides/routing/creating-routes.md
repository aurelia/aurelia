---
description: Learn all there is to know about creating routes in Aurelia.
---

# Creating routes

The router takes your routing instructions and matches the URL to determine what components to render. In the case of configured routes, when the URL patch matches the configured route path, the component is loaded. If you are using the direct router because there is no configuration the premise is the same without the configuration part.

To register routes you can either use the `@route` decorator or you can use the static routes property `static routes` to register one or more routes in your application.

## Route syntax

The routing syntax used in the Aurelia router is similar to that of other routers you might have worked with before. If you have worked with Express.js routing, then the syntax will be very familiar to you.

A route is an object containing a few required properties that tell the router what component to render, what URL it should match on and other route-specific configuration options.

At a minimum, a route must contain `path` and `component` properties, or `path` and `redirectTo` properties. The `component` and `redirectTo` properties can be used in place of one another, allowing you to create routes that point to other routes.

```typescript
{
    path: 'my-route',
    component: import('./my-component')
}
```

### The anatomy of a route path

The `path` property on a route is where you'll spend the most time configuring your routes. The path tells the router what to match in the URL, what parameters there are and if they're required or not.

A path can be made up of either a static string with no additional values in it, or it can be an array of strings. An empty path value is interpreted as the default route and there should only ever be one specified.

#### Required named parameters

Named required parameters that are prefixed with a colon. `:productId` when used in a path a named required parameter might look like this:

```typescript
import { IRouteViewModel, Routeable } from "aurelia";

export class MyApp implements IRouteViewModel {
  static routes: Routeable[] = [
    {
      path: 'product/:productId',
      component: import('./components/product-detail')
    }
  ]
}
```

#### Optional named parameters

Named optional parameters. Like required parameters, they are prefixed with a colon but end with a question mark.&#x20;

```typescript
import { IRouteViewModel, Routeable } from "aurelia";

export class MyApp implements IRouteViewModel {
  static routes: Routeable[] = [
    {
      path: 'product/:productId/:variation?',
      component: import('./components/product-detail')
    }
  ]
}
```

In the above example, we have an optional parameter called variation. We know it's optional because of the question mark at the end. This means if you were to visit this route with supplying the variation parameter, it would still be valid.

#### Wildcard parameters

Wildcard parameters. Unlike required and optional parameters, wildcard parameters are not prefixed with a colon, instead of using an asterisk. The asterisk works as a catch-all, capturing everything provided after it.&#x20;

```typescript
import { IRouteViewModel, Routeable } from "aurelia";

export class MyApp implements IRouteViewModel {
  static routes: Routeable[] = [
    {
      path: 'files/*path',
      component: import('./components/files-manager')
    }
  ]
}
```

In the above code example, we can have an endless path after which is supplied as a value to the `canLoad` and `load` methods.

### Route configuration options

Besides the basics of `path` and `component` a route can have additional configuration options.

* `id` — The unique ID for this route
* `redirectTo` — Allows you to specify whether this route redirects to another route. If the `redirectTo` path starts with `/` it is considered absolute, otherwise relative to the parent path.
* `caseSensitive` — Determines whether the `path` should be case sensitive. By default, this is `false`
* `transitionPlan` — How to behave when this component is scheduled to be loaded again in the same viewport. Valid values for transitionPlan are:
  * `replace` — completely removes the current component and creates a new one, behaving as if the component changed.
  * `invoke-lifecycles` — calls `canUnload`, `canLoad`, `unload` and `load` (default if only the parameters have changed)
  * `none` — does nothing (default if nothing has changed for the viewport)
* `title` — Specify a title for the route. This can be a string or it can be a function that returns a string.
* `viewport` — The name of the viewport this component should be loaded into.
* `data` — Any custom data that should be accessible to matched components or hooks. This is where you can specify data such as roles and other permissions.
* `routes` — The child routes that can be navigated to from this route.

## Specify routes

When it comes to creating routes, it is important to note that the `component` property can do more than accept inline import statements. If you prefer, you can also import the component itself and specify the component class as the component property.

As you will learn towards the end of this section, inline import statements allow you to implement lazy loaded routes (which might be needed as your application grows in size).

### Create routes using a static property

If you have a lot of routes, the static property might be preferable from a cleanliness perspective.

```typescript
import { IRouteViewModel, Routeable } from "aurelia";

export class MyApp implements IRouteViewModel {
  static routes: Routeable[] = [
    {
      path: ['', 'home'],
      component: import('./components/home-page'),
      title: 'Home',
    }
  ]
}
```

{% hint style="info" %}
If you have more than a few routes, it might be best practice to write your routes in a separate file and then import it inside of your application.
{% endhint %}

### Defining routes using the route decorator

The syntax for routes stays the same using the decorator, just how they are defined changes slightly.

```typescript
import { route, IRouteViewModel } from '@aurelia/router-lite';

@route({
    routes: [
      {
        path: ['', 'home'],
        component: import('./components/home-page'),
        title: 'Home',
      }
    ]
})
export class MyApp implements IRouteViewModel {

}
```

## Lazy loaded routes

Most modern bundlers like Webpack support lazy bundling and loading of Javascript code. The Aurelia router allows you to create routes that are lazily loaded only when they are evaluated. What this allows us to do is keep the initial page load bundle size down, only loading code when it is needed.

```typescript
    {
      path: 'product/:productId',
      component: () => import('./components/product-detail')
    }
```

By specifying an arrow function that returns an inline `import` we are telling the bundler that our route is to be lazily loaded when requested.

{% hint style="warning" %}
Inline import statements are a relatively new feature. Inside of your tsconfig.json file, ensure you have your module property set to esnext to support inline import statements using this syntax.
{% endhint %}
