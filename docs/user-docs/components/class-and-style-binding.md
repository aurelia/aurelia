---
description: >-
  Styling components using CSS, CSS pre and post-processors as well as working
  with web components.
---

# Styling Components in Aurelia 2

Aurelia 2 simplifies the process of styling components, supporting a variety of CSS flavors and encapsulation methods. Whether you prefer raw CSS, PostCSS, SASS, or Stylus, Aurelia 2 streamlines their integration into your components. Ultimately, all styles compile into standard CSS that browsers can interpret.

## Style Conventions

Aurelia 2 automatically imports styles for custom elements based on file naming conventions. For instance, if you have a custom element named `my-component`, Aurelia 2 looks for a corresponding stylesheet named `my-component.css`.

### Example: Automatic Style Import

Consider the following file structure:

- `my-component.ts`: The TypeScript file defining the `MyComponent` class.
- `my-component.css`: The stylesheet containing styles for `MyComponent`.
- `my-component.html`: The HTML template for `MyComponent`.

Aurelia 2's convention-based approach eliminates the need to explicitly import the CSS file. When you run your application, Aurelia 2 automatically detects and applies the styles.

{% tabs %}
{% tab title="my-component.ts" %}
```typescript
export class MyComponent {
  // Component logic goes here
}
```
{% endtab %}

{% tab title="my-component.css" %}
```css
.my-class {
  color: blue;
  background-color: lightgrey;
  padding: 10px;
  border-radius: 5px;
}
```
{% endtab %}

{% tab title="my-component.html" %}
```html
<template>
  <p class="my-class">Stylized content here!</p>
</template>
```
{% endtab %}
{% endtabs %}

When `MyComponent` is used in the application, the associated styles are automatically applied, giving the paragraph text a blue color and a light grey background with padding and rounded corners.

## Shadow DOM

The Shadow DOM API, part of the Web Components standard, provides encapsulation by hiding the component's internal DOM and styles from the rest of the application. Aurelia 2 offers several options for working with Shadow DOM:

1. **Global Shadow DOM**: By default, encapsulates all components in your application.
2. **Configured Shadow DOM**: Use the `useShadowDOM` decorator to opt-in per component.
3. **Global opt-out Shadow DOM**: Enable Shadow DOM globally but disable it for specific components.

{% hint style="info" %}
If your application uses CSS frameworks like Bootstrap, which rely on global styles, consider how Shadow DOM encapsulation may affect their behavior. The following sections guide managing global and shared styles.
{% endhint %}

### Enabling Shadow DOM

To enable Shadow DOM after the initial setup, configure it in the `main.ts` file:

{% code title="main.ts" %}
```typescript
import Aurelia, { StyleConfiguration } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(StyleConfiguration.shadowDOM({
    // Configuration options here
  }))
  .app(MyApp)
  .start();
```
{% endcode %}

The `StyleConfiguration` class from Aurelia allows you to specify how styles are applied, including options for Shadow DOM.

### Webpack Configuration for Shadow DOM

When using Webpack, ensure the following rule is included in the Webpack configuration:

{% code title="webpack.config.js" %}
```javascript
{
  test: /[/\\]src[/\\].+\.html$/i,
  use: {
    loader: '@aurelia/webpack-loader',
    options: {
      defaultShadowOptions: { mode: 'open' }
    }
  },
  exclude: /node_modules/
}
```
{% endcode %}

This rule ensures that HTML files within your `src` directory are processed correctly to work with Shadow DOM.

### Global Shared Styles

In the Shadow DOM, styles are scoped to their components and don't leak to the global scope. To apply global styles across all components, use the `sharedStyles` property in the Shadow DOM configuration.

#### Example: Using Bootstrap Globally

{% code title="main.ts" %}
```typescript
import Aurelia, { StyleConfiguration } from 'aurelia';
import { MyApp } from './my-app';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

Aurelia
  .register(StyleConfiguration.shadowDOM({
    sharedStyles: [bootstrap] // Apply Bootstrap styles to all components
  }))
  .app(MyApp)
  .start();
```
{% endcode %}

The `sharedStyles` property accepts an array, allowing you to include multiple shared stylesheets.

### Opting In to Shadow DOM with `useShadowDOM`

The `useShadowDOM` decorator, imported from Aurelia, lets you enable Shadow DOM on a per-component basis. Without configuration options, it defaults to `open` mode.

#### Example: Enabling Shadow DOM on a Component

{% code title="my-component.ts" %}
```typescript
import { useShadowDOM } from 'aurelia';

@useShadowDOM()
export class MyComponent {
  // Component logic with Shadow DOM enabled
}
```
{% endcode %}

You can specify the Shadow DOM mode (`open` or `closed`) as a configuration option. The `open` mode allows JavaScript to access the component's DOM through the `shadowRoot` property, while `closed` mode restricts this access.

#### Example: Specifying Shadow DOM Mode

{% code title="my-component.ts" %}
```typescript
import { useShadowDOM } from 'aurelia';

@useShadowDOM({ mode: 'closed' })
export class MyComponent {
  // Component logic with Shadow DOM in 'closed' mode
}
```
{% endcode %}

### Disabling Shadow DOM

The `useShadowDOM` decorator also allows disabling Shadow DOM for a specific component by passing `false`.

#### Example: Disabling Shadow DOM for a Component

{% code title="my-component.ts" %}
```typescript
import { useShadowDOM } from 'aurelia';

@useShadowDOM(false)
export class MyComponent {
  // Component logic without Shadow DOM
}
```
{% endcode %}

### Shadow DOM Special Selectors

Shadow DOM introduces special selectors that offer additional styling capabilities. These selectors are part of the CSS Scoping Module specification.

#### :host

The `:host` selector targets the custom element itself, not its children. You can use the `:host()` function to apply styles based on the host element's classes or attributes.

#### Example: Styling the Host Element

{% code title="app-header.css" %}
```css
:host {
  display: block;
  border: 1px solid #000;
}

:host(.active) {
  background-color: #f0f0f0;
}
```
{% endcode %}

In this example, all `app-header` elements have a solid border, and those with the `active` class have a grey background.

#### :host-context

The `:host-context` selector styles the custom element based on its context within the document.

#### Example: Styling Based on Context

{% code title="app-header.css" %}
```css
:host-context(.dark-mode) {
  color: white;
  background-color: #333;
}
```
{% endcode %}

Here, `app-header` elements will have white text on a dark background inside an element with the `dark-mode` class.

## CSS Modules

When Shadow DOM does not meet your needs, CSS Modules balance style encapsulation and global accessibility. CSS Modules transform class names into unique identifiers, preventing style collisions.

### Webpack Configuration for CSS Modules

To use CSS Modules, include the following loader configuration in your Webpack setup:

{% code title="webpack.config.js" %}
```javascript
{
  test: /\.css$/i,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: true
      }
    }
  ],
  exclude: /node_modules/
}
```
{% endcode %}

This rule processes CSS files, enabling CSS module functionality.

### Example: Using CSS Modules in Components

Define your styles, and reference the class names in your HTML templates. Webpack will handle the conversion to unique class names.

{% code title="my-component.css" %}
```css
.title {
  font-size: 24px;
  color: #333;
}
```
{% endcode %}

{% code title="my-component.html" %}
```html
<template>
  <h1 class="title">Hello, Aurelia!</h1>
</template>
```
{% endcode %}

After processing, the `title` class may be transformed to a unique identifier like `title_1a2b3c`.

### CSS Modules' Special Selectors

CSS Modules support the `:global` selector for styling global elements without transformation.

#### Example: Using Global Selectors

{% code title="my-component.css" %}
```css
:global(.button-primary) {
  background-color: #007bff;
  color: white;
}
```
{% endcode %}

This style will apply globally to elements with the `button-primary` class, maintaining the class name without transformation.

## Advanced Shadow DOM Usage

Shadow DOM encapsulates a component's styles, preventing them from leaking into the global scope. Aurelia 2 offers granular control over Shadow DOM usage, including global and per-component configuration.

### Example: Styling Slotted Content

When using Shadow DOM, you can style content passed into slots using the `::slotted()` pseudo-element.

{% code title="tab-panel.css" %}
```css
::slotted(.tab-content) {
  padding: 15px;
  border: 1px solid #ddd;
}
```
{% endcode %}

{% code title="tab-panel.html" %}
```html
<template>
  <slot name="tab-content"></slot>
</template>
```
{% endcode %}

In this example, content assigned to the `tab-content` slot will receive padding and a border. At the same time, the encapsulation ensures that these styles don't affect other elements outside the `tab-panel` component.

### Example: Theming with CSS Variables

CSS variables can be used within Shadow DOM to create themeable components:

{% code title="button-group.css" %}
```css
:host {
  --button-bg-color: #eee;
  --button-text-color: #333;
}

button {
  background-color: var(--button-bg-color);
  color: var(--button-text-color);
}
```
{% endcode %}

{% code title="button-group.html" %}
```html
<template>
  <button><slot></slot></button>
</template>
```
{% endcode %}

Users of the `button-group` component can then define these variables at a higher level to theme the buttons consistently across the application.

### Example: Scoped Animations in Shadow DOM

Animations can be defined within Shadow DOM to ensure they are scoped to the component:

{% code title="animated-banner.css" %}
```css
@keyframes slide-in {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.banner {
  animation: slide-in 1s ease-out forwards;
}
```
{% endcode %}

{% code title="animated-banner.html" %}
```html
<template>
  <div class="banner">Welcome to Aurelia!</div>
</template>
```
{% endcode %}

The `slide-in` animation is encapsulated within the `animated-banner` component, preventing it from conflicting with any other animations defined in the global scope.

## CSS Modules: Advanced Techniques

CSS Modules provide a powerful way to locally scope class names, avoiding global conflicts. With Aurelia 2, you can leverage CSS Modules to create maintainable, conflict-free styles.

### Example: Composing CSS Module Classes

CSS Modules support composing classes from other modules, promoting reusability.

{% code title="styles.css" %}
```css
.baseButton {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.primaryButton {
  composes: baseButton;
  background-color: #007bff;
  color: white;
}
```
{% endcode %}

{% code title="my-component.html" %}
```html
<template>
  <button class="primaryButton">Click Me</button>
</template>
```
{% endcode %}

In this example, `primaryButton` composes the `baseButton` styles, adding its own background and text color. CSS Modules ensures that these class names are unique to avoid styling conflicts.

### Example: Theming with CSS Modules

CSS Modules can also facilitate theming by exporting and importing variables.

{% code title="theme.css" %}
```css
:export {
  primaryColor: #007bff;
  secondaryColor: #6c757d;
}
```
{% endcode %}

{% code title="button.css" %}
```css
@value primaryColor, secondaryColor from "./theme.css";

.primaryButton {
  background-color: primaryColor;
  color: white;
}

.secondaryButton {
  background-color: secondaryColor;
  color: white;
}
```
{% endcode %}

{% code title="my-component.html" %}
```html
<template>
  <button class="primaryButton">Primary</button>
  <button class="secondaryButton">Secondary</button>
</template>
```
{% endcode %}

By defining and exporting theme variables in `theme.css`, they can be imported and used in other CSS Modules to ensure consistent theming across the application.

## Additional Resources

For more guidance on class and style bindings in Aurelia applications, please take a look at the [CSS classes and styling section](.. templates/class-and-style-bindings.md). This section covers strategies for dynamically working with classes and inline styles.
