---
description: Learn all there is to know about creating routes in Aurelia.
---

# Creating Routes

The router takes your routing instructions and matches the URL to determine what components to render. When the URL patch matches the configured route path, the component is loaded in the case of configured routes.

To register routes, you can either use the `@route` decorator or the static routes property `static routes` to register one or more routes in your application.

## Route syntax

The routing syntax used in the Aurelia router is similar to that of other routers you might have worked with before. The syntax will be very familiar if you have worked with Express.js routing.

A route is an object containing a few required properties that tell the router what component to render, what URL it should match and other route-specific configuration options.

At a minimum, a route must contain `path` and `component` properties, or `path` and `redirectTo` properties. The `component` and `redirectTo` properties can be used in place of one another, allowing you to create routes that point to other routes.

```typescript
{
    path: 'my-route',
    component: import('./my-component')
}
```

### The anatomy of a route path

The `path` property on a route is where you'll spend the most time configuring your routes. The path tells the router what to match in the URL, what parameters there are and if they're required.

A path can be made up of either a static string with no additional values or an array of strings. An empty path value is interpreted as the default route, and only one should be specified.

{% hint style="info" %}
Parameters are supplied to `canLoad` and `loading` router lifecycle callbacks as the first argument. They are passed as an object with key/value pairs. Please consult the [Routing Lifecycle](routing-lifecycle.md) section to learn how to access them.
{% endhint %}

#### Required named parameters

Named required parameters that are prefixed with a colon. `:productId` when used in a path, a named required parameter might look like this:

```typescript
import { IRouteableComponent, IRoute } from '@aurelia/router';

export class MyApp implements IRouteableComponent {
  static routes: IRoute[] = [
    {
      path: 'product/:productId',
      component: import('./components/product-detail')
    }
  ]
}
```

This named parameter is denoted by the colon prefix and is called `productId` which we will be able to access within our routed component.

#### Optional named parameters

Named optional parameters. Like required parameters, they are prefixed with a colon but end with a question mark.

```typescript
import { IRouteableComponent, IRoute } from '@aurelia/router';

export class MyApp implements IRouteableComponent {
  static routes: IRoute[] = [
    {
      path: 'product/:productId/:variation?',
      component: import('./components/product-detail')
    }
  ]
}
```

In the above example, we have an optional parameter called `variation`. We know it's optional because of the question mark at the end. This means it would still be valid if you visited this route with supplying the variation parameter.

Using optional name parameters is convenient for routes where different things can happen depending on the presence of those optional parameters.

#### Wildcard parameters

Wildcard parameters. Unlike required and optional parameters, wildcard parameters are not prefixed with a colon, instead using an asterisk. The asterisk works as a catch-all, capturing everything provided after it.

```typescript
import { IRouteableComponent, IRoute } from '@aurelia/router';

export class MyApp implements IRouteableComponent {
  static routes: IRoute[] = [
    {
      path: 'files/*path',
      component: import('./components/files-manager')
    }
  ]
}
```

In the above code example, we can have an endless path after which it is supplied as a value to the `canLoad` and `load` methods.

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

By specifying the `redirectTo` property on our route, we can create route aliases. These allow us to redirect to other routes. We redirect our default route to the products page in the following example.

```typescript
@routes([
    { path: '', redirectTo: 'products' },
    { path: 'products', component: import('./products'), title: 'Products' },
    { path: 'product/:id', component: import('./product'), title: 'Product' }
])
export class MyApp {

}
```

## Specify routes

When creating routes, it is important to note that the `component` property can do more than accept inline import statements. You can also import the component and specify the component class as the component property if you prefer.

If you are working with the Aurelia application generated using `npx makes aurelia` you would already have a `my-app.ts` file to place your routes in. It's the main component of the scaffolded Aurelia application.

```typescript
import { IRouteableComponent, IRoute } from '@aurelia/router';
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

As you will learn towards the end of this section, inline import statements allow you to implement lazy-loaded routes (which might be needed as your application grows in size).

### Create routes using a static property

If you have a lot of routes, the static property might be preferable from a cleanliness perspective.

```typescript
import { IRouteableComponent, IRoute } from '@aurelia/router';

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

The syntax for routes stays the same using the decorator. Just how they have defined changes slightly.

```typescript
import { IRouteableComponent, routes } from '@aurelia/router';

@routes([
    {
        path: ['', 'home'],
        component: import('./components/home-page'),
        title: 'Home',
    }
])
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

You will notice we create routes the same way we learned further above. However, we are defining these inside a component we use for our dashboard section. Notice how we use the `au-viewport` element inside of the `dashboard-page` component.

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
When using a catch-all wildcard route, ensure that it is the last route in your routes array, so it does not hijack any other valid route first.
{% endhint %}

A good use of a catch-all route might be to redirect users away to a landing page. For example, if you had an online store, you might redirect users to a products page.

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
Inline import statements are a relatively new feature. Inside your tsconfig.json file, ensure your module property is set to esnext to support inline import statements using this syntax.
{% endhint %}

## Passing information between routes

We went over creating routes with support for parameters in the creating routes section, but there is an additional property you can specify on a route called `data,` , which allows you to associate metadata with a route.

```typescript
@routes([
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
])
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
