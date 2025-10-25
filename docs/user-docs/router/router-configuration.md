---
description: Learn about configuring the Router.
---

# Router configuration

{% hint style="info" %}
**Bundler note:** These examples import '.html' files as raw strings (showing '?raw' for Vite/esbuild). Configure your bundler as described in [Importing external HTML templates with bundlers](../components/components.md#importing-external-html-templates-with-bundlers) so the imports resolve to strings on Webpack, Parcel, etc.
{% endhint %}

The router allows you to configure how it interprets and handles routing in your Aurelia applications. The `customize` method on the `RouterConfiguration` object can be used to configure router settings.

## Complete Configuration Reference

The router accepts the following configuration options through `RouterConfiguration.customize()` (all map directly to `RouterOptions` except for `basePath`):

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `useUrlFragmentHash` | boolean | `false` | When `true`, uses hash (`#/path`) URLs instead of pushState. Leave `false` for clean URLs. |
| `useHref` | boolean | `true` | Enables the router to intercept standard `href` links. Set to `false` if you only want to route via the `load` attribute. |
| `historyStrategy` | `'push' \| 'replace' \| 'none' \| (instructions) => HistoryStrategy` | `'push'` | Controls how each navigation interacts with `history`. Provide a function to choose per navigation. |
| `basePath` | `string \| null` | `null` | Overrides the base segment used to resolve relative routes. Defaults to `document.baseURI`. |
| `activeClass` | `string \| null` | `null` | CSS class applied by the `load` attribute when a link is active. |
| `useNavigationModel` | boolean | `true` | Generates the navigation model so you can build menus from `IRouteContext.routeConfigContext.navigationModel`. |
| `buildTitle` | `(transition: Transition) => string \| null` | `null` | Customises how page titles are produced. Return `null` to skip title updates. |
| `restorePreviousRouteTreeOnError` | boolean | `true` | Restores the previous route tree if a navigation throws, preventing partial states. |
| `treatQueryAsParameters` | boolean | `false` (deprecated) | Treats query parameters as route parameters. Avoid new usage; scheduled for removal in the next major release. |
| `useEagerLoading` | boolean | `false` | When `true`, eagerly loads all route configurations upfront when the application starts. |

> Pass a partial options object—the router merges your values with the defaults so you only specify what changes. Configure options before the router starts (for example, via `AppTask`) so navigations consistently use the same settings.

## Choose between hash and pushState routing using `useUrlFragmentHash`

If you do not provide any configuration value, the default is pushState routing.
If you prefer hash-based routing to be used, you can enable this like so:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: true }))
  .app(MyApp)
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
In this case, the `router` is picking up the `baseURI` information and performing the routing accordingly.

This needs bit more work when you are supporting multi-tenancy for your app.
In this case, you might want the URLs look like `https://example.com/tenant-foo/app1/view42` or `https://example.com/tenant-bar/app2/view21`.
You cannot set the `document.baseURI` every time you start the app for a different tenant, as that value is static and readonly, read from the `base#href` value.

With `router` you can support this by setting the `basePath` value differently for each tenant, while customizing the router configuration, at bootstrapping phase.
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
import { route } from '@aurelia/router';
import template from './my-app.html?raw';
import { Home } from './home';
import { About } from './about';
import { DI } from '@aurelia/kernel';
import { resolve } from '@aurelia/kernel';

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
  private readonly tenant: string = resolve(ITenant);
}
```
{% endtab %}
{% endtabs %}

Note the `a` tags with [`external` attribute](./navigating.md#bypassing-the-href-custom-attribute).
Note that when you switch to a tenant, the links in the `a` tags also now includes the tenant name; for example when we switch to tenant 'foo' the 'Home' link is changed to `/foo/app/home` from `/app/home`.

## Provide a custom location manager

If your host does not behave like a normal browser history stack (for example, a native WebView, an Electron shell, or a sandbox that proxies URLs), override the router’s location manager. The router always resolves `ILocationManager` from DI and ships with a browser-based implementation. Register your own class that implements the same public surface (`startListening`, `stopListening`, `handleEvent`, `pushState`, `replaceState`, `getPath`, `addBaseHref`, `removeBaseHref`) before the router starts:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration, ILocationManager } from '@aurelia/router';
import { Registration } from '@aurelia/kernel';

class WebViewLocationManager implements ILocationManager {
  constructor(private readonly host = window) {}

  startListening() {/* connect to native host */}
  stopListening() {/* disconnect */}
  handleEvent() {/* publish au:router:location-change */}
  pushState(state: unknown, title: string, url: string) {
    this.host.history.pushState(state, title, `/app/${url}`);
  }
  replaceState(state: unknown, title: string, url: string) {
    this.host.history.replaceState(state, title, `/app/${url}`);
  }
  getPath() {
    return this.host.location.pathname.replace('/app/', '');
  }
  addBaseHref(path: string) { return `/app/${path}`; }
  removeBaseHref(path: string) { return path.replace('/app/', ''); }
}

Aurelia.register(
  RouterConfiguration.customize(),
  Registration.singleton(ILocationManager, WebViewLocationManager),
);
```

Because `RouterConfiguration` registers `BrowserLocationManager` as a singleton, registering your custom implementation afterward replaces it everywhere. Match the method contracts from the linked file so the router keeps receiving normalized URLs and can keep raising `au:router:location-change`.

## Swap the URL parser

`RouterOptions` stores an `_urlParser` instance that is derived from `useUrlFragmentHash`. Advanced apps can replace that parser before any navigation happens. The `_urlParser` field is marked `readonly`, so use `Writable<T>` from `@aurelia/kernel` when mutating:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration, RouterOptions, IRouterOptions, type IUrlParser } from '@aurelia/router';
import { AppTask } from '@aurelia/runtime-html';
import type { Writable } from '@aurelia/kernel';

const createSignedParser = (baseParser: IUrlParser): IUrlParser => ({
  parse(value) {
    const raw = value.replace(/;sig=.*$/, '');
    return baseParser.parse(raw);
  },
  stringify(path, query, fragment, isRooted) {
    const base = baseParser.stringify(path, query, fragment, isRooted);
    return `${base};sig=${sessionStorage.getItem('signature') ?? ''}`;
  },
});

Aurelia.register(
  RouterConfiguration.customize(),
  AppTask.creating(IRouterOptions, (options: RouterOptions) => {
    (options as Writable<RouterOptions>)._urlParser = createSignedParser(options._urlParser);
  }),
);
```

Every call to `ViewportInstruction.toUrl`, `router.load`, or `router.generatePath` now runs through your parser while still using the same API surface as the built-in implementation.

## Customizing title

A `buildTitle` function can be used to customize the [default behavior of building the title](./configuring-routes.md#setting-the-title).
For this example, we assume that we have the configured the routes as follows:

```typescript
import { route, IRouteViewModel } from '@aurelia/router';
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
      const baseTitle = root.context.routeConfigContext.config.title;
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
import type { IRouteViewModel, Routeable } from '@aurelia/router';
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
        const baseTitle = root.context.routeConfigContext.config.title;
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
import { RouterConfiguration } from '@aurelia/router';

Aurelia
  .register(RouterConfiguration.customize({
    useHref: false,
  }))
  .app(MyApp)
  .start();
```

## Configure browser history strategy

Using the `historyStrategy` configuration option it can be instructed, how the router should interact with the browser history object.
This configuration option can take the following values: `push`, `replace`, and `none`.

### `push`

This is the default strategy.
In this mode, the router will interact with Browser history to `push` a new navigation state each time a new navigation is performed.
This enables the end users to use the back and forward buttons of the browser to navigate back and forth in an application using the router.

Check out the following example to see this in action.

{% embed url="https://stackblitz.com/edit/router-lite-historystrategy-push?ctl=1&embed=1&file=src/main.ts" %}

The main configuration can be found in the `main.ts`.

```typescript
import { RouterConfiguration } from '@aurelia/router';
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
import { resolve } from '@aurelia/kernel';
import { IHistory } from '@aurelia/runtime-html';
import { IRouterEvents } from '@aurelia/router';

export class MyApp {
  private history: string;
  public constructor() {
    let i = 0;
    const history = resolve(IHistory);
    resolve(IRouterEvents).subscribe('au:router:navigation-end', () => {
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

Use this if you don't want the router to interact with the history at all.
Check out the following example to see this in action.
Note that the following example is identical with the previous example, with the difference of using the `none`-value as the history strategy.

{% embed url="https://stackblitz.com/edit/router-lite-historystrategy-none?ctl=1&embed=1&file=src/main.ts" %}

As you interact with this example, you can see that there is absolutely no change in the history information, indicating non-interaction with the history object.

### Override configured history strategy

You can use the [navigation options](./navigating.md#using-navigation-options) to override the configured history strategy for individual routing instructions.

### Return a dynamic history strategy

`RouterOptions.historyStrategy` is declared as `ValueOrFunc<HistoryStrategy>`, so you can supply a function whenever you call `RouterConfiguration.customize`. That callback receives the `ViewportInstructionTree` for the pending transition, allowing you to branch on route metadata:

```typescript
import {
  RouterConfiguration,
  type HistoryStrategy,
  type ViewportInstructionTree,
  type ViewportInstruction,
} from '@aurelia/router';

const touchesViewport = (instruction: ViewportInstruction, name: string): boolean => {
  if (instruction.viewport === name) {
    return true;
  }

  return instruction.children.some(child => touchesViewport(child, name));
};

RouterConfiguration.customize({
  historyStrategy(instructions: ViewportInstructionTree): HistoryStrategy {
    const updatesSettingsPanel = instructions.children.some(child => touchesViewport(child, 'settings'));
    return updatesSettingsPanel ? 'replace' : 'push';
  },
});
```

The router invokes your function right before it pushes or replaces browser history inside `router.load`, so every navigation—declarative or programmatic—follows the same rule.

## Configure active class

Using the `activeClass` option you can add a class name to the router configuration.
This class name is used by the [`load` custom attribute](./navigating.md#using-the-load-custom-attribute) when the associated instruction is active.
The default value for this option is `null`, which also means that the `load` custom attribute won't add any class proactively.
Note that the router does not define any CSS class out-of-the-box.
If you want to use this feature, make sure that you defines the class as well in your stylesheet.

```typescript
// main.ts
RouterConfiguration.customize({
  activeClass: 'active-route'
})
```

```css
/* styles.css */
.active-route {
  font-weight: bold;
  color: #007acc;
  text-decoration: underline;
}
```

```html
<!-- These links will get the 'active-route' class when their routes are active -->
<a load="home">Home</a>
<a load="about">About</a>
```

## Disable navigation model generation

If you're not using the navigation model feature for building menus, you can disable it to improve performance:

```typescript
RouterConfiguration.customize({
  useNavigationModel: false
})
```

This prevents the router from generating navigation model data, which can be useful in applications with many routes where you don't need the navigation model functionality.

## Error recovery configuration

The `restorePreviousRouteTreeOnError` option controls what happens when navigation fails:

```typescript
// Default behavior - restore previous route on error (recommended)
RouterConfiguration.customize({
  restorePreviousRouteTreeOnError: true
})

// Strict mode - leave application in error state
RouterConfiguration.customize({
  restorePreviousRouteTreeOnError: false
})
```

With the default `true` setting, if navigation fails (due to guards returning false, component loading errors, etc.), the router will restore the previous working route. Setting this to `false` provides stricter error handling but requires your application to handle error states properly.

## Observing navigation state while configuring the router

Beyond setting up routes, hash/push mode, or titles, you can optionally observe the active route and track query parameters. One way is to inject `ICurrentRoute` in any of your components. Another is to watch router events:

```typescript
import { RouterConfiguration, IRouter, IRouterEvents, NavigationEndEvent, ICurrentRoute } from '@aurelia/router';
import { DI } from '@aurelia/kernel';

const container = DI.createContainer();
container.register(
  RouterConfiguration.customize({ useHref: false }) // for example
);

const routerEvents = container.get(IRouterEvents);
const currentRoute = container.get(ICurrentRoute);
const router = container.get(IRouter);

routerEvents.subscribe('au:router:navigation-end', (evt: NavigationEndEvent) => {
  console.log('Navigation ended on:', evt.finalInstructions.toUrl(true, router.options._urlParser, true));
  console.log('Active route object:', currentRoute.path);
});
```

This can help debug or log your router's runtime state. See the [ICurrentRoute docs](./configuring-routes.md#retrieving-the-current-route-and-query-parameters) for an example usage.

## Treat query parameters as path parameters

When the `treatQueryAsParameters` property in the router configuration is set to `true`, the router will treat query parameters as path parameters. The default value is `false`.

{% hint style="warning" %}
`treatQueryAsParameters` is deprecated and will be removed in the next major version.
{% endhint %}

## Use eager loading for route configurations

When the `useEagerLoading` property in the router configuration is set to `true`, the router will eagerly load all route configurations upfront when the application starts. The default value is `false`.

Consider the following scenario. A parent route with paths `[ 'parent', 'parent/:id' ]` configures a child route with path `['child']`. Given this scenario, if when a user tries to navigate to the path `/parent/child`, the router might 'recognize' the `child` segment as a value for the `:id` parameter of the parent route, instead of recognizing it as the child route. This problem is the artifact of how the route-recognizer works under the lazy-loading scenario. The recognizer tries to match the path hungrily, without having any information about the child routes.

To avoid this problem, you can set the `useEagerLoading` property to `true` in the router configuration. Under this configuration, the router will make all the route information available to the route-recognizer when the application starts, thereby avoiding the aforementioned problem.

```typescript
RouterConfiguration.customize({
  useEagerLoading: true,
})
```

For the above mentioned paths-constellation, under eager-loading the router will essentially create the following routing table.

| Path                 | Components                                                            |
|----------------------|-----------------------------------------------------------------------|
| `parent`             | ParentComponent                                                       |
| `parent/:id`         | ParentComponent with the (required) `:id` parameter                   |
| `parent/child`       | [ParentComponent, ChildComponent]                                     |
| `parent/:id/child`   | [ParentComponent with the (required) `:id` parameter, ChildComponent] |


As all the routing paths contribute to create a single routing table, the usage of empty paths are discouraged under eager-loading. For example, if instead of `child`, the child route was configured with an empty path `''`, then the routing table would have contained two identical paths `parent` and `parent/:id`, which is not allowed.

## Advanced Configuration Scenarios

### Combining Multiple Options

Most real-world applications will need to combine multiple configuration options:

```typescript
// Production-ready configuration
RouterConfiguration.customize({
  useUrlFragmentHash: false,           // Use clean URLs
  historyStrategy: 'push',             // Standard browser navigation
  activeClass: 'active',               // Highlight active nav items
  useNavigationModel: true,            // Enable navigation model for menus
  restorePreviousRouteTreeOnError: true, // Graceful error recovery
  buildTitle: (transition) => {
    // Custom title building with SEO considerations
    const routeTitle = transition.routeTree.root.children
      .map(child => child.title)
      .filter(title => title)
      .join(' - ');
    return routeTitle ? `${routeTitle} | My App` : 'My App';
  }
})
```

### Environment-Specific Configuration

You might want different configurations for different environments:

```typescript
// environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

RouterConfiguration.customize({
  useUrlFragmentHash: isDevelopment,            // Hash routing in dev for simplicity
  historyStrategy: isDevelopment ? 'replace' : 'push', // Keep history noise low in dev, full history in prod
  restorePreviousRouteTreeOnError: !isDevelopment, // Let errors surface in dev, recover in prod
  buildTitle: isProduction
    ? (tr) => buildSEOTitle(tr)                 // SEO-optimised titles in production
    : (tr) => `[DEV] ${tr.routeTree.root.title ?? 'Unknown route'}`,
});
```

### Micro-frontend Configuration

When building micro-frontends, you might need specific base path configurations:

```typescript
// Determine base path from current location
const currentPath = window.location.pathname;
const microFrontendName = currentPath.split('/')[1]; // e.g., 'admin', 'customer', 'reports'

RouterConfiguration.customize({
  basePath: `/${microFrontendName}`,
  useUrlFragmentHash: false,
  historyStrategy: 'push',
  buildTitle: (transition) => {
    const appName = microFrontendName.charAt(0).toUpperCase() + microFrontendName.slice(1);
    const routeTitle = transition.routeTree.root.children[0]?.title;
    return routeTitle ? `${routeTitle} - ${appName}` : appName;
  }
})
```

### Single-Page Application Embedded in Existing Site

When your Aurelia app is embedded within a larger traditional website:

```typescript
RouterConfiguration.customize({
  basePath: '/spa',                     // App lives under /spa path
  useUrlFragmentHash: true,             // Hash routing to avoid conflicts
  historyStrategy: 'replace',           // Don't interfere with main site navigation
  useHref: false,                       // Only use load attribute to avoid conflicts
  activeClass: 'spa-active',            // Namespaced CSS class
})
```

## Common Configuration Patterns

### Mobile-Optimized Configuration

```typescript
RouterConfiguration.customize({
  historyStrategy: 'replace',           // Reduce memory usage on mobile
  useNavigationModel: false,            // Disable if using custom mobile navigation
  restorePreviousRouteTreeOnError: true, // Important for unreliable mobile networks
})
```

### Debug-Friendly Development Configuration

```typescript
RouterConfiguration.customize({
  useUrlFragmentHash: true,             // Easier to debug without server setup
  restorePreviousRouteTreeOnError: false, // See errors clearly in development
  buildTitle: (transition) => {
    // Detailed debugging information in title
    const route = transition.routeTree.root.children[0];
    return `[${route?.component?.name || 'Unknown'}] ${route?.title || 'No Title'}`;
  }
})
```

## Router lifecycle (advanced)

The router exposes `start(performInitialNavigation: boolean)` and `stop()`, but when you register `RouterConfiguration` the router is started and stopped automatically via `AppTask`.

- Use `router.stop()` if you temporarily need to suspend routing (for example, while showing a modal flow that should ignore browser back/forward).
- If you call `router.stop()`, call `router.start(false)` to resume listening without triggering another initial navigation.
- Delaying the *very first* navigation requires a custom router configuration, because `RouterConfiguration` always starts the router during app activation.

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class DebugPanel {
  private readonly router = resolve(IRouter);

  pauseRouting() {
    this.router.stop();
  }

  resumeRouting() {
    this.router.start(false);
  }
}
```

## Troubleshooting Configuration Issues

### Common Problems and Solutions

**Problem**: Routes not working with `useUrlFragmentHash: false`
```typescript
// Solution: Ensure base tag is set correctly
// In your index.html:
<base href="/">

// And configure your server for SPA routing
RouterConfiguration.customize({
  useUrlFragmentHash: false
})
```

**Problem**: External links being processed by router
```typescript
// Solution 1: Disable href processing
RouterConfiguration.customize({
  useHref: false  // Only use load attribute for routing
})

// Solution 2: Mark external links explicitly
// <a href="mailto:test@example.com" external>Contact</a>
```

**Problem**: Navigation not updating browser history
```typescript
// Check your history strategy
RouterConfiguration.customize({
  historyStrategy: 'push'  // Ensure this is not 'none'
})
```
