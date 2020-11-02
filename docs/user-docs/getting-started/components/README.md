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

To define a component, you only need to create your JavaScript or TypeScript file with the same name as your HTML file. By convention, Aurelia will recognize these as the view-model and view of a component, and will assemble them for you. Here's an example of a simple "hello world" component:

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

By default, components you create aren't global. What that means is that you can't use a component within another component, unless that component has been imported. Let's imagine that our "say-hello" component wants to use a "name-tag" component internally. To do that, we need to add an import in our view. Here's how that works:

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
<say-hello to="John"></say-hello>
```
{% endtab %}
{% endtabs %}

In practice, most people want to side-step this feature and make most of their general-purpose components global, so they can remove the majority of their imports. To make a component global, simply register it with the application's root dependency injection container at startup:

{% code title="mail.ts" %}
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

Every component instance has a lifecycle that you can tap into. This makes it easy for you to perform various actions at particular times. For example, you may want to execute some code as soon as your component properties are bound, but before the component is first rendered. Or, you may want to run some code to manipulate the DOM as soon as possible after your element is attached to the document.

Every lifecycle callback is optional. Implement whatever makes sense for your component, but don't feel obligated to implement any of them if they aren't needed for your scenario. Some of the lifecycle callbacks make sense to implement in pairs \(`binding/unbinding`, `attaching/detaching`\) in order to clean up any resources you have allocated. If you register a listener or subscriber in one callback, remember to remove it in the opposite callback.

| Lifecycle Callback | Description |
| :--- | :--- |
| `constructor` | When the framework instantiates a component, it calls your class's constructor, just like any JavaScript class. This is the best place to put basic initialization code that is not dependent on bindable properties. |
| `define` | The "define" hook is the go-to hook for contextual dynamic composition. It runs just after the constructor and can be treated like a late interceptor for the `@customElement` decorator / `CustomElement.define` api: it allows you to change the `CustomElementDefinition` created by the framework before it is compiled, as well as make certain changes to the controller \(for example, wrapping or overriding the `scope`\). You'll have the compiled definition of the parent \(owning\) element available, as well as any `replace` parts. The returned definition is the cache key for the compiled definition in the context of the parent definition. To make a change only the first time the hook is invoked for an instance underneath a particular parent definition \(affecting all instances of the type underneath that parent definition\), mutate and return the existing definition; to make a contextual change \(that needs to be re-compiled per instance\), clone the definition before mutating and returning it. |
| `hydrating` | The "hydrating" hook allows you to add contextual DI registrations \(to `controller.context`\) to influence which resources are resolved when the template is compiled. It runs synchronously right after the `define` hook and can still be considered part of "construction". From a caching perspective it has a direct 1-1 parity with the `define` hook: the context is cached per unique definition that is returned from `define` \(or per parent definition, if no new definition is returned from `define`\). Therefore, if you need true per-instance contextual registrations \(should be rare\), make sure to bust the cache per instance by returning a clone from the `define` hook. |
| `hydrated` | The "hydrated" hook is a good place to contextually influence the way child components are constructed and rendered. It runs synchronously after the definition is compiled \(which happens synchronously after `hydrating`\) and, like `hydrating`, can still be considered part of "construction" and also has a direct 1-1 parity with the `define` hook from a caching perspective. This is the last opportunity to add DI registrations specifically for child components in this context, or in any other way affect what is rendered and how it is rendered. |
| `created` | The "created" hook is the last hook that can be considered part of "construction". It is called \(synchronously\) after this component is hydrated, which includes resolving, compiling and hydrating child components. In terms of the component hierarchy, the created hooks execute bottom-up, from child to parent \(whereas `define`, `hydrating` and `hydrated` are all top-down\). This is also the last hook that runs only once per instance. Here you can perform any last-minute work that requires having all child components hydrated and that might affect the `bind` and `attach` lifecycles. |
| `binding` | If your component has a method named "binding", then the framework will invoke it after the bindable properties of your component are assigned. In terms of the component hierarchy, the binding hooks execute top-down, from parent to child, so your bindables will have their values set by the owning components, but the bindings in your view are not yet set. This is a good place to perform any work or make changes to anything that your view would depend on because data still flows down synchronously. This is the best time to do anything that might affect children as well. We prefer using this hook over `bound`, unless you specifically need `bound` for a situation when `binding` is too early. You can optionally return a `Promise`. If you do so, it will suspend binding and attaching of the children until the promise resolved. This is useful for fetch/save of data before render. |
| `bound` | If your component has a method named "bound", then the framework will invoke it when the bindings between your component and its view have been set. This is the best place to do anything that requires the values from `let`, `from-view` or `ref` bindings to be set. |
| `attaching` | If your component has a method named "attaching", then the framework will invoke it when it has attached the component's HTML element. You can queue animations and/or initialize certain 3rd party libraries. If you return a `Promise` from this method, it will not suspend binding/attaching of child components but it will be awaited before the `attached` hook is invoked. |
| `attached` | If your component has a method named "attached", then the framework will invoke it when it has attached the current component as well as all of its children. In terms of the component hierarchy, the attached hooks execute bottom-up. This is the best time to invoke code that requires measuring of elements or integrating a 3rd party JavaScript library that requires the whole component subtree to be mounted to the DOM. |
| `detaching` | If your component has a method named "detaching", then the framework will invoke it when it is about to remove your HTML element from the document. In terms of the component hierarchy, the detaching hooks execute bottom-up. If you return a `Promise` (for example, from an outgoing animation), it will be awaited before the element is detached. It will run in parallel with promises returned from the `detaching` hooks of siblings / parents. |
| `unbinding` | If your component has a method named "unbinding", then the framework will invoke it when it has fully removed your HTML element from the document. In terms of the component hierarchy, the `unbinding` hooks execute bottom-up. |
| `dispose` | If your component has a method named "dispose", then the framework will invoke it when the component is to be cleared from memory completely. It may be called for example when a component is in a repeater, and some items are removed that are not returned to cache. This is an advanced hook mostly useful for clean up of resources and references that might cause memory leaks if never dereferenced explicitly. |

To tap into any of these hooks, simply implement the method on your class:

{% code title="say-hello.ts" %}
```typescript
import { bindable } from 'aurelia';

export class SayHello {
  @bindable to = 'World';
  message = 'Hello';

  leave() {
    this.message = 'Goodbye';
  }

  beforeAttach() {
    // your special lifecycle-dependent code goes here...
  }
}
```
{% endcode %}

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
- [Local Templates](./local-templates.md).
- [Watching data](./watching-data.md).
- [Components Revisited](../app-basics/components-revisited.md).
