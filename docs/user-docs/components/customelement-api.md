# CustomElement API

The `CustomElement` resource is a fundamental concept in Aurelia 2, providing the core functionality for creating encapsulated and reusable components. This comprehensive guide covers all aspects of the `CustomElement` API, including methods, decorators, and configuration options.

## Table of Contents

- [Core Methods](#core-methods)
  - [CustomElement.for](#customelement-for)
  - [CustomElement.define](#customelement-define)
  - [CustomElement.getDefinition](#customelement-getdefinition)
  - [CustomElement.find](#customelement-find)
  - [CustomElement.isType](#customelement-istype)
- [Metadata Methods](#metadata-methods)
  - [CustomElement.annotate](#customelement-annotate)
  - [CustomElement.getAnnotation](#customelement-getannotation)
- [Utility Methods](#utility-methods)
  - [CustomElement.generateName](#customelement-generatename)
  - [CustomElement.generateType](#customelement-generatetype)
  - [CustomElement.createInjectable](#customelement-createinjectable)
  - [CustomElement.keyFrom](#customelement-keyfrom)
- [Decorators](#decorators)
  - [@customElement](#customelement-decorator)
  - [@useShadowDOM](#useshadowdom-decorator)
  - [@containerless](#containerless-decorator)
  - [@capture](#capture-decorator)
  - [@processContent](#processcontent-decorator)
- [Definition Objects](#definition-objects)
  - [PartialCustomElementDefinition](#partialcustomelementdefinition)
  - [CustomElementDefinition](#customelementdefinition)

## Core Methods

### CustomElement.for

Retrieves the Aurelia controller associated with a DOM node. The controller provides access to the element's view model, lifecycle methods, and other properties.

#### Method Signatures

```typescript
// Get controller for the current node
CustomElement.for<T>(node: Node): ICustomElementController<T>

// Get controller with optional flag (returns null if not found)
CustomElement.for<T>(node: Node, opts: { optional: true }): ICustomElementController<T> | null

// Search parent nodes for a controller
CustomElement.for<T>(node: Node, opts: { searchParents: true }): ICustomElementController<T>

// Get controller for a named custom element
CustomElement.for<T>(node: Node, opts: { name: string }): ICustomElementController<T> | undefined

// Get controller for a named custom element, searching parents
CustomElement.for<T>(node: Node, opts: { name: string; searchParents: true }): ICustomElementController<T> | undefined
```

#### Parameters

- `node: Node` - The DOM node for which to retrieve the controller
- `opts?: object` - Optional configuration object with the following properties:
  - `optional?: boolean` - If `true`, returns `null` instead of throwing when no controller is found
  - `searchParents?: boolean` - If `true`, searches parent nodes (including containerless elements) for a controller
  - `name?: string` - If provided, only returns controllers for custom elements with this specific name

#### Examples

```typescript
import { CustomElement, ILogger } from 'aurelia';

// Basic usage - get controller for current node
const myElement = document.querySelector('.my-custom-element');
try {
  const controller = CustomElement.for(myElement);
  // You can inject ILogger in your classes for proper logging
  this.logger?.info('View model:', controller.viewModel);
  this.logger?.info('Element state:', controller.state);
} catch (error) {
  this.logger?.error('The provided node does not host a custom element.', error);
}

// Safe retrieval without throwing errors
const optionalController = CustomElement.for(myElement, { optional: true });
if (optionalController) {
  // Controller found and available for use
  optionalController.viewModel.someMethod();
} else {
  // No controller found, handle gracefully
  this.logger?.info('Node is not a custom element');
}

// Search parent hierarchy for any custom element controller
const someInnerElement = document.querySelector('.some-inner-element');
const parentController = CustomElement.for(someInnerElement, { searchParents: true });
// parentController is the closest controller up the DOM tree

// Get controller for a specific named custom element
const namedController = CustomElement.for(myElement, { name: 'my-custom-element' });
if (namedController) {
  // Found a controller for the specific element type
} else {
  // The node is not hosting the named custom element type
}

// Search parents for a specific named custom element
const namedParentController = CustomElement.for(someInnerElement, {
  name: 'my-custom-element',
  searchParents: true
});

// Access view model properties and methods
const controller = CustomElement.for(myElement);
const viewModel = controller.viewModel;
viewModel.myProperty = 'new value';
viewModel.myMethod();

// Access lifecycle state
this.logger?.info('Current state:', controller.state);
this.logger?.info('Is activated:', controller.isActive);
```

### CustomElement.define

Registers a class as a custom element in Aurelia. This method can be called directly or is used internally by the `@customElement` decorator.

#### Method Signatures

```typescript
// Define with name and class
CustomElement.define<T>(name: string, Type: Constructable<T>): CustomElementType<T>

// Define with definition object and class
CustomElement.define<T>(def: PartialCustomElementDefinition, Type: Constructable<T>): CustomElementType<T>

// Define with definition object only (generates type)
CustomElement.define<T>(def: PartialCustomElementDefinition): CustomElementType<T>
```

#### Parameters

- `nameOrDef: string | PartialCustomElementDefinition` - Either the element name or a complete definition object
- `Type?: Constructable` - The class containing the element's logic (optional when using definition object)

#### Examples

```typescript
import { CustomElement } from 'aurelia';

// Basic definition with name and class
class MyCustomElement {
  public message = 'Hello, World!';

  public greet() {
    alert(this.message);
  }
}

CustomElement.define('my-custom-element', MyCustomElement);

// Definition with complete configuration object
const definition = {
  name: 'advanced-element',
  template: '<h1>${title}</h1><div class="content"><au-slot></au-slot></div>',
  bindables: ['title', 'size'],
  shadowOptions: { mode: 'open' },
  containerless: false,
  capture: true,
  dependencies: []
};

class AdvancedElement {
  public title = '';
  public size = 'medium';
}

CustomElement.define(definition, AdvancedElement);

// Definition without explicit type (generates anonymous class)
const simpleDefinition = {
  name: 'simple-element',
  template: '<p>${text}</p>',
  bindables: ['text']
};

const SimpleElementType = CustomElement.define(simpleDefinition);

// Note: Using @customElement decorator is preferred over calling define directly
@customElement('my-element')
class MyElement {
  // This is equivalent to calling CustomElement.define('my-element', MyElement)
}
```

### CustomElement.getDefinition

Retrieves the `CustomElementDefinition` for a custom element class, providing access to all metadata about the element.

#### Method Signature

```typescript
CustomElement.getDefinition<T>(Type: Constructable<T>): CustomElementDefinition<T>
```

#### Parameters

- `Type: Constructable` - The custom element class

#### Return Value

Returns a `CustomElementDefinition` object containing all metadata about the custom element.

#### Example

```typescript
import { CustomElement, ILogger } from 'aurelia';

@customElement({
  name: 'my-element',
  template: '${message}',
  bindables: ['message']
})
class MyElement {
  public message = '';

  constructor(private logger: ILogger) {}

  public logDefinitionInfo() {
    const definition = CustomElement.getDefinition(MyElement);

    this.logger.info('Element name:', definition.name); // 'my-element'
    this.logger.info('Template:', definition.template);
    this.logger.info('Bindables:', definition.bindables);
    this.logger.info('Is containerless:', definition.containerless);
    this.logger.info('Shadow options:', definition.shadowOptions);
    this.logger.info('Dependencies:', definition.dependencies);
    this.logger.info('Aliases:', definition.aliases);
    this.logger.info('Capture mode:', definition.capture);
  }
}
```

### CustomElement.find

Searches for a custom element definition by name within a specific container's registry.

#### Method Signature

```typescript
CustomElement.find(container: IContainer, name: string): CustomElementDefinition | null
```

#### Parameters

- `container: IContainer` - The dependency injection container to search in
- `name: string` - The name of the custom element to find

#### Return Value

Returns the `CustomElementDefinition` if found, or `null` if no element with the specified name is registered.

#### Example

```typescript
import { CustomElement, IContainer, ILogger } from 'aurelia';

// In a custom service or component
class MyService {
  constructor(private container: IContainer, private logger: ILogger) {}

  public checkElementExists(elementName: string): boolean {
    const definition = CustomElement.find(this.container, elementName);
    return definition !== null;
  }

  public getElementTemplate(elementName: string): string | null {
    const definition = CustomElement.find(this.container, elementName);
    return definition?.template as string || null;
  }
}

// Usage in template compiler or dynamic composition
class SomeComponent {
  constructor(private logger: ILogger) {}

  public checkDynamicElement(container: IContainer) {
    const definition = CustomElement.find(container, 'my-dynamic-element');
    if (definition) {
      // Element is registered and available for use
      this.logger.info('Found element:', definition.name);
    } else {
      // Element not found in current container
      this.logger.warn('Element not registered');
    }
  }
}
```

### CustomElement.isType

Checks whether a given value is a custom element type (class decorated with `@customElement` or defined via `CustomElement.define`).

#### Method Signature

```typescript
CustomElement.isType<T>(value: T): value is CustomElementType<T>
```

#### Parameters

- `value: any` - The value to check

#### Return Value

Returns `true` if the value is a custom element type, `false` otherwise.

#### Example

```typescript
import { CustomElement, customElement, ILogger } from 'aurelia';

@customElement('my-element')
class MyElement {}

class RegularClass {}

// Service class that performs type checking
class TypeCheckingService {
  constructor(private logger: ILogger) {}

  public demonstrateTypeChecking() {
    // Type checking
    this.logger.info('MyElement is custom element type:', CustomElement.isType(MyElement)); // true
    this.logger.info('RegularClass is custom element type:', CustomElement.isType(RegularClass)); // false
    this.logger.info('String is custom element type:', CustomElement.isType('string')); // false
    this.logger.info('Number is custom element type:', CustomElement.isType(42)); // false
  }

  // Usage in dynamic scenarios
  public processComponent(component: unknown) {
    if (CustomElement.isType(component)) {
      // Safe to use as custom element
      const definition = CustomElement.getDefinition(component);
      this.logger.info('Processing element:', definition.name);
    } else {
      this.logger.info('Not a custom element type');
    }
  }
}
```

## Metadata Methods

### CustomElement.annotate

Attaches metadata to a custom element class. This is typically used internally by decorators and the framework.

#### Method Signature

```typescript
CustomElement.annotate<K extends keyof PartialCustomElementDefinition>(
  Type: Constructable,
  prop: K,
  value: PartialCustomElementDefinition[K]
): void
```

#### Parameters

- `Type: Constructable` - The custom element class to annotate
- `prop: string` - The property key for the annotation
- `value: any` - The value to associate with the property

#### Example

```typescript
import { CustomElement } from 'aurelia';

class MyElement {}

// Manually annotate the class (decorators do this automatically)
CustomElement.annotate(MyElement, 'template', '${message}');
CustomElement.annotate(MyElement, 'bindables', ['message']);
CustomElement.annotate(MyElement, 'containerless', true);
```

### CustomElement.getAnnotation

Retrieves metadata that was previously attached to a custom element class.

#### Method Signature

```typescript
CustomElement.getAnnotation<K extends keyof PartialCustomElementDefinition>(
  Type: Constructable,
  prop: K
): PartialCustomElementDefinition[K] | undefined
```

#### Parameters

- `Type: Constructable` - The custom element class
- `prop: string` - The property key to retrieve

#### Return Value

Returns the annotation value, or `undefined` if not found.

#### Example

```typescript
import { CustomElement, customElement, ILogger } from 'aurelia';

@customElement({
  name: 'annotated-element',
  template: '${content}'
})
class AnnotatedElement {
  constructor(private logger: ILogger) {}

  public logAnnotations() {
    // Retrieve annotations
    const template = CustomElement.getAnnotation(AnnotatedElement, 'template');
    const bindables = CustomElement.getAnnotation(AnnotatedElement, 'bindables');

    this.logger.info('Template:', template);
    this.logger.info('Bindables:', bindables);
  }
}
```

## Utility Methods

### CustomElement.generateName

Generates a unique name for a custom element, useful for anonymous or dynamically created elements.

#### Method Signature

```typescript
CustomElement.generateName(): string
```

#### Return Value

A string representing a unique name (typically in the format `unnamed-{number}`).

#### Example

```typescript
import { CustomElement } from 'aurelia';

// Generate unique names for dynamic elements
const uniqueName1 = CustomElement.generateName(); // 'unnamed-1'
const uniqueName2 = CustomElement.generateName(); // 'unnamed-2'

// Use with dynamic element creation
class DynamicElement {
  public data = '';
}

const DynamicElementType = CustomElement.define(uniqueName1, DynamicElement);
```

### CustomElement.generateType

Dynamically generates a `CustomElementType` with a given name and prototype properties.

#### Method Signature

```typescript
CustomElement.generateType<P extends object = object>(
  name: string,
  proto?: P
): CustomElementType<Constructable<P>>
```

#### Parameters

- `name: string` - The name for the generated type
- `proto?: object` - An optional object containing properties and methods to add to the prototype

#### Return Value

A `CustomElementType` that can be used with `CustomElement.define`.

#### Example

```typescript
import { CustomElement } from 'aurelia';

// Generate a type with custom properties and methods
const DynamicElement = CustomElement.generateType('dynamic-element', {
  message: 'Hello from Dynamic Element!',
  count: 0,

  increment() {
    this.count++;
  },

  showMessage() {
    alert(`${this.message} Count: ${this.count}`);
  }
});

// Define the generated type
CustomElement.define('dynamic-element', DynamicElement);

// Usage in templates: <dynamic-element></dynamic-element>
```

### CustomElement.createInjectable

Creates an `InjectableToken` for dependency injection scenarios.

#### Method Signature

```typescript
CustomElement.createInjectable<T = any>(): InterfaceSymbol<T>
```

#### Return Value

An `InterfaceSymbol` that can be used as a dependency injection token.

#### Example

```typescript
import { CustomElement, resolve } from 'aurelia';

// Create injectable tokens for custom scenarios
const MyServiceToken = CustomElement.createInjectable<MyService>();

// Use in dependency injection
class MyElement {
  private service = resolve(MyServiceToken);
}
```

### CustomElement.keyFrom

Generates the registry key used internally to store and retrieve custom element definitions.

#### Method Signature

```typescript
CustomElement.keyFrom(name: string): string
```

#### Parameters

- `name: string` - The custom element name

#### Return Value

A string representing the internal registry key.

#### Example

```typescript
import { CustomElement, ILogger } from 'aurelia';

class KeyGeneratorService {
  constructor(private logger: ILogger) {}

  public demonstrateKeyGeneration() {
    const key = CustomElement.keyFrom('my-element');
    this.logger.info(key); // 'au:ce:my-element' (internal format)

    // Used internally for container registration/lookup
    const hasElement = container.has(CustomElement.keyFrom('my-element'));
  }
}
```

## Decorators

### @customElement Decorator

The primary decorator for marking a class as a custom element.

#### Syntax

```typescript
@customElement(name: string)
@customElement(definition: PartialCustomElementDefinition)
```

#### Examples

```typescript
import { customElement } from 'aurelia';

// Simple name-based definition
@customElement('hello-world')
class HelloWorld {
  public message = 'Hello, World!';
}

// Full definition object
@customElement({
  name: 'advanced-component',
  template: `
    <h1>\${title}</h1>
    <div class="content">
      <au-slot></au-slot>
    </div>
  `,
  bindables: ['title', 'theme'],
  shadowOptions: { mode: 'open' },
  dependencies: []
})
class AdvancedComponent {
  public title = '';
  public theme = 'light';
}
```

### @useShadowDOM Decorator

Enables Shadow DOM for the custom element.

#### Syntax

```typescript
@useShadowDOM(options?: { mode: 'open' | 'closed' })
```

#### Example

```typescript
import { customElement, useShadowDOM } from 'aurelia';

@customElement('shadow-element')
@useShadowDOM({ mode: 'open' })
class ShadowElement {
  // This element will render in Shadow DOM
}

// Or with default mode (open)
@customElement('shadow-element-simple')
@useShadowDOM()
class ShadowElementSimple {}
```

### @containerless Decorator

Renders the custom element without its element container.

#### Syntax

```typescript
@containerless()
@containerless(target: Constructable, context: ClassDecoratorContext)
```

#### Example

```typescript
import { customElement, containerless } from 'aurelia';

@customElement('invisible-wrapper')
@containerless()
class InvisibleWrapper {
  // This element won't create its own DOM node
  // Only its content will be rendered
}

// Usage: <invisible-wrapper>content</invisible-wrapper>
// Renders: content (without the wrapper element)
```

### @capture Decorator

Enables capturing of all attributes and bindings that are not explicitly defined as bindables or template controllers.

#### Syntax

```typescript
@capture()
@capture(filter: (attr: string) => boolean)
```

#### Example

```typescript
import { customElement, capture } from 'aurelia';

@customElement('flexible-element')
@capture() // Capture all unrecognized attributes
class FlexibleElement {
  // Any attribute not defined as bindable will be captured
}

@customElement('filtered-element')
@capture((attrName) => attrName.startsWith('data-'))
class FilteredElement {
  // Only capture attributes that start with 'data-'
}
```

### @processContent Decorator

Defines a hook that processes the element's content before compilation.

#### Syntax

```typescript
@processContent(hook: ProcessContentHook)
@processContent(methodName: string | symbol)
@processContent() // Decorator for static method
```

#### Example

```typescript
import { customElement, processContent, IPlatform } from 'aurelia';

@customElement('content-processor')
class ContentProcessor {
  @processContent()
  static processContent(node: HTMLElement, platform: IPlatform): boolean | void {
    // Modify the element's content before compilation
    const children = Array.from(node.children);
    children.forEach(child => {
      if (child.tagName === 'SPECIAL') {
        child.setAttribute('processed', 'true');
      }
    });
    return true; // Continue with normal compilation
  }
}

// Or reference a method by name
@customElement('named-processor')
@processContent('customProcessor')
class NamedProcessor {
  static customProcessor(node: HTMLElement, platform: IPlatform): boolean | void {
    // Process content
    return true;
  }
}
```

## Definition Objects

### PartialCustomElementDefinition

An object that describes a custom element's configuration. All properties are optional.

#### Properties

```typescript
interface PartialCustomElementDefinition {
  name?: string;                    // Element name (kebab-case)
  template?: string | Node | null;  // HTML template
  bindables?: string[] | object;    // Bindable properties
  dependencies?: any[];             // Required dependencies
  aliases?: string[];               // Alternative names
  containerless?: boolean;          // Render without container
  shadowOptions?: { mode: 'open' | 'closed' } | null; // Shadow DOM options
  hasSlots?: boolean;              // Has <au-slot> elements
  capture?: boolean | ((attr: string) => boolean); // Capture unbound attributes
  enhance?: boolean;               // Enhance existing DOM
  instructions?: any[][];          // Template instructions
  surrogates?: any[];             // Surrogate instructions
  needsCompile?: boolean;         // Requires compilation
  injectable?: any;               // DI token
  watches?: any[];               // Property watchers
  strict?: boolean;              // Strict binding mode
  processContent?: Function;     // Content processing hook
}
```

#### Example

```typescript
const elementDefinition: PartialCustomElementDefinition = {
  name: 'my-component',
  template: `
    <h1>\${title}</h1>
    <p class="description">\${description}</p>
    <div class="actions">
      <au-slot name="actions"></au-slot>
    </div>
  `,
  bindables: ['title', 'description'],
  shadowOptions: { mode: 'open' },
  containerless: false,
  hasSlots: true,
  capture: false,
  dependencies: [],
  aliases: ['my-comp']
};
```

### CustomElementDefinition

The complete, resolved definition of a custom element (read-only).

#### Key Properties

```typescript
interface CustomElementDefinition {
  readonly Type: CustomElementType;      // The element class
  readonly name: string;                 // Element name
  readonly template: string | Node | null; // Compiled template
  readonly bindables: Record<string, BindableDefinition>; // Resolved bindables
  readonly aliases: string[];            // Alternative names
  readonly key: string;                  // Registry key
  readonly containerless: boolean;       // Container rendering mode
  readonly shadowOptions: { mode: 'open' | 'closed' } | null; // Shadow DOM
  readonly hasSlots: boolean;           // Contains slots
  readonly capture: boolean | Function; // Attribute capturing
  readonly enhance: boolean;            // DOM enhancement mode
  readonly dependencies: any[];         // Required dependencies
  readonly instructions: any[][];       // Template instructions
  readonly surrogates: any[];          // Surrogate instructions
  readonly needsCompile: boolean;      // Compilation requirement
  readonly watches: any[];             // Property watchers
  readonly strict: boolean | undefined; // Strict binding mode
  readonly processContent: Function | null; // Content processor
}
```

## Programmatic Resource Aliases

`PartialCustomElementDefinition.aliases` is only one way to expose alternative names. For reusable libraries or bridge packages you often need to add aliases outside of the definition itself. The runtime provides two helpers to make that ergonomic.

### `alias(...aliases)` decorator

Apply the decorator directly to any custom element, custom attribute, value converter, or binding behavior to append aliases to the resource metadata.

```typescript
import { alias, customElement } from '@aurelia/runtime-html';

@alias('counter-panel', 'stats-card')
@customElement({
  name: 'au-counter',
  template: `
    <section class="counter">
      <h2>\${title}</h2>
      <slot></slot>
    </section>
  `
})
export class CounterPanel {
  title = 'Visitors';
}
```

The decorator merges with aliases declared via the definition object, so you can sprinkle default aliases in a base class and extend them in derived implementations without clobbering earlier metadata.

### `registerAliases(...)`

When you need to attach aliases to an existing resource (for example, to keep backwards compatibility after a rename), call `registerAliases` during app startup.

```typescript
import { AppTask, CustomElement, registerAliases } from '@aurelia/runtime-html';
import { IContainer } from '@aurelia/kernel';

export const LegacyCounterAliases = AppTask.creating(IContainer, container => {
  const definition = CustomElement.getDefinition(CounterPanel);
  registerAliases(['legacy-counter', 'legacy-panel'], CustomElement, definition.key, container);
});
```

The `resource` argument identifies which registry to update. Pass `CustomElement`, `CustomAttribute`, `ValueConverter`, or `BindingBehavior` depending on the resource you are aliasing. Because aliases are registered against the supplied container you can scope them to individual feature modules or make them global by running the task in your root configuration.

## Best Practices

### 1. Use Decorators Over Direct API Calls

```typescript
// Preferred
@customElement('my-element')
class MyElement {}

// Avoid unless in dynamic scenarios
CustomElement.define('my-element', MyElement);
```

### 2. Type Your Controllers

```typescript
interface MyElementViewModel {
  title: string;
  count: number;
  increment(): void;
}

const controller = CustomElement.for<MyElementViewModel>(element);
controller.viewModel.increment(); // Fully typed
```

### 3. Handle Errors Gracefully

```typescript
// Use optional flag when controller might not exist
const controller = CustomElement.for(element, { optional: true });
if (controller) {
  // Safe to use
} else {
  // Handle missing controller
}
```

### 4. Leverage Definition Objects for Complex Elements

```typescript
@customElement({
  name: 'complex-element',
  template: complexTemplate,
  shadowOptions: { mode: 'open' },
  bindables: ['data', 'config'],
  dependencies: [SomeService, AnotherDependency]
})
class ComplexElement {}
```
