# Modifying template parsing with AttributePattern

Sometimes developers want to simulate the situation they have experienced in other frameworks in Aurelia, like Angular or Vue binding syntax. Aurelia provides an API that allows you to change how it interprets templating syntax and even emulate other framework syntax with ease.

#### What is attributePattern?

`attributePattern` decorator in the form of `extensibility` feature in Aurelia. With it, we can introduce our own syntax to Aurelia's binding engine.

```typescript
export function attributePattern(...patternDefs: AttributePatternDefinition[]): AttributePatternDecorator {
    // ...
}

export interface AttributePatternDefinition {
  pattern: string;
  symbols: string;
}
```

Its parameters are as follows

| Parameter | Description                                                                                                                                                                                                                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pattern   | You define the pattern of your new syntax in terms of a very special keyword, `PART`. That's essentially the equivalent of this regex: `(.+)`.                                                                                                                                                                               |
| symbols   | In symbols you put anything that should not be included in part extraction, anything that makes your syntax more readable but plays no role but separator e.g. in `value.bind` syntax, the `symbols` is `.` which sits there just in terms of more readability, and does not play a role in detecting `parts` of the syntax. |

Consider the following example:

```typescript
@attributePattern({ pattern: 'foo@PART', symbols: '@' })
```

`foo@bar` would give you the parts `foo` and `bar`, but if you omitted symbols, then it would give you the parts `foo@` and `bar`.

This attribute should be on top of a class, and that class should have methods whose name matches the `pattern` property of each pattern you have passed to the `attributePattern`. Consider the following example:

```typescript
// attr-patterns.ts

@attributePattern({ pattern: '[(PART)]', symbols: '[()]' })
export class AngularTwoWayBindingAttributePattern {

    public ['[(PART)]'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
    }

}
```

```html
<!-- Angular two-way binding usage -->
<input [(value)]="message">
```

We have defined the Angular two-way binding pattern, `[(PART)]`, the symbols are `[()]` which behaves as a syntax sugar for us; the public method defined in the body of the class has **the same name as the pattern** defined.&#x20;

This method also accepts three parameters, `rawName`, `rawValue`, and `parts`.

| Parameter | Description                                          |
| --------- | ---------------------------------------------------- |
| rawName   | Left-side of assignment.                             |
| rawValue  | Right-side of assignment.                            |
| parts     | The values of PARTs of your pattern without symbols. |

* `rawName`: "\[(value)]"
* `rawValue`: "message"
* `parts`: \["value"]

The `ref` binding command to create a reference to a DOM element. In Angular, this is possible with `#`. For instance, `ref="uploadInput"` has `#uploadInput` equivalent in Angular.

```typescript
@attributePattern({ pattern: '#PART', symbols: '#' })
export class SharpRefAttributePattern {   
    public ['#PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, parts[0], 'element', 'ref');
    }
}
```

Given the above example and the implementation, the parameters would have values like the following:

```html
<!-- #uploadInput="" -->
<input type="file" #uploadInput/>
```

* `rawName`: "#uploadInput"
* `rawValue`: "" , an empty string.
* `parts`: \["uploadInput"]

If we want to extend the syntax for `ref.view-model="uploadVM"`, for example, we could just add another pattern to the existing class:

```typescript
@attributePattern(
    { pattern: 'PART#PART', symbols: '#' }, // e.g. view-model#uploadVM
    { pattern: '#PART', symbols: '#' }      // e.g. #uploadInput
)
export class AngularSharpRefAttributePattern {
    public ['PART#PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, parts[1], parts[0], 'ref');
    }
    public ['#PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, parts[0], 'element', 'ref');
    }   
}
```

It is up to you to decide how each `PART` will be taken into play.

#### How to register an attributePattern?

You can register `attributePattern` in the following two ways:

**Globally**

Go to the `main.ts` or `main.js` and add the following code:

```typescript
import {
  AngularTwoWayBindingAttributePattern
} from './attr-patterns';

Aurelia
  .register(
    AngularTwoWayBindingAttributePattern
  )
  .app(MyApp)
  .start();
```

**Locally**

You may want to use it in a specific part of your application. You can introduce it through `dependencies`.

Import from somewhere else:

```typescript
import { AngularTwoWayBindingAttributePattern } from "./attr-patterns";

@customElement({ 
    name: 'foo',
    template, 
    /* HERE */
    dependencies: [
        AngularTwoWayBindingAttributePattern
    ] 
})
```

Define it inline:

```typescript
@customElement({ 
    name: 'foo',
    template    
    /* HERE */
    dependencies: [
        AttributePattern.define(class { ['!PART'](n, v, [t]) { return new AttrSyntax(n, v, t, 'bind') } }
    ] 
})
```

#### Cheatsheet

```typescript
// attr-patterns.ts

import { attributePattern, AttrSyntax } from '@aurelia/runtime-html';

// Angular

@attributePattern({ pattern: '#PART', symbols: '#' })
export class AngularSharpRefAttributePattern {
    public ['#PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, parts[0], 'element', 'ref');
    }
}

@attributePattern({ pattern: '[PART]', symbols: '[]' })
export class AngularOneWayBindingAttributePattern {
    public ['[PART]'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'to-view' /*'bind'*/);
    }
}

@attributePattern({ pattern: '(PART)', symbols: '()' })
export class AngularEventBindingAttributePattern {
    public ['(PART)'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
    }
}

@attributePattern({ pattern: '[(PART)]', symbols: '[()]' })
export class AngularTwoWayBindingAttributePattern {
    public ['[(PART)]'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
    }
}

// Vue

@attributePattern({ pattern: '[PART]', symbols: ':' })
export class VueOneWayBindingAttributePattern {
    public [':PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'to-view' /*'bind'*/);
    }
}

@attributePattern({ pattern: '@PART', symbols: '@' })
export class VueEventBindingAttributePattern {
    public ['@PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
    }
}

@attributePattern({ pattern: 'v-model', symbols: '' })
export class VueTwoWayBindingAttributePattern {
    public ['v-model'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, 'value', 'two-way');
    }
}

// Vue+

@attributePattern({ pattern: '::PART', symbols: '::' })
export class DoubleColonTwoWayBindingAttributePattern {
    public ['::PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
    }
}

// main.ts

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
