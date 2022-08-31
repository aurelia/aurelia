# Getting Started

Routing with Aurelia feels like a natural part of the framework. It can easily be implemented into your applications in a way that feels familiar if you have worked with other frameworks and library routers.

{% hint style="warning" %}
The following getting started guide assumes you have an Aurelia application already created. If not, [consult our Quick Start](../../getting-started/quick-install-guide.md) to get Aurelia installed in minutes.
{% endhint %}

Here is a basic example of routing in an Aurelia application.&#x20;

## HTML

First, let's look at the HTML. If you use the `makes` tool to scaffold your Aurelia application, this might be `my-app.html`

{% code title="my-app.html" %}
```html
<a load="/">Home</a>
<a load="about">About</a>

<au-viewport></au-viewport>
```
{% endcode %}

`load`

Notice how we use standard hyperlink `<a>` tags, but they have a `load` attribute? This attribute tells the router that these are routable links.

`au-viewport`

This tells the router where to display your components. It can go anywhere inside of your HTML.

## Javascript

To use the router, we have to register it with Aurelia. We do this inside of `main.ts` — the router is then enabled after it is registered.

{% code title="main.ts" %}
```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration)
  .app(MyApp)
  .start();
```
{% endcode %}

Now, we create our routes. We'll do this inside of `my-app.ts` and use the `static routes` property.

{% code title="my-app.ts" %}
```typescript
import { HomePage } from './home-page';
import { AboutPage } from './about-page';

export class MyApp {
    static routes = [
        {
            path: '',
            component: HomePage,
            title: 'Home'
        },
        {
            path: '/about',
            component: AboutPage,
            title: 'About'
        },
    ];
}
```
{% endcode %}

For our two routes, we import and provide their respective components. Your components are just classes and can be very simple. Here is the `HomePage` component.

{% code title="home-page.html" %}
```html
<h1>Homepage</h1>
<p>This is the homepage.</p>
```
{% endcode %}

And the view-model for our component is equally simple:

```typescript
export class HomePage {
}
```

We only touched upon the basics of routing in this getting started section. To learn how to work with parameters, lifecycles and other routing concepts, please consult the other parts of the router documentation.

{% hint style="success" %}
Still confused or need an example? You can find an example application with routing over on GitHub [here](https://github.com/aurelia/routing-application).
{% endhint %}
