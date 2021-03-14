---
description: Understand the scope and binding context
---

# Scope and context

You might have noticed these words Scope, binding context, and override context in other places in the documentation.
Although you can go a long way without even understanding what these are (Aurelia is cool that way), these are some (of many) powerful concepts those are essential when you need to deal with the lower level Aurelia2 API.
This section explains what these terms mean.

{% hint style="success" %}
**Here's what you'll learn...**

* What is Scope?
* What are binding context, and override context?
* How a context is selected?

{% endhint %}

## Background

When we start an Aurelia app, the compilation pipeline JIT compiles the templates (HTML/markup) associated with custom elements.
The compilation process in itself demands a documentation of its own, and certainly is out of the scope of this topic.
Without going into much details about that, we can simply think of the compilation process in terms of the following steps:

* parse the template text,
* create instructions for custom elements, custom attributes, and template controllers (`if`, `else`, `repeat.for` etc.), and
* create a set of bindings for every instruction.

Most the bindings also contains expressions.
Following are some examples.

```markup
<!-- interpolation binding -->
${firstName}

<!-- property binding -->
<my-el prop.bind="address.pin"></my-el>
```

In the example above, the interpolation binding has the expression `firsName`, and the property binding has the expression `address.pin` (quite unsurprisingly the things are bit more involved in actuality, but this abstraction will do for now).
An expression in itself might not be that interesting, but when it is executed, it becomes of interest.
Enter scope; to evaluate an expression we need scope.

## Scope and binding context

The expressions themselves do not hold any state or context.
This means that the expression `firstName` only knows that given an object it needs to grab the `firstName` property of that object.
However, the expression in itself, does not hold that object.
Scope is the container that holds the object(s) for the expression.

These objects are known as contexts.
There are typically two types of contexts: binding context, and override context.
An expression can be evaluated against any of these two kinds of contexts.
Even though there are couple of subtle difference between these two kinds of contexts (see [Override context](#override-context)), in terms of expression evaluation there exists no difference between these.

### JavaScript analogy

One way to think about expression and binding context is in terms of functions and binding those functions.
Let us consider the following example.

{% code title="foo.ts" %}
```typescript
function foo() { return this.a ** 2; }
```
{% endcode %}

If we execute this function we will get `NaN`.
However, when we bind any object to it, it might return more meaningful value, depending on the bound object.

{% code title="foo.ts" %}
```typescript
function foo() { return this.a ** 2; }

const obj1 = { a: 10 };
const obj2 = { a: 20 };

console.log(foo.apply(obj1));       // 100
console.log(foo.apply(obj2));       // 400
```
{% endcode %}

Following that analogy, the expressions are like this function, or more precisely like the expression `a ** 2` in the function.
Binding contexts are like the objects used to bind the function.
That is given 2 different binding context, same expression can produce different results, when evaluated.
Scope, as said before, wraps the binding context.
The need to have this wrapper over the binding context is explained in later sections.

### How to access the scope and the binding context?

Aurelia pipeline injects a `$controller` property to every custom element, custom attribute, and template controllers.
This property can be used access the scope, and binding context.
Let us consider the following example.

{% code title="App.ts" %}
```typescript
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({
  name: 'app',
  template: '<div>${message}</div>'
})
export class App implements ICustomElementViewModel {
  public readonly message: string = 'Hello World!';
  public readonly $controller: ICustomElementController<this>;

  public created(): void {
    const scope = this.$controller.scope;
    const bindingContext = scope.bindingContext;
    console.log(Object.is(bindingContext, this)); // true
    console.log(bindingContext.message);          // Hello World!
  }
}
```
{% endcode %}

Note that we haven't assigned any value explicitly to the `$controller` property; and that is assigned by the Aurelia pipeline.
We can use the `$controller.scope` to access the scope, and subsequently `$controller.scope.bindingContext` can be used to access the binding context.
Note how the `bindingContext` in the above example points to `this`, that is the current instance of `App` (with template controllers, this gets little bit more involved; but we will leave that one out for now).
However, in the context of evaluating expressions, we refer the source of data as a "context".

The relations explored so far can be expressed as follows.

```text
+-----------------------+
|                       |
|  Scope                |
|                       |
|  +----------------+   |
|  |                |   |
|  | bindingContext |   |
|  |                |   |
|  +----------------+   |
|                       |
+-----------------------+

```

From here let us proceed to understand what override context is.

## Override context

As the name suggests, it is also a context, that overrides the binding context.
In other words, Aurelia prioritize the override context when the desired property is found there.
Continuing with the [example above](#how-to-access-the-scope-and-the-binding-context), it renders `<div>Hello World!</div>`.
However, things might be bit different if we toy with the override context, as shown in the following example.

{% code title="App.ts" %}
```typescript
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({
  name: 'app',
  template: '<div>${message}</div>'
})
export class App implements ICustomElementViewModel {
  public readonly message: string = 'Hello World!';
  public readonly $controller: ICustomElementController<this>;

  public created(): void {
    const scope = this.$controller.scope;
    scope.overrideContext.message = 'Hello Aurelia!';
  }
}
```
{% endcode %}

With the assignment to `overrideContext.message` the rendered output is now `<div>Hello Aurelia!</div>` instead of `<div>Hello World!</div>`.
This is because of the existence of the property `message` in the override context.
Context [selection process](#context-selection) sees that there the required property exists in the override context, and prioritize that even though a property with the same name exists on the binding context as well.

Now with this information we also have a new diagram.

```text
+-----------------------+
|                       |
|  Scope                |
|                       |
|  +----------------+   |
|  |                |   |
|  | bindingContext |   |
|  |                |   |
|  +----------------+   |
|                       |
|                       |
|  +-----------------+  |
|  |                 |  |
|  | overrideContext |  |
|  |                 |  |
|  +-----------------+  |
|                       |
+-----------------------+
```

### Motivation

If you are thinking 'Why do we need override context at all?', let me tell you that it is a great question.
The reason it exists has to do with the template controllers.
While writing template controllers, many times we want a context object that is not the underlying view-model instance.
One such prominent example is the [`repeat.for`](../getting-started/rendering-collections.md) template controller.
As you might know that `repeat.for` template controller provides contextual properties such as `$index`, `$first`, `$last` etc.
These properties end up being in the override context.

Now imagine if those properties actually end up being in the binding context, which is often the underlying view-model instance, it would have caused a lot of other issues.
First of all, that would have restricted you having properties with the same name to avoid conflicts.
Which in turn means that you need to know the template controllers you are using thoroughly, to know about such restrictions, which is not a sound idea in itself.
And with that if you define a property with the same name, as used by the template controller, coupled with change observation etc., we could have found ourselves dealing with numerous bugs in the process.
Override context helps us to get out of that horrific mess.

### Connection between binding context and override context

Ideally, even with the presence of override context, we do want to use the properties (not the same one of course) defined in the binding context.
For that reason, every instance of override context also has a property named `bindingContext` that points to the binding context.
This is shown in the example below.

{% code title="App.ts" %}
```typescript
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({
  name: 'app',
  template: '<div>${message}</div>'
})
export class App implements ICustomElementViewModel {
  public readonly message: string = 'Hello World!';
  public readonly $controller: ICustomElementController<this>;

  public created(): void {
    const scope = this.$controller.scope;
    console.log(Object.is(scope.overrideContext.bindingContext, scope.bindingContext)); // true
  }
}
```
{% endcode %}

This makes the binding context readily available, even when we dealing with override context, without necessarily traverse via the scope.
With this information, we can again change our diagram to the following one.

```text
+---------------------------------+
|                                 |
|     Scope                       |
|                                 |
|     +----------------+          |
|     |                |          |
|  +--> bindingContext |          |
|  |  |                |          |
|  |  +----------------+          |
|  |                              |
|  |                              |
|  +--------------------------+   |
|                             |   |
|     +---------------------+ |   |
|     |                     | |   |
|     | overrideContext     | |   |
|     |                     | |   |
|     | +----------------+  | |   |
|     | |                |  | |   |
|     | | bindingContext +----+   |
|     | |                |  |     |
|     | +----------------+  |     |
|     |                     |     |
|     +---------------------+     |
|                                 |
+---------------------------------+

```

## Parent scope

If after following the discussion so far, if you are wondering 'If the expressions are evaluated based on the context, why do we even need scope?', let me tell you again that it is a great question.
Apart from serving a s logical container to the contexts, a scope also optionally point to the parent scope.
Let us consider the following example to understand that.

{% code title="App.ts" %}
```typescript
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({ name: 'foo-bar', template: `\${message} \${$parent.message}` })
export class FooBar implements ICustomElementViewModel {
  public readonly message: string = 'Hello Foo-Bar!';
  public readonly $controller: ICustomElementController<this>;

  public binding(): void {
    const scope = this.$controller.scope;
    console.log(scope.parentScope.bindingContext instanceof App); // true
  }
}

@customElement({
  name: 'app',
  template: '<foo-bar></foo-bar>',
  dependencies: [FooBar]
})
export class App implements ICustomElementViewModel {
  public readonly message: string = 'Hello App!';
  public readonly $controller: ICustomElementController<this>;

  public binding(): void {
    console.log(this.$controller.scope.parentScope); // null
  }
}
```
{% endcode %}

In the example above, `App` uses the `FooBar` custom element, and both have property named `message`, initialized with different values.
As expected, the rendered output in this case is `Hello Foo-Bar! Hello App!`.
You might have used the `$parent` keyword a lot, but for completeness, it should be clarified that the parent scope can be accessed using the `$parent` keyword.
In the example above `FooBar#$controller.scope.parentScope.bindingContext` points to the instance of `App` where `<foo-bar>` is used.
In short, every instance of scope has a `parentScope` property that points to the parent scope, when available.

With this information, our diagram changes for one last time.

```text
      +----------------------------------+       +----------------------------------+
+---->+                                  |       |                                  |
|     |     Scope                        |       |     Scope                        |
|     |                                  |       |                                  |
|     |     +--------------+             |       |     +--------------+             |
|     |     |              |             |       |     |              |             |
|     |     | parentScope  |             |       |     | parentScope  +-------------------+
|     |     |              |             |       |     |              |             |     |
|     |     +--------------+             |       |     +--------------+             |     |
|     |                                  |       |                                  |     |
|     |     +----------------+           |       |     +----------------+           |     |
|     |     |                |           |       |     |                |           |     |
|     |  +--> bindingContext |           |       |  +--> bindingContext |           |     |
|     |  |  |                |           |       |  |  |                |           |     |
|     |  |  +----------------+           |       |  |  +----------------+           |     |
|     |  |                               |       |  |                               |     |
|     |  |                               |       |  |                               |     |
|     |  +--------------------------+    |       |  +--------------------------+    |     |
|     |                             |    |       |                             |    |     |
|     |     +---------------------+ |    |       |     +---------------------+ |    |     |
|     |     |                     | |    |       |     |                     | |    |     |
|     |     | overrideContext     | |    |       |     | overrideContext     | |    |     |
|     |     |                     | |    |       |     |                     | |    |     |
|     |     | +----------------+  | |    |       |     | +----------------+  | |    |     |
|     |     | |                |  | |    |       |     | |                |  | |    |     |
|     |     | | bindingContext +----+    |       |     | | bindingContext +----+    |     |
|     |     | |                |  |      |       |     | |                |  |      |     |
|     |     | +----------------+  |      |       |     | +----------------+  |      |     |
|     |     |                     |      |       |     |                     |      |     |
|     |     +---------------------+      |       |     +---------------------+      |     |
|     |                                  |       |                                  |     |
|     +----------------------------------+       +----------------------------------+     |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

## Host scope

As we are talking about scope, it needs to be noted that 'host scope' is used in the context of `au-slot`.
There is no difference between a "normal" scope and a host scope, just it acts as the special marker to instruct to use the scope of the host element, instead of scope of the parent element.
Moreover, this is a special kind of scope that is valid only in the context of `au-slot`.
This is already discussed in detail in the [`au-slot` documentation](./components-revisited.md#au-slot), and thus not repeated here.

## Context and change observation

TODO

## Context selection

TODO
