---
description: >-
  The Aurelia template compiler is powerful and developer-friendly, allowing you
  extend its binding language with great ease.
---

# Extending the binding language

The Aurelia binding language provides commands like `.bind`, `.one-way`, `.trigger`, `.for`, `.class` etc. These commands are used in the view to express the intent of the binding, or in other words, to build binding instructions.

Although the out-of-box binding language is sufficient for most use cases, Aurelia also provides a way to extend the binding language so that developers can create their own incredible stuff when needed.

In this article, we will build an example to demonstrate how to introduce your own binding commands using the `@bindingCommand` decorator from the template compiler.

## Binding command

Before jumping directly into the example, let's first understand what a binding command is. In a nutshell, a binding command is a piece of code used to register "keywords" in the binding language and provide a way to build binding instructions from that.

To understand it better, we start our discussion with the template compiler. The template compiler is responsible for parsing templates and, among all, creating attribute syntaxes. This is where the [attribute patterns](./attributepattern.md) come into play. Depending on how you define your attribute patterns, the attribute syntaxes will be created with or without a binding command name, such as `bind`, `one-way`, `trigger`, `for`, `class`, etc. The template compiler then instantiates binding commands for the attribute syntaxes with a binding command name. Later, binding instructions are built from these binding commands, which are "rendered" by renderers. Depending on the binding instructions, the " rendering " process can differ. For this article, the rendering process details are unimportant, so we will skip it.

## Creating a custom binding command

To create a binding command, decorate a class with `@bindingCommand` and implement the following interface:

```typescript
interface BindingCommandInstance {
  ignoreAttr: boolean;
  build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): IInstruction;
}
```

When the template compiler encounters an attribute, it first lets custom elements or attributes claim it. Only when no bindable handles the attribute does it look up a binding command whose name matches the parsed instruction. Setting `ignoreAttr = true` tells the compiler that your command consumes the attribute as-is and it should not keep probing for other handlers. Built-in commands like `.two-way` keep this value `false`, whereas specialized commands such as `.attr` set it to `true` so they can short-circuit the remaining checks.

The more interesting part of the interface is the `build` method. The template compiler calls this method to build binding instructions. The `info` parameter contains information about the element, the attribute name, the bindable definition (if present), and the custom element/attribute definition (if present). The `parser` parameter is used to parse the attribute value into an expression. The `mapper` parameter of [type `IAttrMapper`](./attributemapper.md) is used to determine the binding mode, the target property name, etc. (for more information, refer to the [documentation](./extending-templating-syntax.md)). In short, here comes your logic to convert the attribute information into a binding instruction.

For our example, we want to create a binding command that can trigger a handler when custom events such as `bs.foo.bar`, `bs.fizz.bizz` etc. are fired, and we want the following syntax:

```html
<div foo.bar.bs="ev => handleCustomEvent(ev)"></div>
```

instead of

```html
<div bs.foo.bar.trigger="ev => handleCustomEvent(ev)"></div>
```

We first create a class that implements the `BindingCommandInstance` interface to do that.

```typescript
import { IExpressionParser } from 'aurelia';
import {
  BindingCommandInstance,
  ICommandBuildInfo,
  ListenerBindingInstruction,
  bindingCommand,
} from '@aurelia/template-compiler';

@bindingCommand('bs')
export class BsBindingCommand implements BindingCommandInstance {
  public ignoreAttr = true; // we fully own attributes that end with .bs

  public build(
    info: ICommandBuildInfo,
    exprParser: IExpressionParser,
  ) {
    return new ListenerBindingInstruction(
      /* from           */ exprParser.parse(info.attr.rawValue, 'IsFunction'),
      /* to             */ `bs.${info.attr.target}`,
      /* preventDefault */ true,
      /* capture        */ false,
    );
  }
}
```

Note that from the `build` method, we are creating a `ListenerBindingInstruction` with `bs.` prefixed to the event name used in the markup. Thus, we are saying that the handler should be invoked when a `bs.*` event is raised.

To register the custom binding command, it needs to be registered with the dependency injection container.

### Registering the custom binding command

```typescript
import Aurelia from 'aurelia';
import { BsBindingCommand } from './bs-binding-command';
import { MyRoot } from './my-root';

Aurelia
  .register(BsBindingCommand)
  .app(MyRoot)
  .start();
```

Because `@bindingCommand` wires up the resource metadata, registering the class is all the compiler needs to find it.

#### Why `ignoreAttr = true`?

Setting `ignoreAttr = true` tells the compiler that this binding command fully manages the attribute in the view. Without this flag, Aurelia might attempt to interpret the same attribute as a custom attribute or a normal bindable property. This can lead to conflicts or warnings if you reuse attribute names already in use by other features.

#### Debugging custom binding commands

If your command doesn't behave as expected:

- Make sure you've registered it before Aurelia starts (see the `main.ts` snippet above).
- Double-check that the **command name** (e.g., `'bs'`) matches in both the `@bindingCommand('bs')` decorator and your view markup (`foo.bar.bs="..."`).
- Use browser dev tools to confirm whether your event is fired and that the method in your view model is triggered.

And that's it! We have created our own binding command and registered it. This means the following syntax will work:

```html
<div foo.bar.bs="ev => handleCustomEvent(ev)"></div>
<!--         ^^
             |_________ custom binding command
-->
```

## Live example

This binding command can be seen in action below.

{% embed url="https://stackblitz.com/edit/aurelia2-custom-binding-command?ctl=1&embed=1&file=src%2Fmy-app.ts" %}

> Note that the example defines a custom attribute pattern to support `foo.bar.fizz.bs="ev => handle(ev)"` syntax.
