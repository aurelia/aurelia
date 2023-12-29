---
description: >-
  Learn about binding values to attributes of DOM elements and
  how to extend the attribute mapping with great ease.
---

# Attribute mapping

When dealing with Aurelia and custom elements, we tend to use the `@bindable` decorator to define bindable properties. The bindable properties are members of the underlying view model class. However, there are cases, where we want to work with attributes of the DOM elements directly.

For example, we want to have an `<input>` element with a `maxlength` attribute and map a view model property to the attribute. Let us assume that we have the following view model class:

```typescript
export class App {
  private inputMaxLength: number = 10;
  private input: HTMLInputElement;
}
```
Then, intuitively, we would write the following template:

```html
<input maxlength.bind="inputMaxLength" ref="input">
```

This binds the value to the `maxlength` attribute of the `<input>` element. Consequently, the `input.maxLength` is also bound to be `10`. Note that binding the value of the `maxLength` attribute also sets the value of the `maxLength` property of the input element. This happens because Aurelia in background does the mapping for us.

In a broad level, this is what attribute mapping is about. This article provides further information about how it works and how to extend it.

## How it works

To facilitate the attribute mapping, Aurelia uses `IAttrMapper`, which has the information about how to map an attribute to a property. While creating property binding instructions from [binding commands](./bindingcommand.md), it is first checked if the attribute is a bindable or not. If it is a bindable property, then the attribute name (in kebab-case) is converted to the camelCase property name. However, when it is not a bindable, then the the attribute mapper is queried for the target property name. If the attribute mapper returns a property name, then the property binding instruction is created with that property name. Otherwise, the standard camelCase conversion is applied.

This means that if we want to bind a non-standard `<input>` attribute, such as `fizz-buzz`, then we can expect the `input.fizzBuzz` property to be bound. This looks as follows.

```html
<input fizz-buzz.bind="someValue" ref="input">
```

```typescript
export class App {
  private someValue: number = 10;
  private input: HTMLInputElement;

  public attached(): void {
    console.log(this.input.fizzBuzz); // 10
  }
}
```

## Extending the attribute mapping

The attribute mapping can be extended by registering new mappings with the `IAttrMapper`. The `IAttrMapper` provides two methods for this purpose. The `.useGlobalMapping` method registers mapping those are applicable for all elements, whereas the `.useMapping` is responsible for registering mapping for individual elements.

To this end, we can grab the `IAttrMapper` instance during bootstrapping the app and register the mappings (there is no restriction however, on when or where those mappings are registered). An example might look as follows.

```typescript
import {
  AppTask,
  Aurelia,
  IAttrMapper,
} from '@aurelia/runtime-html';

const au = new Aurelia();
au.register(
  AppTask.creating(IAttrMapper, (attrMapper) => {
    attrMapper.useMapping({
      'MY-CE': {
        'fizz-buzz': 'FizzBuzz',
      },
      INPUT: {
        'fizz-buzz': 'fizzbuzz',
      },
    });
    attrMapper.useGlobalMapping({
      'foo-bar': 'FooBar',
    });
  })
);
```

In the example above, we are registering a global mapping for `foo-bar` attribute to `FooBar` property, which will be applicable for all elements. We are also registering mappings for individual elements. Note that the key of the object is the [`nodeName`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName) of the element, thus for an element it needs to be the element name in upper case. Note that in the example above, we are mapping the `fizz-buzz` attribute differently for `<input>` and `<my-ce>` elements.

With this custom mapping registered, we can expect the following to work.

```html
<input fizz-buzz.bind="42" foo-bar.bind="43" ref="input">
<my-ce fizz-buzz.bind="44" foo-bar.bind="45" ref="myCe"></my-ce>
```

```typescript
export class App {
  private input: HTMLInputElement;
  private myCe: HTMLElement;

  public attached(): void {
    console.log(this.input.fizzbuzz); // 42
    console.log(this.input.FooBar); // 43
    console.log(this.myCe.FizzBuzz); // 44
    console.log(this.myCe.fooBar); // 45
  }
}
```

## Use two-way binding for attribute

In addition to register custom mappings, we can also teach the attribute mapper when to use two-way binding for an attribute. To this end, we can use the `.useTwoWay` method of the `IAttrMapper`. The `.useTwoWay` method accepts a predicate function that determines whether the attribute should be bound in two-way mode or not. The predicate function receives the attribute name and the element name as parameters. If the predicate function returns `true`, then the attribute is bound in two-way mode, otherwise it is bound in to-view mode.

An example looks like as follows.

```typescript

import {
  AppTask,
  Aurelia,
  IAttrMapper,
} from '@aurelia/runtime-html';

const au = new Aurelia();
au.register(
  AppTask.creating(IAttrMapper, (attrMapper) => {
    // code omitted for brevity
    attrMapper.useTwoWay(
      (el, attr) => el.tagName === 'MY-CE' && attr == 'fizz-buzz'
    );
  })
);
```

In this example, we are instructing the attribute mapper to use two-way binding for `fizz-buzz` attribute of `<my-ce>` element. This means that the following will work.

```html
<my-ce
    ref="myCe"
    foo-bar.bind="myCeFooBar"
    fizz-buzz.bind="myCeFizzBuzz"></my-ce>

myCeFizzBuzz: ${myCeFizzBuzz} myCeFooBar: ${myCeFooBar}
```

```typescript
export class MyApp {
  private myCeFooBar: any = 'fizz';
  private myCeFizzBuzz: any = '2424';
  private myCe: HTMLElement & { FooBar?: string; FizzBuzz?: string };
  public attached() {
    setInterval(() => {
      // This change will trigger a change for the myCeFizzBuzz property
      this.myCe.FizzBuzz = Math.ceil(Math.random() * 10_000).toString();

      // This change won't trigger a change for the myCeFooBar property
      this.myCe.FooBar = Math.ceil(Math.random() * 10_000).toString();
    }, 1000);
  }
}
```

## Live example

A similar example can be seen in action below.

{% embed url="https://stackblitz.com/edit/aurelia2-attribute-mapper?file=src%2Fmy-app.ts" %}
