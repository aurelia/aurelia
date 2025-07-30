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
3. [Custom Attribute Definition Approaches](#custom-attribute-definition-approaches)
   - [Convention-Based Approach](#convention-based-approach)
   - [Decorator-Based Approach](#decorator-based-approach)
   - [Static Definition Approach](#static-definition-approach)
4. [Explicit Custom Attributes](#explicit-custom-attributes)
   - [Explicit Attribute Naming](#explicit-attribute-naming)
   - [Attribute Aliases](#attribute-aliases)
5. [Single Value Binding](#single-value-binding)
6. [Bindable Properties and Change Detection](#bindable-properties-and-change-detection)
   - [Binding Modes](#binding-modes)
   - [Primary Bindable Property](#primary-bindable-property)
   - [Bindable Interceptors](#bindable-interceptors)
   - [Custom Change Callbacks](#custom-change-callbacks)
7. [Options Binding for Multiple Properties](#options-binding-for-multiple-properties)
8. [Advanced Bindable Configuration](#advanced-bindable-configuration)
9. [Lifecycle Hooks](#lifecycle-hooks)
10. [Aggregated Change Callbacks](#aggregated-change-callbacks)
11. [Accessing the Host Element](#accessing-the-host-element)
12. [Finding Related Custom Attributes](#finding-related-custom-attributes)
13. [Template Controller Custom Attributes](#template-controller-custom-attributes)
14. [Advanced Configuration Options](#advanced-configuration-options)
15. [Watch Integration](#watch-integration)
16. [Integrating Third-Party Libraries](#integrating-third-party-libraries)
17. [Best Practices](#best-practices)

---

## Introduction

Custom attributes are one of the core building blocks in Aurelia 2. Similar to components, they encapsulate behavior and style, but are applied as attributes to existing DOM elements. This makes them especially useful for:
- Decorating elements with additional styling or behavior.
- Wrapping third-party libraries that expect to control their own DOM structure.
- Creating reusable logic that enhances multiple elements across your application.
- Creating template controllers that control the rendering of content.

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
  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

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

The `<import>` tag ensures that Aurelia's dependency injection is aware of your custom attribute. When applied, the `<div>` will render with the specified styles.

---

## Custom Attribute Definition Approaches

Aurelia 2 provides multiple approaches for defining custom attributes. For most user scenarios, you'll use either the convention-based or decorator-based approach:

### Convention-Based Approach

Classes ending with `CustomAttribute` are automatically recognized as custom attributes:

```typescript
import { INode, resolve } from 'aurelia';

export class RedSquareCustomAttribute {
  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

  constructor() {
    this.element.style.width = this.element.style.height = '100px';
    this.element.style.backgroundColor = 'red';
  }
}
```

The attribute name is derived from the class name (`red-square` in this case).

### Decorator-Based Approach (Recommended)

Use the `@customAttribute` decorator for explicit control and better IDE support:

```typescript
import { customAttribute, INode, resolve } from 'aurelia';

@customAttribute({ name: 'red-square' })
export class RedSquare {
  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

  constructor() {
    this.element.style.width = this.element.style.height = '100px';
    this.element.style.backgroundColor = 'red';
  }
}
```

### Static Definition Approach (Framework Internal)

For completeness, the framework also supports defining attributes using a static `$au` property. This approach is primarily used by the framework itself to avoid conventions and decorators, but is available if needed:

```typescript
import { INode, resolve, type CustomAttributeStaticAuDefinition } from 'aurelia';

export class RedSquare {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'red-square'
  };

  private element: HTMLElement = resolve(INode) as HTMLElement;

  constructor() {
    this.element.style.width = this.element.style.height = '100px';
    this.element.style.backgroundColor = 'red';
  }
}
```

{% hint style="info" %}
**When to use each approach:**
- **Convention-based**: Quick prototyping, simple attributes where the class name matches desired attribute name
- **Decorator-based**: Production code, when you need explicit control over naming, aliases, or other configuration
- **Static definition**: Advanced scenarios, framework extensions, or when you need to avoid decorators for tooling reasons
{% endhint %}

---

## Explicit Custom Attributes

To gain finer control over your attribute's name and configuration, Aurelia provides the `@customAttribute` decorator. This lets you explicitly define the attribute name and even set up aliases.

### Explicit Attribute Naming

By default, the class name might be used to infer the attribute name. However, you can explicitly set a custom name:

```typescript
import { customAttribute, INode, resolve } from 'aurelia';

@customAttribute({ name: 'red-square' })
export class RedSquare {
  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

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
  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

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

For simple cases, you might want to pass a single value to your custom attribute without explicitly declaring a bindable property. Aurelia will automatically populate the `value` property if a value is provided.

```typescript
import { INode, resolve } from 'aurelia';

export class HighlightCustomAttribute {
  private readonly element: HTMLElement = resolve(INode) as HTMLElement;
  public value: string;

  constructor() {
    // Apply default highlighting style
    this.element.style.backgroundColor = 'yellow';
    this.element.style.padding = '2px 4px';
    this.element.style.borderRadius = '3px';
  }

  bind() {
    // Override default color if a specific color is provided
    if (this.value) {
      this.element.style.backgroundColor = this.value;
    }
  }
}
```

**Usage:**
```html
<import from="./highlight"></import>

<!-- Uses default yellow highlighting -->
<span highlight>Important text</span>

<!-- Uses custom color -->
<span highlight="lightblue">Custom highlighted text</span>
```

To further handle changes in the value over time, you can define the property as bindable:

```typescript
import { bindable, INode, resolve } from 'aurelia';

export class HighlightCustomAttribute {
  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

  @bindable() public value: string;

  constructor() {
    // Apply default highlighting style
    this.element.style.backgroundColor = 'yellow';
    this.element.style.padding = '2px 4px';
    this.element.style.borderRadius = '3px';
    this.element.style.transition = 'background-color 0.3s ease';
  }

  bound() {
    if (this.value) {
      this.element.style.backgroundColor = this.value;
    }
  }

  valueChanged(newValue: string, oldValue: string) {
    this.element.style.backgroundColor = newValue || 'yellow';
  }
}
```

**Usage with dynamic binding:**
```html
<import from="./highlight"></import>

<!-- Color changes reactively based on view model property -->
<span highlight.bind="selectedColor">Dynamic highlighting</span>
```

---

## Bindable Properties and Change Detection

Custom attributes often need to be configurable. Using the @bindable decorator, you can allow users to pass in parameters that change the behavior or style dynamically.

### Binding Modes

Bindable properties support different binding modes that determine how data flows:

```typescript
import { bindable, INode, resolve, BindingMode } from 'aurelia';

export class InputWrapperCustomAttribute {
  @bindable({ mode: BindingMode.twoWay }) public value: string = '';
  @bindable({ mode: BindingMode.toView }) public placeholder: string = '';
  @bindable({ mode: BindingMode.fromView }) public isValid: boolean = true;
  @bindable({ mode: BindingMode.oneTime }) public label: string = '';

  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

  // ... implementation
}
```

Available binding modes:
- `BindingMode.toView` (default): Data flows from view model to view
- `BindingMode.fromView`: Data flows from view to view model
- `BindingMode.twoWay`: Data flows both ways
- `BindingMode.oneTime`: Data is set once and never updated

### Primary Bindable Property

You can mark one property as primary, allowing simpler binding syntax:

```typescript
import { bindable, INode, resolve } from 'aurelia';

export class ColorSquareCustomAttribute {
  @bindable({ primary: true }) public color: string = 'red';
  @bindable() public size: string = '100px';

  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

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

### Bindable Interceptors

You can intercept and transform values being set on bindable properties:

```typescript
import { bindable, INode, resolve } from 'aurelia';

export class ValidatedInputCustomAttribute {
  @bindable({
    set: (value: string) => value?.trim().toLowerCase()
  }) public email: string = '';

  @bindable({
    set: (value: number) => Math.max(0, Math.min(100, value))
  }) public progress: number = 0;

  private readonly element: HTMLElement = resolve(INode) as HTMLElement;
}
```

### Custom Change Callbacks

You can specify custom callback names for change handlers:

```typescript
import { bindable } from 'aurelia';

export class DataVisualizationCustomAttribute {
  @bindable({ callback: 'onDataUpdate' }) public dataset: any[] = [];
  @bindable({ callback: 'onConfigChange' }) public config: any = {};

  onDataUpdate(newData: any[], oldData: any[]) {
    // Handle data changes
    this.redrawChart();
  }

  onConfigChange(newConfig: any, oldConfig: any) {
    // Handle configuration changes
    this.updateChartSettings();
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

## Advanced Bindable Configuration

You can also define bindables in the static definition or decorator:

```typescript
import { customAttribute, INode, resolve, BindingMode } from 'aurelia';

@customAttribute({
  name: 'advanced-input',
  bindables: {
    value: { mode: BindingMode.twoWay, primary: true },
    placeholder: { mode: BindingMode.toView },
    validation: { callback: 'validateInput' }
  }
})
export class AdvancedInputCustomAttribute {
  public value: string;
  public placeholder: string;
  public validation: any;

  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

  validateInput(newValidation: any, oldValidation: any) {
    // Handle validation changes
  }
}
```

Or using the static `$au` approach:

```typescript
import { INode, resolve, BindingMode, type CustomAttributeStaticAuDefinition } from 'aurelia';

export class AdvancedInput {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'advanced-input',
    bindables: {
      value: { mode: BindingMode.twoWay, primary: true },
      placeholder: { mode: BindingMode.toView },
      validation: { callback: 'validateInput' }
    }
  };

  public value: string;
  public placeholder: string;
  public validation: any;

  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

  validateInput(newValidation: any, oldValidation: any) {
    // Handle validation changes
  }
}
```

---

## Lifecycle Hooks

Custom attributes support a comprehensive set of lifecycle hooks that allow you to run code at different stages of their existence:

- `created(controller)`: Called after the attribute instance is created
- `binding(initiator, parent)`: Called before data binding begins
- `bind()`: Called when data binding begins (simplified version)
- `bound(initiator, parent)`: Called after data binding is complete
- `attaching(initiator, parent)`: Called before the element is attached to the DOM
- `attached(initiator)`: Called after the element is attached to the DOM
- `detaching(initiator, parent)`: Called before the element is detached from the DOM
- `unbinding(initiator, parent)`: Called before data binding is removed
- `unbind()`: Called when data binding is removed (simplified version)

### Example: Using Lifecycle Hooks

```typescript
import { bindable, INode, resolve, customAttribute, ICustomAttributeController, IHydratedController } from 'aurelia';

@customAttribute({ name: 'lifecycle-demo' })
export class LifecycleDemoCustomAttribute {
  @bindable() public value: string = '';

  private readonly element: HTMLElement = resolve(INode) as HTMLElement;

  created(controller: ICustomAttributeController) {
    // Called when the attribute instance is created
    console.log('Custom attribute created');
  }

  binding(initiator: IHydratedController, parent: IHydratedController) {
    // Called before binding begins - good for setup
    console.log('Starting to bind');
  }

  bind() {
    // Simplified binding hook - most commonly used
    this.applyInitialValue();
  }

  bound(initiator: IHydratedController, parent: IHydratedController) {
    // Called after binding is complete
    console.log('Binding complete');
  }

  attaching(initiator: IHydratedController, parent: IHydratedController) {
    // Called before DOM attachment
    console.log('About to attach to DOM');
  }

  attached(initiator: IHydratedController) {
    // Called after DOM attachment - good for DOM manipulation
    this.initializeThirdPartyLibrary();
  }

  valueChanged(newValue: string, oldValue: string) {
    // Called whenever the value changes
    this.updateDisplay();
  }

  detaching(initiator: IHydratedController, parent: IHydratedController) {
    // Called before DOM detachment - good for cleanup
    this.cleanupEventListeners();
  }

  unbinding(initiator: IHydratedController, parent: IHydratedController) {
    // Called before unbinding
    console.log('About to unbind');
  }

  unbind() {
    // Simplified unbinding hook - good for final cleanup
    this.finalCleanup();
  }

  private applyInitialValue() {
    this.element.textContent = this.value;
  }

  private updateDisplay() {
    this.element.textContent = this.value;
  }

  private initializeThirdPartyLibrary() {
    // Initialize any third-party libraries that need DOM access
  }

  private cleanupEventListeners() {
    // Remove event listeners to prevent memory leaks
  }

  private finalCleanup() {
    // Final cleanup before the attribute is destroyed
  }
}
```

---

## Aggregated Change Callbacks

Custom attributes can implement aggregated change detection that batches multiple property changes:

```typescript
import { bindable, customAttribute } from 'aurelia';

@customAttribute('batch-processor')
export class BatchProcessorCustomAttribute {
  @bindable() public prop1: string;
  @bindable() public prop2: number;
  @bindable() public prop3: boolean;

  // Called when any bindable property changes (batched until next microtask)
  propertiesChanged(changes: Record<string, { newValue: unknown; oldValue: unknown }>) {
    console.log('Properties changed:', changes);
    // Example output: { prop1: { newValue: 'new', oldValue: 'old' } }

    // Process all changes at once for better performance
    this.processBatchedChanges(changes);
  }

  // Called for every property change (immediate)
  propertyChanged(key: PropertyKey, newValue: unknown, oldValue: unknown) {
    console.log(`Property ${String(key)} changed from ${oldValue} to ${newValue}`);
  }

  private processBatchedChanges(changes: Record<string, any>) {
    // Efficiently handle multiple property changes
  }
}
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
  <center>
    <div foo="3">
      <div bar="2"></div>
    </div>
  </center>
</div>
```

```typescript
import { CustomAttribute, resolve, INode, customAttribute } from 'aurelia';

@customAttribute('bar')
export class Bar {
  private readonly host: HTMLElement = resolve(INode) as HTMLElement;

  binding() {
    // Find the closest ancestor that has the 'foo' custom attribute
    const closestFoo = CustomAttribute.closest(this.host, 'foo');
    if (closestFoo) {
      console.log('Found foo attribute:', closestFoo.viewModel);
    }
  }
}
```

### Example: Searching by Constructor

If you want to search based on the attribute's constructor (for stronger typing), you can do so:

```typescript
import { CustomAttribute, resolve, INode, customAttribute } from 'aurelia';
import { Foo } from './foo';

@customAttribute('bar')
export class Bar {
  private readonly host: HTMLElement = resolve(INode) as HTMLElement;

  binding() {
    // Find the closest ancestor that is an instance of the Foo custom attribute
    const parentFoo = CustomAttribute.closest(this.host, Foo);
    if (parentFoo) {
      // parentFoo.viewModel is now strongly typed as Foo
      parentFoo.viewModel.someMethod();
    }
  }
}
```

---

## Template Controller Custom Attributes

Custom attributes can also function as template controllers, which control the rendering of content. Template controllers are similar to built-in directives like `if.bind` and `repeat.for`.

### Creating a Template Controller

```typescript
import { templateController, IViewFactory, ISyntheticView, IRenderLocation, resolve, bindable, ICustomAttributeController } from 'aurelia';

@templateController('permission')
export class PermissionTemplateController {
  @bindable() public userRole: string;
  @bindable() public requiredRole: string;

  public readonly $controller!: ICustomAttributeController<this>;

  private view: ISyntheticView;
  private readonly factory = resolve(IViewFactory);
  private readonly location = resolve(IRenderLocation);

  bound() {
    this.updateView();
  }

  userRoleChanged() {
    if (this.$controller.isActive) {
      this.updateView();
    }
  }

  requiredRoleChanged() {
    if (this.$controller.isActive) {
      this.updateView();
    }
  }

  private updateView() {
    const hasPermission = this.userRole === this.requiredRole;

    if (hasPermission) {
      if (!this.view) {
        this.view = this.factory.create().setLocation(this.location);
      }
      if (!this.view.isActive) {
        this.view.activate(this.view, this.$controller, this.$controller.scope);
      }
    } else {
      if (this.view?.isActive) {
        this.view.deactivate(this.view, this.$controller);
      }
    }
  }

  unbind() {
    if (this.view?.isActive) {
      this.view.deactivate(this.view, this.$controller);
    }
  }
}
```

Usage:

```html
<div permission="user-role.bind: currentUser.role; required-role: admin">
  <h2>Admin Panel</h2>
  <p>Only admins can see this content</p>
</div>
```

You can also use the static definition approach:

```typescript
import { IViewFactory, ISyntheticView, IRenderLocation, resolve, type CustomAttributeStaticAuDefinition } from 'aurelia';

export class PermissionTemplateController {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'permission',
    isTemplateController: true,
    bindables: ['userRole', 'requiredRole']
  };

  // ... implementation same as above
}
```

---

## Advanced Configuration Options

Custom attributes support several advanced configuration options:

### No Multi-Bindings

By default, custom attributes support multiple bindings (`attr="prop1: value1; prop2: value2"`). You can disable this:

```typescript
import { customAttribute } from 'aurelia';

@customAttribute({
  name: 'simple-url',
  noMultiBindings: true
})
export class SimpleUrlCustomAttribute {
  public value: string; // Will receive the entire attribute value as a string
}
```

```html
<!-- With noMultiBindings: true, this won't be parsed as bindings -->
<a simple-url="https://example.com:8080/path">Link</a>
```

### Dependencies

You can specify dependencies that should be registered when the attribute is used:

```typescript
import { customAttribute } from 'aurelia';
import { SomeService } from './some-service';

@customAttribute({
  name: 'dependent-attr',
  dependencies: [SomeService]
})
export class DependentAttributeCustomAttribute {
  // SomeService will be registered when this attribute is used
}
```

### Container Strategy (Template Controllers Only)

For template controller custom attributes, you can specify the container strategy:

```typescript
import { templateController } from 'aurelia';

@templateController({
  name: 'isolated-scope',
  containerStrategy: 'new' // Creates a new container for the view factory
})
export class IsolatedScopeTemplateController {
  // Views created by this template controller will have their own container
}
```

### Default Binding Mode

You can set a default binding mode for all bindable properties:

```typescript
import { customAttribute, BindingMode } from 'aurelia';

@customAttribute({
  name: 'two-way-default',
  defaultBindingMode: BindingMode.twoWay
})
export class TwoWayDefaultCustomAttribute {
  @bindable() public value1: string; // Will default to two-way binding
  @bindable() public value2: string; // Will default to two-way binding
  @bindable({ mode: BindingMode.toView }) public value3: string; // Explicitly one-way
}
```

---

## Watch Integration

Custom attributes can integrate with Aurelia's `@watch` decorator for advanced property observation:

```typescript
import { bindable, customAttribute, watch } from 'aurelia';

@customAttribute('data-processor')
export class DataProcessorCustomAttribute {
  @bindable() public data: any[];
  @bindable() public config: any;

  @watch('data', { immediate: true })
  @watch('config')
  onDataOrConfigChange(newValue: any, oldValue: any, propertyName: string) {
    console.log(`${propertyName} changed from`, oldValue, 'to', newValue);
    this.reprocessData();
  }

  private reprocessData() {
    // Process data based on current data and config
  }
}
```

---

## Integrating Third-Party Libraries

Often, you'll want to incorporate functionality from third-party libraries—such as sliders, date pickers, or custom UI components—into your Aurelia applications. Custom attributes provide an excellent way to encapsulate the integration logic, ensuring that the third-party library initializes, updates, and cleans up properly within Aurelia's lifecycle.

### When to Use Custom Attributes for Integration

- **DOM Manipulation:** Many libraries require direct access to the DOM element for initialization.
- **Lifecycle Management:** You can leverage Aurelia's lifecycle hooks (`attached()` and `detached()`) to manage resource allocation and cleanup.
- **Dynamic Updates:** With bindable properties, you can pass configuration options to the library and update it reactively when those options change.

### Example: Integrating a Hypothetical Slider Library

Consider a third-party slider library called `AwesomeSlider` that initializes a slider on a given DOM element. Below is an example of how to wrap it in a custom attribute.

```typescript
import { customAttribute, bindable, INode, resolve, ILogger } from 'aurelia';
// Import the third-party slider library (this is a hypothetical example)
import AwesomeSlider from 'awesome-slider';

@customAttribute('awesome-slider')
export class AwesomeSliderCustomAttribute {
  // Allow dynamic options to be bound from the view
  @bindable() public options: any = {};

  // The instance of the third-party slider
  private sliderInstance: any;

  // Safely resolve the host element
  private readonly element: HTMLElement = resolve(INode) as HTMLElement;
  private readonly logger = resolve(ILogger);

  attached() {
    // Initialize the slider when the element is attached to the DOM.
    // This ensures that the DOM is ready for manipulation.
    try {
      this.sliderInstance = new AwesomeSlider(this.element, this.options);
    } catch (error) {
      this.logger.error('Failed to initialize AwesomeSlider:', error);
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
      this.sliderInstance = null;
    }
  }
}
```

In place of our hypothetical `AwesomeSlider` library, you can use any third-party library that requires DOM manipulation such as jQuery plugins, D3.js, or even custom UI components.

---

## Best Practices

### Separation of Concerns
Keep your custom attribute logic focused on enhancing the host element, and avoid heavy business logic. Custom attributes should be presentational or behavioral enhancements, not data processing units.

```typescript
// ✅ Good - focused on DOM enhancement
@customAttribute('tooltip')
export class TooltipCustomAttribute {
  @bindable() public text: string;
  // Implementation focused on showing/hiding tooltip
}

// ❌ Bad - mixing business logic
@customAttribute('tooltip')
export class TooltipCustomAttribute {
  @bindable() public userId: string;
  
  async fetchUserData() {
    // Don't do data fetching in custom attributes
    return await this.api.getUser(this.userId);
  }
}
```

### Performance
- **Minimize DOM manipulations**: Cache style properties and batch updates when possible
- **Use `propertiesChanged`**: For multiple property changes, batch updates to reduce DOM thrashing
- **Lifecycle hook timing**: Use appropriate hooks for initialization
  - `constructor()`: Basic setup, non-DOM operations
  - `attached()`: DOM-dependent initialization, third-party library setup
  - `detaching()`: Cleanup before DOM removal

```typescript
@customAttribute('performance-optimized')
export class PerformanceOptimizedCustomAttribute {
  @bindable() public width: string;
  @bindable() public height: string;
  @bindable() public color: string;

  // ✅ Batch multiple property changes
  propertiesChanged(changes: Record<string, any>) {
    const element = this.element;
    if ('width' in changes) element.style.width = changes.width.newValue;
    if ('height' in changes) element.style.height = changes.height.newValue;
    if ('color' in changes) element.style.backgroundColor = changes.color.newValue;
  }
}
```

### Memory Management
- **Clean up event listeners**: Always remove event listeners to prevent memory leaks
- **Dispose third-party instances**: Call proper cleanup methods for external libraries
- **Weak references**: Use WeakMap/WeakSet for object references when appropriate

```typescript
@customAttribute('event-handler')
export class EventHandlerCustomAttribute {
  private eventListener: EventListener;
  private thirdPartyInstance: any;

  attached() {
    this.eventListener = this.handleClick.bind(this);
    this.element.addEventListener('click', this.eventListener);
    
    this.thirdPartyInstance = new SomeLibrary(this.element);
  }

  detaching() {
    // ✅ Always clean up
    this.element.removeEventListener('click', this.eventListener);
    this.thirdPartyInstance?.destroy();
    this.thirdPartyInstance = null;
  }
}
```

### Error Handling
- **Graceful degradation**: Handle initialization failures gracefully
- **Validation**: Validate bindable property values
- **Logging**: Use Aurelia's logging system for debugging

```typescript
@customAttribute('robust-attribute')
export class RobustCustomAttribute {
  @bindable() public config: any;
  private readonly logger = resolve(ILogger);

  attached() {
    try {
      this.initializeFeature();
    } catch (error) {
      this.logger.error('Failed to initialize feature:', error);
      // Fallback behavior
      this.element.classList.add('feature-unavailable');
    }
  }

  configChanged(newConfig: any) {
    if (!this.isValidConfig(newConfig)) {
      this.logger.warn('Invalid configuration provided');
      return;
    }
    this.updateConfiguration(newConfig);
  }
}
```

### Testing
Write comprehensive unit tests covering lifecycle hooks, property changes, and edge cases:

```typescript
// Example test structure
describe('MyCustomAttribute', () => {
  it('should initialize correctly', () => { /* ... */ });
  it('should handle property changes', () => { /* ... */ });
  it('should clean up on detach', () => { /* ... */ });
  it('should handle invalid input gracefully', () => { /* ... */ });
});
```

### Documentation and Maintainability
- **Document public APIs**: Clearly document bindable properties and their expected types
- **Use meaningful names**: Choose descriptive names for attributes and properties  
- **Provide usage examples**: Include HTML usage examples in comments
- **Type everything**: Use strong TypeScript typing for better IDE support

### Type Safety Best Practices
```typescript
// ✅ Strong typing with interfaces
interface ChartConfiguration {
  readonly type: 'line' | 'bar' | 'pie';
  readonly data: ChartData;
  readonly options?: ChartOptions;
}

@customAttribute('chart')
export class ChartCustomAttribute {
  @bindable() public config: ChartConfiguration;
  
  // ✅ Typed change handlers
  configChanged(newConfig: ChartConfiguration, oldConfig: ChartConfiguration) {
    // TypeScript will catch type errors
    if (newConfig.type !== oldConfig?.type) {
      this.recreateChart(newConfig);
    }
  }
}
```

```typescript
interface SliderOptions {
  min: number;
  max: number;
  step: number;
}

@customAttribute('typed-slider')
export class TypedSliderCustomAttribute {
  @bindable() public options: SliderOptions = { min: 0, max: 100, step: 1 };
  @bindable() public value: number = 0;

  optionsChanged(newOptions: SliderOptions, oldOptions: SliderOptions) {
    // Type-safe change handling
  }
}