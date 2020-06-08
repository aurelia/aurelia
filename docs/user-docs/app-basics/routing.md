---
description: The ins and outs of routing in an Aurelia application
---

# Routing

This document explains how to add in routing to your application using the Aurelia Router. The Aurelia Router provides numerous ways of routing in your apps, including convention-based routing known as direct routing.

{% hint style="success" %}
**Here's what you'll learn...**

* How to register and configure the router
* How to work with direct routing
* How to use with parameterized routes
* How to use with child routes
* How to use router hooks to prevent access to certain parts of your app
* How to use configuration-based routing
* How to customize the router to support push state and hash change routing
* Styling links with active CSS classes
{% endhint %}

> Note if you have worked with the Aurelia v1 router, direct routing is an entirely new feature and way of working with routes. Please see the [differences to v1](#differences-from-v1) section for further details.

## Getting Started

The Router comes with the default installation of Aurelia and does not require the installation of any additional packages. The only requirement for the router is that you have an Aurelia application already created.

To register the plugin in your application, you can pass in the router object to the `register` method inside of the file containing your Aurelia initialization code. 

We import the `RouterConfiguration` class from the `aurelia` package, which allows us to register our router and change configuration settings.

 ```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration)
  .app(component)
  .start();
 ```

You might notice we are supplying a configuration object to the `customize` method. Inside of it, we are providing `useUrlFragmentHash: true` -- this tells the router by default to use URL fragments for routing. Setting this to `false` will give you cleaner URL's, but require a server that can support push state routing.

Inside of your root application view, you'll then want to add the `<au-viewport>` element where routed components will be displayed inside of. If you followed the recommended way of creating an Aurelia application, your root view is called `my-app.html`.

## Direct Routing

Aurelia is known for its conventions-based approach to building applications. It provides you with a set of sane defaults and ways of doing certain things in your app, which help save time and make your life easier. The router in Aurelia 2 is no exception.

### What Is Direct Routing?

To put it in simple terms, direct routing is routing without configuration. Unlike other routers you might be familiar with, you do not need to specify your routes upfront in code. The direct routing functionality works for all kinds of routing from standard routes to routes with parameters, child routing and more.

### How It Works

You start off by registering the plugin in your app, you add in an `<au-viewport>` element where your routes will be displayed. Then using the `goto` attribute on your links, you can tell the router to render a specific component.

Components which have been globally registered inside the `register` method, or imported inside of the view can be rendered through the router.

### A Simple Example

As you will see, the direct routing approach requires no configuration. We import our component, and then reference it by name inside of the `goto` attribute.

{% tabs %}
{% tab title="my-app.html" %}

```html
<import from="./test-component.html"></import>

<ul>
    <li><a goto="test-component">Test Component</a></li>
</ul>

<au-viewport></au-viewport>
```

{% endtab %}

{% tab title="test-component.html" %}

```html
<h1>Hello world, I'm a test component.</h1>
```

{% endtab %}
{% endtabs %}

The `goto` attribute on our link denotes that this link is to navigate to a component using the router. Inside of the `goto` attribute, we pass in the name of the component (without any file extension).

### Routes With Parameters

The simple example above shows you how to render a component using the router and now we are going to introduce support for parameters. A parameter is a dynamic value in your URL which can be accessed inside of the routed component. For example, this might be a product ID or a category name.

To access parameters from the URL, we can get those from the router lifecycle hook called `enter` which also supports promises and can be asynchronous.

{% tabs %}
{% tab title="my-app.html" %}

```html
<import from="./test-component"></import>

<ul>
    <li><a goto="test-component('hello')">Test Component</a></li>
</ul>

<au-viewport></au-viewport>
```

{% endtab %}

{% tab title="test-component.ts" %}

```typescript
import { IRouteableComponent } from '@aurelia/router';

export class TestComponent implements IRouteableComponent {
    public enter(parameters) {
        console.log(parameters); // Should display {0: "hello"} in the browser developer tools console
    }
}
```

{% endtab %}

{% tab title="test-component.html" %}

```html
<h1>Hello world, I'm a test component.</h1>
```

{% endtab %}
{% endtabs %}

In this example, we are not telling the router the name of our parameters. By default, the router will pass an object keyed by index (starting at 0) for unnamed parameters. To access the value being passed to our test component, we would reference it using `parameters['0']` which would contain `1` as the value.

### Inline Named Route Parameters

You can name your route parameters inline by specifying the name inside of the `goto` attribute on the component.

{% tabs %}
{% tab title="my-app.html" %}

```html
<import from="./test-component"></import>

<ul>
    <li><a goto="test-component(named=hello)">Test Component</a></li>
</ul>

<au-viewport></au-viewport>
```

{% endtab %}

{% tab title="test-component.ts" %}

```typescript
import { IRouteableComponent } from '@aurelia/router';

export class TestComponent implements IRouteableComponent {
    public enter(parameters) {
        console.log(parameters); // Should display {named: "hello"} in the browser developer tools console
    }
}
```

{% endtab %}

{% tab title="test-component.html" %}

```html
<h1>Hello world, I'm a test component.</h1>
```

{% endtab %}
{% endtabs %}

### Named Route Parameters

It is recommended that unless you do not know the names of the parameters, that you supply the names inside of your routed component using the static class property `parameters` which accepts an array of strings corresponding to parameters in your URL. 

While you can name them inline, specifying them inside of your component makes it easier for other people working in your codebase to determine how the component work.

{% tabs %}
{% tab title="my-app.html" %}

```html
<import from="./test-component"></import>

<ul>
    <li><a goto="test-component('hello')">Test Component</a></li>
</ul>

<au-viewport></au-viewport>
```

{% endtab %}

{% tab title="test-component.ts" %}

```typescript
import { IRouteableComponent } from '@aurelia/router';

export class TestComponent implements IRouteableComponent {
    public static parameters = ['id'];
    
    public enter(parameters) {
        console.log(parameters); // Should display {id: "hello"} in the browser developer tools console
    }
}
```

{% endtab %}

{% tab title="test-component.html" %}

```html
<h1>Hello world, I'm a test component.</h1>
```

{% endtab %}
{% endtabs %}

## Component Configured Routing

## Configured Routing

## Router Hooks

As the name implies, route hooks  allow you to guard specific routes and redirect the user or cancel navigation entirely. In most cases, you will be wanting to use route hooks to protect certain areas of your application from people who do not have the required permission.

{% hint style="success" %}
If you want to protect certain routes in your application behind authentication checks, this is the section for you.
{% endhint %}

We are going to inject the router into the root of our application and then register a hook.

```typescript
import { IRouter, IViewModel } from 'aurelia';

export class MyApp implements IViewModel {
    constructor(@IRouter private router: IRouter) {

    }

    afterBind() {
    	this.router.addHook(async (instructions) => {
        return true;
    	});
    }
}
```

A router hook allows you to run middleware in the routing process, which you can then use to redirect a user, perform additional checks (token, permission calls) and other applicable scenarios.

Returning `true` will allow the instruction to be processed and returning `false` will disallow it. This will apply to every processed component, which for many purposes is a little heavy-handed and not what you want to do. You'll want to be specific when using a router hook so you know when it runs and what it will apply to.

Running the above code will allow all route instructions to proceed, so nothing will change.

### Whitelist/Blacklist Using `exclude` and `include`

As we mentioned previously, our hook will apply to every component in our application. You might only have a couple of areas of your app you want to protect behind hook checks. There are two properties `include` which is a whitelist property and `exclude` which is a blacklist property.

```typescript
import { IRouter, IViewModel } from 'aurelia';

export class App implements IViewModel {
    constructor(@IRouter private router: IRouter) {

    }

    afterBind() {
    	this.router.addHook(async (instructions) => {

    	}, {
    		include: ['admin']
    	});
    }
}
```

In this example, we are telling the router we only want to apply the hook to a component called admin.

## Differences from v1

If you worked with Aurelia before version two, then you will already know just from reading the getting started in this documentation, Aurelia 2 routing is a little different.

This section is only relevant and applicable to developers who are either migrating from the Aurelia 1 router or more familiar with Aurelia 1 routing and want to understand the differences.
