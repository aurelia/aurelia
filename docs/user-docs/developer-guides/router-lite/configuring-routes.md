---
description: Learn about configuring routes in Router-Lite.
---

# Configuring Routes

The router takes your routing instructions and matches the URL to one of the configured Routes to determine which components to render.
To register routes you can either use the `@route` decorator or you can use the `static route` property to register one or more routes in your application.

## Route configuration syntax

The routing configuration syntax for router-lite is similar to that of other routers you might have worked with before. If you have worked with Express.js routing, then the syntax will be very familiar to you.

A route is an object containing a few required properties that tell the router what component to render, what URL it should match on and other route-specific configuration options.

The most usual case of defining a route configuration is by specifying the `path` and the `component` properties.
The idea is to use the `path` property to define a pattern, which when seen in the URL path, the view model defined using the `component` property is activated by the router-lite.
Simply put, a routing configuration is a mapping between one or more path patterns to components.
Below is a simple example of this.

```typescript
import { route } from '@aurelia/router-lite';
import { Home } from './home';
import { About } from './about';

@route({
  routes: [
    {
      path: ['', 'home'],
      component: Home,
    },
    {
      path: 'about',
      component: About,
    },
  ],
})
export class MyApp {}
```

For the example above, when the router-lite sees either the path `/` or `/home`, it loads the `Home` component and if it sees the `/about` path it loads the `About` component.
Note that you can map multiple paths to a single component.

### `path` and parameters

The path defines one or more patterns, which are used by the router-lite to evaluate whether or not an URL matches a route or not.
A path can be either a static string (empty string is also allowed, and is considered as the default route) without any additional dynamic parts in it, or it can contain parameters.
The paths defined on every routing hierarchy (note that routing configurations can be hierarchical) must be unique.

**Required parameters**

Required parameters are prefixed with a colon.
The following example shows how to use a required parameter in the `path`.

```typescript
import { route } from '@aurelia/router-lite';
import { Product } from './product';

@route({
  routes: [
    {
      path: 'products/:id',
      component: Product,
    },
  ],
})
export class MyApp {}
```

When a given URL matches one such route, the parameter value is made available in the `canLoad`, and `load` [routing hooks](TODO).

```typescript
import { IRouteViewModel, Params } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';
import template from './product.html';

@customElement({ name: 'pro-duct', template })
export class Product implements IRouteViewModel {
  public canLoad(params: Params): boolean {
    console.log(params.id);
    return true;
  }
}
```

Note that the value of the `id` parameter as defined in the route configuration (`:id`) is available via the `params.id`.
Check out the live example to see this in action.

{% embed url="https://stackblitz.com/edit/router-lite-required-param?ctl=1&embed=1&file=src/my-app.ts" %}

**Optional parameters**

Optional parameters start with a colon and end with a question mark.
The following example shows how to use a required parameter in the `path`.

```typescript
import { route } from '@aurelia/router-lite';
import { Product } from './product';

@route({
  routes: [
    {
      path: 'product/:id?',
      component: Product,
    },
  ],
})
export class MyApp {}
```

In the example, shown above, the `Product` component is loaded when the router-lite sees paths like `/product` or `/product/some-id`, that is irrespective of a value for the `id` parameter.
You can see the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-optional-param?ctl=1&embed=1&file=src/my-app.ts" %}

Note that there is a additional link added to the `products.html` to fetch a random product.

```html
<li>
  <a href="../product">Random product</a>
</li>
```

Because the `id` parameter is optional, even without a value for the `id` parameter, clicking the link loads the `Product` component.
Depending on whether or not there is a value present for the `id` parameter, the `Product` component generates a random id and loads that.

```typescript
public canLoad(params: Params): boolean {
  let id = Number(params.id);
  if (Number.isNaN(id)) {
    id = Math.ceil(Math.random() * 30);
  }

  this.promise = this.productService.get(id);
  return true;
}
```

#### Wildcard parameters

Wildcard parameters. Unlike required and optional parameters, wildcard parameters are not prefixed with a colon, instead of using an asterisk. The asterisk works as a catch-all, capturing everything provided after it.

```typescript
import { IRouteableComponent, IRoute } from "@aurelia/router";

export class MyApp implements IRouteableComponent {
  static routes: IRoute[] = [
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
* `title` — Specify a title for the route. This can be a string, or it can be a function that returns a string.
* `viewport` — The name of the viewport this component should be loaded into.
* `data` — Any custom data that should be accessible to matched components or hooks. This is where you can specify data such as roles and other permissions.
* `routes` — The child routes that can be navigated from this route.

### Redirect

By specifying the `redirectTo` property on our route, we can create route aliases. These allow us to redirect to other routes. In the following example, we redirect our default route to the products page.

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

## Specify routes

When creating routes, it is important to note that the `component` property can do more than accept inline import statements. If you prefer, you can also import the component and specify the component class as the component property.

```typescript
import { IRouteableComponent, IRoute } from "@aurelia/router";
import { HomePage } from './components/home-page';

export class MyApp implements IRouteableComponent {
  static routes: IRoute[] = [
    {
      path: ['', 'home'],
      component: HomePage,
      title: 'Home',
    }
  ]
}
```

As you will learn towards the end of this section, inline import statements allow you to implement lazy loaded routes (which might be needed as your application grows in size).

### Create routes using a static property

If you have a lot of routes, the static property might be preferable from a cleanliness perspective.

```typescript
import { IRouteableComponent, IRoute } from "@aurelia/router";

export class MyApp implements IRouteableComponent {
  static routes: IRoute[] = [
    {
      path: ['', 'home'],
      component: import('./components/home-page'),
      title: 'Home',
    }
  ]
}
```

{% hint style="info" %}
If you have more than a few routes, it might be best practice to write them in a separate file and then import them inside your application.
{% endhint %}

### Defining routes using the route decorator

The syntax for routes stays the same using the decorator, just how they are defined changes slightly.

```typescript
import { IRouteableComponent } from "@aurelia/router";

@route({
    routes: [
      {
        path: ['', 'home'],
        component: import('./components/home-page'),
        title: 'Home',
      }
    ]
})
export class MyApp implements IRouteableComponent {

}
```

## Child routes

As your application grows, child routes can become a valuable way to organize your routes and keep things manageable. Instead of defining all your routes top-level, you can create routes inside your child components to keep them contained.

An example of where child routes might be useful in creating a dashboard area for authenticated users.

{% code title="my-app.ts" %}
```typescript
export class MyApp {
    static routes = [
        {
            path: '/dashboard',
            component: () => import('./dashboard-page'),
            title: 'Dashboard'
        }
    ];
}
```
{% endcode %}

We add a route in our top-level `my-app.ts` component where we added routes in our previous examples. Now, we will create the dashboard-page component.

{% code title="dashboard-page.ts" %}
```typescript
import { DashboardHome } from './dashboard-home';

import { IRouteableComponent } from '@aurelia/router';

export class DashboardPage implements IRouteableComponent {
    static routes = [
        {
            path: '',
            component: DashboardHome,
            title: 'Landing'
        }
    ];
}
```
{% endcode %}

{% code title="dashboard-page.html" %}
```html
<div>
    <au-viewport></au-viewport>
</div>
```
{% endcode %}

You will notice we create routes the same way we learned further above. However, we are defining these inside of a component we are using for our dashboard section. Notice how we use the `au-viewport` element inside of the `dashboard-page` component.

Lastly, let's create our default dashboard component for the landing page.

{% code title="dashboard-home.ts" %}
```typescript
export class DashboardHome {

}
```
{% endcode %}

{% code title="dashboard-home.html" %}
```html
<h1>Dashboard</h1>
<p>Welcome to your dashboard.</p>
```
{% endcode %}

Now, we can contain all dashboard-specific routes inside of our `dashboard-page` component for dashboard views. Furthermore, it allows us to implement route guards to prevent unauthorized users from visiting the dashboard.

## Catch all / 404 not found route

When a user attempts to visit a route that does not exist, we want to catch this route attempt using a catch-all route. We can use a wildcard `*` to create a route that does this.

{% hint style="warning" %}
When using a catch-all wildcard route, ensure that it is the last route in your routes array so it does not hijack any other valid route first.
{% endhint %}

A good use of a catch-all route might be to redirect users away to a landing page. For example, if you had an online store you might just redirect users to a products page.

```typescript
{
    path: '*',
    redirectTo: '/products'
}
```

You can also specify a component that gets loaded like a normal route:

```typescript
{
    path: '*',
    component: () => import('./not-found')
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
Inline import statements are a relatively new feature. Inside your tsconfig.json file, ensure you have your module property set to esnext to support inline import statements using this syntax.
{% endhint %}

## Passing information between routes

We went over creating routes with support for parameters in the creating routes section, but there is an additional property you can specify on a route called `data,` which allows you to associate metadata with a route.

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

This data property will be available in the routable component and can be a great place to store data associated with a route, such as roles and auth permissions. In some instances, the route parameters can be used to pass data, but for other use cases, you should use the data property.

## Styling Active Router Links

A common scenario is styling an active router link with styling to signify that the link is active, such as making the text bold. When a route is active, by default, a CSS class name of `active` will be added to the route element.

```css
.active {
    font-weight: bold;
}
```

In your HTML, if you were to create some links with `load` attributes and visit one of those routes, the `active` class would be applied to the link for styling. In the following example, visiting the about route would put `class="active"` onto our `a` element.

```html
<a load="about">About</a>
<a load="home">Home</a>
```

TODO(Sayan): verify the content above ^^


## Setting the title

You can set the title while you are configuring the routes.
The title can be configured in the root level, as well as in the individual route level.
This can be seen in the following example using the `@route` decorator.

```typescript
import { route, IRouteViewModel } from '@aurelia/router-lite';
@route({
    title: 'Aurelia', // <-- this is the base title
    routes: [
      {
        path: ['', 'home'],
        component: import('./components/home-page'),
        title: 'Home',
      }
    ]
})
export class MyApp implements IRouteViewModel {}
```

If you prefer using the static `routes` property, the title can be set using a static `title` property in the class.
The following example has exactly the same effect as of the previous example.

```typescript
import { IRouteViewModel, Routeable } from "aurelia";
export class MyApp implements IRouteViewModel {
  static title: string = 'Aurelia'; // <-- this is the base title
  static routes: Routeable[] = [
    {
      path: ['', 'home'],
      component: import('./components/home-page'),
      title: 'Home',
    }
  ];
}
```

With this configuration in place, the default-built title will be `Home | Aurelia` when user is navigated to `/` or `/home` route.
That is, the titles of the child routes precedes the base title.
You can customize this default behavior by using a [custom `buildTitle` function](./router-configuration.md#customizing-title) when customizing the router configuration.
