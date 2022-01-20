# Creating components

There are numerous ways in which you can create custom components. By leveraging conventions, you can create simple components with minimal code to more verbose components that offer greater control over how they work.

There is no right or wrong way to create a component. As you will soon see, you can choose whatever works for your needs.

{% hint style="warning" %}
**Naming Components**

The component name, derived from the file name, **must** contain a hyphen when working with Shadow DOM (see [Styling Components](broken-reference)). This is part of the W3C Web Components standard and is designed to serve as a namespacing mechanism for custom HTML elements. A typical best practice is to choose a two to three character prefix to use consistently across your app or company. For example, all components provided by Aurelia have the prefix `au-`.
{% endhint %}

## Components with conventions

In Aurelia, you don't technically have to even tell it what a component is. You can export a plain Javascript class and it will assume that it is a component.

This is what a basic component in Aurelia can look like. Obviously, you would add in logic and bindable properties (maybe) but a barebones component is just a class.

{% tabs %}
{% tab title="loader.ts" %}
```typescript
export class Loader {
}
```
{% endtab %}

{% tab title="loader.html" %}
```markup
<p>Loading...</p>
```
{% endtab %}
{% endtabs %}

Conventions mean Aurelia will automatically associate our component view model (`loader.ts`) with a file of the same name but with `.html` on the end, so `loader.html`.

{% hint style="warning" %}
**Don't Skip the Conventions**

We highly recommend that you leverage conventions where possible. A few benefits include:

* Reduction of boilerplate.
* Cleaner, more portable code.
* Improved readability and learnability of code.
* Less setup work and maintenance over time.
* Ease of migration to future versions and platforms.
{% endhint %}

## Convention-less components using @customElement

If you don't want to use conventions, there is a `@customElement` decorator which allows you to verbosely create custom elements. This is what Aurelia does under the hood when it transforms your convention-based components.

{% tabs %}
{% tab title="loader.ts" %}
```typescript
import { customElement } from 'aurelia';
import template from './loader.html'; 

@customElement({
  name: 'loader',
  template
})
export class Loader {
}
```
{% endtab %}
{% endtabs %}

{% tabs %}
{% tab title="loader.html" %}
```html
<p>Loading...</p>
```
{% endtab %}
{% endtabs %}

## HTML only components

More often than not, when you create a component in Aurelia you want to create a view and view model-based component. However, Aurelia uniquely gives you the ability to create components using just HTML.

{% hint style="info" %}
When working with HTML only components, the file name becomes the HTML tag. Say you had a component called `app-loader.html` you would reference it using `<app-loader></app-loader>`
{% endhint %}

### Creating a basic HTML only component

It really is just as it sounds, HTML. Say you wanted to create a loader component that didn't require any logic and just displayed a CSS loader, it might look something like this. We will call this `app-loader.html`

{% code title="app-loader.html" %}
```
<p>Loading...</p>
```
{% endcode %}

To use this component import and reference it:

```
<import from="./app-loader.html"></import>

<app-loader></app-loader>
```

### HTML only components with bindable properties

Sometimes you want a custom element with bindable properties. Aurelia allows you to do this without the need for a view model using the `<bindable>` custom element.

{% code title="app-loader.html" %}
```
<bindable property="loading"></bindable>

<p>${loading ? 'Loading...' : ''}</p>
```
{% endcode %}

Using it in your application would look like this:

```
<import from="./app-loader.html"></import>

<app-loader loading.bind="mybool"></app-loader>
```

## Components without views

If you worked with Aurelia 1, you might have been familiar with a feature called `@noView` that allowed you to mark your components as viewless (they had a view model, but no accompanying view). You are probably thinking, "This sounds a lot like a custom attribute", however, there are situations where a custom element without a view is needed.

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

In this particular example, the nprogress library handles adding and removing styles/elements from the DOM, so we omit the template in this instance. By choosing not to specify a template, this component will not have an accompanying view.

While a viewless component is a very specific need and in many cases, a custom attribute is a better option, by omitting the `template` property of `customElement` you can achieve the same thing.

## Register your components

To enable the custom markup to be available within your template or globally you must register your element. In order to use a component, you must register your component either globally or within the component you would like to use it in.

### Globally registering an element

To register your component to be used globally within your application you will use `.register` in `main.ts`

```javascript
import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import { SomeElement } from './path-to/some-element';

Aurelia
  .register(SomeElement)
  .app(MyApp)
  .start();
```

### Importing the element within the template

Adding your element to be used within the template is as easy as adding the following line in your `.html` file. Paths for the `import` element are relative, so ensure that your import paths are correct if you encounter any issues.

```html
<import from="./path-to/some-element"></import>
```
