# Router configuration

The router allows you to configure how it interprets and handles routing in your Aurelia applications. The `customize` method on the `RouterConfiguration` object can be used to set numerous router settings besides the `useUrlFragmentHash` value.

## Configuring route markup parsing using useHref

The `useHref` configuration setting is something that all developers working with routing in Aurelia need to be aware of. By default, the router will allow you to use both `href` as well as `load` for specifying routes.

Where this can get you into trouble is external links, mailto links and other types of links that do not route.&#x20;

A simple example looks like this:

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
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router'; 

Aurelia
  .register(RouterConfiguration.customize({
      useHref: false
  }))
  .app(component)
  .start();
```

## Configuring the title

The title can be set for the overall application. By default, the title uses the following value: `${componentTitles}${appTitleSeparator}Aurelia` the component title (taken from the route or component) and the separator, followed by Aurelia.

In many instances, you will want to keep the two interpolation values: `${componentTitles}${appTitleSeparator}` — but replace Aurelia with the name of your application.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router'; 

Aurelia
  .register(RouterConfiguration.customize({ 
    title: '${componentTitles}${appTitleSeparator}My App'
  }))
  .app(component)
  .start();Th
```

### Customizing the title

Using the `transformTitle`method from the router customization, the default title-building logic can be overwritten.

{% code title="main.ts" %}
```typescript
import { RouterConfiguration, RoutingInstruction, Navigation } from '@aurelia/router';
import { Aurelia } from 'aurelia';

import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration.customize({
      title: {
        transformTitle: (title: string, instruction: RoutingInstruction, navigation: Navigation) => {
          return `${title} - MYAPP`;
        }
      }
  })
  .app(MyApp)
  .start();
```
{% endcode %}

## Configuring the route swap order

The `swapStrategy` configuration value determines how contents are swapped in a viewport when transitioning. In some instances, you might want to change this depending on the type of data you are working with or how your routes are loaded. A good example of configuring the swap order is when you're working with animations.

* `attach-next-detach-current` (default)
* `attach-detach-simultaneously`
* `detach-current-attach-next`
* `detach-attach-simultaneously`

## Changing the router mode (hash and pushState routing)

If you do not provide any configuration value, the default is hash-based routing.

If you prefer pushState routing to be used, you can enable this like so:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router'; 

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(component)
  .start();
```

By calling the `customize` method, you can supply a configuration object containing the property `useUrlFragmentHash` and supplying a boolean value. If you supply `true` this will enable hash mode. The default is `true`.

If you are working with pushState routing, you will need a base HREF value in the head of your document. The scaffolded application from the CLI includes this in the `index.html` file, but if you're starting from scratch or building within an existing application you need to be aware of this.

```html
<head>
    <base href="/">
</head>
```

{% hint style="warning" %}
PushState requires server-side support. This configuration is different depending on your server setup. For example, if you are using Webpack DevServer, you'll want to set the `devServer` `historyApiFallback` option to `true`. If you are using ASP.NET Core, you'll want to call `routes.MapSpaFallbackRoute` in your startup code. See your preferred server technology's documentation for more information on how to allow 404s to be handled on the client with push state.
{% endhint %}
