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

If you do not provide any configuration value, the default as we saw above is hash style routing. In most cases, you will probably prefer to use pushState style routing which uses cleaner URL's for routing instead of the hashes added into your route.

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(component)
  .start();
```

By calling the `customize` method, you can supply a configuration object containing the property `useUrlFragmentHash` and supplying a boolean value. If you supply `false` this will enable pushState style routing and `true` will enable hash mode, which is the default setting.

{% hint style="warning" %}
Enabling pushState routing setting `useUrlFragmentHash` to false will require a server that can handle pushState style routing.
{% endhint %}

## Styling Active Router Links

A common scenario is styling an active router link with styling to signify that the link is active, such as making the text bold. By default, any link with a `goto` attribute that is routed to, will receive the class `goto-active` if it is currently active.

## Setting The Title

The router supports setting the application title a few different ways. You can set a default title on the router when you configure it like above via the `register` method.

### Via Configuration

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: false, title: 'My Application' }))
  .app(component)
  .start();
```

If you are working with direct routing, then supplying a `title` property on your component will allow you to set the title. This can either be a string or a function.

### Passing a String To Title

```typescript
import { IRouteableComponent } from '@aurelia/router';

export class Product implements IRouteableComponent {
    public static title = 'My Product';
}
```

### Using a Function

When passing a function into the `title` property, the first argument is the view-model of the component itself. This allows you to get information from the view-model such as loaded details like a product name or username. the function must return a string.

```typescript
import { IRouteableComponent } from '@aurelia/router';

export class Product implements IRouteableComponent {
    public static title = (viewModel: Product) => `${viewModel.productName}`;
}
```

For configured routing, you can specify the title on the route itself. But, you can also dynamically set the title from within a router hook or within the routable component itself. Please see the [Router Hooks](router-hooks.md#setting-the-title-from-within-router-hooks) section for specifics around using a hook to change the title.

