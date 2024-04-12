---
description: >-
  Components are the building blocks of Aurelia applications. This guide covers the essentials of creating, configuring, and using components, complete with practical code examples.
---

# Component Basics

Custom elements are the foundation of Aurelia applications. As a developer, you'll often create custom elements that consist of:

* An HTML template (view)
* A class acting as the view model
* An optional CSS stylesheet

{% hint style="warning" %}
**Naming Components**

The component name, derived from the file name, **must** include a hyphen to comply with the Shadow DOM specifications (see [Styling Components](class-and-style-binding.md)). This requirement is part of the W3C Web Components standard to ensure proper namespacing for custom HTML elements.

A common best practice is to use a consistent two or three-character prefix for your components. For instance, all Aurelia-provided components start with the prefix `au-`.
{% endhint %}

There are various ways to create custom components in Aurelia, from simple convention-based components to more explicit and configurable ones.

The creation process is flexible, allowing you to adopt the approach that best fits your project's needs.

## Creating Components

Aurelia treats any exported JavaScript class as a component by default. As such, there's no difference between an Aurelia component and a vanilla JavaScript class at their core.

Here's an example of a basic Aurelia component. You might add logic and bindable properties as needed, but at its simplest, a component is just a class.

{% tabs %}
{% tab title="app-loader.ts" %}
```typescript
export class AppLoader {
  // Component logic goes here
}
```
{% endtab %}

{% tab title="app-loader.html" %}
```html
<p>Loading...</p>
```
{% endtab %}
{% endtabs %}

By convention, Aurelia pairs the `app-loader.ts` view model with a corresponding `app-loader.html` file.

{% hint style="warning" %}
**Embrace Conventions**

Using Aurelia's conventions offers several benefits:

* Reduced boilerplate code.
* Cleaner and more portable codebases.
* Enhanced code readability and learnability.
* Less setup and ongoing maintenance.
* Smoother upgrades to new versions and different platforms.
{% endhint %}

## Explicit Component Creation with @customElement

The `@customElement` decorator provides a way to define components, bypassing conventions explicitly.

{% code title="app-loader.ts" %}
```typescript
import { customElement } from 'aurelia';
import template from './app-loader.html';

@customElement({
    name: 'app-loader',
    template
})
export class AppLoader {
  // Component logic goes here
}
```
{% endcode %}

```html
<p>Loading...</p>
```

The `@customElement` decorator allows for a variety of customizations, such as defining a different HTML template or inline template string, specifying the element's tag name, and configuring other component properties that would otherwise be managed by Aurelia.

Here's an example of defining the template inline:

{% code title="app-loader.ts" %}
```typescript
import { customElement } from 'aurelia';

@customElement({
    name: 'app-loader',
    template: '<p>Loading...</p>'
})
export class AppLoader {
  // Component logic goes here
}
```
{% endcode %}

This approach is useful for simple components that don't require a separate view file.

### Configuring the @customElement Decorator

The `@customElement` decorator allows for several configuration options:

#### name

This option sets the HTML tag name for the component. For instance, specifying "app-loader" means the component can be used in views as `<app-loader></app-loader>`.

If you only need to set the name, you can use a simpler syntax:

```typescript
import { customElement } from 'aurelia';

@customElement('app-loader')
export class AppLoader {
  // Component logic goes here
}
```

#### template

The `template` option allows you to define the content of your component's template. You can specify an external template file, an inline template string, or even set it to `null` for components that don't require a view:

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'app-loader',
  template: null
})
export class AppLoader {
  // Component logic goes here
}
```

Omitting the `template` property means Aurelia won't use conventions to locate the template.

#### dependencies

You can declare explicit dependencies within the `@customElement` decorator, which can be an explicit way to manage dependencies without using the `<import>` tag in your templates:

```typescript
import { customElement } from 'aurelia';
import { NumberInput } from './number-input';

@customElement({
  name: 'app-loader',
  dependencies: [NumberInput]
})
export class AppLoader {
  // Component logic goes here
}
```

{% hint style="info" %}
Dependencies can also be declared within the template using the `<import>` tag or globally registered through [Aurelia's Dependency Injection layer](../getting-to-know-aurelia/dependency-injection-di/).
{% endhint %}

## Programmatic Component Creation

Aurelia provides an API for creating components programmatically, which is especially useful for testing.

```typescript
import { CustomElement } from '@aurelia/runtime-html';

export class App {
  MyField = CustomElement.define({
    name: 'my-input',
    template: '<input value.bind="value">'
  });

  // Application logic goes here
}
```

The `CustomElement.define` method allows for a syntax similar to the `@customElement` decorator, including dependencies and other configurations.

{% hint style="warning" %}
While it's useful to know about this API, it's typically unnecessary to define custom elements within Aurelia applications. This method is more relevant for writing tests, which you can learn about [here](../developer-guides/testing.md).
{% endhint %}

## Components declaration with static property `$au`

Beside the custom element and `CustomElement.define` usages, it's also possible to to delcare a components using static `$au` property, like the following example:

```typescript
export class AppLoader {
  static $au = {
    type: 'custom-element',
    name: 'app-loader',
    dependencies: [...]
  }
  // Component logic goes here
}
```
{% hint style="info" %}
Similar to custom element components, custom attributes, binding behaviors and value converters can also be declared using the static property `$au`.
{% endhint %}

## HTML-Only Components

It's possible to create components in Aurelia using only HTML without a corresponding view model.

{% hint style="info" %}
The file name determines the component's tag name. For example, a file named `app-loader.html` would be used as `<app-loader></app-loader>`.
{% endhint %}

For instance, an HTML-only loader component might look like this:

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

### HTML Components with Bindable Properties

You can create HTML components with bindable properties using the `<bindable>` custom element, which serves a similar purpose to the `@bindable` decorator in a view model:

{% code title="app-loader.html" %}
```html
<bindable name="loading"></bindable>

<p>${loading ? 'Loading...' : ''}</p>
```
{% endcode %}

Here's how you would use it:

```html
<import from="./app-loader.html"></import>

<app-loader loading.bind="isLoading"></app-loader>
```

## Components Without Views

Though less common, there are times when you might need a component with a view model but no view. Aurelia allows for this with the `@customElement` decorator by omitting the `template` property.

For example, a loading indicator using the nprogress library might be implemented as follows:

```typescript
import nprogress from 'nprogress';
import { bindable, customElement } from 'aurelia';

import 'nprogress/nprogress.css';

@customElement({
    name: 'loading-indicator',
    template: null // No view template
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

In this example, nprogress manages the DOM manipulation, so a template isn't necessary.

## Registering Your Components

To use your custom components, you must register them either globally or within the scope of their intended use.

### Globally Registering a Component

Register a component globally in `main.ts` using the `.register` method:

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
For more on working with Aurelia's Dependency Injection and registering dependencies, see the [Dependency Injection documentation](../getting-to-know-aurelia/dependency-injection-di/).
{% endhint %}

### Importing a Component Within a Template

To use a component within a specific template, import it using the `<import>` tag:

```html
<import from="./path-to/some-element"></import>
```

To use a component but with an alias, import it using the `<import>` tag, together with the `as` attribute for the new name:

```html
<import from="./path-to/some-element" as="the-element"></import>
```

To use alias for a specific resource on an import, using the `<import>` tag, together with the `{name}.as` attribute for the new name, with `{name}` being the resource name:

```html
<import from="./path-to/some-element" my-element.as="the-element"></import>
```

{% hint style="info" %}
If there are multiple resource exports with the same resource name (an element and an attribute with the same `foo` name, for example), the alias will be applied to both of them.
{% endhint %}

## Containerless Components

Sometimes you may want to render a component without its enclosing tags, effectively making it "containerless."

{% hint style="warning" %}
Be cautious when using containerless components, as you lose the ability to reference the element's container tags, which can complicate interactions with third-party libraries or testing. Use containerless only when necessary.
{% endhint %}

### Using the @customElement Decorator

Mark a component as containerless with the `containerless` property:

```typescript
import { customElement, ICustomElementViewModel } from 'aurelia';

@customElement({
    name: 'my-component',
    containerless: true
})
export class MyComponent implements ICustomElementViewModel {
  // Component logic goes here
}
```

### The @containerless Decorator

The `@containerless` decorator is an alternative way to indicate a containerless component:

```typescript
import { ICustomElementViewModel } from 'aurelia';
import { containerless } from '@aurelia/runtime-html';

@containerless
export class MyComponent implements ICustomElementViewModel {
  // Component logic goes here
}
```

When using `<my-component></my-component>`, Aurelia will remove the surrounding tags, leaving only the inner content.

### Containerless Elements in Views

Declare a containerless component inside a view using the `<containerless>` tag:

```html
<containerless>
  <!-- Custom element markup goes here -->
</containerless>
```
