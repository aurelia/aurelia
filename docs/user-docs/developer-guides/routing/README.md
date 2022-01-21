# Routing

## Getting started

Aurelia being a fully-featured framework comes with a router package ready to use in the framework.

To register the plugin in your application, you can pass in the router object to the `register` method inside of the file containing your Aurelia initialization code.&#x20;

We import the `RouterConfiguration` class from the `aurelia` package, which allows us to register our router and change configuration settings.

This file is generated from the `npx makes aurelia` scaffolding tool and is found in `src/main.ts`

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration)
  .app(component)
  .start();
```

The `RouterConfiguration` object is highly configurable and allows us to change how routing works in our Aurelia applications. It will use some default settings if you don't change anything (like we have done). By default, the router will assume you are using pushState routing.

### Create a viewport

After registering the router plugin, we need to add a viewport element to the default root component. If you scaffolded your application using Makes, then your root component by default is `my-app.ts` and `my-app.html`.

Inside of `my-app.html` you can add the following to get you started:

```html
<au-viewport></au-viewport>
```

We will get into the specifics of the `<au-viewport>` element later on. Right now, all you need is this one simple element in the same view as the accompanying view model that contains the routes.

To learn more about configuring the viewport, please see the router docs on configuring the viewport in the [viewports section](viewports.md).

## Changing the router mode (hash and pushState routing)

If you do not provide any configuration value, the default as we saw above is pushState routing. If you prefer the hash to be used, you can enable this like so:

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

## Router Configuration options

The `customize` method on the `RouterConfiguration` object can be used to set numerous router settings besides the `useUrlFragmentHash` value.

{% hint style="info" %}
While router hooks can be configured on a global basis from within `customize` those are covered in their own dedicated section.
{% endhint %}

### Styling Active Router Links

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

### Configuring route markup parsing using useHref

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

### Configuring the same URL strategy

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

### Configuring the route swap order

The `swapStrategy` configuration value determines how contents are swapped in a viewport when transitioning. The default value for this setting is `sequential-`remove`-first` — however, in some instances, you might want to change this depending on the type of data you are working with or how your routes are loaded.

* `sequential-add-first`
* `sequential-remove-first`
* `parallel-remove-first`
