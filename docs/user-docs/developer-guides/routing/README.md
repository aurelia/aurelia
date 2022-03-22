# Routing

## Getting started

Aurelia being a fully-featured framework comes with a router package ready to use in the framework. To register the plugin in your application, you can pass in the router object to the `register` method inside of the file containing your Aurelia initialization code.&#x20;

{% hint style="success" %}
Looking for a shortcut? If you generate a new Aurelia application using `npx makes aurelia` and choose routing, you can skip over this getting started section as we talk about code that is automatically added in for you as part of the scaffolding process.
{% endhint %}

We import the `RouterConfiguration` class from the `aurelia` package, which allows us to register our router and change configuration settings.

This file is generated from the `npx makes aurelia` scaffolding tool and is found in `src/main.ts`

{% code title="main.ts" %}
```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration)
  .app(component)
  .start();
```
{% endcode %}

The `RouterConfiguration` object is highly configurable and allows us to change how routing works in our Aurelia applications. It will use some default settings if you don't change anything (like we have done). By default, the router will assume you are using pushState routing.

{% hint style="info" %}
A scaffolded Aurelia application using `makes` and routing selected will automatically add in router configuration for you. The code above is taken from a newly generated Aurelia application and shown for reference.
{% endhint %}

### Create a viewport

After registering the router plugin, we need to add a viewport element to the default root component. If you scaffolded your application using Makes, then your root component by default is `my-app.ts` and `my-app.html`.

Inside of `my-app.html` you can add the following to get you started:

```html
<au-viewport></au-viewport>
```

We will get into the specifics of the `<au-viewport>` element later on. Right now, all you need is this one simple element in the same view as the accompanying view model that contains the routes.

{% hint style="info" %}
Like router configuration, using `makes` will automatically add in a `au-viewport` element to `my-app.html` if you choose routing as part of the scaffolding decision process.
{% endhint %}

{% hint style="success" %}
To learn more about configuring the viewport, please see the router docs on configuring the viewport in the [viewports section](viewports.md)
{% endhint %}
