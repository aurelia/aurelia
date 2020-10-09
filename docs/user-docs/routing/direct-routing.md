---
description: >-
  How to leverage direct routing in your Aurelia applications using the
  convention-based direct router feature.
---

# Direct Routing

Aurelia is known for its conventions-based approach to building applications. It provides you with a set of sane defaults and ways of doing certain things in your app, which help save time and make your life easier. The router in Aurelia 2 is no exception.

{% hint style="success" %}
**What you will learn in this section**

* What direct routing is
* How to create parameter-less routes
* How to create routes with parameters
* How to pass data through routes
* How to name parameters
{% endhint %}

## What Is Direct Routing?

To put it in simple terms, direct routing is routing without route configuration. Unlike other routers you might be familiar with, you do not need to specify your routes upfront in code. The direct routing functionality works for all kinds of routing from standard routes to routes with parameters, child routing and more.

### How It Works

You start off by registering the plugin in your app, you add in an `<au-viewport>` element where your routes will be displayed. Then using the `load` attribute on your links, you can tell the router to render a specific component.

Components which have been globally registered inside the `register` method, or imported inside of the view can be rendered through the router.

## Direct Routing Example

As you will see, the direct routing approach requires no configuration. We import our component and then reference it by name inside of the `load` attribute.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<import from="./test-component.html"></import>

<ul>
    <li><a load="test-component">Test Component</a></li>
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

The `load` attribute on our link denotes that this link is to navigate to a component using the router. Inside of the `load` attribute, we pass in the name of the component \(without any file extension\). As you can see, HTML only components are supported by the router.

## Routes With Parameters

The simple example above shows you how to render a component using the router, and now we are going to introduce support for parameters. A parameter is a dynamic value in your route which can be accessed inside of the routed component. For example, this might be a product ID or a category name.

To access parameters from the route, we can get those from the router lifecycle hook called `load` which also supports promises and can be asynchronous.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<import from="./test-component"></import>

<ul>
    <li><a load="test-component(hello)">Test Component</a></li>
</ul>

<au-viewport></au-viewport>
```
{% endtab %}

{% tab title="test-component.ts" %}
```typescript
import { IRouteableComponent } from '@aurelia/router';

export class TestComponent implements IRouteableComponent {
    public load(parameters) {
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

### **Inline Named Route Parameters**

You can name your route parameters inline by specifying the name inside of the `load` attribute on the component.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<import from="./test-component"></import>

<ul>
    <li><a load="test-component(named=hello)">Test Component</a></li>
</ul>

<au-viewport></au-viewport>
```
{% endtab %}

{% tab title="test-component.ts" %}
```typescript
import { IRouteableComponent } from '@aurelia/router';

export class TestComponent implements IRouteableComponent {
    public load(parameters) {
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

### **Named Route Parameters**

It is recommended that unless you do not know the names of the parameters, that you supply the names inside of your routed component using the static class property `parameters` which accepts an array of strings corresponding to parameters in your route.

While you can name them inline, specifying them inside of your component makes it easier for other people working in your codebase to determine how the component work.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<import from="./test-component"></import>

<ul>
    <li><a load="test-component(hello)">Test Component</a></li>
</ul>

<au-viewport></au-viewport>
```
{% endtab %}

{% tab title="test-component.ts" %}
```typescript
import { IRouteableComponent } from '@aurelia/router';

export class TestComponent implements IRouteableComponent {
    public static parameters = ['id'];

    public load(parameters) {
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

