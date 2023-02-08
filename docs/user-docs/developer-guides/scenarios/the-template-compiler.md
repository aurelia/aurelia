---
description: >-
  The template compiler is used by Aurelia under the hood to process templates
  and provides hooks and APIs allowing you intercept and modify how this
  behavior works in your applications.
---

# Using the template compiler

## Hooks

There are scenarios where an application wants to control how to preprocess a template before it is compiled. There could be various reasons, such as accessibility validation, adding debugging attributes etc...

Aurelia supports this via template compiler hooks, enabled with the default template compiler. To use these features, declare and then register the desired hooks with either global (at startup) or local container (at dependencies (runtime) or `<import>` with convention).

An example of declaring global hooks that will be called for every template:

### With VanillaJS

```typescript
import Aurelia, { TemplateCompilerHooks } from 'aurelia';

Aurelia
  .register(TemplateCompilerHooks.define(class {
    compiling(template: HTMLElement) {
      element.querySelector('table').setAttribute(someAttribute, someValue);
    }
  }))
```

### With decorator

```typescript
import Aurelia, { templateCompilerHooks } from 'aurelia';

@templateCompilerHooks
class MyTableHook1 {
  compiling(template) {...}
}
// paren ok too
@templateCompilerHooks()
class MyTableHook1 {
  compiling(template) {...}
}

Aurelia.register(MyTableHook1);
```

### Supported hooks

* **compiling**: this hook will be invoked before the template compiler starts compiling a template. Use this hook if there need to be any changes to a template before any compilation.

### Hooks invocation order

All hooks from local and global registrations will be invoked: local first, then global.

## Compilation Behavior

The default compiler will remove all binding expressions while compiling a template. This is to clean the rendered HTML and increase the performance of cloning compiled fragments.

Though this is not always desirable for debugging, it could be hard to figure out what element mapped to the original part of the code. To enable an easier debugging experience, the default compiler has a property `debug` that when set to `true` will keep all expressions intact during the compilation.

This property can be set early in an application lifecycle via `AppTask`, so that all the rendered HTML will keep their original form. An example of doing this is:

```typescript
import Aurelia, { AppTask, ITemplateCompiler } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(AppTask.creating(ITemplateCompiler, compiler => compiler.debug = true))
  .app(MyApp)
  .start();
```

List of attributes that are considered expressions:

* containerless
* as-element
* ref
* attr with binding expression (`attr.command="..."`)
* attr with interpolation (`attr="${someExpression}"`)
* custom attribute
* custom element bindables

## Node APIs used

The default template compiler will turn a template, either in string or already an element, into an element before the compilation. During the compilation, these APIs on the `Node` & `Element` classes are accessed and invoked:

* `Node.prototype.nodeType`
* `Node.prototype.nodeName`
* `Node.prototype.childNodes`
* `Node.prototype.childNode`
* `Node.prototype.firstChild`
* `Node.prototype.textContent`
* `Node.prototype.parentNode`
* `Node.prototype.appendChild`
* `Node.prototype.insertBefore`
* `Element.prototype.attributes`
* `Element.prototype.hasAttribute`
* `Element.prototype.getAttribute`
* `Element.prototype.setAttribute`
* `Element.prototype.classList.add`

If it is desirable to use the default template compiler in any environment other than HTML, ensure the template compiler can hydrate the input string or object into some object with the above APIs.
