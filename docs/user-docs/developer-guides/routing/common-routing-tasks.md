# Routing fundamentals

This section details common scenarios and tasks using the router in your Aurelia applications. These basic concepts allow you to set route titles, pass data between routes and do other things you might commonly do with a router.

It is highly recommended that you familiarize yourself with other parts of the router documentation before consulting this section, as we will introduce concepts that you might not be familiar with just yet that are mentioned in other sections of the router documentation.

## Styling Active Router Links

A common scenario is styling an active router link with styling to signify that the link is active, such as making the text bold. The `load` attribute has a bindable property named `active` which you can bind to a property on your view-model to use for conditionally applying a class:

```css
.active {
    font-weight: bold;
}
```

```html
<a active.class="_settings" load="route:settings; active.bind:_settings">
    Settings
</a>
```

The `active` property is a boolean value that we bind to. In this example, we use an underscore to signify this is a private property.

{% hint style="info" %}
You do not need to explicitly declare this property in your view model since it is a from-view binding. The underscore prefix of \_settings has no special meaning to the framework, it is just a common convention for private properties which can make sense for properties that are not explicitly declared in the view model.
{% endhint %}

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

With this configuration in place, the default-built title will be `Home | Aurelia` when user is navigated to `/` or `/home` route. That is the titles of the child routes precedes the base title.

### Customizing the title

Using the `buildTitle` method from the router customization the default title-building logic can overwritten.

```typescript
// main.ts
import { RouterConfiguration, Transition } from '@aurelia/router-lite';
import { Aurelia } from '@aurelia/runtime-html';

const au = new Aurelia();
au.register(
  RouterConfiguration.customize({
    buildTitle(tr: Transition) {
      const root = tr.routeTree.root;
      const baseTitle = root.context.definition.config.title;
      const titlePart = root.children.map(c => c.title).join(' - ');
      return `${baseTitle} - ${titlePart}`;
    },
  }),
);
```

This customization in conjunction with the previously shown routing configuration will cause the title to be `Aurelia - Home` when user is navigated to `/` or `/home` route.

### Translating the title

When localizing your app, you would also like to translate the title.
Note that the router does not facilitate the translation by itself.
However, there are enough hooks that can be leveraged to translate the title.
To this end, we would use the `data` property in the route configuration to store the i18n key.

```typescript
import { IRouteViewModel, Routeable } from "aurelia";

export class MyApp implements IRouteViewModel {
  static title: string = 'Aurelia';
  static routes: Routeable[] = [
    {
      path: ['', 'home'],
      component: import('./components/home-page'),
      title: 'Home',
      data: {
        i18n: 'routes.home'
      }
    }
  ];
}
```

Loosely speaking, `data` is an object of type `Record<string, string>`.
Therefore you are free to chose the property names inside the `data` object.
Here we are using the `i18n` property to store the i18n key for individual routes.

In the next step we make use of the `buildTitle` customization as well as a `AppTask` hook to subscribe to the locale change event.

```typescript
import { I18N, Signals } from '@aurelia/i18n';
import { IEventAggregator } from '@aurelia/kernel';
import { IRouter, RouterConfiguration, Transition } from '@aurelia/router-lite';
import { AppTask, Aurelia } from '@aurelia/runtime-html';

(async function () {
  const host = document.querySelector<HTMLElement>('app');

  const au = new Aurelia();
  const container = au.container;
  let i18n: I18N | null = null;
  let router: IRouter | null = null;
  au.register(
    // other registrations such as the StandardRegistration, I18NRegistrations come here
    RouterConfiguration.customize({
      buildTitle(tr: Transition) {
        // Use the I18N to translate the titles using the keys from data.i18n.
        i18n ??= container.get(I18N);
        const baseTitle = root.context.definition.config.title;
        const child = tr.routeTree.root.children[0];
        return `${baseTitle} - ${i18n.tr(child.data.i18n)}`;
      },
    }),
    AppTask.afterActivate(IEventAggregator, ea => {
      // Ensure that the title changes whenever the locale is changed.
      ea.subscribe(Signals.I18N_EA_CHANNEL, () => {
        (router ??= container.get(IRouter)).updateTitle();
      });
    }),
  );

  // start aurelia here

})().catch(console.error);
```

This infra in conjunction in conjunction with the previously shown routing configuration will cause the title to be `Aurelia - Startseite` when user is navigated to `/` or `/home` route and the current locale is `de`.
Here we are assuming that the i18n resource for the `de` locale contains the following.

```json
{
  "routes": {
    "home": "Startseite"
  }
}
```

### Setting the title from component

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
