---
description: >-
  How to setup your Aurelia applications to work with routing: it all starts
  with the initial setup.
---

# Configuration & Setup

## Getting Started

First of all the Aurelia Direct Router package needs to be installed. Open a command prompt in the root of your Aurelia application and run the command
```cmd
npm i aurelia-direct-router
```
Once that's finished, you're all set up for using the `aurelia-direct-router` in your application.

{% hint style="success" %}
**What you will learn in this section**

* How to configure the router
* How to use hash-style routing as well as "pushState" routing
* How to style active router links
* How to change the application title
{% endhint %}

To register the plugin in your application, you pass in the router object to the `register` method inside of the file containing your Aurelia initialization code. Then import the `RouterConfiguration` class from the `aurelia-direct-router` package, which allows you to register the router and change configuration settings.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from 'aurelia-direct-router';

Aurelia
  .register(RouterConfiguration)
  .app(component)
  .start();
```

## Changing The Router Mode \(hash and pushState routing\)

If you do not provide any configuration value, the default is that the router uses the URL fragment hash for your routes. If you prefer to use the pathname part of the URL for your routes, sometimes called pushState routing, you can disable hash-style routing by doing a customized registration:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from 'aurelia-direct-router';

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(component)
  .start();
```

By calling the `customize` method when registering, you can supply a configuration object containing the property `useUrlFragmentHash` and specify a boolean value. If you specify `false` this will disable hash-style mode and enable pushState style routing. If you specify `true` this will enable hash mode (the default).

{% hint style="warning" %}
Enabling pushState routing by setting `useUrlFragmentHash` to false will require a server that can handle pushState style routing.
{% endhint %}

## Styling Active Router Links

A common scenario is styling active router links to indicate that the links are active, such as making the text bold. By default, any link with a `load` attribute will receive the class `active` if it is currently active. The class name can be changed by using the `indicators.loadActive` property of the configuration object.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from 'aurelia-direct-router';

Aurelia
  .register(RouterConfiguration.customize({
    indicators: {
      loadActive: 'link-active',
    },
  }))
  .app(component)
  .start();
```

To make all of your active router links bold, all you need to do is write the following CSS and put it somewhere global in your application.

```css
.active {
    font-weight: bold;
}
```

{% hint style="info" %}
An earlier version of the router used the class name `load-active` to indicate active links. If you're using that earlier version and your links are no longer being indicated as active, either change the name of the indicating class in the CSS or in the customized registration.
{% endhint %}

## Setting The Title

The router supports setting the application title a few different ways. You can set a default title on the router when you configure it like above via the `customize` method.

### Via Configuration

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from 'aurelia-direct-router';

Aurelia
  .register(RouterConfiguration.customize({ title: 'My Application' }))
  .app(component)
  .start();
```

By default, the names of your active components will be added to the application title. Supplying a `title` property on your components will allow you to set the title of the components. This can either be a string or a function.

### Passing a String To Title

```typescript
import { IRouteableComponent } from 'aurelia-direct-router';

export class Product implements IRouteableComponent {
    public static title = 'My Product';
}
```

### Using a Function

When passing a function into the `title` property, the first argument is the view-model of the component itself. This allows you to get information from the view-model such as loaded details like a product name or username. The function must return a string or `null` if the component shouldn't be a part of the title.

```typescript
import { IRouteableComponent } from 'aurelia-direct-router';

export class Product implements IRouteableComponent {
    public static title = (viewModel: Product) => `${viewModel.productName}`;
}
```

As mentioned, there are several ways to set the application title, including specifying the title on the route itself when using configured routes.

More details about configuring titles, and the entire router, can be found in the Configuration details section.
