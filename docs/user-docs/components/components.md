---
description: >-
  Components underpin most of what you do in Aurelia. Learn all there is to know
  about authoring components, working with dependencies and more.
---

# Component basics

Custom elements underpin Aurelia applications. They are what you will be spending most of your time creating and can be consisted of the following:

* An HTML template (view)
* A class that constitutes the view model
* An optional CSS stylesheet

{% hint style="warning" %}
**Naming Components**

The component name, derived from the file name, **must** contain a hyphen when working with Shadow DOM (see [Styling Components](class-and-style-binding.md)). This is part of the W3C Web Components standard and is designed to serve as a namespacing mechanism for custom HTML elements.&#x20;



A typical best practice is to choose a two to three-character prefix to use consistently across your app or company. For example, all components provided by Aurelia have the prefix `au-`.
{% endhint %}

There are numerous ways in which you can create custom components. By leveraging conventions, you can create simple components with minimal code to more verbose components that offer greater control over how they work.

There is no right or wrong way to create a component. As you will soon see, you can choose whatever works for your needs.

## Creating components

In Aurelia, you can export a plain Javascript class, and it will assume that it is a component as a default convention-based setting. Components, by default, are no different to vanilla Javascript classes.

This is what a basic component in Aurelia can look like. You would add logic and bindable properties (maybe), but a barebones component is just a class.

{% tabs %}
{% tab title="app-loader.ts" %}
```typescript
export class AppLoader {
}
```
{% endtab %}

{% tab title="app-loader.html" %}
```markup
<p>Loading...</p>
```
{% endtab %}
{% endtabs %}

So far, we haven't written any Aurelia-specific code.

Conventions mean Aurelia will automatically associate our component view model (`app-loader.ts`) with a file of the same name but with `.html` on the end, so `app-loader.html`.

{% hint style="warning" %}
**Don't Skip the Conventions**

We highly recommend that you leverage conventions where possible. A few benefits include the following:

* Reduction of boilerplate.
* Cleaner, more portable code.
* Improved readability and learnability of code.
* Less setup work and maintenance over time.
* Ease of migration to future versions and platforms.
{% endhint %}

## Explicit component creation using @customElement

If you don't want to use conventions, a `@customElement` decorator allows you to create custom elements verbosely. There are benefits to explicit component creation using the `@customElement` decorator, as conventions are bypassed.

{% code title="app-loader.ts" %}
```typescript
import { customElement } from 'aurelia';
import template from './app-loader.html'; 

@customElement({
    name: 'app-loader',
    template
})
export class AppLoader {
}
```
{% endcode %}

```html
<p>Loading...</p>
```

There are many reasons you might want to use the `customElement` decorator. It allows you to specify a different HTML template (or inline template string). You can define the name of the HTML tag used to reference the element, the stylings and other aspects of components that Aurelia would handle for you.

Here is how you can avoid a separate HTML view file entirely and define the template inline:

{% code title="app-loader.ts" %}
```typescript
import { customElement } from 'aurelia';

@customElement({
    name: 'app-loader',
    template: '<p>Loading...</p>'
})
export class AppLoader {
}
```
{% endcode %}

As you can see, we only have a view model now and specify the view template inline. For simple components that require a view model, it's a nice in-between way of creating components without cluttering your application with additional files.

### Configuring the customElement decorator

We've seen that the `customElement` decorator allows us to be explicit on our components. Here are some of the valid configuration options for this decorator.

#### name

Allows you to configure what the HTML representation of the component will be. In the above example, specifying "app-loader" as the name of the component means we reference it in our views using `<app-loader></app-loader>`

**It makes no sense when you only want to configure the name to use the object notation. You can do this:**

```typescript
import { customElement } from 'aurelia';

@customElement('app-loader')
export class AppLoader {
}
```

#### template

Referencing the app-loader example again allows you to specify your template contents. You can also use the template configuration property to specify no template by providing null as a value:

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'app-loader',
  template: null
})
export class AppLoader {
}
```

If you don't specify a `template` property, Aurelia won't use conventions to find the template either.

#### dependencies

Components can have explicit dependencies declared from within the `customElement` decorator too. This means you do not have to import them from within your template using `<import>` , which can be a nice explicit way to handle dependencies.

```typescript
import { customElement } from 'aurelia';
import { NumberInput } from './number-input'; 

@customElement({
  name: 'app-loader',
  dependencies: [ NumberInput ]
})
export class AppLoader {
}
```

{% hint style="info" %}
It is worth noting that dependencies can also be specified from within the template using the `import` tag, or they can be globally registered through [Aurelia's Dependency Injection layer](../getting-to-know-aurelia/dependency-injection-di/).
{% endhint %}

## Programmatic component creation

Aurelia also has a more verbose API for creating components in your applications. You can use this approach to create components inline without needing separate files. This approach also works nicely for testing.

```typescript
import { CustomElement } from '@aurelia/runtime-html';

export class App {
  MyField = CustomElement.define({
    name: 'my-input',
    template: '<input value.bind="value">'
  })
}
```

By calling `CustomElement.define` we can create a component using familiar syntax to the verbose decorator approach above, including dependencies and more.

{% hint style="warning" %}
While it is good to know what APIs Aurelia provides, in most instances, you won't need to define custom elements inside your Aurelia applications using the `define` functionality. This is helpful when writing tests, which you can learn about [here](../developer-guides/testing.md).
{% endhint %}

## HTML only components

More often than not, when you create a component in Aurelia, you want to create a view and view model-based component. However, Aurelia uniquely allows you to create components using just HTML.

{% hint style="info" %}
When working with HTML-only components, the file name becomes the HTML tag. Say you had a component called `app-loader.html` you would reference it using `<app-loader></app-loader>`
{% endhint %}

Say you wanted to create a loader component that didn't require any logic and displayed a CSS loader. It might look something like this. We will call this `app-loader.html`

{% code title="app-loader.html" %}
```html
<p>Loading...</p>
```
{% endcode %}

To use this component, import and reference it:

```html
<import from="./app-loader.html"></import>

<app-loader></app-loader>
```

{% hint style="info" %}
Aurelia infers the component's name from the file name (it strips off the .html file extension).
{% endhint %}

### HTML components with bindable properties

Sometimes you want a custom element with bindable properties. Aurelia allows you to do this without needing a view model using the `<bindable>` custom element. The following is what you would have used the `@bindable` decorator for inside your view model if you had one.

{% code title="app-loader.html" %}
```html
<bindable property="loading"></bindable>

<p>${loading ? 'Loading...' : ''}</p>
```
{% endcode %}

Using it in your application would look like this:

```html
<import from="./app-loader.html"></import>

<app-loader loading.bind="mybool"></app-loader>
```

This replaces the equivalent of a view model-based component, which would use the `bindable` decorator.

## Components without views

If you worked with Aurelia 1, you might have been familiar with a feature  `@noView` that allowed you to mark your components as viewless (they had a view model but no accompanying view). You probably think, "This sounds a lot like a custom attribute", but not quite. However, there are situations where a custom element without a view is needed.

One prime example of a viewless component is a loading indicator using the nprogress library.

```typescript
import nprogress from 'nprogress';
import { bindable, customElement } from 'aurelia';

import 'nprogress/nprogress.css';

@customElement({
    name: 'loading-indicator'
})
export class LoadingIndicator {
  @bindable loading = false;

  loadingChanged(newValue) {
    if (newValue) {
      nprogress.start();
    } else {
      nprogress.done();
    }
  }
}
```

In this example, the nprogress library handles adding and removing styles/elements from the DOM, so we omit the template. By choosing not to specify a template, this component will not have an accompanying view.

While a viewless component is a very specific need, and in many cases, a custom attribute is a better option, omitting the `template` property of `customElement` you can achieve the same thing.

## Registering your components

To enable the custom markup to be available within your template or globally, you must register your element. To use a component, you must register it globally or within the component, you would like to use it within.

### Globally registering an element

To register your component to be used globally within your application, you will use `.register` in `main.ts`

```javascript
import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import { SomeElement } from './path-to/some-element';

Aurelia
  .register(SomeElement)
  .app(MyApp)
  .start();
```

{% hint style="info" %}
To learn more about working with Aurelia's Dependency Injection and registering dependencies, consult the [Dependency Injection](../getting-to-know-aurelia/dependency-injection-di/) documentation to learn more.
{% endhint %}

### Importing the element within the template

Adding your element to be used within the template is as easy as adding the following line in your `.html` file. Paths for the `import` element are relative, so ensure that your import paths are correct if you encounter any issues.

```html
<import from="./path-to/some-element"></import>
```

## Containerless components

In some scenarios, you want the ability to use a component but remove the tags from your markup leaving behind the inner part and removing the outer custom element tags. You can achieve this using containerless functionality.

{% hint style="warning" %}
When using containerless functionality, because the tags are removed from the DOM, you will lose the ability to reference the element container tags. This can make tasks such as using third-party libraries or writing tests more difficult as you lose the reference. We recommend avoiding the use of containerless where possible.
{% endhint %}

### Configuring the customElement

If you are creating components using the `customElement` decorator, you can denote components are containerless using the `containerless` boolean configuration property.

```typescript
import { customElement, ICustomElementViewModel } from 'aurelia';

@customElement({
    name: 'my-component',
    containerless: true
})
export class MyComponent implements ICustomElementViewModel {    
    constructor() {

    }
 }   
```

### The containerless decorator

Aurelia provides a convenient decorator to mark your components as containerless.

```typescript
import { ICustomElementViewModel } from 'aurelia';
import { containerless } from '@aurelia/runtime-html';

@containerless
export class MyComponent implements ICustomElementViewModel {    
    constructor() {

    }
 }   
```

When referencing our component using `<my-component></my-component>` Aurelia will strip out the tags and leave the inner part.

### Containerless element in views

Inside of your views, you can denote a containerless component by using the `<containerless>` element. Unlike the other approaches, you specify this element inside your HTML views.

```html
<containerless>

<p>My custom element markup</p>
```
