---
description: Explore how Aurelia's compiler turns templates into instructions and how the runtime executes them.
---

# Framework Internals: Understanding Aurelia's Instruction System

> This deep dive assumes you're comfortable with Aurelia's binding and component model. Bookmark it for debugging and tooling work.

Aurelia's instruction system is the bridge between template compilation and runtime execution. Templates compile to instruction objects that describe exactly what bindings and components to create, then renderers interpret these instructions to build the actual DOM bindings and component instances.

## From Template to Runtime

Let's follow a simple template through the complete pipeline:

### Template
```html
<my-element value.bind="name" click.trigger="doSomething()">
  <p>${message}</p>
</my-element>
```

### Compilation Phase
The template compiler processes this into instruction arrays:

```typescript
const instructions = [
  [ // Instructions for <my-element>
    new HydrateElementInstruction(
      'my-element',                    // Element name/definition
      [                               // Property instructions
        new PropertyBindingInstruction('name', 'value', BindingMode.toView),
        new ListenerBindingInstruction('doSomething()', 'click', false, null)
      ],
      null,                           // Projections
      false,                          // Containerless
      [],                             // Captures
      {}                              // Data
    )
  ],
  [ // Instructions for <p> inside my-element
    new InterpolationInstruction('message', 'textContent')
  ]
];
```

### Runtime Phase
At runtime, renderers execute these instructions:

1. **CustomElementRenderer** creates the `my-element` component instance
2. **PropertyBindingRenderer** creates a binding from `name` to the `value` property
3. **ListenerBindingRenderer** creates a click event listener
4. **InterpolationRenderer** creates a text binding for `${message}`

All bindings are added to the component's controller and activated during the binding lifecycle.

## Instruction Types and What They Do

### Component Creation
- **`hydrateElement`** - Creates custom element instances
- **`hydrateAttribute`** - Creates custom attribute instances  
- **`hydrateTemplateController`** - Creates template controllers (`if`, `repeat`, etc.)

### Data Binding
- **`propertyBinding`** - Property bindings (`.bind`, `.two-way`, etc.)
- **`interpolation`** - Text interpolation `${...}`
- **`attributeBinding`** - Attribute bindings (`.attr`)
- **`stylePropertyBinding`** - Style bindings (`.style`)

### Event Handling
- **`listenerBinding`** - Event listeners (`.trigger`, `.delegate`, `.capture`)

### Static Values  
- **`setProperty`** - Static property values
- **`setAttribute`** - Static attribute values
- **`setClassAttribute`** - Static class values

### Advanced Features
- **`refBinding`** - Reference bindings (`ref` attribute)
- **`letBinding`** - Let bindings (`let` element)
- **`iteratorBinding`** - Iterator bindings (for `repeat`)

## Debugging with Instructions

### Inspecting Compiled Instructions
You can examine compiled instructions in the browser devtools:

```typescript
// In a component's constructor or attached() lifecycle
export class MyComponent {
  constructor() {
    // Access the compiled definition
    const definition = CustomElement.getDefinition(this.constructor);
    console.log('Compiled instructions:', definition.instructions);
  }
}
```

### Understanding Instruction Arrays
Instructions are organized as arrays where each array corresponds to a DOM target:

```typescript
// instructions[0] = instructions for the first target element
// instructions[1] = instructions for the second target element
// etc.
```

### Debugging Binding Issues
When bindings don't work as expected:

1. Check what instructions were generated
2. Verify the instruction properties match your template
3. Look for missing or incorrect binding modes
4. Check if custom elements/attributes were resolved properly

```typescript
// Example: Debug why a binding isn't working
const instructions = definition.instructions[0]; // First target
const propertyBinding = instructions.find(i => i.type === 'rg'); // propertyBinding type
console.log('Binding from:', propertyBinding.from);
console.log('Binding to:', propertyBinding.to);
console.log('Binding mode:', propertyBinding.mode);
```

## Common Template Patterns

### Basic Property Binding
```html
<input value.bind="name">
```
Compiles to:
```typescript
new PropertyBindingInstruction('name', 'value', BindingMode.twoWay)
```

### Event Binding
```html
<button click.trigger="save()">Save</button>
```
Compiles to:
```typescript
new ListenerBindingInstruction('save()', 'click', false, null)
```

### String Interpolation
```html
<span>${firstName} ${lastName}</span>
```
Compiles to:
```typescript
new InterpolationInstruction('`${firstName} ${lastName}`', 'textContent')
```

### Custom Element with Bindables
```html
<user-card name.bind="user.name" age.bind="user.age"></user-card>
```
Compiles to:
```typescript
new HydrateElementInstruction(
  'user-card',
  [
    new PropertyBindingInstruction('user.name', 'name', BindingMode.toView),
    new PropertyBindingInstruction('user.age', 'age', BindingMode.toView)
  ],
  null, false, [], {}
)
```

### Template Controller (Repeater)
```html
<div repeat.for="item of items">${item.name}</div>
```
Compiles to:
```typescript
new HydrateTemplateController(
  definition,  // Template controller definition
  'repeat',    // Resource name or definition
  undefined,   // Alias
  [new IteratorBindingInstruction('item of items', 'items', [])]
)
```

## Extending the System

### Creating Custom Instructions
For advanced scenarios, you can create custom instruction types:

```typescript
export class CustomInstruction {
  public static readonly type = 'my-custom-instruction';
  
  constructor(
    public readonly config: any,
    public readonly target: string
  ) {}
}
```

### Creating Custom Renderers
Custom renderers interpret your custom instructions:

```typescript
import { renderer } from '@aurelia/runtime-html';

export const CustomRenderer = renderer(class {
  public readonly target = 'my-custom-instruction';
  
  public render(
    renderingCtrl: IHydratableController,
    target: unknown,
    instruction: CustomInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    // Your custom rendering logic
    const binding = new CustomBinding(/* ... */);
    renderingCtrl.addBinding(binding);
  }
});
```

### Registering Custom Renderers
Register your renderer during app startup:

```typescript
import Aurelia from 'aurelia';
import { CustomRenderer } from './custom-renderer';

Aurelia
  .register(CustomRenderer)
  .app(App)
  .start();
```

## Resource Registration and Discovery

Before instructions can reference resources like custom elements, Aurelia needs to discover and register them. The framework supports multiple registration patterns.

### Resource Registration Patterns

#### Decorator-Based Registration
```typescript
@customElement('user-card')
export class UserCard {
  @bindable name: string;
  @bindable age: number;
}
```

The decorator automatically:
1. Creates a resource definition with metadata
2. Registers the resource in the DI container with key: `"au:resource:custom-element:user-card"`
3. Stores the definition for later compilation use

#### Static `$au` Property Registration
```typescript
export class UserCard {
  static readonly $au: CustomElementStaticAuDefinition = {
    type: 'custom-element',
    name: 'user-card',
    bindables: {
      name: { mode: BindingMode.toView },
      age: { mode: BindingMode.toView }
    }
  };
}
```

#### Convention-Based Registration
With the conventions plugin, file names automatically determine resource names:
```
src/components/user-card.ts → resource name: "user-card"
src/components/userName.ts   → resource name: "user-name"
```

### Resource Resolution During Compilation

When the template compiler encounters `<user-card>`, it:

1. **Looks up the resource** using `CustomElement.find(container, 'user-card')`
2. **Resolves the definition** from the DI container key `"au:resource:custom-element:user-card"`
3. **Creates instruction** with either the resource name string or the resolved definition
4. **Caches the result** to avoid repeated lookups

```typescript
// Template compiler resource resolution
export class ResourceResolver {
  public el(container: IContainer, name: string): CustomElementDefinition | null {
    // Check cache first, then resolve from container
    return this._cache[name] ?? (this._cache[name] = CustomElement.find(container, name));
  }
}
```

### Resource Resolution During Runtime

At runtime, the CustomElementRenderer processes `HydrateElementInstruction`:

```typescript
export const CustomElementRenderer = renderer(class {
  public render(/* ... */, instruction: HydrateElementInstruction) {
    // Resolve resource definition if not already resolved
    const definition = instruction.def ?? 
      renderingCtrl.container.find(CustomElement, instruction.res);
    
    // Create component instance using DI
    const component = renderingCtrl.container.invoke(definition.Type);
    
    // Create controller and add to hierarchy
    const controller = Controller.createForCustomElement(/* ... */);
    renderingCtrl.addChild(controller);
  }
});
```

### Container Hierarchy and Resource Scope

Resources are registered in DI containers, which form hierarchies:

```typescript
// Root container - global resources
const rootContainer = DI.createContainer();
rootContainer.register(GlobalButton, GlobalModal);

// Child container - page-specific resources  
const pageContainer = rootContainer.createChild();
pageContainer.register(PageSpecificCard);

// Component container - component-specific resources
const componentContainer = pageContainer.createChild();
```

Resource resolution follows the hierarchy:
1. Check current container
2. Check parent containers up to root
3. Return null if not found

### Debugging Resource Registration

Check what resources are registered:

```typescript
// In a component
export class MyComponent {
  constructor(private container: IContainer) {
    // Check if a resource is registered
    const definition = this.container.find(CustomElement, 'user-card');
    console.log('UserCard registered:', definition !== null);
    
    // Access registration details
    if (definition) {
      console.log('Resource key:', definition.key);
      console.log('Resource type:', definition.Type);
      console.log('Bindables:', definition.bindables);
    }
  }
}
```

### Resource Registration Best Practices

1. **Use decorators for explicit control** over resource configuration
2. **Use static `$au` properties** when decorators aren't suitable (e.g., plain classes)
3. **Use conventions** for rapid development with consistent naming
4. **Register global resources** at app startup in `main.ts`
5. **Register page-specific resources** in route components or modules

Understanding Aurelia's instruction system and resource registration gives you deeper insight into how templates become living, reactive UIs and provides the foundation for advanced framework extensions.
