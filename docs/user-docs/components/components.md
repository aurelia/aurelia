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

{% hint style="info" %}
**Table of Contents**

This guide covers all aspects of Aurelia components:
- [Basic component creation](#creating-components)
- [Configuration options](#explicit-component-creation-with-customelement)
- [Registration approaches](#registering-your-components)
- [Containerless components](#containerless-components)
- [Component lifecycle hooks](#component-lifecycle-hooks)
- [Bindable properties](#bindable-properties)
- [Shadow DOM support](#shadow-dom-support)
- [Advanced features](#process-content-hook) (processContent, enhance, watch, children/slotted)
- [Additional decorators](#advanced-component-features) (capture, aliases, dependencies)
- [Best practices](#component-best-practices)
{% endhint %}

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

## Component Lifecycle Hooks

Components in Aurelia follow a comprehensive lifecycle with multiple hooks that allow you to execute code at specific stages. Every lifecycle callback is optional—implement only what makes sense for your component.

For complete lifecycle documentation including advanced scenarios and timing details, see the [Component Lifecycles documentation](component-lifecycles.md).

{% hint style="info" %}
All arguments on lifecycle callback methods are optional and in most cases will not be needed.
{% endhint %}

{% hint style="warning" %}
If you register a listener or subscriber in one callback, remember to remove it in the opposite callback. For example, a native event listener registered in `attached` should be removed in `detaching`.
{% endhint %}

### Constructor

The constructor is called when the framework instantiates a component, just like any JavaScript class. This is the best place for basic initialization code that doesn't depend on bindable properties.

```typescript
import { resolve } from 'aurelia';
import { IRouter } from '@aurelia/router';

export class MyComponent {
    readonly router: IRouter = resolve(IRouter);

    constructor() {
        // Basic initialization logic here
    }
}
```

### Hydrating

The `hydrating` hook allows you to add contextual DI registrations to influence which resources are resolved when the template is compiled.

```typescript
import { ICustomElementController } from 'aurelia';

export class MyComponent {
    hydrating(controller: ICustomElementController<this>) {
        // Add DI registrations for child components
        // This is called before template compilation
    }
}
```

### Hydrated

The `hydrated` hook is called after the definition is compiled and is a good place to influence how child components are constructed and rendered contextually.

```typescript
export class MyComponent {
    hydrated(controller: ICustomElementController<this>) {
        // Last opportunity to affect child component rendering
    }
}
```

### Created

The `created` hook is called after this component and all child components are hydrated. It executes bottom-up, from child to parent.

```typescript
export class MyComponent {
    created(controller: ICustomElementController<this>) {
        // Work that requires all child components to be hydrated
    }
}
```

### Binding

The `binding` hook is invoked after bindable properties are assigned but before the view bindings are set. Executes top-down, from parent to child.

```typescript
import { IHydratedController, LifecycleFlags } from 'aurelia';

export class MyComponent {
    binding(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags) {
        // Ideal place for work that might affect child components
        // Can return a Promise to suspend child binding until resolved
    }
}
```

### Bound

The `bound` hook is invoked when all bindings between the component and its view have been set.

```typescript
export class MyComponent {
    bound(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags) {
        // Values from `let`, `from-view`, and `ref` bindings are now available
    }
}
```

### Attaching

The `attaching` hook is invoked when the component's HTML element is being attached to the DOM.

```typescript
export class MyComponent {
    attaching(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags) {
        // Good place to queue animations or initialize 3rd party libraries
        // Can return a Promise that will be awaited before `attached` is called
    }
}
```

### Attached

The `attached` hook is invoked when the component and all its children are attached to the DOM. Executes bottom-up.

```typescript
export class MyComponent {
    attached(initiator: IHydratedController, flags: LifecycleFlags) {
        // Best time for DOM measurements or 3rd party library integration
    }
}
```

### Detaching

The `detaching` hook is invoked when the HTML element is being removed from the DOM. Executes bottom-up.

```typescript
export class MyComponent {
    detaching(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags) {
        // Can return a Promise for outgoing animations
        // Cleanup of DOM-related resources
    }
}
```

### Unbinding

The `unbinding` hook is invoked when the component is being fully removed. Executes bottom-up.

```typescript
export class MyComponent {
    unbinding(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags) {
        // Final cleanup of bindings and subscriptions
    }
}
```

### Dispose

The `dispose` hook is called when the component is cleared from memory completely.

```typescript
export class MyComponent {
    dispose() {
        // Advanced cleanup for memory leak prevention
    }
}
```

## Advanced Lifecycle Features

### Lifecycle Hooks Plugin

You can create global lifecycle hooks that apply to all components using the `@lifecycleHooks` decorator:

```typescript
import { lifecycleHooks, ILifecycleHooks, IHydratedController } from 'aurelia';

@lifecycleHooks()
class GlobalLoggingHook implements ILifecycleHooks {
    attached(viewModel: any, controller: IHydratedController) {
        console.log('Component attached:', viewModel.constructor.name);
    }

    detaching(viewModel: any, controller: IHydratedController) {
        console.log('Component detaching:', viewModel.constructor.name);
    }
}

// Register globally
Aurelia.register(GlobalLoggingHook).app(MyApp).start();
```

## Bindable Properties

Components can accept data from their parent components through bindable properties. This is covered in comprehensive detail in the dedicated [Bindable Properties documentation](bindable-properties.md), including binding modes, change callbacks, coercion, and advanced configuration options.

Here's a quick overview of basic usage:

### Basic Bindable Example

```typescript
import { bindable } from 'aurelia';

export class UserCard {
    @bindable user: User;
    @bindable isSelected: boolean = false;
}
```

```html
<user-card user.bind="currentUser" is-selected.bind="userIsSelected"></user-card>
```

### Advanced Bindable Configuration

```typescript
import { bindable, BindingMode } from 'aurelia';

export class DataInput {
    @bindable({ mode: BindingMode.twoWay }) value: string;
    @bindable({ callback: 'onValidationChange' }) validation: any;
    @bindable({
        mode: BindingMode.toView,
        set: (value) => value?.toString().trim()
    }) placeholder: string;

    onValidationChange(newValidation: any, oldValidation: any) {
        // Handle validation changes
    }
}
```

## Shadow DOM Support

Aurelia components can use Shadow DOM for style and DOM encapsulation using the `@useShadowDOM` decorator.

```typescript
import { customElement, useShadowDOM } from 'aurelia';

@customElement({ name: 'my-widget', template: './my-widget.html' })
@useShadowDOM({ mode: 'open' })
export class MyWidget {
    // Component logic
}
```

You can also configure Shadow DOM options:

```typescript
@customElement({
    name: 'my-widget',
    template: './my-widget.html',
    shadowOptions: { mode: 'closed' }
})
export class MyWidget {
    // Component logic
}
```

## Process Content Hook

The `@processContent` decorator allows you to manipulate the DOM before compilation, enabling powerful template transformations.

```typescript
import { customElement, processContent, INode, IPlatform } from 'aurelia';

@customElement({
    name: 'tabs-container',
    template: `
        <div class="tab-headers">
            <au-slot name="headers"></au-slot>
        </div>
        <div class="tab-content">
            <au-slot name="content"></au-slot>
        </div>
    `
})
export class TabsContainer {
    @processContent()
    static processContent(node: INode, platform: IPlatform) {
        // Transform tab markup into slotted content
        const tabs = Array.from(node.querySelectorAll('tab'));

        tabs.forEach((tab, index) => {
            const header = platform.document.createElement('button');
            header.setAttribute('au-slot', 'headers');
            header.textContent = tab.getAttribute('header');
            header.setAttribute('click.trigger', `showTab(${index})`);

            const content = platform.document.createElement('div');
            content.setAttribute('au-slot', 'content');
            content.innerHTML = tab.innerHTML;

            node.appendChild(header);
            node.appendChild(content);
            node.removeChild(tab);
        });
    }
}
```

## Enhance Feature

The `enhance` feature allows you to apply Aurelia's capabilities to existing DOM elements or server-rendered content.

When you're already inside an Aurelia component, use the existing Aurelia instance:

```typescript
import { resolve, Aurelia } from 'aurelia';

export class MyComponent {
    private readonly au = resolve(Aurelia);

    async attached() {
        const existingElement = document.getElementById('existing-content');
        existingElement.innerHTML = "<div repeat.for='item of items'>${item}</div>";

        await this.au.enhance({
            host: existingElement,
            component: {
                message: 'Hello World',
                items: [1, 2, 3]
            }
        });
    }
}
```

## Watch Integration

Components can use the `@watch` decorator for reactive property observation:

```typescript
import { watch, bindable } from 'aurelia';

export class DataVisualization {
    @bindable data: any[];
    @bindable config: ChartConfig;

    @watch('data')
    @watch('config')
    onDataOrConfigChange(newValue: any, oldValue: any, propertyName: string) {
        this.redrawChart();
    }

    private redrawChart() {
        // Redraw chart with new data/config
    }
}
```

## Children and Slotted Decorators

### @children Decorator

The `@children` decorator allows you to observe child elements:

```typescript
import { children } from 'aurelia';

export class ListContainer {
    @children('list-item') items: ListItem[];

    itemsChanged(newItems: ListItem[], oldItems: ListItem[]) {
        console.log('Child items changed');
    }
}
```

### @slotted Decorator

The `@slotted` decorator helps observe projected content in au-slot elements:

```typescript
import { slotted } from 'aurelia';

export class TabContainer {
    @slotted('tab-panel', 'content') panels: TabPanel[];

    panelsChanged(newPanels: TabPanel[]) {
        this.updateTabVisibility();
    }
}
```

## Advanced Component Features

### @capture Decorator

The `@capture` decorator allows components to capture attributes and bindings that aren't explicitly declared as bindables or template controllers.

```typescript
import { customElement, capture } from 'aurelia';

@customElement({ name: 'flexible-wrapper' })
@capture() // Captures all unrecognized attributes
export class FlexibleWrapper {
    // All captured attributes are available through the component
}
```

You can also provide a filter function to selectively capture attributes:

```typescript
@capture((attrName: string) => attrName.startsWith('data-'))
export class DataWrapper {
    // Only captures attributes starting with 'data-'
}
```

Alternatively, configure capture in the component definition:

```typescript
@customElement({
    name: 'capturing-element',
    capture: true // or a filter function
})
export class CapturingElement {
    // Component logic
}
```

### Strict Binding Mode

Components can use strict binding mode to handle undefined/null values consistently:

```typescript
@customElement({
    name: 'strict-component',
    strict: true
})
export class StrictComponent {
    // undefined/null values will be coerced to 0 or '' based on expected type
}
```

### Component Aliases

Components can be registered with multiple names using aliases:

```typescript
@customElement({
    name: 'primary-button',
    aliases: ['btn-primary', 'p-button']
})
export class PrimaryButton {
    // Can be used as <primary-button>, <btn-primary>, or <p-button>
}
```

### Dependencies Declaration

You can declare component dependencies directly in the decorator:

```typescript
import { SomeService } from './some-service';
import { ChildComponent } from './child-component';

@customElement({
    name: 'parent-component',
    dependencies: [SomeService, ChildComponent]
})
export class ParentComponent {
    // Dependencies are automatically registered when component is used
}
```

## Component Best Practices

### Performance
- Use lifecycle hooks appropriately—prefer `attached()` for DOM-dependent initialization
- Minimize DOM manipulations in change handlers
- Clean up subscriptions and event listeners in `detaching()` or `unbinding()`
- Use `@watch` for reactive updates instead of polling
- Consider using Shadow DOM for style encapsulation to avoid CSS conflicts

### Testing
- Write unit tests for component lifecycle hooks
- Test bindable property changes and their effects
- Mock dependencies properly in component tests
- Test error scenarios and edge cases in lifecycle hooks

### Type Safety
- Use TypeScript interfaces for complex bindable properties
- Provide proper typing for lifecycle callback parameters
- Use generic constraints where appropriate
- Leverage Aurelia's type system for better IDE support
- Always avoid `any` type—create specific types instead

```typescript
import { bindable, IHydratedController, resolve, ILogger } from 'aurelia';

interface UserData {
    name: string;
    email: string;
    avatar?: string;
}

export class UserProfile {
    @bindable user: UserData;

    private readonly logger = resolve(ILogger);

    bound(initiator: IHydratedController, parent: IHydratedController) {
        // user is properly typed as UserData
        this.logger.info('User profile bound', this.user.email);
    }
}
```

### Architecture
- Keep components focused on a single responsibility
- Use composition over inheritance when possible
- Separate business logic from presentation logic
- Use the DI system effectively for testability and modularity
- Prefer arrow functions and const/let over var
- Use template literals over string concatenation

### Error Handling
- Handle errors gracefully in lifecycle hooks
- Provide meaningful error messages for debugging
- Use Aurelia's logger system (ILogger) instead of console methods
- Use try/catch blocks appropriately with async operations
