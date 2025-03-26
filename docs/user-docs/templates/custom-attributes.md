---
description: >-
  Learn how to build and enhance Aurelia 2 custom attributes, including
  advanced configuration, binding strategies, and accessing the host element.
---

# Custom attributes

Custom attributes in Aurelia empower you to extend and decorate standard HTML elements by embedding custom behavior and presentation logic. They allow you to wrap or integrate existing HTML plugins and libraries, or simply enhance your UI components with additional dynamic functionality. This guide provides a comprehensive overview—from basic usage to advanced techniques—to help you leverage custom attributes effectively in your Aurelia 2 projects.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Creating a Basic Custom Attribute](#creating-a-basic-custom-attribute)
3. [Explicit Custom Attributes](#explicit-custom-attributes)
   - [Explicit Attribute Naming](#explicit-attribute-naming)
   - [Attribute Aliases](#attribute-aliases)
4. [Single Value Binding](#single-value-binding)
5. [Bindable Properties and Change Detection](#bindable-properties-and-change-detection)
6. [Options Binding for Multiple Properties](#options-binding-for-multiple-properties)
7. [Specifying a Primary Bindable Property](#specifying-a-primary-bindable-property)
8. [Accessing the Host Element](#accessing-the-host-element)
9. [Finding Related Custom Attributes](#finding-related-custom-attributes)
10. [Lifecycle Hooks and Best Practices](#lifecycle-hooks-and-best-practices)
11. [Integrating Third-Party Libraries](#integrating-third-party-libraries)

---

## Introduction

Custom attributes are one of the core building blocks in Aurelia 2. Similar to components, they encapsulate behavior and style, but are applied as attributes to existing DOM elements. This makes them especially useful for:
- Decorating elements with additional styling or behavior.
- Wrapping third-party libraries that expect to control their own DOM structure.
- Creating reusable logic that enhances multiple elements across your application.

---

## Creating a Basic Custom Attribute

At its simplest, a custom attribute is defined as a class that enhances an element. Consider this minimal example:

```typescript
export class CustomPropertyCustomAttribute {
  // Custom logic can be added here
}
```

When you apply a similar pattern using CustomElement instead, you are defining a component. Custom attributes are a more primitive (yet powerful) way to extend behavior without wrapping the entire element in a component.

### Example: Red Square Attribute

This custom attribute adds a fixed size and a red background to any element it is applied to:

```typescript
import { INode, resolve } from 'aurelia';

export class RedSquareCustomAttribute {
  private element: HTMLElement = resolve(INode) as HTMLElement;

  constructor() {
    // Set fixed dimensions and a red background on initialization
    this.element.style.width = this.element.style.height = '100px';
    this.element.style.backgroundColor = 'red';
  }
}
```

**Usage in HTML:**

```html
<import from="./red-square"></import>

<div red-square></div>
```

The `<import>` tag ensures that Aurelia’s dependency injection is aware of your custom attribute. When applied, the `<div>` will render with the specified styles.

---

## Explicit Custom Attributes

To gain finer control over your attribute’s name and configuration, Aurelia provides the @customAttribute decorator. This lets you explicitly define the attribute name and even set up aliases.

### Explicit Attribute Naming

By default, the class name might be used to infer the attribute name. However, you can explicitly set a custom name:

```typescript
import { customAttribute, INode, resolve } from 'aurelia';

@customAttribute({ name: 'red-square' })
export class RedSquare {
  private element: HTMLElement = resolve(INode) as HTMLElement;

  constructor() {
    this.element.style.width = this.element.style.height = '100px';
    this.element.style.backgroundColor = 'red';
  }
}
```

### Attribute Aliases

You can define one or more aliases for your custom attribute. This allows consumers of your attribute flexibility in naming:

```typescript
import { customAttribute, INode, resolve } from 'aurelia';

@customAttribute({ name: 'red-square', aliases: ['redify', 'redbox'] })
export class RedSquare {
  private element: HTMLElement = resolve(INode) as HTMLElement;

  constructor() {
    this.element.style.width = this.element.style.height = '100px';
    this.element.style.backgroundColor = 'red';
  }
}
```

Now the attribute can be used interchangeably using any of the registered names:

```html
<div red-square></div>
<div redify></div>
<div redbox></div>
```

---

## Single Value Binding

For simple cases, you might want to pass a single value to your custom attribute without explicitly declaring a bindable property. Aurelia will automatically populate the value property if a value is provided.

```typescript
import { INode, resolve } from 'aurelia';

export class RedSquareCustomAttribute {
  private element: HTMLElement = resolve(INode) as HTMLElement;
  private value: string;

  constructor() {
    this.element.style.width = this.element.style.height = '100px';
    // Use a default color, but override it if a value is supplied during binding.
    this.element.style.backgroundColor = 'red';
  }

  bind() {
    if (this.value) {
      this.element.style.backgroundColor = this.value;
    }
  }
}
```

To further handle changes in the value over time, you can define the property as bindable:

```typescript
import { bindable, INode, resolve } from 'aurelia';

export class RedSquareCustomAttribute {
  private element: HTMLElement = resolve(INode) as HTMLElement;

  @bindable() private value: string;

  constructor() {
    this.element.style.width = this.element.style.height = '100px';
    this.element.style.backgroundColor = 'red';
  }

  bound() {
    this.element.style.backgroundColor = this.value;
  }

  valueChanged(newValue: string, oldValue: string) {
    this.element.style.backgroundColor = newValue;
  }
}
```

---

## Bindable Properties and Change Detection

Custom attributes often need to be configurable. Using the @bindable decorator, you can allow users to pass in parameters that change the behavior or style dynamically. In the following example, the background color is configurable:

```typescript
import { bindable, INode, resolve } from 'aurelia';

export class ColorSquareCustomAttribute {
  @bindable() color: string = 'red';

  constructor(private element: HTMLElement = resolve(INode)) {
    this.element.style.width = this.element.style.height = '100px';
    this.element.style.backgroundColor = this.color;
  }

  bound() {
    // Ensure the element reflects the current color after binding
    this.element.style.backgroundColor = this.color;
  }

  colorChanged(newColor: string, oldColor: string) {
    // Update the background color dynamically when the property changes
    this.element.style.backgroundColor = newColor;
  }
}
```

You can extend this to support multiple bindable properties. For example, to also allow a dynamic size:

```typescript
import { bindable, INode, resolve } from 'aurelia';

export class ColorSquareCustomAttribute {
  @bindable() color: string = 'red';
  @bindable() size: string = '100px';

  constructor(private element: HTMLElement = resolve(INode)) {
    this.applyStyles();
  }

  bound() {
    this.applyStyles();
  }

  colorChanged(newColor: string) {
    this.element.style.backgroundColor = newColor;
  }

  sizeChanged(newSize: string) {
    this.element.style.width = this.element.style.height = newSize;
  }

  private applyStyles() {
    this.element.style.width = this.element.style.height = this.size;
    this.element.style.backgroundColor = this.color;
  }
}
```

---

## Options Binding for Multiple Properties

When you have more than one bindable property, you can use options binding syntax to bind multiple properties at once. Each bindable property in the view model corresponds to a dash-case attribute in the DOM. For instance:

```html
<import from="./color-square"></import>

<div color-square="color.bind: myColor; size.bind: mySize;"></div>
```

The Aurelia binding engine converts the attribute names (e.g., `color-square`) to the corresponding properties in your class.

---

## Specifying a Primary Bindable Property

If one of your bindable properties is expected to be used more frequently, you can mark it as the primary property. This simplifies the syntax when binding:

```typescript
import { bindable, INode, resolve } from 'aurelia';

export class ColorSquareCustomAttribute {
  @bindable({ primary: true }) color: string = 'red';
  @bindable() size: string = '100px';

  private element: HTMLElement = resolve(INode) as HTMLElement;

  constructor() {
    this.applyStyles();
  }

  bound() {
    this.applyStyles();
  }

  colorChanged(newColor: string) {
    this.element.style.backgroundColor = newColor;
  }

  sizeChanged(newSize: string) {
    this.element.style.width = this.element.style.height = newSize;
  }

  private applyStyles() {
    this.element.style.width = this.element.style.height = this.size;
    this.element.style.backgroundColor = this.color;
  }
}
```

With a primary property defined, you can bind directly:

```html
<import from="./color-square"></import>

<!-- Using a literal value -->
<div color-square="blue"></div>

<!-- Or binding the value dynamically -->
<div color-square.bind="myColour"></div>
```

---

## Accessing the Host Element

A key aspect of custom attributes is that they work directly on DOM elements. To manipulate these elements (e.g., updating styles or initializing plugins), you need to access the host element. Aurelia provides a safe way to do this using dependency injection with `INode`.

```typescript
import { INode, resolve } from 'aurelia';

export class RedSquareCustomAttribute {
  // Resolve the host element safely, even in Node.js environments
  private element: HTMLElement = resolve(INode) as HTMLElement;

  constructor() {
    // Now you can modify the host element directly
    this.element.style.width = this.element.style.height = '100px';
    this.element.style.backgroundColor = 'red';
  }
}
```

**Note:** While you can also use `resolve(Element)` or `resolve(HTMLElement)`, using `INode` is safer in environments where global DOM constructors might not be available (such as Node.js).

---

## Finding Related Custom Attributes

In complex UIs, you might have multiple custom attributes working together (for example, a dropdown with associated toggle buttons). Aurelia offers the `CustomAttribute.closest` function to traverse the DOM and locate a related custom attribute. This function can search by attribute name or by constructor.

### Example: Searching by Attribute Name

```html
<div foo="1">
  <div bar="2"></div>
</div>
```

```typescript
import { CustomAttribute, resolve, INode, customAttribute } from 'aurelia';

@customAttribute('bar')
export class Bar {
  host: HTMLElement = resolve(INode) as HTMLElement;
  // Find the closest ancestor that has the 'foo' custom attribute
  parent = CustomAttribute.closest(this.host, 'foo');
}
```

### Example: Searching by Constructor

If you want to search based on the attribute’s constructor (for stronger typing), you can do so:

```typescript
import { CustomAttribute, resolve, INode, customAttribute } from 'aurelia';
import { Foo } from './foo';

@customAttribute('bar')
export class Bar {
  host: HTMLElement = resolve(INode) as HTMLElement;
  // Find the closest ancestor that is an instance of the Foo custom attribute
  parent = CustomAttribute.closest(this.host, Foo);
}
```

---

## Lifecycle Hooks and Best Practices

Custom attributes, like components, have lifecycle hooks that let you run code at different stages of their existence:

- `bind() / unbind()`: Initialize or clean up data bindings.
- `attached() / detached()`: Perform actions when the host element is attached to or removed from the DOM.

### Example: Using Lifecycle Hooks

```typescript
import { bindable, INode, resolve, customAttribute } from 'aurelia';

@customAttribute({ name: 'dynamic-style' })
export class DynamicStyleCustomAttribute {
  @bindable() color: string = 'red';
  @bindable() size: string = '100px';
  private element: HTMLElement = resolve(INode) as HTMLElement;

  bind() {
    // Initial setup or computation can go here
    this.applyStyles();
  }

  attached() {
    // For DOM-dependent initialization, e.g., third-party plugin initialization
  }

  colorChanged(newColor: string) {
    this.element.style.backgroundColor = newColor;
  }

  sizeChanged(newSize: string) {
    this.element.style.width = this.element.style.height = newSize;
  }

  private applyStyles() {
    this.element.style.width = this.element.style.height = this.size;
    this.element.style.backgroundColor = this.color;
  }

  detached() {
    // Clean up event listeners or other resources if needed
  }

  unbind() {
    // Clean up any remaining state
  }
}
```

### Best Practices:

- Separation of Concerns: Keep your custom attribute logic focused on enhancing the host element, and avoid heavy business logic.
- Performance: Minimize DOM manipulations inside change handlers. If multiple properties change at once, consider batching style updates.
- Testing: Write unit tests for your custom attributes to ensure that lifecycle hooks and bindings work as expected.
- Documentation: Comment your code and document the expected behavior of your custom attributes, especially if you provide aliases or multiple bindable properties.

---

## Integrating Third-Party Libraries

Often, you’ll want to incorporate functionality from third-party libraries—such as sliders, date pickers, or custom UI components—into your Aurelia applications. Custom attributes provide an excellent way to encapsulate the integration logic, ensuring that the third-party library initializes, updates, and cleans up properly within Aurelia's lifecycle.

### When to Use Custom Attributes for Integration

- **DOM Manipulation:** Many libraries require direct access to the DOM element for initialization.
- **Lifecycle Management:** You can leverage Aurelia's lifecycle hooks (`attached()` and `detached()`) to manage resource allocation and cleanup.
- **Dynamic Updates:** With bindable properties, you can pass configuration options to the library and update it reactively when those options change.

### Example: Integrating a Hypothetical Slider Library

Consider a third-party slider library called `AwesomeSlider` that initializes a slider on a given DOM element. Below is an example of how to wrap it in a custom attribute.

```typescript
import { customAttribute, bindable, INode, resolve } from 'aurelia';
// Import the third-party slider library (this is a hypothetical example)
import AwesomeSlider from 'awesome-slider';

@customAttribute('awesome-slider')
export class AwesomeSliderCustomAttribute {
  // Allow dynamic options to be bound from the view
  @bindable() options: any = {};

  // The instance of the third-party slider
  private sliderInstance: any;

  // Safely resolve the host element
  private element: HTMLElement = resolve(INode) as HTMLElement;

  attached() {
    // Initialize the slider when the element is attached to the DOM.
    // This ensures that the DOM is ready for manipulation.
    try {
      this.sliderInstance = new AwesomeSlider(this.element, this.options);
    } catch (error) {
      console.error('Failed to initialize AwesomeSlider:', error);
    }
  }

  optionsChanged(newOptions: any, oldOptions: any) {
    // Update the slider if its configuration changes at runtime.
    // This callback is triggered when the bound `options` property changes.
    if (this.sliderInstance && typeof this.sliderInstance.updateOptions === 'function') {
      this.sliderInstance.updateOptions(newOptions);
    }
  }

  detached() {
    // Clean up the slider instance when the element is removed from the DOM.
    // This prevents memory leaks and removes event listeners.
    if (this.sliderInstance && typeof this.sliderInstance.destroy === 'function') {
      this.sliderInstance.destroy();
    }
  }
}
```

In place of our hypothetical `AwesomeSlider` library, you can use any third-party library that requires DOM manipulation such as jQuery plugins, D3.js, or even custom UI components.
