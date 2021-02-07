---
description: The basics of building components with Aurelia.
---

# Building Components

Aurelia applications are built out of components, from top to bottom. At startup, an app declares a _root component_, but inside of that component's view, other components are used, and inside of those components, even more components. In this fashion, the entire user interface is constructed.

{% hint style="success" %}
**Here's what you'll learn...**

* How to create and use components.
* How to leverage conventions to work smarter and not harder.
* What component lifecycle hooks are available to you.
{% endhint %}

## Creating and Using Components

Components in Aurelia follow the Model-View-ViewModel design pattern \(a descendant of MVC and MVP\) and are represented in HTML as _custom elements_. Each component has a JavaScript class, which serves as the _view-model_, providing the state and behavior for the component. Each component has an HTML template or _view_, which provides the rendering instructions for the component. Optionally, components can have a separate _model_ to provide unique business logic or a separate CSS file to provide styles.

### The Basics

To define a component, you only need to create your JavaScript or TypeScript file with the same name as your HTML file. By convention, Aurelia will recognize these as the view-model and view of a component and will assemble them for you. Here's an example of a simple "hello world" component:

{% tabs %}
{% tab title="say-hello.ts" %}
```typescript
export class SayHello {

}
```
{% endtab %}

{% tab title="say-hello.html" %}
```markup
<h2>Hello World!</h2>
```
{% endtab %}

{% tab title="my-app.html" %}
```markup
<import from="./say-hello"></import>

<say-hello></say-hello>
```
{% endtab %}
{% endtabs %}

{% hint style="warning" %}
**Naming Components**

The component name, derived from the file name, **must** contain a hyphen when working with Shadow DOM \(see [Styling Components](../../app-basics/styling-components.md)\). This is part of the W3C Web Components standard and is designed to serve as a namespacing mechanism for custom HTML elements. A typical best practice is to choose a two to three character prefix to use consistently across your app or company. For example, all components provided by Aurelia have the prefix `au-`.
{% endhint %}

The `say-hello` custom element we've created isn't very interesting yet, so lets spice it up by allowing the user to providing a "to" property so that we can personalize the message. To create "bindable" properties for your HTML element, you declare them using the `@bindable` decorator as shown in the next example.

{% tabs %}
{% tab title="say-hello.ts" %}
```typescript
import { bindable } from 'aurelia';

export class SayHello {
  @bindable to = 'World';
}
```
{% endtab %}

{% tab title="say-hello.html" %}
```markup
<h2>Hello ${to}!</h2>
```
{% endtab %}

{% tab title="my-app.html" %}
```markup
<import from="./say-hello"></import>

<say-hello to="John"></say-hello>
```
{% endtab %}
{% endtabs %}

By declaring a _bindable_, not only can your template access the property via string interpolation, but those who use the custom element in HTML can set that property directly through an HTML attribute or even bind the `to` attribute to their own model.

{% hint style="success" %}
**CSS Conventions**

Want to define component-specific CSS? Simply name your CSS file the same as your view-model and view, and Aurelia will include the styles in your component automatically. So, for the component defined above, we only need to add a `say-hello.css` file.
{% endhint %}

Now, what if we want our component to do something in response to user interaction? Let's see how we can set up DOM events to trigger methods on our component.

{% tabs %}
{% tab title="say-hello.ts" %}
```typescript
import { bindable } from 'aurelia';

export class SayHello {
  @bindable to = 'World';
  message = 'Hello';

  leave() {
    this.message = 'Goodbye';
  }
}
```
{% endtab %}

{% tab title="say-hello.html" %}
```markup
<h2>${message} ${to}!</h2>
<button click.trigger="leave()">Leave</button>
```
{% endtab %}

{% tab title="my-app.html" %}
```markup
<import from="./say-hello"></import>

<say-hello to="John"></say-hello>
```
{% endtab %}
{% endtabs %}

Now, when the user clicks the button, the `leave` method will get called. It then updates the message property, which causes the DOM to respond by updating as well.

{% hint style="info" %}
**Further Reading**

Interested to learn more about how you can display data with Aurelia's templating engine or how you can leverage events to respond to changes and interactions within your app? The next few docs on [Displaying Basic Data](../displaying-basic-data.md), [Rendering Collections](../rendering-collections.md), [Conditional Rendering](../conditional-rendering.md), and [Handling Events](../handling-events.md) will give you all the nitty, gritty details.
{% endhint %}

### Component Registration

By default, the components you create aren't global. What that means is that you can't use a component within another component, unless that component has been imported. Let's imagine that our "say-hello" component wants to use a "name-tag" component internally. To do that, we need to add an import in our view. Here's how that works:

{% tabs %}
{% tab title="say-hello.html" %}
```markup
<import from="./name-tag">

<h2>${message} <name-tag name.bind="to"></name-tag>!</h2>
<button click.trigger="leave()">Leave</button>
```
{% endtab %}

{% tab title="say-hello.ts" %}
```typescript
import { bindable } from 'aurelia';

export class SayHello {
  @bindable to = 'World';
  message = 'Hello';

  leave() {
    this.message = 'Goodbye';
  }
}
```
{% endtab %}

{% tab title="app.html" %}
```markup
<import from="./say-hello"></import>

<say-hello to="John"></say-hello>
```
{% endtab %}
{% endtabs %}

In practice, most people want to side-step this feature and make most of their general-purpose components global, so they can remove the majority of their imports. To make a component global, simply register it with the application's root dependency injection container at startup:

{% code title="main.ts" %}
```typescript
import Aurelia from 'aurelia';
import { App } from './app';
import { NameTag } from './name-tag';

Aurelia
  .register(
    NameTag // Here it is!
  )
  .app(App)
  .start();
```
{% endcode %}

As a best practice, we recommend an alternate approach to registering each component individually in this way. Instead, create a folder where you keep all your shared components. In that folder, create a `registry.ts` module where you re-export your components. Then, import that registry module and pass it to the application's `register` method at startup.

{% tabs %}
{% tab title="components/registry.ts" %}
```typescript
export * from './say-hello';
export * from './name-tag';
```
{% endtab %}

{% tab title="main.ts" %}
```typescript
import Aurelia from 'aurelia';
import { App } from './app';
import * as globalComponents from './components/registry';

Aurelia
  .register(
    globalComponents // This globalizes all the exports of our registry.
  )
  .app(App)
  .start();
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
**Aurelia Architecture**

Did you notice how the default Aurelia startup code involves importing and registering `StandardConfiguration`? The `StandardConfiguration` export is a type of `registry,` just like the one we described above. Since all of Aurelia's internals are pluggable and extensible, we provide this convenience registry to setup the standard options you would want in a typical application.
{% endhint %}

### Working without Conventions

So far, we've described how components are created by simply naming your JavaScript and HTML files with the same name, and that the component name is automatically derived from the file name. However, if you don't want to leverage conventions, or need to override the default behavior for an individual component, you can always explicitly provide the configuration yourself. To do this, use the `@customElement` decorator. Here's how we would define the previous component, without using conventions.

{% tabs %}
{% tab title="say-hello.ts" %}
```typescript
import { customElement, bindable } from 'aurelia';
import template from './say-hello.html';

@customElement({
  name: 'say-hello',
  template
})
export class SayHello {
  @bindable to = 'World';
  message = 'Hello';

  leave() {
    this.message = 'Goodbye';
  }
}
```
{% endtab %}

{% tab title="say-hello.html" %}
```markup
<h2>${message} ${to}!</h2>
<button click.trigger="leave()">Leave</button>
```
{% endtab %}

{% tab title="my-app.html" %}
```markup
<say-hello to="John"></say-hello>
```
{% endtab %}
{% endtabs %}

{% hint style="warning" %}
**Don't Skip the Conventions**

We highly recommend that you leverage conventions where possible. A few benefits include:

* Reduction of boilerplate.
* Cleaner, more portable code.
* Improved readability and learnability of code.
* Less setup work and maintenance over time.
* Ease of migration to future versions and platforms.
{% endhint %}

## The Component Lifecycle

Learn more about the [component lifecycle here](component-lifecycles.md)

### Component Constructors

All components are instantiated by the framework's dependency injection system. As a result, you can share common services across components and get access to component-specific services by declaring that you want the framework to "inject" them into your constructor. The most common component-specific thing you may want to inject into your component is the `HTMLElement` that serves as the host element for your component. In the examples above, this is the `say-hello` element itself \(rather than an element within its template\). Should you need access to the host for any component, you can declare that like this:

{% code title="say-hello.ts" %}
```typescript
export class SayHello {
  constructor(private element: HTMLElement) {}
}
```
{% endcode %}

{% hint style="info" %}
**Dependency Injection**

There are various ways to tell the framework what you want to inject. The above code sample shows the most vanilla JS approach, by using a TypeScript constructor param. This works automatically for components that use conventions. See [the dependency injection documentation](../../app-basics/dependency-injection.md) for more information on other approaches, as well as an in-depth look at dependency injection in general.
{% endhint %}

{% hint style="success" %}
**Referencing View Elements**

If you need access to a DOM element from within your view, rather than the host, place a `ref` attribute on the desired element in your template and the framework will set a property of the same name on your class to reference that element. For more information on this, see the documentation on [displaying basic data](../displaying-basic-data.md#referencing-dom-elements).
{% endhint %}

## So Much More...

So far, we've only scratched the surface of what Aurelia's component system can do. If you'd like to continue on to additional component scenarios, including component composition, Shadow DOM and slots, HTML-only components, and more, you can pick up from here in our Component Basics articles:

* [Local Templates](local-templates.md).
* [Watching data](watching-data.md).
* [Components Revisited](https://github.com/aurelia/aurelia/tree/5dcb1613039f0fa4f97d0114cc47cc7a66f04425/docs/user-docs/getting-started/app-basics/components-revisited.md).

