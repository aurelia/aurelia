---
description: >-
  How to setup your Aurelia applications to work with routing: it all starts
  with the initial setup.
---

# Configuration & Setup

## Getting Started

The Router comes with the default installation of Aurelia and does not require the installation of any additional packages. The only requirement for the router is that you have an Aurelia application already created.

{% hint style="success" %}
**What you will learn in this section**

* How to configure the router
* How to use hash-style routing as well as pushState routing
* How to style active router links
{% endhint %}

To register the plugin in your application, you can pass in the router object to the `register` method inside of the file containing your Aurelia initialization code. We import the `RouterConfiguration` class from the `aurelia` package, which allows us to register our router and change configuration settings.

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration)
  .app(component)
  .start();
```

## Changing The Router Mode \(hash and pushState routing\)

If you do not provide any configuration value, the default as we saw above is pushState routing. If you prefer the hash to be used, you can enable this like so:

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: true }))
  .app(component)
  .start();
```

By calling the `customize` method, you can supply a configuration object containing the property `useUrlFragmentHash` and supplying a boolean value. If you supply `true` this will enable hash mode. The default is `false`.

{% hint style="warning" %}
pushState routing requires the server to be configured to redirect client-side routes to the entry html file. In webpack-dev-server this is enabled via the `historyApiFallback` option.
{% endhint %}

## Styling Active Router Links

A common scenario is styling an active router link with styling to signify that the link is active, such as making the text bold. The `load` attribute has a bindable property named `active` which you can bind to a property on your view-model to use for conditionally applying a class:

```css
.active {
    font-weight: bold;
}
```

```markup
<a active.class="_settings" load="route:settings; active.bind:_settings">
    Settings
</a>
```

{% hint style="info" %}
You do not need to explicitly declare this property in your view-model since it is a from-view binding. The underscore prefix of \_settings has no special meaning to the framework, it is just a common convention for private properties which can make sense for properties that are not explicitly declared in the view-model.
{% endhint %}

## Setting The Title

The router supports setting the application title a few different ways. You can set a default title on the router when you configure it like above via the `register` method.

### Via Configuration

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration.customize({ title: 'My Application' }))
  .app(component)
  .start();
```

If no title is configured, the router by default combines the names of the active components separated by a bar \(`|`\).

You can override the separator via the `RouterConfiguration`:

```typescript
RouterConfiguration.customize({ titleSeparator: ' - ' })
```

### Passing a String To Title

```typescript
export class Product {
  static title = 'My Product';
}
```

### Using a Function

When passing a function into the `title` property, the first argument is the `RouteNode` which contains information like parameters, route configuration, the route context \(which contains the component and viewport\) and more. The function must return a string, or `null` if that node should not contribute to the title.

```typescript
import { RouteNode } from 'aurelia';

export class Product {
  static title = (node: RouteNode) => node.params.slug.replace('-', ' ');
}
```

Like the `title` function you can provide on the component, you can also do this on a global level and take full control over the title that is generated. You are always given the root `RouteNode` in this case, from which you can then traverse the entire route tree. Since this can be quite involved, only use this when you have no other option.

```typescript
RouterConfiguration.customize({ title: (root: RouteNode) => root.context.component.name })
```

