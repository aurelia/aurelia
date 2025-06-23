# Getting started

{% hint style="info" %}
Please note that in Aurelia2 there are two routers, namely [`@aurelia/router-direct`](../router-direct/getting-started.md) and `@aurelia/router-lite` (this one).
The router-lite one is smaller in size, supports only configured routing, and does not support direct routing, as facilitated by `@aurelia/router-direct`. Choose your router depending on your need.
{% endhint %}

Routing with Aurelia feels like a natural part of the framework. It can easily be implemented into your applications in a way that feels familiar if you have worked with other frameworks and library routers.
Here is a basic example of routing in an Aurelia application using `router-lite`.

The following getting started guide assumes you have an Aurelia application already created. If not, [consult our Quick Start](../getting-started/quick-install-guide.md) to get Aurelia installed in minutes.

## Installation

```bash
npm i @aurelia/router-lite
```

## Configure the `router-lite`

To use the `router-lite`, we have to register it with Aurelia.
We do this at the bootstrapping phase.

{% code title="main.ts" %}
```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router-lite';
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
To know more about the different configuration options for router-lite, please refer the [documentation](./router-configuration.md) on that topic.
{% endhint %}

## Create the routable components

For this example, we have a root component which is `MyApp`.
And then we are going to define two routes for the root component, namely `home` and `about`.

Let us define these components first.

{% tabs %}
{% tab title="home.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import template from './home.html';

@customElement({ name: 'ho-me', template })
export class Home {
  private readonly message: string = 'Welcome to Aurelia2 router-lite!';
}
```
{% endtab %}
{% tab title="home.html" %}
```html
<h1>${message}</h1>
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

With the routable components in place, let's define the routes.
To this end, we need to add the route configurations to our root component `MyApp`.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';
import { route } from '@aurelia/router-lite';
import template from './my-app.html';
import { Home } from './home';
import { About } from './about';

@route({
  routes: [
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
  ],
})
@customElement({ name: 'my-app', template })
export class MyApp {}

```
{% endtab %}
{% tab title="my-app.html" %}
```html
<nav>
  <a href="home">Home</a>
  <a href="about">About</a>
</nav>

<au-viewport></au-viewport>
```
{% endtab %}
{% endtabs %}

There are couple of stuffs to note here.
We start by looking at the configurations defined using the `@route` decorator where we list out the routes under the `routes` property in the configuration object in the `@route` decorator.
The most important things in every route configurations are the `path` and the `component` properties.
This instructs the router to use the defined `component` in the viewport when it sees the associated `path`.

{% hint style="info" %}
To know more about configuring routes, please refer to the respective [documentation](./configuring-routes.md).
{% endhint %}

The viewport is specified in the view (see `my-app.html`) by using the `<au-viewport>` custom element.
For example, the router will use this element to display the `Home` component when it sees the `/` (the empty path) or the `/home` paths.

The `nav>a` elements are added to navigate from one view to another.

See this in action:

{% embed url="https://stackblitz.com/edit/router-lite-getting-started?ctl=1&embed=1&file=src/main.ts" %}

## Using pushstate

If you have opened the demo then you can notice that the URL in the address bar or the URLs in the `nav>a` elements contains a `#` (example: `/#home`, `/#about` etc.).
Depending on your project need and esthetics you may want to get rid of the `#`-character.
To this end, you need set the [`useUrlFragmentHash` to `false`](./router-configuration.md#choose-between-hash-and-pushstate-routing-using-useurlfragmenthash), which is also the default.

## Live examples

For the documentation of router-lite, many live examples are prepared.
It is recommended to use the live examples as you read along the documentation.
However, if you are feeling adventurous enough to explore the features by yourself, here is the complete [collection of the live examples](https://stackblitz.com/@Sayan751/collections/router-lite) at your disposal.

{% hint style="info" %}
The examples are created using StackBlitz.
Sometimes, you need to open the examples in a new tab to see changes in the URL, title etc.
To this end, copy the URL appearing on the address bar on the right pane and open that in a new tab.
{% endhint %}
