# Getting Started

Routing with Aurelia feels like a natural part of the framework. It can easily be implemented into your applications in a way that feels familiar if you have worked with other frameworks and library routers.

This section is broken up into two parts—a quick introduction to the router and router configuration. If you are looking for details on configuring the router (set titles, handle unknown routes, etc.), please see the [Configuration](getting-started.md#configuration) section at the end of this guide.

At present, there are two routers that ship with Aurelia: router lite and core router. This section refers to the core router package that lives in `@aurelia/router` — please see the warning note below on a caveat some developers encounter when working with the router.

{% hint style="warning" %}
**Before you go any further:** Please ensure you are importing from the `@aurelia/router` package. Sometimes import extensions will autocomplete your imports and import from the `aurelia` package, which currently exports the lite router. Eventually, the `aurelia` package will export the `@aurelia/router` package, but it currently does not. We have noticed, in many instances, that using the incorrect router imports is why routing is not working.
{% endhint %}

## A quick introduction to routing

See how you can configure and implement routing in your Aurelia applications in only a few minutes. Of course, you will want to expand upon this as you build your routes. Here we only learn the bare minimum to get started.

{% hint style="success" %}
The following getting started guide assumes you have an Aurelia application already created. If not, [consult our Quick Start](../getting-started/quick-install-guide.md) to get Aurelia installed in minutes.
{% endhint %}

### Register the router and create routes

To use the router, we have to register it with Aurelia. We do this inside of `main.ts` (or `main.js` if you're working with Javascript) — the router is then enabled after it is registered. You might already have code like this if you chose the routing example when generating using the Makes scaffolding tool.

{% code title="main.ts" %}
```typescript
import Aurelia from 'aurelia';

// Our router configuration import to register the Router with Aurelia's DI
import { RouterConfiguration } from '@aurelia/router';

import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration)
  .app(MyApp)
  .start();
```
{% endcode %}

{% hint style="warning" %}
Once again, it bears repeating. Please make sure your router imports are being imported from ``@aurelia/router in your `main.ts` file, but also in other parts of your Aurelia application as well.``
{% endhint %}

Now, we create our routes. We'll do this inside  `my-app.ts` and use the `static routes` property. Please note that there is also a `@routes` decorator, which is detailed inside the [Creating Routes](creating-routes.md) section.

{% code title="my-app.ts" %}
```typescript
import { HomePage } from './home-page';

export class MyApp {
    static routes = [
        {
            path: '',
            component: HomePage,
            title: 'Home'
        },
    ];
}
```
{% endcode %}

For our two routes, we import and provide their respective components. Your components are just classes and can be very simple. Here is the `HomePage` component. Please note that you can use inline imports when creating routes, also detailed in the [Creating Routes](creating-routes.md) section.

Take note of the `path` property which is empty. This tells the router that the `HomePage` component is our default route. If no route is supplied, it will load this as the default component. The `component` property is the component that will be loaded (self-explanatory). And the `title` property is the title for our route.

{% code title="home-page.html" %}
```html
<h1>Homepage</h1>
<p>This is the homepage.</p>
```
{% endcode %}

And the view model for our component is equally simple:

{% code title="home-page.ts" %}
```typescript
export class HomePage {
}
```
{% endcode %}

### Create the HTML View

First, let's look at the HTML. If you use the `makes` tool to scaffold your Aurelia application. This might be `my-app.html`

{% code title="my-app.html" %}
```html
<!-- Two routes using the load attribute containing the path of the route -->
<a load="/">Home</a>

<!-- This is where our routed components are loaded -->
<au-viewport></au-viewport>
```
{% endcode %}

`load`

Notice how we use a standard hyperlink `<a>` tags, but they have an `load` attribute instead of `href`? This attribute tells the router that these are routable links. The router will translate these `load` values into routes (either path or route name). By default, the router does also allow you to use `href` for routes (a setting that can be turned off below configuring `useHref`).

`au-viewport`

This tells the router where to display your components. It can go anywhere inside your HTML. It can also have a name (handy for instances where there are multiple `au-viewport` elements) and you can have more than one.

## Configuration

The router allows you to configure how it interprets and handles routing in your Aurelia applications. The `customize` method on the `RouterConfiguration` object can be used to set numerous router settings besides the `useUrlFragmentHash` value.

{% hint style="info" %}
Can't find what you're looking for in this section? We have a [Router Recipes](router-recipes.md) section detailing many tasks for working with the router, from passing data between routes to route guards.
{% endhint %}

### Setting the title of your application

The title can be set for the overall application. By default, the title uses the following value: `${componentTitles}${appTitleSeparator}Aurelia` the component title (taken from the route or component) and the separator, followed by Aurelia.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router'; 

Aurelia
  .register(
    RouterConfiguration.customize({ 
      title: '${componentTitles}${appTitleSeparator}My App'
    }))
  .app(component)
  .start();
```

In most instances, using the above string title is what you will want. For situations where you need to set the title or transform the title programmatically, you will want the solution below.

### Customizing the title

Using the `transformTitle`method from the router customization, the default title-building logic can be overwritten. This allows you to set the title programmatically, perform translation (using Aurelia i18n or other packages) and more.

{% hint style="info" %}
Are you trying to set the title using the Aurelia i18n package? Visit the section on configuring translated router titles here.
{% endhint %}

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

### Changing the router mode (hash and pushState routing)

If you do not provide any configuration value, the default is hash-based routing. This means a hash will be used in the URL. If your application requires SEO-friendly links instead of hash-based routing links, you will want to use pushState.

#### Configuring pushState routing

We are performing the configuration inside of the `main.ts` file, which is the default file created when using the `Makes` CLI tool.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router'; 

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(component)
  .start();
```

By calling the `customize` method, you can supply a configuration object containing the property `useUrlFragmentHash` and supplying a boolean value. If you supply `true` this will enable hash mode. The default is `true`.

If you are working with pushState routing, you will need a base HREF value in the head of your document. The scaffolded application from the CLI includes this in the `index.html` file, but if you're starting from scratch or building within an existing application, you need to be aware of this.

```html
<head>
    <base href="/">
</head>
```

{% hint style="warning" %}
PushState requires server-side support. This configuration is different depending on your server setup. For example, if you are using Webpack DevServer, you'll want to set the `devServer` `historyApiFallback` option to `true`. If you are using ASP.NET Core, you'll want to call `routes.MapSpaFallbackRoute` in your startup code. See your preferred server technology's documentation for more information on how to allow 404s to be handled on the client with push state.
{% endhint %}

### Configuring route markup parsing using useHref

The `useHref` configuration setting is something all developers working with routing in Aurelia need to be aware of. By default, the router will allow you to use both `href` as well as `load` for specifying routes.

Where this can get you into trouble are external links, mailto links and other types of links that do not route. A simple example looks like this:

```html
<a href="mailto:myemail@gmail.com">Email Me</a>
```

By default, this seemingly innocent and common scenario will trigger the router and cause an error in the console.

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

### Handling unknown components

If you are using the router to render components in your application, there might be situations where a component attempts to be rendered that does not exist. This can happen while using direct routing (not configured routing)

{% hint style="warning" %}
This section is not for catch-all/404 routes. If you are using configured routing, you are looking for the [section on catch-all routes here](creating-routes.md#catch-all-404-not-found-route).
{% endhint %}

To add in fallback behavior, we can do this in two ways. The `fallback` attribute on the `<au-viewport>` element or in the router `customize` method (code).

#### Create the fallback component

Let's create the `missing-page` component (this is required, or the fallback behavior will not work). First, we'll create the view model for our `missing-page` component.

{% code title="missing-page.ts" %}
```typescript
export class MissingPage {
  public static parameters = ['id'];
  public missingComponent: string ;

  public loading(parameters: {id: string}): void {
    this.missingComponent = parameters.id;
  }
}
```
{% endcode %}

For the `fallback` component, an ID gets passed as a parameter which is the value from the URL. If you were to attempt to visit a non-existent route called "ROB," the `missingComponent` value would be ROB.

Now, the HTML.

{% code title="missing-page.html" %}
```html
<h3>Ouch! I couldn't find '${missingComponent}'!</h3>
```
{% endcode %}

#### Programmatically

By using the `fallback` property on the `customize` method when we register the router, we can pass a component.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';
import { MissingPage } from './missing-page'; 

Aurelia
  .register(RouterConfiguration.customize({
    fallback: MissingPage,
  }))
  .app(MyApp)
  .start();
```

#### Attribute

Sometimes the `fallback` attribute can be the preferred approach to registering a fallback. Import your fallback component and pass the name to the `fallback` attribute. The same result, but it doesn't require touching the router registration.

{% code title="my-app.html" %}
```html
<import from="./missing-page"></import>

<au-viewport fallback="missing-page"></au-viewport>
```
{% endcode %}

### Configuring the route swap order

The `swapStrategy` configuration value determines how contents are swapped in a viewport when transitioning. Sometimes, you might want to change this depending on the type of data you are working with or how your routes are loaded. A good example of configuring the swap order is when you're working with animations.

* `attach-next-detach-current` (default)
* `attach-detach-simultaneously`
* `detach-current-attach-next`
* `detach-attach-simultaneously`

{% hint style="success" %}
Still, confused or need an example? You can find an example application with routing over on GitHub [here](https://github.com/aurelia/routing-application).
{% endhint %}
