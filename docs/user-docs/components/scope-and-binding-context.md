---
description: Understand the scope and binding context.
---

# Scope and context

You might have noticed these words "Scope", "binding context", and "override context" in other places in the documentation or while working with Aurelia in general. Although you can go a long way without even understanding what these are (Aurelia is cool that way), these are some (of many) powerful concepts that are essential when you need to deal with the lower level Aurelia2 API. This section explains what these terms mean.

{% hint style="success" %}
**Here's what you'll learn...**

* What is Scope?
* What are binding context, and override context?
* How to troubleshoot the rare and weird data binding issues?
* How a context is selected?
{% endhint %}

## Background

When we start an Aurelia app, the compilation pipeline JIT compiles the templates (HTML/markup) associated with custom elements. The compilation process in itself demands a documentation of its own, and certainly is out of the scope of this topic. Without going into much details about that, we can simply think of the compilation process in terms of the following steps:

* parse the template text,
* create instructions for custom elements, custom attributes, and template controllers (`if`, `else`, `repeat.for` etc.), and
* create a set of bindings for every instruction.

Most of the bindings also contains expressions. Following are some examples.

```markup
<!-- interpolation binding -->
${firstName}

<!-- property binding -->
<my-el prop.bind="address.pin"></my-el>
```

In the example above, the interpolation binding has the expression `firsName`, and the property binding has the expression `address.pin` (quite unsurprisingly the things are bit more involved in actuality, but this abstraction will do for now). An expression in itself might not be that interesting, but when it is evaluated, it becomes of interest. Enter scope. To evaluate an expression we need scope.

## Scope and binding context

The expressions themselves do not hold any state or context. This means that the expression `firstName` only knows that given an object it needs to grab the `firstName` property of that object. However, the expression in itself, does not hold that object. Scope is the container that holds the object(s) which can be supplied to the expression when it is evaluated.

These objects are known as contexts. There are typically two types of contexts: binding context, and override context. An expression can be evaluated against any of these two kinds of contexts. Even though there are couple of subtle difference between these two kinds of contexts (see [Override context](scope-and-binding-context.md#override-context)), in terms of expression evaluation there exists no difference between these two.

### JavaScript analogy

One way to think about expression and binding context is in terms of functions and binding those functions with a execution context (Refer: [Function.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_objects/Function/bind)). Let us consider the following example.

{% code title="foo.ts" %}
```typescript
function foo() { return this.a ** 2; }
```
{% endcode %}

If we invoke this function like `foo()`, we will get `NaN`. However, when we bind any object to it, it might return more meaningful value, depending on the bound object.

{% code title="foo.ts" %}
```typescript
function foo() { return this.a ** 2; }

const obj1 = { a: 10 };
const obj2 = { a: 20 };

console.log(foo.apply(obj1));       // 100
console.log(foo.apply(obj2));       // 400
```
{% endcode %}

Following that analogy, the expressions are like this function, or more precisely like the expression `a ** 2` in the function. Binding contexts are like the objects used to bind the function. That is given 2 different binding context, same expression can produce different results, when evaluated. Scope, as said before, wraps the binding context, almost like the scope in JavaScript. The need to have this wrapper over the binding context is explained in later sections.

### How to access the scope and the binding context?

Aurelia pipeline injects a `$controller` property to every custom element, custom attribute, and template controllers. This property can be used to access the scope, and binding context. Let us consider the following example.

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

Note that we haven't assigned any value explicitly to the `$controller` property; and that is assigned by the Aurelia pipeline. We can use the `$controller.scope` to access the scope, and subsequently `$controller.scope.bindingContext` can be used to access the binding context.

Note how the `bindingContext` in the above example points to `this`, that is the current instance of `App` (with template controllers, this gets little bit more involved; but we will leave that one out for now). However, in the context of evaluating expressions, we refer the source of data as a "context".

The relations explored so far can be expressed as follows.

```
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

As the name suggests, it is also a context, that overrides the binding context. Aurelia gives higher precedence to the override context when the desired property is found there. This means that while binding, if a property is found in both binding and override context, the later will be selected to evaluate the expression. We continue with the previous example; it renders `<div>Hello World!</div>`. However, things might be bit different if we toy with the override context, as shown in the following example.

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

With the assignment to `overrideContext.message` the rendered output is now `<div>Hello Aurelia!</div>` instead of `<div>Hello World!</div>`. This is because of the existence of the property `message` in the override context. As the assignment is made pre-binding phase (`created` hook in the example above), context [selection process](scope-and-binding-context.md#context-selection) sees that the required property exists in the override context, and selects that with higher precedence even though a property with the same name exists in the binding context as well.

Now with this information, we also have a new diagram.

```
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

Now let's address the question 'Why do we need override context at all?'. The reason it exists has to do with the template controllers (mostly). While writing template controllers, many times we want a context object that is not the underlying view-model instance. One such prominent example is the [`repeat.for`](../templates/repeats-and-list-rendering.md) template controller. As you might know that `repeat.for` template controller provides contextual properties such as `$index`, `$first`, `$last` etc. These properties end up being in the override context.

Now imagine if those properties actually end up being in the binding context, which is often the underlying view-model instance, it would have caused a lot of other issues. First of all, that would have restricted you having properties with the same name to avoid conflicts.

This in turn means that you need to know the template controllers you are using thoroughly, to know about such restrictions, which is not a sound idea in itself. And with that if you define a property with the same name, as used by the template controller, coupled with change observation etc., we could have found ourselves dealing with numerous bugs in the process. Override context helps us to get out of that horrific mess.

Another prominent use-case for override context is the `let` binding. When not specified otherwise, the properties bound via the `let` binding ends up in the override context. This can be seen in the example below.

{% code title="App.ts" %}
```typescript
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({
  name: 'app',
  template: '<let foo.bind="42"></let>${foo}'
})
export class App implements ICustomElementViewModel {
  public readonly $controller: ICustomElementController<this>;

  public attached(): void {
    const scope = this.$controller.scope;
    console.log('foo' in scope.bindingContext);  // false
    console.log(scope.overrideContext.foo);      // 42
  }
}
```
{% endcode %}

As typically the properties for the `let`-bindings are view-only properties, it makes sense to have those properties in the override context.

{% hint style="info" %}
Do you know that you can use `to-binding-context` attribute in `let`-binding to target the binding context instead of override context? Why don't you try `<let foo.bind="42" to-binding-context></let>` and inspect the scope contexts by yourself?
{% endhint %}

## Parent scope

The discussion so far has explained the necessity of context. However that still does not answer the question 'If the expressions are evaluated based on the context, why do we even need scope?'. Apart from serving as a logical container to the contexts, a scope also optionally points to the parent scope. Let us consider the following example to understand that.

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

In the example above, `App` uses the `FooBar` custom element, and both have property named `message`, initialized with different values. As expected, the rendered output in this case is `Hello Foo-Bar! Hello App!`. You might have used the `$parent` keyword a lot, but for completeness it should be clarified that the parent scope can be accessed using the `$parent` keyword. In the example above `FooBar#$controller.scope.parentScope.bindingContext` points to the instance of `App` where `<foo-bar>` is used. In short, every instance of scope has a `parentScope` property that points to the parent scope, when available.

With this information, our diagram changes for one last time.

```
    +----------------------------+    +----------------------------+
+-->+                            |    |                            |
|   |     Scope                  |    |     Scope                  |
|   |                            |    |                            |
|   |     +--------------+       |    |     +--------------+       |
|   |     |              |       |    |     |              |       |
|   |     | parentScope  |       |    |     | parentScope  +----------+
|   |     |              |       |    |     |              |       |  |
|   |     +--------------+       |    |     +--------------+       |  |
|   |                            |    |                            |  |
|   |     +----------------+     |    |     +----------------+     |  |
|   |     |                |     |    |     |                |     |  |
|   |     | bindingContext |     |    |     | bindingContext |     |  |
|   |     |                |     |    |     |                |     |  |
|   |     +----------------+     |    |     +----------------+     |  |
|   |                            |    |                            |  |
|   |     +-----------------+    |    |     +-----------------+    |  |
|   |     |                 |    |    |     |                 |    |  |
|   |     | overrideContext |    |    |     | overrideContext |    |  |
|   |     |                 |    |    |     |                 |    |  |
|   |     +-----------------+    |    |     +-----------------+    |  |
|   |                            |    |                            |  |
|   +----------------------------+    +----------------------------+  |
|                                                                     |
+---------------------------------------------------------------------+
```

Note that the `parentScope` for the scope of the root component is `null`.

## Host scope

As we are talking about scope, it needs to be noted that the term 'host scope' is used in the context of `au-slot`. There is no difference between a "normal" scope and a host scope, just it acts as the special marker to instruct the scope selection process to use the scope of the host element, instead of scope of the parent element. Moreover, this is a special kind of scope that is valid only in the context of `au-slot`. This is already discussed in detail in the [`au-slot` documentation](broken-reference/), and thus not repeated here.

## Context and change observation

Now let us discuss briefly about change observation. A comprehensive discussion on change observation is bit out of the scope of this documentation. However, for this discussion it would suffice to say that generally whenever Aurelia binds an expression to the view, it also employs one or more observers for that. This is how when the value of the underlying property changes, the change is also propagated to view or other associated components. The focus of this discussion is how some interesting scenarios occur in conjunction of binding/override context and the change observation.

Let's start with a simple example.

{% code title="App.ts" %}
```typescript
import {
  IPlatform,
} from '@aurelia/kernel';
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({
  name: 'app',
  template: `\${message}`,
})
export class App implements ICustomElementViewModel {
  public message: string = 'Hello App!';
  public readonly $controller: ICustomElementController<this>;
  private intervalId: ReturnType<IPlatform['setInterval']>;

  public constructor(
    @IPlatform private readonly platform: IPlatform,
  ) { }

  public attached(): void {
    const scope = this.$controller.scope;
    let i = 1;

    this.intervalId = this.platform.setInterval(() => {
      scope.bindingContext.message = `Hello App! #i: ${i++}`;
    }, 1000);

    // this.intervalId = this.platform.setInterval(() => {
    //   this.message = `Hello App! #i: ${i++}`;
    // }, 1000);
  }

  public detaching(): void {
    this.platform.clearInterval(this.intervalId);
  }
}
```
{% endcode %}

The example above updates the `message` property of the binding context in every 1 second. As Aurelia is also observing the property, the interpolated output is also updated after every 1 second. Note that as the `scope.bindingContext` above points to the `this`, updating `this.message` like that way has the exact same effect.

As the next example, we change the property in both binding context and override context.

{% code title="App.ts" %}
```typescript
import {
  IPlatform,
} from '@aurelia/kernel';
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({
  name: 'app',
  template: `\${message}`,
})
export class App implements ICustomElementViewModel {
  public message: string = 'Hello App!';
  public readonly $controller: ICustomElementController<this>;
  private intervalId1: ReturnType<IPlatform['setInterval']>;
  private intervalId2: ReturnType<IPlatform['setInterval']>;

  public constructor(
    @IPlatform private readonly platform: IPlatform,
  ) { }

  public attached(): void {
    const scope = this.$controller.scope;
    let i = 1;

    this.intervalId1 = this.platform.setInterval(() => {
      scope.bindingContext.message = `Hello Binding Context! #i: ${i++}`;
    }, 1000);

    this.intervalId2 = this.platform.setInterval(() => {
      scope.overrideContext.message = `Hello Override Context! #i: ${i}`;
    }, 1000);
  }

  public detaching(): void {
    const platform = this.platform.
    platform.clearInterval(this.intervalId1);
    platform.clearInterval(this.intervalId2);
  }
}
```
{% endcode %}

Although it has been said before that the property in override context takes precedence over binding context, the output from the example above is `Hello Binding Context! #i: 1`, `Hello Binding Context! #i: 2`, and so on. The reason for this behavior is because of the fact that the `scope.bindingContext.message` is in fact bound to the view instead of `scope.overrideContext.message`, as the later was non-existent during binding phase (note that the values are being changed in `attached` lifecycle hook). Therefore, the change observation is also applied for the `scope.bindingContext.message` as opposed to that of override context. This explains why updating the `scope.overrideContext.message` is rather 'futile' in the example above.

However, the result would have been quite different, if the `message` property is introduced to override context during the `binding` phase (or before that for that matter).

{% code title="App.ts" %}
```typescript
import {
  IPlatform,
} from '@aurelia/kernel';
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({
  name: 'app',
  template: `\${message}`,
})
export class App implements ICustomElementViewModel {
  public message: string = 'Hello App!';
  public readonly $controller: ICustomElementController<this>;
  private intervalId1: ReturnType<IPlatform['setInterval']>;
  private intervalId2: ReturnType<IPlatform['setInterval']>;

  public constructor(
    @IPlatform private readonly platform: IPlatform,
  ) { }

  public binding(): void {
    this.$controller.scope.overrideContext.message = 'Hello Override Context!';
  }

  public attached(): void {
    const scope = this.$controller.scope;
    let i = 1;

    this.intervalId1 = this.platform.setInterval(() => {
      scope.bindingContext.message = `Hello Binding Context! #i: ${i++}`;
    }, 1000);

    this.intervalId2 = this.platform.setInterval(() => {
      scope.overrideContext.message = `Hello Override Context! #i: ${i}`;
    }, 1000);
  }

  public detaching(): void {
    const platform = this.platform.
    platform.clearInterval(this.intervalId1);
    platform.clearInterval(this.intervalId2);
  }
}
```
{% endcode %}

Note that the example above introduces the `message` property in the override context during the `binding` phase. When the interpolation expression is evaluated in the view, it is that property from the override context that ends up being bound. This means that the `message` property in override context is also observed. Thus, quite expectedly in every 1 second output of the above shown example changes as `Hello Override Context! #i: 1`, `Hello Override Context! #i: 2`, and so on.

## Context selection

So far we have seen various aspects of scope, binding and override context. One thing we have not addressed so far is how the contexts are selected for expression evaluation or assignment. In this section, we will look into that aspect.

The context selection process can be summed up (simplified) as follows.

1. IF `$parent` keyword is used once or more than once, THEN
   1. traverse up the scope, the required number of parents (that is for `$parent.$parent.foo`, we will go two steps/scopes up)
   2. RETURN override context if the desired property is found there, ELSE RETURN binding context.
2. ELSE
   1. LOOP till either the desired property is found in the context or the component boundary is hit. Then perform the following.
   2. IF the desired property is found in the override context return override context.
   3. ELSE RETURN binding context.

The first rule involving `$parent` should be self-explanatory. We will focus on the second part.

Let us first see an example to demonstrate the utility of the rule `#2.1.`.

{% code title="App.ts" %}
```typescript
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({
  name: 'foo-bar',
  template: `<div repeat.for="i of 3">
  <div repeat.for="j of 2">
    \${message} \${$parent.i} \${j}
  </div>
  </div>` })
export class FooBar implements ICustomElementViewModel {
  public readonly message: string = 'Hello Foo-Bar!';
}

@customElement({
  name: 'app',
  template: '<foo-bar></foo-bar>',
  dependencies: [FooBar]
})
export class App implements ICustomElementViewModel {
  public message: string = 'Hello App!';
}
```
{% endcode %}

As expected, the example produces the following output.

```
Hello Foo-Bar! 0 0
Hello Foo-Bar! 0 1
Hello Foo-Bar! 1 0
Hello Foo-Bar! 1 1
Hello Foo-Bar! 2 0
Hello Foo-Bar! 2 1
```

Note that both `App` and `FooBar` initializes their own `message` properties. According to our rule `#2.3.` binding context is selected, and the corresponding `message` property is bound to the view. However, it is important to note that if the `FooBar#message` stays uninitialized, that is the `message` property exists neither in binding context nor in override context (of `FooBar`'s scope), the output would have been as follows.

```
0 0
0 1
1 0
1 1
2 0
2 1
```

Although it should be quite as per expectation, the point to be noted here is that the scope traversal never reaches to `App` in the process. This is because of the 'component boundary' clause in rule `#2.1.`. In case of this example the expression evaluation starts with the scope of the innermost `repeat.for`, and traversed upwards.

When traversal hits the scope of `FooBar`, it recognize the scope as a component boundary, and stops traversing any further, irrespective of whether the property is found or not. Contextually note that if you want to cross the component boundary, you need to explicitly use `$parent` keyword.

The rule `#2.2.` is also self explanatory, as we have seen plenty examples of override context precedence so far. Thus the last bit of this story boils down to the rule `#2.3.`. This rule facilitates using an uninitialized property in binding context by default or as fallback, as can be seen in the example below.

{% code title="App.ts" %}
```typescript
import {
  customElement,
  ICustomElementController,
  ICustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({
  name: 'app',
  template: `\${message}`,
})
export class App implements ICustomElementViewModel {
  public message: string;

  public constructor(
    @IPlatform private readonly platform: IPlatform,
  ) { }

  public attached(): void {
    const platform = this.platform;
    const id = platform.setTimeout(() => {
      this.message = 'Hello World!';
      platform.clearTimeout(id);
    }, 2000);
  }
}
```
{% endcode %}

The example shown above produces `Hello World!` as output after 2 seconds of the invocation of the `attached` hook. This happens because of the fallback to binding context by the rule `#2.3.`.

That's it! Congratulations! You have made it till the end. Go have that tea break now! Hope you have enjoyed this documentation as much as you will enjoy that tea. Have fun with Aurelia2!
