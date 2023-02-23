---
description: Learn about configuring the Router-Lite.
---

# Router configuration

The router allows you to configure how it interprets and handles routing in your Aurelia applications. The `customize` method on the `RouterConfiguration` object can be used to configure router settings.

## Choose between hash and pushState routing using `useUrlFragmentHash`

If you do not provide any configuration value, the default is pushState routing.
If you prefer hash-based routing to be used, you can enable this like so:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router-lite';

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: true }))
  .app(component)
  .start();
```

By calling the `customize` method, you can supply a configuration object containing the property `useUrlFragmentHash` and supplying a boolean value. If you supply `true` this will enable hash mode. The default is `false`.

If you are working with pushState routing, you will need a `<base>` element with `href` attribute (for more information, refer [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)) in the head of your document. The scaffolded application from the CLI includes this in the `index.html` file, but if you're starting from scratch or building within an existing application you need to be aware of this.

```html
<head>
  <base href="/">
</head>
```

{% hint style="info" %}
PushState requires server-side support. This configuration is different depending on your server setup. For example, if you are using Webpack DevServer, you'll want to set the `devServer.historyApiFallback` option to `true`. If you are using ASP.NET Core, you'll want to call `routes.MapSpaFallbackRoute` in your startup code. See your preferred server technology's documentation for more information on how to allow 404s to be handled on the client with push state.
{% endhint %}

## Configuring `basePath`

Configuring a base path is useful in many real-life scenarios.
One such example is when you are hosting multiple smaller application under a single hosting service.
In this case, you probably want the URLs to look like `https://example.com/app1/view42` or `https://example.com/app2/view21`.
In such cases, it is useful to specify a different [`base#href`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) value for every app.

```html
<!-- app1/index.html -->
<head>
  <base href="/app1">
</head>

<!-- app2/index.html -->
<head>
  <base href="/app2">
</head>
```

Run the following example to understand how the value defined in `base#href` is affecting the URLs.

{% embed url="https://stackblitz.com/edit/router-lite-base-href?embed=1&file=src/my-app.html" %}

When you open the example in a new browser tab, you can note that the URL in the address bar looks the `HOSTING_PREFIX/app/home` or `HOSTING_PREFIX/app/about`.
This is also true for the `href` values in the `a` tags.
This happens because `<base href="/app">` is used in the `index.ejs` (producing the index.html).
In this case, the `router-lite` is picking up the `baseURI` information and performing the routing accordingly.

This needs bit more work when you are supporting multi-tenancy for your app.
In this case, you might want the URLs look like `https://example.com/tenant-foo/app1/view42` or `https://example.com/tenant-bar/app2/view21`.
You cannot set the `document.baseURI` every time you start the app for a different tenant, as that value is static and readonly, read from the `base#href` value.

With `router-lite` you can support this by setting the `basePath` value differently for each tenant, while customizing the router configuration, at bootstrapping phase.
Following is an example that implements the aforementioned URL convention.
To better understand, open the the example in a new tab and check the URL in address bar when you switch tenants as well as the links in the `a` tags.

{% embed url="https://stackblitz.com/edit/router-lite-base-path?ctl=1&embed=1&file=src/main.ts" %}

The actual configuration takes place in the `main.ts` while customizing the router configuration in the following lines of code.

```typescript
  // this can either be '/', '/app[/+]', or '/TENANT_NAME/app[/+]'
  let basePath = location.pathname;
  const tenant =
    (!basePath.startsWith('/app') && basePath != '/'
      ? basePath.split('/')[1]
      : null) ?? 'none';
  if (tenant === 'none') {
    basePath = '/app';
  }
  const host = document.querySelector<HTMLElement>('app');
  const au = new Aurelia();
  au.register(
    StandardConfiguration,
    RouterConfiguration.customize({
      basePath,
    }),
    Registration.instance(ITenant, tenant) // <-- this is just to inject the tenant name in the `my-app.ts`
  );
```

There are also the following links, included in the `my-app.html`, to simulate tenant switch/selection.

{% tabs %}
{% tab title="my-app.html" %}
```html
tenant: ${tenant}
<nav>
  <a href="${baseUrl}/foo/app" external>Switch to tenant foo</a>
  <a href="${baseUrl}/bar/app" external>Switch to tenant bar</a>
</nav>
<nav>
  <a load="home">Home</a>
  <a load="about">About</a>
</nav>

<au-viewport></au-viewport>

```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import { route } from '@aurelia/router-lite';
import template from './my-app.html';
import { Home } from './home';
import { About } from './about';
import { DI } from '@aurelia/kernel';

export const ITenant = DI.createInterface<string>('tenant');

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
  ],
})
@customElement({ name: 'my-app', template })
export class MyApp {
  private baseUrl = location.origin;
  public constructor(@ITenant private readonly tenant: string) {}
}
```
{% endtab %}
{% endtabs %}

Note the `a` tags with [`external` attribute](./navigating.md#bypassing-the-href-custom-attribute).
Note that when you switch to a tenant, the links in the `a` tags also now includes the tenant name; for example when we switch to tenant 'foo' the 'Home' link is changed to `/foo/app/home` from `/app/home`.

## Customizing title

A `buildTitle` function can be used to customize the [default behavior of building the title](./configuring-routes.md#setting-the-title).
For this example, we assume that we have the configured the routes as follows:

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

With this route configuration in place, when we navigate to `/home`, the default-built title will be `Home | Aurelia`.
We can use the following `buildTitle` function that will cause the title to be `Aurelia - Home` when users navigate to `/` or `/home` route.

```typescript
// main.ts
import { RouterConfiguration, Transition } from '@aurelia/router';
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

Check out the following live example. You might need to open the demo in a new tab to observe the title changes.

{% embed url="https://stackblitz.com/edit/router-lite-buildtitle?ctl=1&embed=1&file=src/main.ts" %}

**Translating the title**

When localizing your app, you would also like to translate the title.
Note that the router does not facilitate the translation by itself.
However, there are enough hooks that can be leveraged to translate the title.
To this end, we would use the [`data` property](./configuring-routes.md#advanced-route-configuration-options) in the route configuration to store the i18n key.

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

As `data` is an object of type `Record<string, unknown>`, you are free to chose the property names inside the `data` object.
Here we are using the `i18n` property to store the i18n key for individual routes.

In the next step we make use of the `buildTitle` customization as well as a `AppTask` hook to subscribe to the locale change event.

```typescript
import { I18N, Signals } from '@aurelia/i18n';
import { IEventAggregator } from '@aurelia/kernel';
import { IRouter, RouterConfiguration, Transition } from '@aurelia/router';
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
        const root = tr.routeTree.root;
        const baseTitle = root.context.definition.config.title;
        const child = tr.routeTree.root.children[0];
        return `${baseTitle} - ${i18n.tr(child.data.i18n as string)}`;
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

This customization in conjunction with the previously shown routing configuration will cause the title to be `Aurelia - Startseite` when user is navigated to `/` or `/home` route and the current locale is `de`.
Here we are assuming that the i18n resource for the `de` locale contains the following.

```json
{
  "routes": {
    "home": "Startseite"
  }
}
```

The following example demonstrate the title translation.

{% embed url="https://stackblitz.com/edit/router-lite-translate-title?ctl=1&embed=1&file=src/main.ts" %}

## Enable or disable the usage of the `href` custom attribute using `useHref`

By default, the router will allow you to use both `href` as well as `load` for specifying routes.
Where this can get you into trouble is external links, `mailto:` links and other types of links that do not route.
A simple example looks like this:

```html
<a href="mailto:myemail@gmail.com">Email Me</a>
```

This seemingly innocent and common scenario by default will trigger the router and will cause an error.

You have two options when it comes to working with external links. You can specify the link as external using the [`external` attribute](./navigating.md#bypassing-the-href-custom-attribute).

```html
<a href="mailto:myemail@gmail.com" external>Email Me</a>
```

Or, you can set `useHref` to `false` (default is `true`) and only ever use the `load` attribute for routes.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router-lite';

Aurelia
  .register(RouterConfiguration.customize({
      useHref: false
  }))
  .app(component)
  .start();
```

## Configure browser history strategy

Using the `historyStrategy` configuration option it can be instructed, how the router-lite should interact with the browser history object.
This configuration option can take the following values: `push`, `replace`, and `none`.

### `push`

This is the default strategy.
In this mode, the router-lite will interact with Browser history to `push` a new navigation state each time a new navigation is performed.
This enables the end users to use the back and forward buttons of the browser to navigate back and forth in an application using the router-lite.

Check out the following example to see this in action.

{% embed url="https://stackblitz.com/edit/router-lite-historystrategy-push?ctl=1&embed=1&file=src/main.ts" %}

The main configuration can be found in the `main.ts`.

```typescript
import { RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { MyApp as component } from './my-app';

(async function () {
  const host = document.querySelector<HTMLElement>('app');
  const au = new Aurelia();
  au.register(
    StandardConfiguration,
    RouterConfiguration.customize({
      historyStrategy: 'push', // default value can can be omitted
    })
  );
  au.app({ host, component });
  await au.start();
})().catch(console.error);
```

To demonstrate the `push` behavior, there is a small piece of code in the `my-app.ts` that listens to router events to create informative text (the `history` property in the class) from the browser history object that is used in the view to display the information.

```typescript
import { IHistory } from '@aurelia/runtime-html';
import { IRouterEvents } from '@aurelia/router-lite';

export class MyApp {
  private history: string;
  public constructor(
    @IHistory history: IHistory,
    @IRouterEvents events: IRouterEvents
  ) {
    let i = 0;
    events.subscribe('au:router:navigation-end', () => {
      this.history = `#${++i} - len: ${history.length} - state: ${JSON.stringify(history.state)}`;
    });
  }
}
```

As you click the `Home` and `About` links in the example, you can see that the new states are being pushed to the history, and thereby increasing the length of the history.

### `replace`

This can be used to replace the current state in the history.
Check out the following example to see this in action.
Note that the following example is identical with the previous example, with the difference of using the `replace`-value as the history strategy.

{% embed url="https://stackblitz.com/edit/router-lite-historystrategy-replace?ctl=1&embed=1&file=src/main.ts" %}

As you interact with this example, you can see that new states are replacing old states, and therefore, unlike the previous example, you don't observe any change in the length of the history.

### `none`

Use this if you don't want the router-lite to interact with the history at all.
Check out the following example to see this in action.
Note that the following example is identical with the previous example, with the difference of using the `none`-value as the history strategy.

{% embed url="https://stackblitz.com/edit/router-lite-historystrategy-none?ctl=1&embed=1&file=src/main.ts" %}

As you interact with this example, you can see that there is absolutely no change in the history information, indicating non-interaction with the history object.

### Override configured history strategy

You can use the [navigation options](./navigating.md#using-navigation-options) to override the configured history strategy for individual routing instructions.
