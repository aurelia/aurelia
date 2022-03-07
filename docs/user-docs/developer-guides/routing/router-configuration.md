# Router configuration

The router allows you to configure how it interprets and handles routing in your Aurelia applications. The `customize` method on the `RouterConfiguration` object can be used to set numerous router settings besides the `useUrlFragmentHash` value.

## Configuring route markup parsing using useHref

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

Or, you can set `useHref` to `false` and only ever use the `load` attribute for routes.

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration.customize({
      useHref: false
  }))
  .app(component)
  .start();
```

## Configuring the same URL strategy

In some scenarios, the same route may be used more than once. On a global level, you can configure the same URL strategy to either be `replace` or `ignore`. The default value for this is `ignore`.

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration.customize({
      sameUrlStrategy: 'replace'
  }))
  .app(component)
  .start();
```

## Configuring the route swap order

The `swapStrategy` configuration value determines how contents are swapped in a viewport when transitioning. The default value for this setting is `sequential-`remove`-first` — however, in some instances, you might want to change this depending on the type of data you are working with or how your routes are loaded.

* `sequential-add-first`
* `sequential-remove-first`
* `parallel-remove-first`

## Changing the router mode (hash and pushState routing)

If you do not provide any configuration value, the default as we saw above is pushState routing. With pushState routing, your URLs will be full paths and not feature any hash in them.

If you prefer the hash method to be used, you can enable this like so:

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: true }))
  .app(component)
  .start();
```

By calling the `customize` method, you can supply a configuration object containing the property `useUrlFragmentHash` and supplying a boolean value. If you supply `true` this will enable hash mode. The default is `false`.

If you are working with pushState routing, you will need a base HREF value in the head of your document. The scaffolded application from the CLI includes this in the `index.html` file, but if you're starting from scratch or building within an existing application you need to be aware of this.

```html
<head>
    <base href="/">
</head>
```

{% hint style="warning" %}
PushState requires server-side support. This configuration is different depending on your server setup. For example, if you are using Webpack DevServer, you'll want to set the `devServer` `historyApiFallback` option to `true`. If you are using ASP.NET Core, you'll want to call `routes.MapSpaFallbackRoute` in your startup code. See your preferred server technology's documentation for more information on how to allow 404s to be handled on the client with push state.
{% endhint %}
