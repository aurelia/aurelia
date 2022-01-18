# The Template Compiler

## Hooks

There are scenarios where an application wants to control how to preprocess a template before it is compiled. There could be various reasons such as accessibility validation, adding debugging attributes etc...

Aurelia supports this via template compiler hooks, that is enabled with the default template compiler. To use this features, declare and then register the desired hooks with either global \(at startup\) or local container \(at dependencies \(runtime\) or `<import>` with convention\).

An example of declaring global hooks, that will be called for every template:

1. With vanillajs

```typescript
import Aurelia, { TemplateCompilerHooks } from 'aurelia';

Aurelia
  .register(TemplateCompilerHooks.define(class {
    compiling(template: HTMLElement) {
      element.querySelector('table').setAttribute(someAttribute, someValue);
    }
  }))
```

1. With decorator

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

* **compiling**: this hook will be invoked right before the template compiler starts the compilation of a template. Use this hooks if there needs to be some changes to a template before any compilation.

### Hooks invocation order

All hooks from local and global registrations will be invoked in order: local first then global.

## Compilation Behavior

The default compiler will remove all binding expression while compiling a temlplate. This is to make the rendered HTML is clean and increase performance of cloning compiled fragments.

Though this is not always desirable for debugging, as it could be hard to figured out what element mapped to the original part of the code. To enable easier debugging experience, the default compiler has a property `debug` that when set to `true` will keep all expression intact during the compilation.

This property can be set early in an application lifecycle, via `AppTask`, so that all the rendered HTML will keep their original form. An example of doing this is:

```typescript
import Aurelia, { AppTask, ITemplateCompiler } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(AppTask.beforeCreate(ITemplateCompiler, compiler => compiler.debug = true))
  .app(MyApp)
  .start();
```

List of attributes that are considered expressions:

* containerless
* as-element
* ref
* attr with binding expression \(`attr.command="..."`\)
* attr with interpolation \(`attr="${someExpression}"`\)
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

If it is desirable to use the default template compiler in any other environment other than HTML, make sure the template compiler can hydrate the input string or object into some object with the above APIs.

TODO: examples of some hydrator for different environments

