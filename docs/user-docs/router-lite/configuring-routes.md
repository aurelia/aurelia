---
description: Learn about configuring routes in Router-Lite.
---

# Configuring Routes

The router takes your routing instructions and matches the URL to one of the configured Routes to determine which components to render.
To register routes you can either use the `@route` decorator or you can use the `static routes` property to register one or more routes in your application.
This section describes the route configuration options in details.

## Route configuration basics

The routing configuration syntax for router-lite is similar to that of other routers you might have worked with before. If you have worked with Express.js routing, then the syntax will be very familiar to you.

A route is an object containing a few required properties that tell the router what component to render, what URL it should match on and other route-specific configuration options.

The most usual case of defining a route configuration is by specifying the `path` and the `component` properties.
The idea is to use the `path` property to define a pattern, which when seen in the URL path, the view model defined using the `component` property is activated by the router-lite.
Simply put, a routing configuration is a mapping between one or more path patterns to components.
Below is the simple example (from the [getting started](./getting-started.md) section) of this.

```typescript
import { route } from '@aurelia/router-lite';
import { Home } from './home';
import { About } from './about';

@route({
  title: 'Aurelia',
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

{% hint style="info" %}
Note that you can map multiple paths to a single component.
Although these paths can be thought of as aliases, multiple paths, in combination with [path parameters](#path-and-parameters) gets interesting.
Another way of creating aliases is to use the [`redirectTo`](#redirect-to-another-path) configuration option.
{% endhint %}

Note that the example above uses the `@route` decorator.
In case you cannot use the decorator, you can use the static properties instead.
The example shown above can be rewritten as follows.

```typescript
import { Routeable } from '@aurelia/router-lite';
import { Home } from './home';
import { About } from './about';

export class MyApp {
  // corresponds to the `title` property in the options object used in the @route decorator.
  static title: string = 'Aurelia';

  // corresponds to the `routes` property in the options object used in the @route decorator.
  static routes: Routeable[] = [
    {
      path: ['', 'home'],
      component: Home,
    },
    {
      path: 'about',
      component: About,
    },
  ];
}
```

As the re-written example shows, you can convert the properties in the options object used for the `@route` decorator into `static` properties in the view model class.

Apart from the static API including the `@route` decorator, there is also an instance-level hook named `getRouteConfig` that you can use to configure your routes.
This is shown in the example below.

```typescript
import { IRouteConfig, RouteNode } from '@aurelia/router-lite';
import { Home } from './home';
import { About } from './about';

export class MyApp {
  public getRouteConfig(_parentConfig: IRouteConfig | null, _routeNode: RouteNode | null): IRouteConfig {
    return {
      routes: [
        {
          path: ['', 'home'],
          component: Home,
          title: 'Home',
        },
        {
          path: 'about',
          component: About,
          title: 'About',
        },
      ],
    };
  }
}
```

See this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-getrouteconfig-hook?ctl=1&embed=1&file=src/my-app.ts" %}

Note that the hook is also supplied with a parent route configuration, and the new route node.
These values can be nullable; for example, for root node there is no parent route configuration.

The `getRouteConfig` can also be `async`.
This is shown in the example below.

```typescript
import { IRouteConfig, RouteNode } from '@aurelia/router-lite';

export class MyApp {
  public getRouteConfig(_parentConfig: IRouteConfig | null, _routeNode: RouteNode | null): IRouteConfig {
    return {
      routes: [
        {
          path: ['', 'home'],
          component: await import('./home').then((x) => x.Home),
          title: 'Home',
        },
        {
          path: 'about',
          component: await import('./about').then((x) => x.About),
          title: 'About',
        },
      ],
    };
  }
}
```

See this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-async-getrouteconfig-hook?ctl=1&embed=1&file=src/my-app.ts" %}

## `path` and parameters

The path defines one or more patterns, which are used by the router-lite to evaluate whether or not an URL matches a route or not.
A path can be either a static string (empty string is also allowed, and is considered as the default route) without any additional dynamic parts in it, or it can contain parameters.
The paths defined on every routing hierarchy (note that routing configurations can be hierarchical) must be unique.

### Required parameters

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

When a given URL matches one such route, the parameter value is made available in the `canLoad`, and `load` [routing hooks](./routing-lifecycle.md).

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

### Optional parameters

Optional parameters start with a colon and end with a question mark.
The following example shows how to use an optional parameter in the `path`.

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

Note that there is an additional link added to the `products.html` to fetch a random product.

```html
<li>
  <a href="../product">Random product</a>
</li>
```

As the `id` parameter is optional, even without a value for the `id` parameter, clicking the link loads the `Product` component.
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

### Wildcard parameters

The wildcard parameters, start with an asterisk instead of a colon, act as a catch-all, capturing everything provided after it.
The following example shows how to use a wildcard parameter in the `path`.

```typescript
import { route } from '@aurelia/router-lite';
import { Product } from './product';

@route({
  routes: [
    {
      id: 'foo',
      path: ['product/:id', 'product/:id/*rest'],
      component: Product,
    },
  ],
})
export class MyApp {}
```

In the example, shown above, the `Product` component is loaded when the router-lite sees paths like `/product/some-id` or `/product/some-id/foo/bar`.
You can see the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-wildcard-param?ctl=1&embed=1&file=src/my-app.ts" %}

The example utilizes a wildcard parameter named `rest`, and when the value of `rest` is `'image'`, an image for the product is shown.
To this end, the `canLoad` hook of the `Product` view-model reads the `rest` parameter.

```typescript
public canLoad(params: Params): boolean {
  const id = Number(params.id);
  this.promise = this.productService.get(id);
  this.showImage = params.rest == 'image';
  return true;
}
```

## Setting the title

You can configure the title for the routes while you are configuring the routes.
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

Note that, instead of a string, a function can also be used for `title` to lazily set the title.

## Redirect to another path

By specifying the `redirectTo` property on our route, we can create route aliases.
These allow us to redirect to other routes.
In the following example, we redirect our default route to the `home` page and the `about-us` to `about` page.

```typescript
@route({
  routes: [
    { path: '', redirectTo: 'home' },
    { path: 'about-us', redirectTo: 'about' },
    {
      path: 'home',
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

You can see this action below.

{% embed url="https://stackblitz.com/edit/router-lite-redirect?ctl=1&embed=1&file=src/my-app.ts" %}

Note that redirection also works when there are multiple paths/aliases defined for the same component.

```typescript
@route({
  routes: [
    { path: 'foo', redirectTo: 'home' },
    { path: 'bar', redirectTo: 'about' },
    { path: 'fizz', redirectTo: 'about-us' },
    {
      path: ['', 'home'],
      component: Home,
      title: 'Home',
    },
    {
      path: ['about', 'about-us'],
      component: About,
    },
  ],
})
export class MyApp {}
```

You can see this action below.

{% embed url="https://stackblitz.com/edit/router-lite-redirect-multiple-paths?ctl=1&embed=1&file=src/my-app.ts" %}

You can use route parameters for `redirectTo`.
The following example shows that the parameters from the `about-us` path is rearranged to the `about` path.

```typescript
import { route } from '@aurelia/router-lite';
import { About } from './about';

@route({
  routes: [
    { path: 'about-us/:foo/:bar', redirectTo: 'about/:bar/:foo' },
    {
      path: 'about/:p1?/:p2?',
      component: About,
      title: 'About',
    },
  ],
})
export class MyApp {}
```

You can see this action below.

{% embed url="https://stackblitz.com/edit/router-lite-redirect-parameterized?ctl=1&embed=1&file=src/main.ts" %}

## Fallback: redirecting the unknown path

We can instruct the router-lite to redirect the users to a different configured path, whenever it sees any unknown/un-configured paths.
To this end, we can use the `fallback` configuration option.
Following example shows how to use this configuration option.

{% embed url="https://stackblitz.com/edit/router-lite-redirect-multiple-paths-ecrbxz?ctl=1&embed=1&file=src/my-app.ts" %}

As the example shows, the `fallback` is configured as follows.

```typescript
import { route } from '@aurelia/router-lite';
import template from './my-app.html';
import { Home } from './home';
import { About } from './about';
import { NotFound } from './not-found';

@route({
  routes: [
    {
      path: ['', 'home'],
      component: Home,
      title: 'Home',
    },
    {
      path: 'about',
      component: About,
      title: 'About',
    },
    {
      path: 'notfound',
      component: NotFound,
      title: 'Not found',
    },
  ],
  fallback: 'notfound', // <-- fallback configuration
})
export class MyApp {}
```

There is a custom element, named `NotFound`, which is meant to be loaded when any unknown/un-configured route is encountered.
As you can see in the above example, clicking the "Foo" link that is with un-configured `href`, leads to the `NotFound` view.


{% hint style="info" %}
It is recommended that you configure a `fallback` at the root to handle the navigation to un-configured routes gracefully.
{% endhint %}

Another way of defining the `fallback` is to use the [route-`id`](#route-configuration-options).
The following example demonstrates this behavior, where the `NotFound` view can be reached via multiple aliases, and instead of choosing one of these aliases the route-`id` is used to refer the route.

{% embed url="https://stackblitz.com/edit/router-lite-fallback-using-routeid?ctl=1&embed=1&file=src/my-app.ts" %}

The name of the custom element, meant to be displayed for any un-configured route can also be used to define `fallback`.
The following example demonstrates this behavior, where `not-found`, the name of custom element `NotFound`, is used to refer the route.

{% embed url="https://stackblitz.com/edit/router-lite-fallback-using-ce-name?ctl=1&embed=1&file=src/not-found.ts" %}

An important point to note here is that when you are using the custom element name as fallback, you need to ensure that the custom element is registered to the DI container.
Note that in the example above, the `NotFound` component is registered to the DI container in `main.ts`.

A `fallback` defined on parent is inherited by the children (to know more about hierarchical routing configuration, refer the [documentation](./viewports.md#hierarchical-routing)).
However, every child can override the fallback as needed.
The following example demonstrate this.
The root has two [sibling viewports](./viewports.md#sibling-viewports) and two children components can be loaded into each of those by clicking the link.
Every child defines their own child routing configuration.
The root defines a `fallback` and one of the children overrides the `fallback` by defining one of its' own.
With this configuration in place, when navigation to a un-configured route ('Foo') is attempted for each children, one loads the overridden version whereas the other loads the fallback inherited from the parent (in this case the root).

{% embed url="https://stackblitz.com/edit/router-lite-fallback-hierarchical?ctl=1&embed=1&file=src/my-app.ts" %}

A function can be used for `fallback`.
The function takes the following signature.

```typescript
fallback(viewportInstruction: ViewportInstruction, routeNode: RouteNode, context: IRouteContext): string;
```

An example can look like below, where the example redirects the user to `NF1` component if an attempt to load a path `/foo` is made.
Every other attempt to load an unknown path is results loading the `NF2` component.

```typescript
import { customElement } from '@aurelia/runtime-html';
import {
  IRouteContext,
  ITypedNavigationInstruction_string,
  route,
  RouteNode,
  ViewportInstruction,
} from '@aurelia/router-lite';

@customElement({ name: 'ce-a', template: 'a' })
class A {}

@customElement({ name: 'n-f-1', template: 'nf1' })
class NF1 {}

@customElement({ name: 'n-f-2', template: 'nf2' })
class NF2 {}

@route({
  routes: [
    { id: 'r1', path: ['', 'a'], component: A },
    { id: 'r2', path: ['nf1'], component: NF1 },
    { id: 'r3', path: ['nf2'], component: NF2 },
  ],
  fallback(vi: ViewportInstruction, _rn: RouteNode, _ctx: IRouteContext): string {
    return (vi.component as ITypedNavigationInstruction_string).value === 'foo' ? 'r2' : 'r3';
  },
})
@customElement({
  name: 'my-app',
  template: `
  <nav>
  <a href="a">A</a>
  <a href="foo">Foo</a>
  <a href="bar">Bar</a>
</nav>

<au-viewport></au-viewport>`
})
export class MyApp {}
```

You can also see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-fallback-using-function?ctl=1&embed=1&file=src/my-app.html" %}


## Case sensitive routes

Routes can be marked as case-sensitive in the configuration, allowing the navigation to the component only when the case matches exactly the configured path.
See the example below where the navigation to the "about" page is only successful when the casing matches.

```typescript
import { route } from '@aurelia/router-lite';
import { About } from './about';

@route({
  routes: [
    {
      path: 'AbOuT',
      component: About,
      caseSensitive: true,
    },
  ],
})
export class MyApp {}
```

Thus, only an attempt to the `/AbOuT` path loads the `About` component; any attempt with a different casing is navigated to the `fallback`.
See this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-case-sensitive?ctl=1&embed=1&file=src/my-app.ts" %}

## Advanced route configuration options

There are few other routing configuration which aren't discussed above.
Our assumption is that these options are more involved and might not be used that often.
Moreover, to understand the utility of these options fully, knowledge of other parts of the route would be beneficial.
Therefore, this section only briefly introduces these options providing links to the sections with detailed examples.

* `id` — The unique ID for this route. The router-lite implicitly generates a `id` for a given route, if an explicit value for this property is missing. Although this is not really an advanced property, due to the fact that a route can be uniquely identified with `id`, it can be used in many interesting ways. For example, this can be used to generate the `href`s in the view when using the [`load` custom attribute](./navigating.md#using-the-load-custom-attribute) or using the [`Router#load` API](./navigating.md#using-the-router-api). Using this property is also very convenient when there are multiple aliases for a single route, and we need a unique way to refer to this route.
* `transitionPlan` — How to behave when the currently active component is scheduled to be loaded again in the same viewport. For more details, please refer the [documentation](./transition-plans.md).
* `viewport` — The name of the viewport this component should be loaded into. This demands a full fledged documentation of its own. Refer to the [viewport documentation](./viewports.md#specifying-a-viewport-name-on-a-route) for more details.
* `data` — Any custom data that should be accessible to matched components or hooks. The value of this configuration property must be an object and the object can take any shape (that is there is no pre-defined interface/class for this object). A typical use-case for the `data` property is to define the permissions, required by the users, when they attempt to navigate to this route. Refer [an example](./router-hooks.md#example-authentication-and-authorization) of this.
* `nav` - Set this flag to `false` (default value is `true`), to instruct the router not to add the route to the [navigation model](./navigation-model.md). This is typically useful to [exclude routes](./navigation-model.md#excluding-routes-from-the-navigation-model) from the public navigation menu.

## Specifying component

Before finishing the section on the route configuration, we need to discuss one last topic for completeness, and that is how many different ways you can configure the `component`.
Throughout various examples so far we have seen that components are configured by importing and using those in the routing configuration.
However, there are many other ways in which the components can be configured.
This section discusses those.

### Using inline `import()`

Components can be configured using the [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) or dynamic import.
Instead of statically importing the components, those can be imported using `import()`-syntax, as the example shows below.

```diff
  import { customElement } from '@aurelia/runtime-html';
  import { route } from '@aurelia/router-lite';
  import template from './my-app.html';
- import { About } from './about';
- import { Home } from './home';

  @route({
    routes: [
      {
        path: ['', 'home'],
-       component: Home,
+       component: import('./home'),
        title: 'Home',
      },
      {
        path: 'about',
-       component: About,
+       component: import('./about'),
        title: 'About',
      },
    ],
  })
@customElement({ name: 'my-app', template })
export class MyApp {}
```

You can see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-component-inline-import?ctl=1&embed=1&file=src/my-app.ts" %}

{% hint style="info" %}
If you are using TypeScript, ensure that the `module` property set to `esnext` in your `tsconfig.json` to support inline import statements.
{% endhint %}

### Using the name

Components can be configured using only the custom-element name of the component.

```diff
  import { customElement } from '@aurelia/runtime-html';
  import { route } from '@aurelia/router-lite';
  import template from './my-app.html';
- import { About } from './about';
- import { Home } from './home';

  @route({
    routes: [
      {
        path: ['', 'home'],
-       component: Home,
+       component: 'ho-me', // <-- assuming that Home component has the name 'ho-me'
        title: 'Home',
      },
      {
        path: 'about',
-       component: About,
+       component: 'ab-out', // <-- assuming that About component has the name 'ab-out'
        title: 'About',
      },
    ],
  })
@customElement({ name: 'my-app', template })
export class MyApp {}
```
However, when configuring the route this way, you need to register the components to the DI.

```typescript
// main.ts
import { RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { About } from './about';
import { Home } from './home';
import { MyApp as component } from './my-app';

(async function () {
  const host = document.querySelector<HTMLElement>('app');
  const au = new Aurelia();
  au.register(
    StandardConfiguration,
    RouterConfiguration,

    // component registrations
    Home,
    About,
  );
  au.app({ host, component });
  await au.start();
})().catch(console.error);
```

You can see this configuration in action below.

{% embed url="https://stackblitz.com/edit/router-lite-component-ce-name?ctl=1&embed=1&file=src/my-app.ts" %}

### Using a function returning the class

Components can be configured using a function that returns a class.

```diff
  import { customElement } from '@aurelia/runtime-html';
  import { route } from '@aurelia/router-lite';
  import template from './my-app.html';
- import { About } from './about';
- import { Home } from './home';

  @route({
    routes: [
      {
        path: ['', 'home'],
-       component: Home,
+       component: () => {
+         @customElement({ name: 'ho-me', template: '<h1>${message}</h1>' })
+         class Home {
+           private readonly message: string = 'Welcome to Aurelia2 router-lite!';
+         }
+         return Home;
+       },
        title: 'Home',
      },
      {
        path: 'about',
-       component: About,
+       component: () => {
+         @customElement({ name: 'ab-out', template: '<h1>${message}</h1>' })
+         class About {
+           private readonly message = 'Aurelia2 router-lite is simple';
+         }
+         return About;
+       },
        title: 'About',
      },
    ],
  })
@customElement({ name: 'my-app', template })
export class MyApp {}
```

You can see this configuration in action below.

{% embed url="https://stackblitz.com/edit/router-lite-component-function?ctl=1&embed=1&file=src/my-app.ts" %}

### Using custom element definition

Components can be configured using custom element definition.

```diff
  import { customElement } from '@aurelia/runtime-html';
  import { route } from '@aurelia/router-lite';
  import template from './my-app.html';
- import { About } from './about';
- import { Home } from './home';

+ class Home {
+   private readonly message: string = 'Welcome to Aurelia2 router-lite!';
+ }
+ const homeDefn = CustomElementDefinition.create(
+   { name: 'ho-me', template: '<h1>${message}</h1>' },
+   Home
+ );
+ CustomElement.define(homeDefn, Home);
+
+ class About {
+   private readonly message = 'Aurelia2 router-lite is simple';
+ }
+ const aboutDefn = CustomElementDefinition.create(
+   { name: 'ab-out', template: '<h1>${message}</h1>' },
+   About
+ );
+ CustomElement.define(aboutDefn, About);

  @route({
    routes: [
      {
        path: ['', 'home'],
-       component: Home,
+       component: homeDefn,
        title: 'Home',
      },
      {
        path: 'about',
-       component: About,
+       component: aboutDefn,
        title: 'About',
      },
    ],
  })
@customElement({ name: 'my-app', template })
export class MyApp {}
```

You can see this configuration in action below.

{% embed url="https://stackblitz.com/edit/router-lite-component-ce-defn?ctl=1&embed=1&file=src/my-app.ts" %}

### Using custom element instance

Components can be configured using custom element instance.

```diff
  import { customElement } from '@aurelia/runtime-html';
  import { route } from '@aurelia/router-lite';
  import template from './my-app.html';
- import { About } from './about';
- import { Home } from './home';

+ @customElement({ name: 'ho-me', template: '<h1>${message}</h1>' })
+ class Home {
+   private readonly message: string = 'Welcome to Aurelia2 router-lite!';
+ }
+
+ @customElement({ name: 'ab-out', template: '<h1>${message}</h1>' })
+ class About {
+   private readonly message = 'Aurelia2 router-lite is simple';
+ }

  @route({
    routes: [
      {
        path: ['', 'home'],
-       component: Home,
+       component: new Home(),
        title: 'Home',
      },
      {
        path: 'about',
-       component: About,
+       component: new About(),
        title: 'About',
      },
    ],
  })
@customElement({ name: 'my-app', template })
export class MyApp {}
```

You can see this configuration in action below.

{% embed url="https://stackblitz.com/edit/router-lite-component-ce-instance-jx3kee?ctl=1&embed=1&file=src/my-app.ts" %}

## Using classes as routes

Using router-lite it is also possible to use the routed view model classes directly as routes configuration.
The following example demonstrates that the `C1` and `C2` classes are used directly as the child routes for the `Root`.

```typescript
@customElement({ name: 'c-1', template: 'c1', aliases: ['c-a', 'c-one'] })
class C1 { }

@customElement({ name: 'c-2', template: 'c2', aliases: ['c-b', 'c-two'] })
class C2 { }

@route({
  routes: [C1, C2]
})
@customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
class Root { }
```

The example above implies that `router.load('c-1')` and `router.load('c-2')` will load the `C1` and `C2` respectively.

{% hint style="info" %}
To know more about the router API refer [this section](./navigating.md#using-the-router-api).
{% endhint %}

Note that this extends also for alias; that is using `router.load('c-a')` and `router.load('c-two')` will load the `C1` and `C2` respectively.

## Distributed routing configurations

The examples discussed so far demonstrate the classic use-cases of route configurations where the parents define the child routes.
Another aspect of these examples are that all the route configurations are centralized on the parent component.
This section provides some examples where that configuration is distributed across different components.

We start by noting that every component can define its own path.
This is shown in the following example.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import { route } from '@aurelia/router-lite';
import { Home } from './home';
import { About } from './about';

@route({
  routes: [Home, About],
})
@customElement({
  name: 'my-app',
  template: `
<nav>
  <a href="home">Home</a>
  <a href="about">About</a>
</nav>

<au-viewport></au-viewport>
`
})
export class MyApp {}

```
{% endtab %}
{% tab title="home.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@route(['', 'home'])
@customElement({ name: 'ho-me', template: '<h1>${message}</h1>' })
export class Home {
  private readonly message: string = 'Welcome to Aurelia2 router-lite!';
}
```
{% endtab %}
{% tab title="about.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@route('about')
@customElement({ name: 'ab-out', template: '<h1>${message}</h1>' })
export class About {
  private readonly message = 'Aurelia2 router-lite is simple';
}
```
{% endtab %}
{% endtabs %}

The example shows that both `Home` and `About` uses the `@route` decorator to define their own paths.
This reduces the child-route configuration for `MyApp` to `@route({ routes: [Home, About] })`.
The example can be seen in action below.

{% embed url="https://stackblitz.com/edit/router-lite-path-on-vm?ctl=1&embed=1&file=src/my-app.ts" %}

Note that other properties of route configuration can also be used in this way.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import { route } from '@aurelia/router-lite';
import { Home } from './home';
import { About } from './about';

@route({
  routes: [Home, About],
})
@customElement({
  name: 'my-app',
  template: `
<nav>
  <a href="home">Home</a>
  <a href="about">About</a>
</nav>

<au-viewport></au-viewport>
`
})
export class MyApp {}

```
{% endtab %}
{% tab title="home.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@route({ path: ['', 'home'], title: 'Home' })
@customElement({ name: 'ho-me', template: '<h1>${message}</h1>' })
export class Home {
  private readonly message: string = 'Welcome to Aurelia2 router-lite!';
}
```
{% endtab %}
{% tab title="about.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@route({ path: 'about', title: 'About' })
@customElement({ name: 'ab-out', template: '<h1>${message}</h1>' })
export class About {
  private readonly message = 'Aurelia2 router-lite is simple';
}
```
{% endtab %}
{% endtabs %}

The previous example demonstrates that the `Home` and `About` components define the `title` for themselves.
The example can be seen in action below.

{% embed url="https://stackblitz.com/edit/router-lite-route-config-on-vm?ctl=1&embed=1&file=src/home.ts" %}

While adapting to distributes routing configuration, the parent can still override the configuration for its children.
This makes sense, because even if a component defines its own `path`, `title` etc. the parent may choose to reach (route) the component via a different path or display a different title when the component is loaded.
This is shown below, where the `MyApp` overrides the routing configurations defined by `About`.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import { route } from '@aurelia/router-lite';
import { Home } from './home';
import { About } from './about';

@route({
  routes: [
    Home,
    { path: 'about-us', component: About, title: 'About us' }
  ],
})
@customElement({
  name: 'my-app',
  template: `
<nav>
  <a href="home">Home</a>
  <a href="about-us">About</a>
</nav>

<au-viewport></au-viewport>
`
})
export class MyApp {}

```
{% endtab %}
{% tab title="home.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@route({ path: ['', 'home'], title: 'Home' })
@customElement({ name: 'ho-me', template: '<h1>${message}</h1>' })
export class Home {
  private readonly message: string = 'Welcome to Aurelia2 router-lite!';
}
```
{% endtab %}
{% tab title="about.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@route({ path: 'about', title: 'About' })
@customElement({ name: 'ab-out', template: '<h1>${message}</h1>' })
export class About {
  private readonly message = 'Aurelia2 router-lite is simple';
}
```
{% endtab %}
{% endtabs %}

This can be seen in action below.

{% embed url="https://stackblitz.com/edit/router-lite-parent-overrides-comp-route-config?ctl=1&embed=1&file=src/my-app.ts" %}

You can also use the `@route` decorator and the `getRouteConfig` together.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import {
  IRouteConfig,
  IRouteViewModel,
  route,
  RouteNode,
} from '@aurelia/router-lite';
import template from './my-app.html';
import { Home } from './home';
import { About } from './about';

@route({ title: 'Aurelia2' })
@customElement({
  name: 'my-app',
  template: `
<nav>
  <a href="home">Home</a>
  <a href="about">About</a>
</nav>

<au-viewport></au-viewport>
`
})
export class MyApp implements IRouteViewModel {
  public getRouteConfig?(
    parentConfig: IRouteConfig | null,
    routeNode: RouteNode | null
  ): IRouteConfig {
    return {
      routes: [Home, About],
    };
  }
}
```
{% endtab %}
{% tab title="home.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@route({ path: ['', 'home'], title: 'Home' })
@customElement({ name: 'ho-me', template: '<h1>${message}</h1>' })
export class Home {
  private readonly message: string = 'Welcome to Aurelia2 router-lite!';
}
```
{% endtab %}
{% tab title="about.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@route({ path: 'about', title: 'About' })
@customElement({ name: 'ab-out', template: '<h1>${message}</h1>' })
export class About {
  private readonly message = 'Aurelia2 router-lite is simple';
}
```
{% endtab %}
{% endtabs %}

This can be seen in action below.

{% embed url="https://stackblitz.com/edit/router-lite-hybrid-config?ctl=1&embed=1&file=src/my-app.ts" %}

The advantage of this kind of distributed configuration is that the routing configuration of every component is defined by every component itself, thereby encouraging encapsulation, leaving the routing configuration at the parent level to merely listing out its child components.
On the other hand, highly distributed route configuration may prevent easy overview of the configured routes.
That's the trade-off.
Feel free to mix and match as per your need and aesthetics.
