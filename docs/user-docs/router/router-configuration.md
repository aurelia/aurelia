---
description: Configure how the router works with browser URLs, links, and history.
---

# Router configuration

Configure the router at application startup with `RouterConfiguration.customize()`. These options determine how routes appear in the browser and how the router handles links and history. Declare the routes themselves separately in route configuration.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration.customize({
    activeClass: 'active-route',
  }))
  .app(MyApp)
  .start();
```

## Configuration options

Pass only the values you want to change. `basePath` configures the location manager; the remaining options appear on `RouterOptions`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `useUrlFragmentHash` | `boolean` | `false` | Put routes after the URL's hash (`#/path`). |
| `preserveHashDocument` | `boolean` | `false` | In hash mode, retain the current document's pathname and query when publishing routes and links. |
| `useHref` | `boolean` | `true` | Intercept eligible clicks on router-managed `href` links. Disabling it leaves href rewriting enabled. |
| `historyStrategy` | `'push' \| 'replace' \| 'none' \| (instructions) => HistoryStrategy` | `'push'` | Choose how successful navigation updates browser history. |
| `basePath` | `string \| null` | `null` | Override the deployment path inferred from `document.baseURI`. |
| `activeClass` | `string \| null` | `null` | CSS class applied by `load` to an active link. |
| `useNavigationModel` | `boolean` | `true` | Generate the navigation model for route-driven menus. |
| `buildTitle` | `(transition: Transition) => string \| null` | `null` | Build the document title; returning `null` leaves it unchanged. |
| `restorePreviousRouteTreeOnError` | `boolean` | `true` | Attempt to restore the previous route tree after a navigation error. |
| `treatQueryAsParameters` | `boolean` | `false` | Deprecated: include query values in route parameters. |
| `useEagerLoading` | `boolean` | `false` | Load route configurations upfront for recognition across the complete route hierarchy. |

## Choose between hash and pushState routing using `useUrlFragmentHash`

History mode is the default. A route such as `reports` appears in the browser path, for example `https://example.com/app/reports`. Set the application's deployment base and configure the server to return the application document for route URLs, including direct visits and reloads.

```html
<!-- index.html: the application is deployed under /app/ -->
<head>
  <base href="/app/">
</head>
```

With hash routing, the route appears after `#`, for example `https://example.com/app/#/reports`. The server receives the document path, so individual client routes do not require a server fallback rule:

```typescript
RouterConfiguration.customize({
  useUrlFragmentHash: true,
});
```

Both modes use the same route configuration and navigation APIs. An application URL reference such as `/reports` excludes the deployment prefix and the outer `#/` marker; the router adds those when it publishes a browser URL.

## Configuring `basePath`

`basePath` identifies where the application is deployed. It does not select a routing context or make a relative application URL resolve from a particular component.

For an application hosted under `/portal/`, either use `<base href="/portal/">` or explicitly configure:

```typescript
RouterConfiguration.customize({
  basePath: '/portal',
});
```

The browser link for application route `/reports` then points to `/portal/reports` in history mode or `/portal/#/reports` in hash mode. Declare routes and call `navigate()` with application paths such as `/reports`; the router adds `/portal` when it writes a browser URL.

For tenant-specific deployments, supply the deployment path from the host's startup configuration:

```typescript
// A deployment path supplied by the host, such as '/tenant-foo/portal'.
const deploymentPath = hostConfig.applicationBasePath;

RouterConfiguration.customize({
  basePath: deploymentPath,
});
```

Use the deployment path supplied by your host. The current `location.pathname` can include a deep route, so copying it as the base would give different results on reload. `basePath` changes router URLs; it does not change the browser's base for scripts, stylesheets, or other assets.

## Preserve a specific document in hash mode

An application may run from a document such as `/tools/shell.html?tenant=acme`. If its links must reopen that same document, enable `preserveHashDocument`:

```typescript
RouterConfiguration.customize({
  useUrlFragmentHash: true,
  preserveHashDocument: true,
});
```

Navigating to `/reports?page=2` then publishes:

```text
https://example.com/tools/shell.html?tenant=acme#/reports?page=2
```

The document query (`tenant=acme`) belongs to the host; the route query (`page=2`) belongs to the application. The router preserves the document's pathname and query and replaces its hash. This policy applies to initial navigation, history updates, and links generated by `load`, router-managed `href`, `url`, and `createHref()`.

An entry without a hash starts the application's default route. The document filename and query are not treated as route instructions. Keep the same configuration when the document opens in a new tab or reloads.

The option defaults to `false` and has an effect only with `useUrlFragmentHash: true`. With it disabled, hash URLs continue to use the configured deployment base. The option does not change server-side rendering: browser fragments are not sent in normal HTTP requests.

## Provide a custom location manager

An environment that owns navigation outside normal browser history can register an `ILocationManager` implementation after `RouterConfiguration`, before starting Aurelia:

```typescript
import Aurelia from 'aurelia';
import { Registration } from '@aurelia/kernel';
import { ILocationManager, RouterConfiguration } from '@aurelia/router';
import { HostLocationManager } from './host-location-manager';
import { MyApp } from './my-app';

Aurelia
  .register(
    RouterConfiguration,
    Registration.singleton(ILocationManager, HostLocationManager),
  )
  .app(MyApp)
  .start();
```

`HostLocationManager` must implement the [location-manager interface](./api-reference.md#ilocationmanager): listen for location changes, publish `LocationChangeEvent` through `IRouterEvents`, read the current route, publish history entries, and add or remove the deployment base. These operations must agree on the URL form. An adapter that only writes URLs will not support direct entry or Back/Forward navigation correctly.

Use the built-in location manager for ordinary browser deployments and configure it with the options above. `RouterOptions._urlParser` is internal; changing it is unsupported, including through a type cast.

## Customizing title

Supply a `buildTitle` function to customize the [document title](./configuring-routes.md#setting-the-title) for every navigation. The function receives a `Transition` with access to route configuration titles, assigned route-node titles, and navigation options. It decides how to combine them.
For example, give the root and a child route their own titles:

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

With this configuration, navigating to `/home` produces the default title `Home | Aurelia`. The following `buildTitle` function uses ` - ` as the separator for `/` and `/home`:

```typescript
// main.ts
import { RouterConfiguration, Transition } from '@aurelia/router';
import { Aurelia } from '@aurelia/runtime-html';
const au = new Aurelia();
au.register(
  RouterConfiguration.customize({
    buildTitle(tr: Transition) {
      return tr.routeTree.root.getTitle(' - ') ?? 'Aurelia';
    },
  }),
);
```

Open the example in a new tab to see the document title change.

{% embed url="https://stackblitz.com/edit/router-lite-buildtitle?ctl=1&embed=1&file=src/main.ts" %}

**Translating the title**

To translate document titles, store an i18n key in the route's [`data` property](./configuring-routes.md#advanced-route-configuration-options), then read it in `buildTitle`.

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

`data` accepts application-defined fields. Here, `i18n` stores the translation key for each route.

Use `buildTitle` to translate the key, and call `router.updateTitle()` when the locale changes:

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

With the `de` locale active, the title for `/` and `/home` becomes `Aurelia - Startseite`. This assumes the locale contains the following translations:

```json
{
  "routes": {
    "home": "Startseite"
  }
}
```

Try changing the locale in this example:

{% embed url="https://stackblitz.com/edit/router-lite-translate-title?ctl=1&embed=1&file=src/main.ts" %}

## Enable or disable the usage of the `href` custom attribute using `useHref`

By default, the router handles ordinary clicks on route links written with `href` or `load`. Absolute URLs and protocol links such as `mailto:` already keep native browser behavior:

```html
<a href="mailto:support@example.com">Email support</a>
```

For a document-relative link that should bypass routing, use the [`external` attribute](./navigating.md#bypassing-the-href-custom-attribute):

```html
<a href="/downloads/guide.pdf" external>Download the guide</a>
```

Set `useHref` to `false` to disable click interception by the router's `href` attribute. The attribute still resolves routing instructions and writes the resulting URL; use `external` when the authored value should be handled entirely by the browser. The `load` attribute and explicitly registered [`url` attribute](./application-url-navigation.md#declarative-links) continue to handle their own links.

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

Choose whether a successful navigation creates a history entry, replaces the current entry, or leaves history unchanged. This controls what users can return to with Back and Forward.

### `push`

`push` is the default. It creates an entry for navigation so users can return to earlier application locations with Back.

{% embed url="https://stackblitz.com/edit/router-lite-historystrategy-push?ctl=1&embed=1&file=src/main.ts" %}

Configure the strategy in `main.ts`:

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
      historyStrategy: 'push', // The default; can be omitted.
    })
  );
  au.app({ host, component });
  await au.start();
})().catch(console.error);
```

In `my-app.ts`, a router event subscription updates the `history` text displayed in the view:

```typescript
import { resolve } from '@aurelia/kernel';
import { IHistory } from '@aurelia/runtime-html';
import { IRouterEvents } from '@aurelia/router';

export class MyApp {
  private history = '';
  public constructor() {
    let i = 0;
    const history = resolve(IHistory);
    resolve(IRouterEvents).subscribe('au:router:navigation-end', () => {
      this.history = `#${++i} - len: ${history.length} - state: ${JSON.stringify(history.state)}`;
    });
  }
}
```

Click between `Home` and `About` to add history entries and watch the history length increase.

### `replace`

`replace` updates the current entry. Use it when the new location should take the place of the previous one, such as correcting an initial address or updating a filter without adding every intermediate value to history.

{% embed url="https://stackblitz.com/edit/router-lite-historystrategy-replace?ctl=1&embed=1&file=src/main.ts" %}

### `none`

`none` changes the active route without publishing it to browser history.

{% embed url="https://stackblitz.com/edit/router-lite-historystrategy-none?ctl=1&embed=1&file=src/main.ts" %}

The route still changes, but the address bar and history entry do not. The completed route becomes the base for subsequent `navigate()` and `createHref()` calls, so that base can differ from the URL visible in the address bar.

### Override configured history strategy

You can use the [navigation options](./navigating.md#using-navigation-options) to override the configured history strategy for individual routing instructions.

### Return a dynamic history strategy

Set `historyStrategy` to a function when it depends on the destination. The function receives the transition's `ViewportInstructionTree`:

```typescript
import {
  RouterConfiguration,
  type HistoryStrategy,
  type ViewportInstruction,
} from '@aurelia/router';

const touchesViewport = (instruction: ViewportInstruction, name: string): boolean => {
  if (instruction.viewport === name) {
    return true;
  }

  return instruction.children.some(child => touchesViewport(child, name));
};

RouterConfiguration.customize({
  historyStrategy(instructions): HistoryStrategy {
    const updatesSettingsPanel = instructions.children.some(child => touchesViewport(child, 'settings'));
    return updatesSettingsPanel ? 'replace' : 'push';
  },
});
```

The router evaluates this function when publishing a completed navigation. It applies to both contextual and application-URL navigation unless that navigation supplies its own history strategy.

## Configure active class

Set `activeClass` to apply a CSS class to active [`load` links](./navigating.md#using-the-load-custom-attribute). The default is `null`, so no class is added. Define the class in your stylesheet:

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

Disable the navigation model if your menus do not use it:

```typescript
RouterConfiguration.customize({
  useNavigationModel: false
})
```

The router then skips generating that data.

## Error recovery configuration

With `restorePreviousRouteTreeOnError: true` (the default), the router attempts to restore the previous route tree after a transition throws. Your application must handle any effects of the failed transition, such as a completed network request or data changed by a lifecycle hook.

```typescript
RouterConfiguration.customize({
  restorePreviousRouteTreeOnError: true,
});
```

A guard returning `false` cancels navigation. Setting this option to `false` disables automatic restoration after errors; error reporting works with either setting. See [error handling](./error-handling.md) for cancellation and recovery behavior.

## Observing navigation state while configuring the router

Resolve `ICurrentRoute` from the running application's container to read the completed route, or `IRouterEvents` to subscribe to navigation events. A separate container created for logging would not observe that application's router.

See [current route](./current-route.md#observe-completed-navigation) for a subscription with a matching cleanup hook, and [router events](./router-events.md) for attempts, cancellations, and errors.

## Treat query parameters as path parameters

Set `treatQueryAsParameters: true` to include query parameters with path parameters. The default is `false`.

{% hint style="warning" %}
`treatQueryAsParameters` is deprecated and will be removed in the next major version.
{% endhint %}

## Use eager loading for route configurations

Set `useEagerLoading: true` to load all route configurations at application startup. The default is `false`.

For example, a parent with paths `[ 'parent', 'parent/:id' ]` has a child route with path `['child']`. When recognizing `/parent/child` lazily, the router may match `child` as the parent's `:id` value before it knows about the child route.

Eager loading gives the recognizer the complete route hierarchy before navigation, so it can match the child route:

```typescript
RouterConfiguration.customize({
  useEagerLoading: true,
})
```

For these paths, eager loading produces the following routing table:

| Path                 | Components                                                            |
|----------------------|-----------------------------------------------------------------------|
| `parent`             | ParentComponent                                                       |
| `parent/:id`         | ParentComponent with the (required) `:id` parameter                   |
| `parent/child`       | [ParentComponent, ChildComponent]                                     |
| `parent/:id/child`   | [ParentComponent with the (required) `:id` parameter, ChildComponent] |


All paths share one routing table, so avoid empty child paths with eager loading. A child path of `''` in this example would duplicate the parent's `parent` and `parent/:id` entries, which is not allowed. Use a named child path:

```diff
  @route({
    routes: [
-     { path: ['', 'child'], component: ChildComponent },
+     { path: ['child'], component: ChildComponent },
    ]
  })
- @customElement({ name: 'routed-component', template: `<au-viewport></au-viewport>` })
+ @customElement({ name: 'routed-component', template: `<au-viewport default="child"></au-viewport>` })
  export class RoutedComponent {}
```

## Single-page application embedded in an existing site

When an application shares a document with a traditional site, first decide who owns the document URL. For an application that owns the hash while the host owns the pathname and query, use:

```typescript
RouterConfiguration.customize({
  useUrlFragmentHash: true,
  preserveHashDocument: true,
  activeClass: 'spa-active',
});
```

Keep host links native with `external`, and use `load` or explicitly registered `url` for application navigation:

```html
<a href="/account" external>Site account</a>
<a load="reports">Application reports</a>
```

The host and application still share one hash and browser history stack. `preserveHashDocument` keeps the hosting document's pathname and query; `historyStrategy: 'replace'` updates the shared history's current entry. Choose the history strategy together with the host's Back/Forward behavior.

Setting `useHref: false` disables click interception by the `href` custom attribute but still lets it rewrite route links. Use `external` whenever the browser should receive the authored href unchanged.

## Router lifecycle (advanced)

`RouterConfiguration` starts the router after application activation and stops it during deactivation. Most applications do not need to call `start()` or `stop()` themselves.

For a host that manages this lifecycle explicitly, `stop()` removes location-event listening, and `start(false)` resumes listening without performing another initial navigation. Stopping location listening does not block `load()` or `navigate()` calls and is not a navigation guard. Use [lifecycle guards](./routing-lifecycle.md) to decide whether a transition may proceed.

## Troubleshooting configuration

- **A history-mode route works through a link but fails on reload:** check the deployment base and the server fallback for that route URL.
- **A hash link opens a different document in a new tab:** if the application must retain a specific host document, enable `preserveHashDocument` in hash mode.
- **An href changes even with `useHref: false`:** that option controls click interception. Add `external` to preserve a native link's authored value.
- **The page changes while the address bar does not:** check for `historyStrategy: 'none'`, globally or on the individual navigation.
- **Query changes do not refresh page data:** see [query changes and component reuse](./current-route.md#query-changes-and-component-reuse).

See [router troubleshooting](./troubleshooting.md) for navigation and route-matching failures.
