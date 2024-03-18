---
description: >-
  Learn how to work with the @aurelia/router package to implement routing in
  your Aurelia applications.
---

# Getting Started

Routing with Aurelia feels like a natural part of the framework. It can easily be implemented into your applications in a way that feels familiar if you have worked with other frameworks and library routers. Here is a basic example of routing in an Aurelia application using `@auelia/router`.

The following getting started guide assumes you have an Aurelia application already created. If not, [consult our Quick Start](../getting-started/quick-install-guide.md) to get Aurelia installed in minutes.

{% hint style="info" %}
Please note that in Aurelia2 there are two routers, namely [`@aurelia/router`](getting-started.md) and [`@aurelia/router-lite`](../router-lite/getting-started.md).&#x20;
{% endhint %}

{% hint style="warning" %}
**Before you go any further:** Please ensure you are importing from the `@aurelia/router` package.&#x20;
{% endhint %}

See how you can configure and implement routing in your Aurelia applications in only a few minutes. Of course, you will want to expand upon this as you build your routes. Here we only learn the bare minimum to get started.

## Installation

```bash
npm i @aurelia/router
```



## Configure `@aurelia/router`

To use `@aurelia/router`, we first have to register it with Aurelia. This can be done in the bootstrapping phase.

{% code title="main.ts" %}
```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration.customize({
      useUrlFragmentHash: true, // <-- enables the routing using the URL `hash`
  }))
  .app(MyApp)
  .start();
```
{% endcode %}

{% hint style="info" %}
To know more about the different configuration options for router-lite, please refer the documentation on that topic.
{% endhint %}



## Create the routable components&#x20;

For this example, we have a root component which is `MyApp`. And then we are going to define two routes for the root component, namely `home` and `about`.

Let us define these components first.



{% tabs %}
{% tab title="home.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import template from './home.html';

@customElement({ name: 'ho-me', template })
export class Home {
  private readonly message: string = 'Welcome to Aurelia2 router!';
}
```
{% endtab %}

{% tab title="home.html" %}
```html
<h1>${message}</h1>s
```
{% endtab %}
{% endtabs %}

{% tabs %}
{% tab title="about.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import template from './about.html';

@customElement({ name: 'ab-out', template })
export class About {
  private readonly message = 'Aurelia2 router-lite is simple';
}
```
{% endtab %}

{% tab title="about.html" %}
```html
<h1>${message}</h1>
```
{% endtab %}
{% endtabs %}



## Configure the routes

With the routable components in place, let's define the routes. To this end, we need to add the route configurations to our root component `MyApp`.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { routes } from '@aurelia/router';

import { Home } from './home';
import { About } from './about';

@routes([
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
  ]
)

export class MyApp {}

```
{% endtab %}

{% tab title="my-app.html" %}
```html
<nav>
  <a load="home">Home</a>
  <a load="about">About</a>
</nav>

<au-viewport></au-viewport>
```

`load`

Notice how we use a standard hyperlink `<a>` tags, but they have an `load` attribute instead of `href`? This attribute tells the router that these are routable links. The router will translate these `load` values into routes (either path or route name). By default, the router does also allow you to use `href` for routes (a setting that can be turned off below configuring `useHref`).

`au-viewport`

This tells the router where to display your components. It can go anywhere inside your HTML. It can also have a name (handy for instances where there are multiple `au-viewport` elements), and you can have more than one.
{% endtab %}
{% endtabs %}

There are couple of things to note here. We'll start by looking at the configurations defined using the `@routes` decorator. Here we need to pass in a list of routes. Every route needs to have a `path` and a `component` property. This instructs the router to use the defined `component` in the viewport when it sees the associated `path`.

{% hint style="info" %}
To know more about configuring routes, please refer to the respective documentation.
{% endhint %}

The viewport is specified in the view (see `my-app.html`) by using the `<au-viewport>` custom element. For example, the router will use this element to display the `Home` component when it sees the `/` (the empty path) or the `/home` paths.

The `nav>a` elements are added to navigate from one view to another.

See this in action:&#x20;

@todo - Add in stackblitz or similar example



## Using pushstate

If you have opened the demo then you can notice that the URL in the address bar or the URLs in the `nav>a` elements contains a `#` (example: `/#/home`, `/#/about` etc.). Depending on your project need and esthetics you may want to get rid of the `#`-character. To this end, you need set the [`useUrlFragmentHash` to `false`](../router-lite/router-configuration.md#choose-between-hash-and-pushstate-routing-using-useurlfragmenthash), which is also the default.



## Live examples

For the documentation of `@aurelia/router,` many live examples are prepared. It is recommended to use the live examples as you read along the documentation. However, if you are feeling adventurous enough to explore the features by yourself, here is the complete [collection of the live examples](https://stackblitz.com/@Sayan751/collections/router-lite) at your disposal.

{% hint style="info" %}
The examples are created using StackBlitz. Sometimes, you need to open the examples in a new tab to see changes in the URL, title etc. To this end, copy the URL appearing on the address bar on the right pane and open that in a new tab.
{% endhint %}
