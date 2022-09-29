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

{% hint style="warning" %}
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

When you open the app in a different browser, you can note that the URL in the address bar looks the `HOSTING_PREFIX/app/home` or `HOSTING_PREFIX/app/about`.
This is also true for the `href` values in the `a` tags.
This happens because `<base href="/app">` is used in the `index.ejs` (producing the index.html).
In this case, the `router-lite` is picking up the `baseURI` information and performing the routing accordingly.

This needs bit more work when you are supporting multi-tenancy for your app.
In this case, you might want the URLs look like `https://example.com/tenant-foo/app1/view42` or `https://example.com/tenant-bar/app2/view21`.
You cannot set the `document.baseURI` every time you start the app for a different tenant, as that value is static can readonly, read from the `base#href` value.

With `router-lite` you can support this by setting the `basePath` value to differently for each tenant, while customizing the router configuration, at bootstrapping phase.

TODO: continue


## Customizing title

TODO

## Enable or disable the usage of the `href` custom attribute using `useHref`

The `useHref` configuration setting is something that all developers working with routing in Aurelia need to be aware of. By default, the router will allow you to use both `href` as well as `load` for specifying routes.

Where this can get you into trouble is external links, mailto links and other types of links that do not route. A simple example looks like this:

```html
<a href="mailto:myemail@gmail.com">Email Me</a>
```

This seemingly innocent and common scenario by default will trigger the router and will cause an error in the console.

You have two options when it comes to working with external links. You can specify the link as external using the `external` attribute.

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

TODO

## Configure same URL strategy

TODO
