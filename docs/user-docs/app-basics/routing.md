---
description: Everything you need to know about routing in an Aurelia application.
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

> Note if you have worked with the Aurelia v1 router, direct routing is an entirely new feature and way of working with routes. Please see the differences to v1 section for further details.

Before continuing, it is important to note the router supports three different types of routing in your Aurelia applications. It is also possible to mix and switch between the three different types of router to suit your needs. 

These three types are; Direct Routing, Component Configured Routing and Configured Routing.

### Getting Started

The Router comes with the default installation of Aurelia and does not require the installation of any additional packages. The only requirement for the router is that you have an Aurelia application already created.

To register the plugin in your application, you can pass in the router object to the `register` method inside of the file containing your Aurelia initialization code. We import the `RouterConfiguration` class from the `aurelia` package, which allows us to register our router and change configuration settings.

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration)
  .app(component)
  .start();
```

By default, the router will use the hash style routing instead of pushState. Please see further down for details on how to configure the router to enable pushState routing.

Inside of your root application view, you'll then want to add the `<au-viewport>` element where routed components will be displayed inside of. If you followed the recommended way of creating an Aurelia application, your root view is called `my-app.html`.

### Direct Routing

Aurelia is known for its conventions-based approach to building applications. It provides you with a set of sane defaults and ways of doing certain things in your app, which help save time and make your life easier. The router in Aurelia 2 is no exception.

#### What Is Direct Routing?

To put it in simple terms, direct routing is routing without configuration. Unlike other routers you might be familiar with, you do not need to specify your routes upfront in code. The direct routing functionality works for all kinds of routing from standard routes to routes with parameters, child routing and more.

#### How It Works

You start off by registering the plugin in your app, you add in an `<au-viewport>` element where your routes will be displayed. Then using the `goto` attribute on your links, you can tell the router to render a specific component.

Components which have been globally registered inside the `register` method, or imported inside of the view can be rendered through the router.

#### A Simple Example

As you will see, the direct routing approach requires no configuration. We import our component and then reference it by name inside of the `goto` attribute.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<import from="./test-component.html"></import>

<ul>
    <li><a goto="test-component">Test Component</a></li>
</ul>

<au-viewport></au-viewport>
```
{% endtab %}

{% tab title="test-component.html" %}
```markup
<h1>Hello world, I'm a test component.</h1>
```
{% endtab %}
{% endtabs %}

The `goto` attribute on our link denotes that this link is to navigate to a component using the router. Inside of the `goto` attribute, we pass in the name of the component \(without any file extension\).

#### Routes With Parameters

The simple example above shows you how to render a component using the router, and now we are going to introduce support for parameters. A parameter is a dynamic value in your URL which can be accessed inside of the routed component. For example, this might be a product ID or a category name.

To access parameters from the URL, we can get those from the router lifecycle hook called `enter` which also supports promises and can be asynchronous.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<import from="./test-component"></import>

<ul>
    <li><a goto="test-component(hello)">Test Component</a></li>
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
```markup
<h1>Hello world, I'm a test component.</h1>
```
{% endtab %}
{% endtabs %}

In this example, we are not telling the router the name of our parameters. By default, the router will pass an object keyed by index \(starting at 0\) for unnamed parameters. To access the value being given to our test component, we would reference it using `parameters['0']` which would contain `1` as the value.

#### Inline Named Route Parameters

You can name your route parameters inline by specifying the name inside of the `goto` attribute on the component.

{% tabs %}
{% tab title="my-app.html" %}
```markup
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
```markup
<h1>Hello world, I'm a test component.</h1>
```
{% endtab %}
{% endtabs %}

#### Named Route Parameters

It is recommended that unless you do not know the names of the parameters, that you supply the names inside of your routed component using the static class property `parameters` which accepts an array of strings corresponding to parameters in your URL.

While you can name them inline, specifying them inside of your component makes it easier for other people working in your codebase to determine how the component work.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<import from="./test-component"></import>

<ul>
    <li><a goto="test-component(hello)">Test Component</a></li>
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
```markup
<h1>Hello world, I'm a test component.</h1>
```
{% endtab %}
{% endtabs %}

### Component Configured Routing

If direct routing isn't verbose enough for you and configured routing is too verbose, component configured routing is a mix between the two and falls somewhere in the middle. Using decorators to configure your components and router options, it still requires very little code.

### Configured Routing

If you prefer a more traditional approach to routing where you specify the routes through configuration and things work similarly to other routers you might have worked with \(including the Aurelia 1 router\), then configured routing might appeal to you.

### Lifecycle Hooks

Inside of your routeable components which implement the `IRouteableComponent` interface, there are certain methods which are called at different points of the routing lifecycle. These lifecycle hooks allow you to run code inside of your components such as fetch data or change the UI itself.

{% hint style="info" %}
Router lifecycle hook methods are all completely optional. You only have to implement the methods you require. The router will only call a method if it has been specified inside of your routeable component. All lifecycle hook methods also support returning a promise and can be asynchronous.
{% endhint %}

#### canEnter

The `canEnter` method is called upon attempting to load the component. If your route has any parameters supplied, they will be provided to the `enter` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you were loading data from an API based on values provided in the URL, you would most likely do that inside of `canEnter` if the view is dependent on the data successfully loading.
{% endhint %}

#### enter

The `enter` method is called when your component is navigated to. If your route has any parameters supplied, they will be provided to the `enter` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you are loading data from an API based on values provided in the URL and the rendering of this view is not dependent on the data being successfully returned, you can do that inside of `enter`.
{% endhint %}

#### canLeave

The `canLeave` method is called when a user attempts to leave a routed view. The first argument of this callback is a `INavigatorInstruction` which provides information about the next route.

#### leave

The `leave` method is called if the user is allowed to leave and in the process of leaving. The first argument of this callback is a `INavigatorInstruction` which provides information about the next route.

If you are working with components you are rendering, implementing `IRouteableComponent` will ensure that your code editor provides you with intellisense to make working with these lifecycle hooks in the appropriate way a lot easier.

```typescript
export class MyComponent implements IRouteableComponent {
    public canEnter(parameters) {}
    public enter(parameters) {}
    public canLeave() {}
    public leave() {}
}
```

### Router Hooks

As the name implies, route hooks allow you to guard specific routes and redirect the user or cancel navigation entirely. In most cases, you will want to use route hooks to protect certain areas of your application from people who do not have the required permission.

{% hint style="info" %}
If you want to protect specific routes in your application behind authentication checks such as "Only allow user to view this part of my app if they are logged in and have permission", this is the section for you.
{% endhint %}

**This is a basic example of injecting the router and adding a new router hook**

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

A router hook allows you to run middleware in the routing process. Which you can then use to redirect a user, perform additional checks \(token, permission calls\) and other application scenarios.

Returning `true` will allow the instruction to be processed, and returning `false` will disallow it. This will apply to every processed component, which for many purposes, is a little heavy-handed and not what you want to do. You'll want to be specific when using a router hook so you know when it runs and what it will apply to.

Running the above code will allow all route instructions to proceed, so nothing will change.

#### Whitelist/Blacklist Using `exclude` and `include`

As we mentioned previously, our hook will apply to every component in our application. You might only have a couple of areas of your app you want to protect behind hook checks. There is two properties `include` which is a whitelist property and `exclude` which is a blacklist property.

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

In this example, we are telling the router we only want to apply the hook to a component called admin, all other routed components will be ignored when this hook is run. It is recommended that you use the whitelist approach using `include` where only a few components need to use a hook and `exclude` when mostly all components need to be run through the book.

#### Authentication Example using Route Hooks

One of the most common scenarios you will use router hooks for is adding in authentication to your applications.  Whether you use a third-party service such as Auth0 or Firebase Auth, the process is mostly the same. In this example, we will create a service class which will contain our methods for logging in and out.

In a real application, your login and logout methods would obtain a token and authentication data, and check. For the purposes of this example, we have an if statement which checks for a specific username and password being supplied.

{% tabs %}
{% tab title="src/services/auth-service.ts" %}
```typescript
import { IRouter } from 'aurelia';

export class AuthService {
    public isLoggedIn = false;
    private _user = null;

    constructor(@IRouter private router: IRouter) {

    }

    public async login(username: string, password: string): Promise<void> {
        if (username === 'user' && password === 'password') {
            this.isLoggedIn = true;
            
            this._user = {
                username: 'user',
                email: 'user@domain.com'
            };   
        } else {
            this.router.goto('/login');
        }
    }

    public logout(redirect = null): void {
        this.isLoggedIn = false;
        this._user = null;

		    if (redirect) {
			    this.router.goto(redirect);
		    }
    }
    
    public getCurrentUser() {
        return this._user;
    }
}
```
{% endtab %}

{% tab title="my-app.ts" %}
```
import { IRouter, IViewModel } from 'aurelia';
import { AuthService } from './services/auth-service'; 

export class MyApp implements IViewModel {
    constructor(@IRouter private router: IRouter, private auth: AuthService) {

    }

    afterBind() {
        this.router.addHook(async (instructions) => {
            return this.auth.isLoggedIn;
        });
    }
}
```
{% endtab %}
{% endtabs %}

### Differences from v1

If you worked with Aurelia before version two, then you will already know just from reading the getting started in this documentation, Aurelia 2 routing is a little different. This section is only relevant and applicable to developers who are either migrating from the Aurelia 1 router or more familiar with Aurelia 1 routing and want to understand the differences.

