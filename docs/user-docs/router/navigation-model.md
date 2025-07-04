---
description: Create a navigation menu using navigation model in Router-Lite.
---

# Navigation model

The navigation model can be thought of as view-friendly version of the configured routes.
It provides similar information as of the configured routes with some additional data to it.
This is typically useful when you want to create navigation menu from the already registered/configured routes in the router, without necessarily duplicating the data.
The information takes the following shape.

```typescript
interface INavigationModel {
  /**
   * Collection of routes.
   */
  readonly routes: readonly {
    readonly id: string;
    readonly path: string[];
    readonly redirectTo: string | null;
    readonly title: string | ((node: RouteNode) => string | null) | null;
    readonly data: Record<string, unknown>;
    readonly isActive: boolean;
  }[];
}
```
Note that apart from [`isActive`](#using-the-isactive-property), all other properties of the route object are same as the corresponding configured route.

This section provides example of how to use navigation model while discussing different aspects of it.

## Create a navigation menu using a navigation model

The following example shows how to create a navigation menu using the info from the navigation model.

{% embed url="https://stackblitz.com/edit/router-lite-navigation-model?ctl=1&embed=1&file=src/nav-bar.ts" %}

In this example, we are using a custom element named `nav-bar`.
In the custom element we inject an instance of `IRouteContext` and we grab the navigation model from the routing context.

```typescript
import { resolve } from 'aurelia';
import { INavigationModel, IRouteContext } from '@aurelia/router';

export class NavBar {
  private readonly navModel: INavigationModel = resolve(IRouteContext).routeConfigContext.navigationModel;

  public async binding() {
    await this.navModel.resolve()
  }
}
```

Then the information from the model is used in the view to create the navigation menu.

```html
<nav style="display: flex; gap: 0.5rem;">
    <template repeat.for="route of navModel.routes">
        <a href.bind="route.path | firstNonEmpty">\${route.title}</a>
    </template>
</nav>
```

It additionally shows that from the `NavBar#binding`, `INavigationModel#resolve()` is awaited.
This is recommended, when dealing with async route configuration.
This allows all the promises to be resolved and thereafter building the navigation information correctly.

{% hint style="info" %}
Note that in the example above we aren't dealing with async routing.
Therefore, *for that example* waiting the `INavigationModel#resolve()` can be avoided.
{% endhint %}

{% hint style="info" %}
In case you want to inject the `IRouteContext` in the app-root, you need to use a lazy injection, for example: `routeContext = resolve(lazy(IRouteContext))`. An eager injection does not work for app-root due to the timing of app root and the root route-context creation.
{% endhint %}

## Using the `isActive` property

The `isActive` property is `true` when this route is currently active (loaded), and otherwise it is `false`.
A typical use-case for this property is to apply or remove the "active" style to the links, depending on if the link is active or not.
You can see this in the following example where a new `.active` class is added and that is bound to the `isActive` property.

```html
<style>
  .active {
    font-weight: bold;
  }
</style>
<nav>
  <template repeat.for="route of navModel.routes">
    <a href.bind="route.path | firstNonEmpty" active.class="route.isActive">${route.title}</a>
  </template>
</nav>
```

You can see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-navigation-model-isactive?ctl=1&embed=1&file=src/nav-bar.ts" %}

## Excluding routes from the navigation model

By default, all configured routes are added to the navigation model.
However, there might be routes which is desired to be excluded from the navigation model; for example: a fallback route for un-configured routes.
To this end, a route can be configured with `nav: false` to instruct the router not to included it in the navigation model.

```typescript
import { route } from '@aurelia/router';
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
      nav: false,       // <-- exclude from navigation model
    },
  ],
  fallback: 'notfound',
})
export class MyApp {}
```

You see this in action in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-navigation-model-exclusion?ctl=1&embed=1&file=src/my-app.ts" %}

## Disabling navigation model

If you are not creating a menu using the navigation model, you can also deactivate the navigation model by setting `false` to the `useNavigationModel` [router option](./router-configuration.md).
Doing so, will set the `IRouteConfigContext#navigationModel` to `null` and skip further processing.

## Combining `ICurrentRoute` with the navigation model

While the navigation model provides information about all configured routes, sometimes you also need the exact active route or query parameters. The `ICurrentRoute` object can be injected in tandem with your navigation model:

```typescript
import { IRouteContext, INavigationModel, ICurrentRoute } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class NavBar {
  // same as regular usage of navigation model
  private readonly navModel: INavigationModel = resolve(IRouteContext).routeConfigContext.navigationModel;
  private readonly currentRoute = resolve(ICurrentRoute);

  public async binding() {
    await this.navModel.resolve();
    console.log('Active segment:', this.currentRoute.path);
    console.log('Active query:', this.currentRoute.url.split('?')[1]);
  }
}
```

Using both `navModel` and `currentRoute`, you can dynamically highlight the active route in your navigation menu, differentiate query-only changes, and so on.
