# Components

## Introduction

Aurelia applications are built out of components, from top to bottom. At startup, an app declares a *root component*, but inside of that component's template (aka view), other components are used, and inside of those components, yet more components. In this fashion, the entire user interface is constructed.

{% hint style="success" %}
**Here's what you'll learn...**
  * How to create and use components.
  * How to leverage conventions to work smarter and not harder.
  * What component lifecycle hooks are available to you.
{% endhint %}

## Creating and Using Components

Components in Aurelia follow the Model-View-ViewModel design pattern (a descendant of MVC and MVP) and are represented in HTML as *custom elements*. Each component has a JavaScript class, which serves as the *view-model*, providing the state and behavior for the component. Each component has an HTML template or *view*, which provides the rendering instructions for the component. Finally, components can optionally have a *model* to provide unique business logic.

To declare a component, use the `@customElement` decorator on a class. This decorator allows you to name the element as you will use it in HTML and link the view-model class with its template (view). Here's an example of a simple "hello world" component:

#### say-hello.ts

```TypeScript
import { customElement } from '@aurelia/runtime';
import template from './say-hello.html';

@customElement({
  name: 'say-hello',
  template
})
export class SayHello {

}
```

#### say-hello.html

```HTML
<h2>Hello World!</h2>
```

#### app.html

```HTML
<say-hello></say-hello>
```

{% hint style="warning" %}
**Warning**
A component name **must** contain a hyphen. This is part of the W3C web components standard and is designed to serve as a namespacing mechanism for custom HTML elements. A typical best practice is to choose a two to three character prefix to use consistently across your app or company. For example, all components provided by Aurelia have the prefix `au-`.
{% endhint %}

The `say-hello` custom element we've created isn't very interesting yet, so lets spice it up by allowing the user to providing a "to" property so that we can personalize the message. To create "bindable" properties for your HTML element, you declare them using the `@bindable` decorator as shown in the next example.

#### say-hello.ts

```TypeScript
import { customElement, bindable } from '@aurelia/runtime';
import template from './say-hello.html';

@customElement({
  name: 'say-hello',
  template
})
export class SayHello {
  @bindable to = 'World';
}
```

#### say-hello.html

```HTML
<h2>Hello ${to}!</h2>
```
#### app.html

```HTML
<say-hello to="John"></say-hello>
```

By declaring a bindable, not only can your template access that via string interpolation, but those who use the custom element in HTML can set that property directly through an HTML attribute or even bind the `to` attribute to their own model.

Now, what if we want our component to do something in response to user interaction? Let's see how we can set up DOM events to trigger methods on our component.

#### say-hello.ts

```TypeScript
import { customElement, bindable } from '@aurelia/runtime';
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

#### say-hello.html

```HTML
<h2>${message} ${to}!</h2>
<button click.trigger="leave()">Leave</button>
```

#### app.html

```HTML
<say-hello to="John"></say-hello>
```

Now, when the user clicks the button, the `leave` method will get called. It then updates the message property, which causes the DOM to respond by updating as well.

## Leveraging Component Conventions

// TODO: Write this based on the conventions module.

## Registering Components

By default, component views are encapsulated. What that means is that you can't use a component within another component, unless that component has been declared as a dependency. Let's imagine that our "say-hello" component wants to use a "name-tag" component internally. To do that, we need to declare the component dependency. Here's how that works:

#### say-hello.ts

```TypeScript
import { customElement, bindable } from '@aurelia/runtime';
import template from './say-hello.html';
import { NameTag } from './name-tag';

@customElement({
  name: 'say-hello',
  template,
  dependencies: [NameTag]
})
export class SayHello {
  @bindable to = 'World';
  message = 'Hello';

  leave() {
    this.message = 'Goodbye';
  }
}
```

#### say-hello.html

```HTML
<h2>${message} <name-tag name.bind="to"></name-tag>!</h2>
<button click.trigger="leave()">Leave</button>
```

### app.html

```HTML
<say-hello to="John"></say-hello>
```

In practice, most people want to side-step this feature and make all their components global, so they can remove the dependencies boiler-plate code. To make a component global, simply register it with the application's root DI container at startup:

```TypeScript
import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';
import { NameTag } from './name-tag';

new Aurelia()
  .register(BasicConfiguration, DebugConfiguration, NameTag)
  .app({ host: document.querySelector('app'), component: App })
  .start();
```

As a best practice, we recommend an alternate approach to registering each component individually in this way. Instead, create a folder where you keep all your components. In that folder, create a `registry.ts` module where you re-export your components. Then, import that registery module and pass it to the application's `register` method at startup.

#### components/register.ts

```TypeScript
export * from './say-hello';
export * from './name-tag';
```

#### main.ts

```TypeScript
import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';
import * as globalComponents from './components/registry';

new Aurelia()
  .register(BasicConfiguration, DebugConfiguration, globalComponents)
  .app({ host: document.querySelector('app'), component: App })
  .start();
```

## The Component Lifecycle

Every component has a lifecycle that you can tap into, to perform various actions at particular times. Below is a summary of the lifecycle callbacks you can hook into in your component.

* `constructor` - When the framework instantiates a component, it calls your class's constructor, just like any JavaScript class. This is the best place to put basic initialization code that is not dependent on bindables.
* `created` - This executes just after the constructor and can be treated very similarly. The only difference is that the component's `Controller` has been instantiated and is accessible through the `$controller` property for advanced scenarios.
* `binding` - If your component has a method named "binding", then the framework will invoke it when it has begun binding values to your bindable properties. In terms of the component hierarchy, the binding hooks execute top-down, from parent to child so your bindables will have their values set by the owning components, but the bindings in your view are not yet set. This is a good place to perform any work or make changes to anything that your view would depend on because data still flows down synchronously. This is the best time to do anything that might affect children as well. We prefer using this hook over `bound`, unless you specifically need `bound` for a situation when `binding` is too early. You can optionally return a `Promise` or `ILifecycleTask`. If you do so, it will be awaited before the children start binding. This is useful for fetch/save of data before render.
* `bound` - If your component has a method named "bound", then the framework will invoke it when it has fully bound your component, including its children. In terms of the component hierarchy, the bound hooks execute bottom-up, from child to parent. The bindings in the child views are bound, but the parent is not yet bound. This is the best place to do anything that requires children to be fully initialized and/or needs to propagate back up to the parent.
* `attaching` - If your component has a method named "attaching", then the framework will invoke it when it has begun attaching your HTML element to the document. In terms of the component hierarchy, the attaching hooks execute top-down. However, nothing is mounted to the DOM just yet. This is the last chance to attach specific behaviors or mutate the DOM nodes in your view before they are mounted. You can queue animations or initialize certain 3rd party libraries that don't depend on the nodes being connected to the document.
* `attached` - If your component has a method named "attached", then the framework will invoke it when it has fully attached your HTML element to the document, along with its children. In terms of the component hierarchy, the attached hooks execute bottom-up. This is the best time to invoke code that requires measuring of elements or integrating a 3rd party JavaScript library that requires being mounted to the DOM.
* `detaching` - If your component has a method named "detaching", then the framework will invoke it when it is about to remove your HTML element from the document. In terms of the component hierarchy, the detaching hooks execute top-down. However, nothing is unmounted from the DOM just yet.
* `caching` - If your component has a method named "caching", then the framework will invoke it immediately after the DOM nodes are unmounted. This is an advanced hook mostly useful for clean up of resources and references to views you own before they are put into the cache by the framework.
* `detached` - If your component has a method named "detached", then the framework will invoke it when it has fully removed your HTML element from the document. In terms of the component hierarchy, the detached hooks execute bottom-up.
* `unbinding` - If your component has a method named "unbinding", then the framework will invoke it when it has begun disconnecting bindings from your component. In terms of the component hierarchy, the unbinding hooks execute top-down. You can optionally return a `Promise` or `ILifecycleTask`. If you do so, it will be awaited before the children start unbinding. This is useful for fetch/save of data before final data disconnect.
* `unbound` - If your component has a method named "unbound", then the framework will invoke it when it has fully disconnected bindings from your component. In terms of the component hierarchy, the unbound hooks execute bottom-up.

To tap into any of these hooks, simply implement the method on your class:

#### say-hello.ts

```TypeScript
import { customElement, bindable } from '@aurelia/runtime';
import template from './say-hello.html';
import { NameTag } from './name-tag';

@customElement({
  name: 'say-hello',
  template,
  dependencies: [NameTag]
})
export class SayHello {
  @bindable to = 'World';
  message = 'Hello';

  leave() {
    this.message = 'Goodbye';
  }

  attaching() {
    // your special lifecycle-dependent code goes here...
  }
}
```

### Component Constructors

All components are instantiated by the framework's dependency injection system. As a result, you can share common services across components and get access to component-specific services by declaring that you want the framework to "inject" them into your constructor. The most common component-specific thing you may want to inject into your component is the `HTMLElement` that serves as the host element for your component. In the examples above, this is the `say-hello` element itself (rather than an element within its template). Should you need access to the host for any component, you can declare that like this:

```TypeScript
import { customElement } from '@aurelia/runtime';
import template from './say-hello.html';

@customElement({
  name: 'say-hello',
  template
})
export class SayHello {
  static inject = [HTMLElement];

  constructor(element) {
    this.element = element;
  }
}
```


{% hint style="info" %}
**Info**
There are various ways to tell the framework what you want to inject. The above code sample shows the most vanilla JS approach, by using a public statid field named "inject". See the [dependency injection](dependency-injection.md) documentation for more information on other approaches that use decorators or TS-specific metadata.
{% endhint %}

{% hint style="info" %}
**Info**
If you need access to a DOM element from within your template, rather than the host, place a `ref` attribute on the desired element in your template and the framework will set a property of the same name on your class to reference that element. For more information on this, see the documentation on [displaying basic data](displaying-basic-data).
{% endhint %}

## The as-element Attribute

// TODO: Verify that this is implemented in Aurelia 2.

In some cases, especially when creating table rows out of Aurelia custom elements, you may need to have a custom element masquerade as a standard HTML element. For example, if you're trying to fill table rows with data, you may need your custom element to appear as a `<tr>` row or `<td>` cell. This is where the `as-element` attribute comes in handy:

#### as-element.html

```HTML
<template>
  <import from="./hello-row.html"></import>
  <table>
    <tr as-element="hello-row">
  </table>
</template>
```

#### hello-row.html

```HTML
<template>
  <td>Hello</td>
  <td>World</td>
</template>
```

The `as-element` attribute tells Aurelia that we want the content of the table row to be exactly what our `hello-row` template wraps. The way different browsers render tables means this may be necessary sometimes.
