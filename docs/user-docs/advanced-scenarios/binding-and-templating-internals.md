---
description: Deep dive into Aurelia's binding system, template compilation pipeline, and rendering architecture for framework contributors and advanced plugin authors.
---

# Binding and Templating Internals

Understand how Aurelia's binding and templating system works under the hood. This guide covers the compilation pipeline, binding lifecycle, observation strategies, and rendering architecture—essential knowledge for framework contributors, plugin authors, and developers debugging complex binding scenarios.

## Audience

This guide is for:
- **Framework contributors** - Understanding the codebase
- **Plugin authors** - Extending the compiler or runtime
- **Advanced developers** - Debugging complex binding issues
- **Performance optimizers** - Understanding cost of bindings

## Architecture Overview

```
┌─────────────────┐
│  Template HTML  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Template Parser │  (HTMLParser)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Compilation   │  (TemplateCompiler)
│   - Parse       │
│   - Analyze     │
│   - Generate    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Instructions   │  (Binding, Listener, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Rendering     │  (Renderer)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Live Bindings  │  (Binding, Listener, etc.)
│  + Observers    │
└─────────────────┘
```

## Part 1: Template Compilation

### Phase 1: HTML Parsing

Aurelia uses the browser's native HTML parser wrapped in `HTMLParser`:

```typescript
// packages/template-compiler/src/html-parser.ts
export class HTMLParser {
  parse(markup: string): DocumentFragment {
    const template = document.createElement('template');
    template.innerHTML = markup;
    return template.content;
  }
}
```

**Key Points:**
- Uses native `<template>` element
- Parses into DocumentFragment
- Preserves DOM structure exactly
- No virtual DOM involved

### Phase 2: Template Compilation

The `TemplateCompiler` walks the DOM and generates instructions:

```typescript
// Simplified compilation flow
export class TemplateCompiler {
  compile(definition: PartialResourceDefinition): ResourceDefinition {
    // 1. Parse template into DOM
    const fragment = this.parser.parse(definition.template);

    // 2. Walk DOM tree
    const instructions = this.compileNode(fragment);

    // 3. Return compiled definition
    return {
      ...definition,
      instructions,
      template: fragment
    };
  }

  private compileNode(node: Node): IInstruction[] {
    const instructions: IInstruction[] = [];

    // Check for custom elements
    const elementDefinition = this.resources.find(CustomElement, node.nodeName);
    if (elementDefinition) {
      instructions.push(new HydrateElementInstruction(elementDefinition));
    }

    // Check for custom attributes
    for (const attr of node.attributes) {
      const attrDefinition = this.resources.find(CustomAttribute, attr.name);
      if (attrDefinition) {
        instructions.push(new HydrateAttributeInstruction(attrDefinition));
      }
    }

    // Process bindings
    for (const attr of node.attributes) {
      const command = this.parseCommand(attr);
      if (command) {
        const instruction = command.build(attr, this.parser);
        instructions.push(instruction);
      }
    }

    // Recurse to children
    for (const child of node.childNodes) {
      instructions.push(...this.compileNode(child));
    }

    return instructions;
  }
}
```

### Phase 3: Instruction Generation

Instructions are data structures describing what to create at runtime:

```typescript
// Property binding instruction
export class PropertyBindingInstruction {
  constructor(
    public from: IExpression,    // Source expression
    public to: string,            // Target property
    public mode: BindingMode      // oneTime, toView, twoWay, etc.
  ) {}
}

// Listener binding instruction
export class ListenerBindingInstruction {
  constructor(
    public from: IExpression,    // Handler expression
    public to: string,            // Event name
    public strategy: EventStrategy  // None, Capturing, etc.
  ) {}
}

// Interpolation instruction
export class InterpolationInstruction {
  constructor(
    public expressions: IExpression[],  // Expressions to interpolate
    public parts: string[]               // Static string parts
  ) {}
}
```

**Instruction Types:**
- `PropertyBindingInstruction` - `.bind`, `.one-way`, `.two-way`
- `ListenerBindingInstruction` - `.trigger`, `.capture`
- `RefBindingInstruction` - `ref` attribute
- `IteratorBindingInstruction` - `repeat.for`
- `HydrateElementInstruction` - Custom elements
- `HydrateAttributeInstruction` - Custom attributes
- `Interpolation Instruction` - `${expression}`

## Part 2: Expression Parsing

### Expression Parser

Converts strings to Abstract Syntax Trees (AST):

```typescript
// Example: "user.name | uppercase"
const ast = parser.parse("user.name | uppercase", "IsProperty");

// Results in AST:
{
  type: 'ValueConverter',
  expression: {
    type: 'AccessScope',
    name: 'user',
    ancestor: 0
  },
  name: 'uppercase',
  args: []
}
```

### Expression Types

```typescript
// Access member: obj.prop
export class AccessMember {
  constructor(
    public object: IExpression,
    public name: string
  ) {}

  evaluate(scope: IScope) {
    const obj = this.object.evaluate(scope);
    return obj?.[this.name];
  }
}

// Access scope: variableName
export class AccessScope {
  constructor(
    public name: string,
    public ancestor: number = 0
  ) {}

  evaluate(scope: IScope) {
    let currentScope = scope;
    for (let i = 0; i < this.ancestor; i++) {
      currentScope = currentScope.parentScope;
    }
    return currentScope.bindingContext[this.name];
  }
}

// Binary operation: a + b
export class Binary {
  constructor(
    public operation: string,
    public left: IExpression,
    public right: IExpression
  ) {}

  evaluate(scope: IScope) {
    const left = this.left.evaluate(scope);
    const right = this.right.evaluate(scope);
    switch (this.operation) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      // ... etc
    }
  }
}
```

### Binding Modes

```typescript
export const enum BindingMode {
  oneTime = 0,    // Evaluate once, never update
  toView = 1,     // Source → Target only
  fromView = 2,   // Target → Source only
  twoWay = 3,     // Source ↔ Target
  default = 4     // Let target decide
}
```

## Part 3: Rendering & Hydration

### Renderer

Converts instructions into live bindings:

```typescript
export class Renderer {
  render(
    controller: IController,
    targets: ArrayLike<INode>,
    instructions: IInstruction[]
  ): void {
    for (const instruction of instructions) {
      this.renderInstruction(controller, targets, instruction);
    }
  }

  private renderInstruction(
    controller: IController,
    targets: ArrayLike<INode>,
    instruction: IInstruction
  ): void {
    switch (instruction.type) {
      case 'PropertyBinding':
        this.renderPropertyBinding(controller, targets, instruction);
        break;
      case 'ListenerBinding':
        this.renderListenerBinding(controller, targets, instruction);
        break;
      // ... other types
    }
  }

  private renderPropertyBinding(
    controller: IController,
    targets: ArrayLike<INode>,
    instruction: PropertyBindingInstruction
  ): void {
    const target = targets[instruction.targetNodeIndex];
    const binding = new PropertyBinding(
      instruction.from,
      target,
      instruction.to,
      instruction.mode,
      controller.container.get(IObserverLocator)
    );
    controller.addBinding(binding);
  }
}
```

### Binding Lifecycle

```typescript
export class PropertyBinding {
  constructor(
    private sourceExpression: IExpression,
    private target: any,
    private targetProperty: string,
    private mode: BindingMode,
    private observerLocator: IObserverLocator
  ) {}

  $bind(scope: IScope) {
    this.scope = scope;

    // Get source observer
    if (this.mode & BindingMode.toView) {
      this.sourceExpression.connect(this, scope);
    }

    // Get target observer
    if (this.mode & BindingMode.fromView) {
      this.targetObserver = this.observerLocator.getObserver(
        this.target,
        this.targetProperty
      );
      this.targetObserver.subscribe(this);
    }

    // Initial update
    if (this.mode !== BindingMode.fromView) {
      this.updateTarget(this.sourceExpression.evaluate(scope));
    }
  }

  $unbind() {
    this.scope = null;
    this.sourceExpression.disconnect(this);
    this.targetObserver?.unsubscribe(this);
  }

  // Called when source changes
  handleChange(newValue: unknown) {
    if (this.mode & BindingMode.toView) {
      this.updateTarget(newValue);
    }
  }

  // Called when target changes
  handleTargetChange(newValue: unknown) {
    if (this.mode & BindingMode.fromView) {
      this.sourceExpression.assign(this.scope, newValue);
    }
  }

  private updateTarget(value: unknown) {
    this.target[this.targetProperty] = value;
  }
}
```

## Part 4: Observation System

### Observer Types

#### PropertyObserver (Plain Objects)

```typescript
export class PropertyObserver {
  private subscribers: ISubscriber[] = [];
  private currentValue: unknown;

  constructor(
    private obj: object,
    private propertyKey: string
  ) {
    this.currentValue = obj[propertyKey];
    this.createGetterSetter();
  }

  private createGetterSetter() {
    const { obj, propertyKey, currentValue } = this;

    Object.defineProperty(obj, propertyKey, {
      enumerable: true,
      configurable: true,
      get: () => {
        return this.currentValue;
      },
      set: (newValue: unknown) => {
        if (newValue !== this.currentValue) {
          const oldValue = this.currentValue;
          this.currentValue = newValue;
          this.notify(newValue, oldValue);
        }
      }
    });
  }

  subscribe(subscriber: ISubscriber) {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber: ISubscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  private notify(newValue: unknown, oldValue: unknown) {
    for (const subscriber of this.subscribers) {
      subscriber.handleChange(newValue, oldValue);
    }
  }
}
```

#### SetterObserver (Dirty Checking)

```typescript
// For properties that can't use getters/setters
export class SetterObserver {
  private subscribers: ISubscriber[] = [];
  private oldValue: unknown;

  constructor(
    private obj: object,
    private propertyKey: string
  ) {
    this.oldValue = obj[propertyKey];
  }

  getValue() {
    return this.obj[this.propertyKey];
  }

  setValue(newValue: unknown) {
    this.obj[this.propertyKey] = newValue;
  }

  // Called by scheduler
  flushChanges() {
    const newValue = this.getValue();
    if (newValue !== this.oldValue) {
      const oldValue = this.oldValue;
      this.oldValue = newValue;
      this.notify(newValue, oldValue);
    }
  }
}
```

#### ArrayObserver

```typescript
export class ArrayObserver {
  private subscribers: ISubscriber[] = [];

  constructor(private array: any[]) {
    this.wrapMutatorMethods();
  }

  private wrapMutatorMethods() {
    const proto = Array.prototype;
    const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];

    for (const method of methods) {
      this.array[method] = (...args: any[]) => {
        const result = proto[method].apply(this.array, args);
        this.notify({
          type: 'splice',
          object: this.array,
          index: 0,  // Varies by method
          removed: [],
          addedCount: args.length
        });
        return result;
      };
    }
  }

  subscribe(subscriber: ISubscriber) {
    this.subscribers.push(subscriber);
  }

  private notify(changeRecord: IArrayChangeRecord) {
    for (const subscriber of this.subscribers) {
      subscriber.handleChange(changeRecord);
    }
  }
}
```

### ObserverLocator

Central registry for creating observers:

```typescript
export class ObserverLocator {
  getObserver(obj: any, propertyKey: string): IObserver {
    // Check for existing observer
    let observer = this.getExistingObserver(obj, propertyKey);
    if (observer) {
      return observer;
    }

    // Create new observer based on object type
    if (obj instanceof Node) {
      observer = this.createElementObserver(obj, propertyKey);
    } else if (Array.isArray(obj)) {
      observer = this.createArrayObserver(obj);
    } else if (typeof obj === 'object') {
      observer = this.createPropertyObserver(obj, propertyKey);
    } else {
      throw new Error(`Cannot observe ${typeof obj}`);
    }

    this.cacheObserver(obj, propertyKey, observer);
    return observer;
  }
}
```

## Part 5: Change Detection & Scheduling

### Observation Strategies

#### Proxy-Based (Default)

```typescript
// Wrap objects in Proxy for automatic observation
const proxy = new Proxy(obj, {
  get(target, key) {
    trackAccess(target, key);  // Record dependency
    return Reflect.get(target, key);
  },
  set(target, key, value) {
    const result = Reflect.set(target, key, value);
    notifyChange(target, key, value);  // Trigger updates
    return result;
  }
});
```

#### Getter/Setter-Based

```typescript
// Define getters/setters on first access
Object.defineProperty(obj, 'name', {
  get() { return this._name; },
  set(value) {
    if (this._name !== value) {
      this._name = value;
      notifyObservers('name', value);
    }
  }
});
```

## Part 6: Performance Characteristics

### Binding Costs

| Binding Type | Compile Time | Runtime Setup | Per-Update Cost |
|--------------|--------------|---------------|-----------------|
| One-Time | Low | None | Zero |
| To-View | Low | Low | Low |
| Two-Way | Low | Medium | Medium |
| Interpolation | Medium | Low | Low |
| Repeat | High | High | High |

### Observation Costs

| Strategy | Memory | CPU (Setup) | CPU (Update) |
|----------|--------|-------------|--------------|
| Proxy | Low | Low | Very Low |
| Getter/Setter | Medium | Medium | Low |
| Dirty Checking | Low | Low | High |

## Part 7: Debugging Techniques

### Enable Debug Mode

```typescript
import { Aurelia } from 'aurelia';
import { DebugConfiguration } from '@aurelia/debug';

Aurelia
  .register(DebugConfiguration)
  .app(MyApp)
  .start();
```

### Inspect Bindings

```typescript
// In browser console
const controller = au.controllers.find(MyComponent);
console.log(controller.bindings);  // List all bindings

// Inspect specific binding
const binding = controller.bindings[0];
console.log({
  source: binding.sourceExpression,
  target: binding.target,
  mode: binding.mode,
  scope: binding.scope
});
```

### Trace Observations

```typescript
import { IObserverLocator } from 'aurelia';

const locator = container.get(IObserverLocator);
const originalGetObserver = locator.getObserver;

locator.getObserver = function(obj, key) {
  console.log(`Observing: ${obj.constructor.name}.${key}`);
  return originalGetObserver.call(this, obj, key);
};
```

### Profile Bindings

```typescript
// Count binding updates
let updateCount = 0;
const originalUpdateTarget = PropertyBinding.prototype.updateTarget;

PropertyBinding.prototype.updateTarget = function(value) {
  updateCount++;
  console.log(`Update #${updateCount}:`, this.targetProperty, '=', value);
  return originalUpdateTarget.call(this, value);
};
```

## Part 8: Plugin Development

### Custom Binding Command

```typescript
import { bindingCommand } from '@aurelia/template-compiler';
import { PropertyBindingInstruction } from '@aurelia/runtime-html';

@bindingCommand('throttle')
export class ThrottleBindingCommand {
  public get ignoreAttr(): boolean {
    return false;
  }

  public build(info, parser) {
    const expr = parser.parse(info.attr.rawValue, 'IsProperty');

    // Wrap expression with throttling logic
    const throttledExpr = {
      ...expr,
      evaluate(scope, binding) {
        return throttle(() => expr.evaluate(scope, binding), 300);
      }
    };

    return new PropertyBindingInstruction(
      throttledExpr,
      info.attr.target,
      'toView'
    );
  }
}
```

### Custom Observer

```typescript
export class LocalStorageObserver {
  private value: string;
  private subscribers: ISubscriber[] = [];

  constructor(private key: string) {
    this.value = localStorage.getItem(key) ?? '';
    window.addEventListener('storage', this.handleStorageChange);
  }

  getValue() {
    return this.value;
  }

  setValue(newValue: string) {
    if (newValue !== this.value) {
      this.value = newValue;
      localStorage.setItem(this.key, newValue);
      this.notify(newValue);
    }
  }

  private handleStorageChange = (e: StorageEvent) => {
    if (e.key === this.key && e.newValue !== this.value) {
      this.value = e.newValue ?? '';
      this.notify(this.value);
    }
  };

  subscribe(subscriber: ISubscriber) {
    this.subscribers.push(subscriber);
  }

  private notify(newValue: string) {
    for (const subscriber of this.subscribers) {
      subscriber.handleChange(newValue);
    }
  }

  dispose() {
    window.removeEventListener('storage', this.handleStorageChange);
  }
}
```

## Resources

- [Template Compiler Source](https://github.com/aurelia/aurelia/tree/master/packages/template-compiler)
- [Runtime Source](https://github.com/aurelia/aurelia/tree/master/packages/runtime)
- [Runtime HTML Source](https://github.com/aurelia/aurelia/tree/master/packages/runtime-html)
- [Expression Parser](https://github.com/aurelia/aurelia/tree/master/packages/expression-parser)
- [Extending the Binding Engine](extending-the-binding-engine.md)
- [Extending the Template Compiler](extending-the-template-compiler.md)

## Contributing

If you're interested in contributing to Aurelia's core:
1. Read the [Contributing Guide](https://github.com/aurelia/aurelia/blob/master/CONTRIBUTING.md)
2. Join the [Discord](https://discord.gg/RBtyM6u)
3. Check [Good First Issues](https://github.com/aurelia/aurelia/labels/good%20first%20issue)
