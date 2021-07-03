# Template Compiler Hooks

## Introduction

There are scenarios where an application wants to control how to preprocess a template before it is compiled. There could be various reasons such as accessibility validation, adding debugging attributes etc...

Aurelia supports this via template compiler hooks, that is enabled with the default template compiler. To use this features, declare and then register the desired hooks with either global \(at startup\) or local container \(at dependencies \(runtime\) or `<import>` with convention\).

An example of declaring global hooks, that will be called for every template:

1. With vanillajs

   \`\`\`ts

   import Aurelia, { TemplateCompilerHooks } from 'aurelia';

Aurelia.register\(TemplateCompilerHooks.define\(class { beforeCompile\(template: HTMLElement\) { element.querySelector\('table'\).setAttribute\(someAttribute, someValue\); } }\)\)

```text
2. With decorator
```ts
import Aurelia, { templateCompilerHooks } from 'aurelia';

@templateCompilerHooks
class MyTableHook1 {
  beforeCompile(template) {...}
}
// paren ok too
@templateCompilerHooks()
class MyTableHook1 {
  beforeCompile(template) {...}
}

Aurelia.register(MyTableHook1);
```

## Supported hooks

* **beforeCompile**: this hook will be invoked right before the template compiler starts the compilation. Use this hooks if there needs to be some changes to a template before any compilation.

## Hooks invocation order

All hooks from local and global registrations will be invoked in order: local first then global.

