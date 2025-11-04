---
description: Learn how to extend Aurelia's binding language with custom binding commands, attribute patterns, and template syntax extensions.
---

# Extending the Binding Engine

Aurelia's binding system is powerful and extensible by design. This advanced scenario teaches you how to create custom binding commands (like `.bind`, `.trigger`), define attribute patterns, and extend the template compiler to add your own domain-specific syntax to Aurelia templates.

## Why This Is an Advanced Scenario

Extending the binding engine requires deep understanding of:
- **Template compilation** - How Aurelia parses and compiles templates
- **Binding instructions** - Low-level directives that drive the rendering pipeline
- **Attribute patterns** - How Aurelia recognizes and categorizes attributes
- **Expression parsing** - AST manipulation and custom expression types
- **Rendering pipeline** - How instructions become live bindings
- **Framework internals** - Runtime architecture and lifecycle hooks

Use cases for binding engine extensions:
- **Custom DSLs** - Domain-specific template languages
- **Framework integration** - Adapt other framework syntaxes
- **Performance optimization** - Specialized binding modes for specific use cases
- **Developer experience** - Shorthand syntax for common patterns
- **Legacy migration** - Support old syntax during gradual upgrades

## Complete Guides

Aurelia provides several extension points for the binding system:

### 1. Custom Binding Commands
Create new binding commands like `.my-bind` or `.special-trigger`:

**See the complete guide:** [Extending the Binding Language](../developer-guides/scenarios/bindingcommand.md)

### 2. Attribute Patterns
Define how Aurelia recognizes and interprets attributes:

**See the complete guide:** [Modifying Template Parsing with AttributePattern](../developer-guides/scenarios/attributepattern.md)

### 3. Template Syntax Extensions
Add entirely new syntax features to templates:

**See the complete guide:** [Extending Templating Syntax](../developer-guides/scenarios/extending-templating-syntax.md)

### 4. Attribute Mapping
Customize how attribute names map to properties:

**See the complete guide:** [Attribute Mapping](../developer-guides/scenarios/attributemapper.md)

### 5. Template Compiler Extensions
Hook into the compilation process:

**See the complete guide:** [Extending the Template Compiler](extending-the-template-compiler.md)

## Quick Example: Custom Binding Command

Here's a simple custom binding command that logs binding updates:

```typescript
import { bindingCommand } from '@aurelia/template-compiler';
import { PropertyBindingInstruction } from '@aurelia/runtime-html';

@bindingCommand('debug')
export class DebugBindingCommand {
  public get ignoreAttr(): boolean { return false; }

  public build(info, parser) {
    const expression = parser.parse(info.attr.rawValue, 'IsProperty');

    // Wrap the expression with logging
    const wrappedExpr = {
      ...expression,
      evaluate: (scope, binding) => {
        const value = expression.evaluate(scope, binding);
        console.log(`[DEBUG] ${info.attr.target}:`, value);
        return value;
      }
    };

    return new PropertyBindingInstruction(
      wrappedExpr,
      info.attr.target,
      'toView'
    );
  }
}
```

Usage in templates:
```html
<div class.debug="isActive ? 'active' : 'inactive'">
  <!-- Logs class value changes to console -->
  ${message}
</div>
```

## Quick Example: Attribute Pattern

Create a shorthand syntax like `@click` instead of `click.trigger`:

```typescript
import { attributePattern } from '@aurelia/template-compiler';

@attributePattern({ pattern: '@PART', symbols: '@' })
export class AtPrefixedTriggerAttributePattern {
  public ['@PART'](name: string, value: string, parts: string[]): string {
    return `${parts[0]}.trigger`;
  }
}
```

Register it:
```typescript
import Aurelia from 'aurelia';
import { AtPrefixedTriggerAttributePattern } from './at-pattern';

Aurelia
  .register(AtPrefixedTriggerAttributePattern)
  .app(MyApp)
  .start();
```

Usage:
```html
<!-- Instead of click.trigger="handleClick()" -->
<button @click="handleClick()">Click Me</button>

<!-- Instead of submit.trigger="handleSubmit()" -->
<form @submit="handleSubmit()">...</form>
```

## What You'll Learn

The complete guides cover:

### Binding Commands
1. **Basic structure** - The `BindingCommandInstance` interface
2. **Instruction building** - Creating PropertyBinding, TriggerBinding, etc.
3. **Expression parsing** - Working with the expression parser
4. **Registration** - Making commands available globally
5. **Real-world examples** - Two-way, one-time, delegate, capture commands

### Attribute Patterns
1. **Pattern syntax** - Defining recognition rules
2. **Dynamic transformation** - Converting attributes at compile time
3. **Symbol usage** - Dots, colons, at-signs, and custom symbols
4. **Multi-part patterns** - Complex attribute structures
5. **Built-in patterns** - Understanding Aurelia's defaults

### Template Syntax
1. **Custom template controllers** - if, repeat, switch-like syntax
2. **Custom elements** - Component-level extensions
3. **Custom attributes** - Behavior-modifying directives
4. **Value converters** - Transformation pipelines
5. **Binding behaviors** - Runtime binding modifications

## Common Extension Patterns

### Shorthand Syntax
```typescript
// Create :property shorthand for property.bind
@attributePattern({ pattern: ':PART', symbols: ':' })
export class ColonPrefixedBindPattern {
  [':PART'](name, value, parts) {
    return `${parts[0]}.bind`;
  }
}
```

```html
<!-- Use :value instead of value.bind -->
<input :value="username" type="text">
```

### Specialized Binding Modes
```typescript
// Create .once binding that only binds on first render
@bindingCommand('once')
export class OnceBindingCommand {
  build(info, parser) {
    const expr = parser.parse(info.attr.rawValue, 'IsProperty');
    return new PropertyBindingInstruction(expr, info.attr.target, 'oneTime');
  }
}
```

### Framework Syntax Adapters
```typescript
// Support Vue-style v-model syntax
@attributePattern({ pattern: 'v-model', symbols: 'v-' })
export class VueModelPattern {
  ['v-model'](name, value) {
    return 'value.two-way';
  }
}
```

```html
<!-- Vue-style syntax in Aurelia -->
<input v-model="username">
<!-- Becomes: <input value.two-way="username"> -->
```

## Architecture Overview

```
Template Source
     ↓
Template Compiler
     ↓
Attribute Recognition (AttributePattern)
     ↓
Binding Command Lookup
     ↓
Instruction Building (BindingCommand)
     ↓
Compiled Instructions
     ↓
Runtime Rendering
     ↓
Live Bindings
```

## Extension Points

| Extension Type | Use Case | Difficulty | Performance Impact |
|----------------|----------|------------|-------------------|
| **Binding Command** | Custom binding modes | Medium | Low |
| **Attribute Pattern** | Syntax shortcuts | Easy | None (compile-time) |
| **Template Controller** | Control flow | Medium | Low-Medium |
| **Custom Renderer** | Instruction handling | Hard | Medium |
| **Expression Transformer** | AST manipulation | Hard | Low |

## Best Practices

1. **Keep it simple** - Complex extensions are hard to maintain
2. **Document thoroughly** - Custom syntax needs clear documentation
3. **Test extensively** - Edge cases in parsing are common
4. **Consider performance** - Binding overhead accumulates
5. **Follow conventions** - Match Aurelia's naming and patterns
6. **Provide TypeScript support** - Type definitions for IntelliSense

## Performance Considerations

- **Compile-time extensions** (AttributePattern) have zero runtime cost
- **Binding commands** have minimal per-binding overhead
- **Custom expressions** should cache computed values
- **Avoid complex wrapping** - Each layer adds overhead

## Debugging Extensions

```typescript
import { ILogger } from '@aurelia/kernel';
import { resolve } from '@aurelia/kernel';

@bindingCommand('my-bind')
export class MyBindingCommand {
  private logger = resolve(ILogger);

  build(info, parser) {
    this.logger.debug('Building binding:', info);
    // ... implementation
  }
}
```

## Migration from Aurelia 1

Key differences:
- **Decorator-based** - Use `@bindingCommand` and `@attributePattern`
- **TypeScript-first** - Better type inference
- **Simplified APIs** - Fewer required methods
- **Better composition** - Easier to combine extensions

---

## Ready to Extend?

Start with these guides based on your needs:

- **Simple shortcuts?** → [Attribute Patterns](../developer-guides/scenarios/attributepattern.md)
- **Custom binding modes?** → [Binding Commands](../developer-guides/scenarios/bindingcommand.md)
- **New syntax features?** → [Extending Templating Syntax](../developer-guides/scenarios/extending-templating-syntax.md)
- **Deep integration?** → [Extending the Template Compiler](extending-the-template-compiler.md)

## Additional Resources

- [Framework Internals](../getting-to-know-aurelia/framework-internals.md)
- [Template Compiler Source](https://github.com/aurelia/aurelia/tree/master/packages/template-compiler)
- [Runtime Source](https://github.com/aurelia/aurelia/tree/master/packages/runtime-html)

