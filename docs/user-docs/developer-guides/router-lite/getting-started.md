# Getting started

{% hint style="info" %}
Please note that in Aurelia2 there are two routers, namely [`@aurelia/router`](../router/README.md) and `@aurelia/router-lite` (this one). As the name suggests the second one is smaller in size, supports only configured routing, and does not support direct routing, as facilitated by `@aurelia/router`. Choose your router depending on your need.
{% endhint %}

Routing with Aurelia feels like a natural part of the framework. It can easily be implemented into your applications in a way that feels familiar if you have worked with other frameworks and library routers.

{% hint style="warning" %}
The following getting started guide assumes you have an Aurelia application already created. If not, [consult our Quick Start](../../getting-started/quick-install-guide.md) to get Aurelia installed in minutes.
{% endhint %}

Here is a basic example of routing in an Aurelia application using `router-lite`.

## Installation

```bash
npm i @aurelia/router-lite
```

## Configure the `router-lite`

To use the `router-lite`, we have to register it with Aurelia. We do this inside of `main.ts` — the router is then enabled after it is registered.

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
To know more about the different configuration options for router-lite, please refer the [documentation](router-configuration.md) on that topic.
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
<!-- TODO(Sayan): add link to the detailed route-configuration section -->
The most important things in every route configurations are the `path` and the `component` properties.
This indicates the router to use the defined `component` in the routing viewport when it sees the associated `path`.

The routing viewport is specified in the view (see `my-app.html`) by using the `<au-viewport>` custom element.
For example, the router will use this element to display the `Home` component when it sees the `/` (the empty path) or the `/home` fragments.

The `nav>a` elements are added to navigate from one view to another.

See this in action:

{% embed url="https://stackblitz.com/edit/router-lite-getting-started?ctl=1&embed=1&file=src/main.ts" %}

## Using pushstate

If you have open the demo in a preview mode (by copying the preview URL and opening in a different tab), then you can notice that the URL in the address bar or the URLs in the `nav>a` elements contains a `#` (example: `/#home`, `/#about` etc.).
Depending on your project need and esthetics you may want to get rid of the `#`-character.
To this end, you need set the `useUrlFragmentHash` to `false`, which is also the default.
