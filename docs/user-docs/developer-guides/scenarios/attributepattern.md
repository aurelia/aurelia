# Attribute Patterns: Extending Template Syntax

Aurelia's attribute pattern system allows you to create custom template syntax extensions that can emulate other framework syntaxes like Angular or Vue, or define entirely new patterns for your specific needs. This powerful extensibility feature integrates directly with Aurelia's template compiler and binding engine.

## Architecture Overview

The attribute pattern system consists of several core components:

- **AttributePatternDefinition**: Defines pattern structure with `pattern` and `symbols`
- **AttrSyntax**: The parsed result containing binding information
- **SyntaxInterpreter**: A finite state machine that efficiently parses attribute names
- **AttributeParser**: Manages pattern registration and result caching
- **Pattern Priority System**: Resolves conflicts when multiple patterns match

## Basic Pattern Definition

### AttributePatternDefinition Interface

```typescript
export interface AttributePatternDefinition {
  pattern: string;   // Pattern with PART placeholders
  symbols: string;   // Characters treated as separators/delimiters
}
```

### The PART Keyword

`PART` in patterns represents dynamic segments that can match any characters except those defined in `symbols`. Think of `PART` as a flexible placeholder equivalent to the regex `([^symbols]+)`.

### Symbols Behavior

The `symbols` property defines characters that:
- Act as separators between pattern segments
- Are excluded from `PART` matching
- Can be used for readability and structure

**Example:**
```typescript
{ pattern: 'foo@PART', symbols: '@' }
```
- `foo@bar` → parts: `['foo', 'bar']` (with symbols)
- Without symbols → parts: `['foo@', 'bar']` (without symbols)

## Pattern Class Structure

### Basic Pattern Class

```typescript
import { attributePattern, AttrSyntax } from '@aurelia/template-compiler';

@attributePattern({ pattern: '[(PART)]', symbols: '[()]' })
export class AngularTwoWayBindingAttributePattern {
  public ['[(PART)]'](rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
  }
}
```

> **Note**: `AttrSyntax` must be imported from `@aurelia/template-compiler`, not from the main `aurelia` package, as it's not currently re-exported there.

### Pattern Method Signature

Each pattern method must:
1. Have the exact same name as the pattern string
2. Accept three required parameters:
   - `rawName: string` - Original attribute name (e.g., "[(value)]")
   - `rawValue: string` - Attribute value (e.g., "message")
   - `parts: readonly string[]` - Extracted PART values (e.g., ["value"])
3. Return an `AttrSyntax` instance

## AttrSyntax Constructor

The `AttrSyntax` class has the following constructor signature:

```typescript
export class AttrSyntax {
  public constructor(
    public rawName: string,      // Original attribute name
    public rawValue: string,     // Original attribute value
    public target: string,       // Target property/element
    public command: string | null, // Binding command
    public parts: readonly string[] | null = null // Additional parts for complex patterns
  ) {}
}
```

### AttrSyntax Parameters Explained

| Parameter | Description | Example |
|-----------|-------------|---------|
| `rawName` | Original attribute name from template | `"[(value)]"` |
| `rawValue` | Original attribute value | `"message"` |
| `target` | The target property, element, or identifier | `"value"` |
| `command` | Binding command type | `"two-way"`, `"bind"`, `"trigger"`, `"ref"` |
| `parts` | Additional parts for complex patterns | For event modifiers, extended syntax |

### Common Binding Commands

- `'bind'` - One-way to view binding
- `'to-view'` - Explicit one-way to view
- `'from-view'` - One-way from view
- `'two-way'` - Two-way data binding
- `'trigger'` - Event binding
- `'capture'` - Event capture
- `'ref'` - Element/component reference
- `null` - Custom or no specific command

## Pattern Registration

### Global Registration

Register patterns globally at application startup:

```typescript
import { Aurelia } from 'aurelia';
import { AngularTwoWayBindingAttributePattern } from './patterns/angular-patterns';

Aurelia
  .register(AngularTwoWayBindingAttributePattern)
  .app(MyApp)
  .start();
```

### Local Registration

Register patterns for specific components:

```typescript
import { customElement } from '@aurelia/runtime-html';
import { AngularTwoWayBindingAttributePattern } from './patterns/angular-patterns';

@customElement({
  name: 'my-component',
  template: '<input [(value)]="message">',
  dependencies: [AngularTwoWayBindingAttributePattern]
})
export class MyComponent {
  public message = 'Hello World';
}
```

### Inline Pattern Definition

For simple patterns, you can define them inline:

```typescript
import { AttributePattern } from '@aurelia/template-compiler';

@customElement({
  name: 'my-component',
  template: '<input !value="message">',
  dependencies: [
    // Define pattern inline and register directly
    (() => {
      @attributePattern({ pattern: '!PART', symbols: '!' })
      class InlineExclamationPattern {
        '!PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
          return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
        }
      }
      return InlineExclamationPattern;
    })()
  ]
})
```

## Multiple Patterns per Class

A single class can handle multiple related patterns:

```typescript
@attributePattern(
  { pattern: 'PART#PART', symbols: '#' }, // view-model#uploadVM
  { pattern: '#PART', symbols: '#' }      // #uploadInput
)
export class AngularSharpRefAttributePattern {
  public ['PART#PART'](rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, parts[1], parts[0], 'ref');
  }

  public ['#PART'](rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, parts[0], 'element', 'ref');
  }
}
```

## Pattern Priority System

When multiple patterns could match the same attribute name, Aurelia uses a priority system:

1. **Static segments** (exact text matches) have highest priority
2. **Dynamic segments** (PART) have medium priority
3. **Symbol segments** have lower priority

**Example Priority Resolution:**
```typescript
// Given patterns: 'PART.PART', 'value.PART', 'PART.bind'
// For attribute 'value.bind':
// - 'value.PART' matches with 1 static + 1 dynamic = higher priority
// - 'PART.bind' matches with 1 dynamic + 1 static = same priority
// - 'PART.PART' matches with 2 dynamic = lower priority
// Result: First pattern with highest static count wins
```

## Advanced Pattern Examples

### Event Modifiers

```typescript
@attributePattern(
  { pattern: 'PART.trigger:PART', symbols: '.:' },
  { pattern: 'PART.capture:PART', symbols: '.:' }
)
export class EventModifierPattern {
  public 'PART.trigger:PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger', parts);
  }

  public 'PART.capture:PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'capture', parts);
  }
}
```

### Static Patterns (No PART)

```typescript
@attributePattern(
  { pattern: 'promise.resolve', symbols: '' },
  { pattern: 'promise.catch', symbols: '' },
  { pattern: 'ref', symbols: '' }
)
export class StaticPatterns {
  public 'promise.resolve'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, rawValue, 'promise-resolve');
  }

  public 'promise.catch'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, rawValue, 'promise-catch');
  }

  public 'ref'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'element', 'ref');
  }
}
```

### Complex Multi-PART Patterns

```typescript
@attributePattern({ pattern: 'PART.PART.PART', symbols: '.' })
export class ThreePartPattern {
  public 'PART.PART.PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    // For something like 'user.address.street.bind'
    // parts = ['user', 'address', 'street', 'bind']
    const target = `${parts[0]}.${parts[1]}.${parts[2]}`;
    return new AttrSyntax(rawName, rawValue, target, parts[3]);
  }
}
```

## Built-in Pattern Examples

Aurelia includes several built-in patterns you can reference:

### Dot-Separated Patterns
```typescript
// Built-in: handles 'value.bind', 'checked.two-way', etc.
@attributePattern(
  { pattern: 'PART.PART', symbols: '.' },
  { pattern: 'PART.PART.PART', symbols: '.' }
)
export class DotSeparatedAttributePattern {
  public 'PART.PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
  }

  public 'PART.PART.PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, `${parts[0]}.${parts[1]}`, parts[2]);
  }
}
```

### Shorthand Binding Patterns
```typescript
// Built-in: handles ':value', '@click', etc.
@attributePattern({ pattern: ':PART', symbols: ':' })
export class ColonPrefixedBindAttributePattern {
  public ':PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

@attributePattern(
  { pattern: '@PART', symbols: '@' },
  { pattern: '@PART:PART', symbols: '@:' }
)
export class AtPrefixedTriggerAttributePattern {
  public '@PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }

  public '@PART:PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger', [parts[0], 'trigger', ...parts.slice(1)]);
  }
}
```

## Framework Syntax Examples

### Angular-Style Patterns

```typescript
// Angular ref syntax: #myInput
@attributePattern({ pattern: '#PART', symbols: '#' })
export class AngularRefPattern {
  public '#PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, parts[0], 'element', 'ref');
  }
}

// Angular property binding: [value]
@attributePattern({ pattern: '[PART]', symbols: '[]' })
export class AngularPropertyBinding {
  public '[PART]'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

// Angular event binding: (click)
@attributePattern({ pattern: '(PART)', symbols: '()' })
export class AngularEventBinding {
  public '(PART)'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }
}

// Angular two-way binding: [(ngModel)]
@attributePattern({ pattern: '[(PART)]', symbols: '[()]' })
export class AngularTwoWayBinding {
  public '[(PART)]'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
  }
}
```

### Vue-Style Patterns

```typescript
// Vue property binding: :value
@attributePattern({ pattern: ':PART', symbols: ':' })
export class VuePropertyBinding {
  public ':PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

// Vue event binding: @click
@attributePattern({ pattern: '@PART', symbols: '@' })
export class VueEventBinding {
  public '@PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }
}

// Vue v-model directive
@attributePattern({ pattern: 'v-model', symbols: '' })
export class VueModelDirective {
  public 'v-model'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'value', 'two-way');
  }
}
```

## Performance Considerations

### Caching System

The attribute parser maintains an internal cache of parsed interpretations. Once an attribute name is parsed, the result is cached for subsequent uses, improving template compilation performance.

### Pattern Optimization

- **Order Matters**: More specific patterns should be defined first when possible
- **Symbol Selection**: Choose symbols that don't conflict with common attribute patterns
- **Minimal Patterns**: Avoid overly complex patterns that could match unintended attributes

### Registration Timing

Patterns must be registered before template compilation begins. Late registration after the application starts may not take effect for already-compiled templates.

## Debugging and Error Handling

### Common Pattern Errors

1. **Missing Method**: Pattern method name doesn't match pattern string exactly
2. **Wrong Signature**: Method signature doesn't match required parameters
3. **Symbol Conflicts**: Pattern symbols conflict with other registered patterns
4. **Registration Timing**: Patterns registered after compilation begins

### Debugging Tips

```typescript
// Enable debug logging to see pattern matching
import { LoggerConfiguration, LogLevel } from '@aurelia/kernel';

Aurelia
  .register(LoggerConfiguration.create({ level: LogLevel.debug }))
  .register(MyPatternClass)
  .app(MyApp)
  .start();
```

### Pattern Testing

Test your patterns with various attribute combinations:

```typescript
// Testing patterns is typically done through the DI container
import { DI } from '@aurelia/kernel';
import { ISyntaxInterpreter, IAttributePattern } from '@aurelia/template-compiler';

// Create a container and register your pattern
const container = DI.createContainer();
container.register(MyPatternClass);

const interpreter = container.get(ISyntaxInterpreter);
const attrPattern = container.get(IAttributePattern);

// Test pattern interpretation
const result = interpreter.interpret('[(value)]');
if (result.pattern) {
  console.log('Pattern matched:', result.pattern);
  console.log('Parts:', result.parts);
}
```

## Integration with Template Compiler

Attribute patterns integrate seamlessly with Aurelia's template compilation process:

1. **Template Analysis**: The compiler scans for all attributes
2. **Pattern Matching**: Each attribute name is tested against registered patterns
3. **Syntax Creation**: Matching patterns create `AttrSyntax` objects
4. **Binding Generation**: The compiler generates appropriate bindings based on the syntax
5. **Runtime Execution**: Bindings execute during component lifecycle

## Best Practices

### Pattern Design

1. **Intuitive Syntax**: Create patterns that feel natural to developers
2. **Consistent Naming**: Follow consistent conventions across related patterns
3. **Clear Symbols**: Use symbols that clearly separate pattern parts
4. **Avoid Conflicts**: Test patterns against existing Aurelia syntax

### Registration Strategy

1. **Global vs Local**: Use global registration for widely-used patterns, local for component-specific ones
2. **Bundle Size**: Consider the impact of registering many patterns globally
3. **Tree Shaking**: Local registration helps with tree shaking unused patterns

### Error Recovery

1. **Graceful Fallback**: Design patterns to fail gracefully when they don't match
2. **Clear Errors**: Provide meaningful error messages in pattern methods
3. **Validation**: Validate pattern inputs and provide helpful feedback

## Complete Examples

### Custom Framework Integration

```typescript
// Complete React-like pattern system
@attributePattern(
  { pattern: 'className', symbols: '' },
  { pattern: 'onClick', symbols: '' },
  { pattern: 'onChange', symbols: '' }
)
export class ReactLikePatterns {
  public 'className'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'class', 'bind');
  }

  public 'onClick'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'click', 'trigger');
  }

  public 'onChange'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'change', 'trigger');
  }
}
```

### Advanced Component System

```typescript
// Advanced pattern for component communication
@attributePattern(
  { pattern: 'emit:PART', symbols: ':' },
  { pattern: 'listen:PART', symbols: ':' },
  { pattern: 'sync:PART', symbols: ':' }
)
export class ComponentCommunicationPatterns {
  public 'emit:PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'emit-event');
  }

  public 'listen:PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'listen-event');
  }

  public 'sync:PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'sync-prop');
  }
}
```

The attribute pattern system provides unlimited flexibility for creating custom template syntaxes that fit your team's needs or emulate familiar patterns from other frameworks, all while maintaining full integration with Aurelia's binding and compilation systems.

## Quick Reference Cheatsheet

Here's a corrected cheatsheet with working examples:

```typescript
// attr-patterns.ts

import { attributePattern, AttrSyntax } from '@aurelia/template-compiler';

// Angular-style patterns

@attributePattern({ pattern: '#PART', symbols: '#' })
export class AngularSharpRefAttributePattern {
  public '#PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, parts[0], 'element', 'ref');
  }
}

@attributePattern({ pattern: '[PART]', symbols: '[]' })
export class AngularOneWayBindingAttributePattern {
  public '[PART]'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

@attributePattern({ pattern: '(PART)', symbols: '()' })
export class AngularEventBindingAttributePattern {
  public '(PART)'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }
}

@attributePattern({ pattern: '[(PART)]', symbols: '[()]' })
export class AngularTwoWayBindingAttributePattern {
  public '[(PART)]'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
  }
}

// Vue-style patterns

@attributePattern({ pattern: ':PART', symbols: ':' })
export class VueOneWayBindingAttributePattern {
  public ':PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

@attributePattern({ pattern: '@PART', symbols: '@' })
export class VueEventBindingAttributePattern {
  public '@PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }
}

@attributePattern({ pattern: 'v-model', symbols: '' })
export class VueTwoWayBindingAttributePattern {
  public 'v-model'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'value', 'two-way');
  }
}

// Custom patterns

@attributePattern({ pattern: '::PART', symbols: '::' })
export class DoubleColonTwoWayBindingAttributePattern {
  public '::PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
  }
}
```

```typescript
// main.ts

import { Aurelia } from 'aurelia';
import {
  AngularEventBindingAttributePattern,
  AngularOneWayBindingAttributePattern,
  AngularSharpRefAttributePattern,
  AngularTwoWayBindingAttributePattern,
  DoubleColonTwoWayBindingAttributePattern,
  VueEventBindingAttributePattern,
  VueOneWayBindingAttributePattern,
  VueTwoWayBindingAttributePattern
} from './attr-patterns';

Aurelia
  .register(
    AngularSharpRefAttributePattern,
    AngularOneWayBindingAttributePattern,
    AngularEventBindingAttributePattern,
    AngularTwoWayBindingAttributePattern,
    VueOneWayBindingAttributePattern,
    VueEventBindingAttributePattern,
    VueTwoWayBindingAttributePattern,
    DoubleColonTwoWayBindingAttributePattern
  )
  .app(MyApp)
  .start();
```
