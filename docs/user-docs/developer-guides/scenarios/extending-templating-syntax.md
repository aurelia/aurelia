---
description: >-
  The Aurelia template compiler is powerful and developer-friendly, allowing you
  extend its syntax with great ease.
---

# Extending templating syntax

## Context

Sometimes you will see the following template in an Aurelia application:

```html
<input value.bind="message">
```

Aurelia understands that `value.bind="message"` means `value.two-way="message"`, and later creates a two way binding between view model `message` property, and input `value` property. How does Aurelia know this?

By default, Aurelia is taught how to interpret a `bind` binding command on a property of an element via a Attribute Syntax Mapper. Application can also tap into this class to teach Aurelia some extra knowledge so that it understands more than just `value.bind` on an `<input/>` element.

## Examples

You may sometimes come across some custom input element in a component library, some examples are:

* Microsoft FAST `text-field` element: [https://explore.fast.design/components/fast-text-field](https://explore.fast.design/components/fast-text-field)
* Ionic `ion-input` element: [https://ionicframework.com/docs/api/input](https://ionicframework.com/docs/api/input)
* Polymer `paper-input` element: [https://www.webcomponents.org/element/@polymer/paper-input](https://www.webcomponents.org/element/@polymer/paper-input)
* and many more...

Regardless of the lib choice an application takes, what is needed in common is the ability to have a concise syntax to describe the two way binding intention with those custom elements. Some examples for the above custom input elements:

```html
<fast-text-field value.bind="message">
<ion-input value.bind="message">
<paper-input value.bind="message">
```

should be treated as:

```html
<fast-text-field value.two-way="message">
<ion-input value.two-way="message">
<paper-input value.two-way="message">
```

In the next section, we will look into how to teach Aurelia such knowledge.

## Using the Attribute Syntax Mapper

As mentioned earlier, the Attribute Syntax Mapper will be used to map `value.bind` into `value.two-way`. Every Aurelia application uses a single instance of this class. The instance can be retrieved via the injection of interface `IAttrMapper`, like the following example:

```typescript
import { resolve } from 'aurelia';
import { inject, IAttrMapper } from '@aurelia/runtime-html';

export class MyCustomElement {
  constructor(attrMapper = resolve(IAttrMapper)) {
    // do something with the attr mapper
  }
}
```

After grabbing the `IAttrMapper` instance, we can use the method `useTwoWay(fn)` of it to extend its knowledge. Following is an example of teaching it that the `bind` command on `value` property of the custom input elements above should be mapped to `two-way`:

```typescript
attrMapper.useTwoWay(function(element, property) {
  switch (element.tagName) {
    // <fast-text-field value.bind="message">
    case 'FAST-TEXT-FIELD': return property === 'value';
    // <ion-input value.bind="message">
    case 'ION-INPUT': return property === 'value';
    // <paper-input value.bind="message">
    case 'PAPER-INPUT': return property === 'value';
    // let other two way mapper check the validity
    default:
      return false;
  }
})
```

## Combining the attribute syntax mapper with the node observer locator

Teaching Aurelia to map `value.bind` to `value.two-way` is the first half of the story. The second half is about how we can teach Aurelia to observe the `value` property for changes on those custom input elements. We can do this via the Node Observer Locator. Every Aurelia application uses a single instance of this class, and this instance can be retrieved via the injection of interface `INodeObserverLocator` like the following example:

```typescript
import { resolve } from 'aurelia';
import { inject, INodeObserverLocator } from '@aurelia/runtime-html';

export class MyCustomElement {
  constructor(nodeObserverLocator = resolve(INodeObserverLocator)) {
    // do something with the locator
  }
}
```

After grabbing the `INodeObserverLocator` instance, we can use the method `useConfig` of it to extend its knowledge. Following is an example of teaching it that the `value` property, on a `<fast-text-field>` element could be observed using `change` event:

```typescript
nodeObserverLocator.useConfig('FAST-TEXT-FIELD', 'value', { events: ['change' ] });
```

Similarly, examples for `<ion-input>` and `<paper-input>`:

```typescript
nodeObserverLocator.useConfig('ION-INPUT', 'value', { events: ['change' ] });
nodeObserverLocator.useConfig('PAPER-INPUT', 'value', { events: ['change' ] });
```

{% hint style="success" %}
If an object is passed to the `.useConfig` API of the Node Observer Locator, it will be used as a multi-registration call, as per following example, where we register `<fast-text-field>`, `<ion-input>`, `<paper-input>` all in a single call:

```typescript
nodeObserverLocator.useConfig({
  'FAST-TEXT-FIELD': {
    value: { events: ['change'] }
  },
  'ION-INPUT': {
    value: { events: ['change'] }
  },
  'PAPER-INPUT': {
    value: { events: ['changer'] }
  }
})
```
{% endhint %}

Combining the examples in the two sections above into some more complete code block example, for [Microsoft FAST components](https://explore.fast.design/components/fast-text-field):

```typescript
import { inject, IContainer, IAttrMapper, INodeObserverLocator, AppTask, Aurelia } from 'aurelia';

Aurelia
  .register(
    AppTask.creating(IContainer, container => {
      const attrMapper = container.get(IAttrMapper);
      const nodeObserverLocator = container.get(INodeObserverLocator);
      attrMapper.useTwoWay((el, property) => {
        switch (el.tagName) {
          case 'FAST-TEXT-FIELD': return property === 'value';
          case 'FAST-TEXT-AREA': return property === 'value';
          case 'FAST-SLIDER': return property === 'value';
          // etc...
        }
      });
      nodeObserverLocator.useConfig({
        'FAST-TEXT-FIELD': {
          value: { events: ['change'] }
        },
        'FAST-TEXT-AREA': {
          value: { events: ['change'] }
        },
        'FAST-SLIDER': {
          value: { events: ['change'] }
        }
      });
    })
  )
  .app(class MyApp {})
  .start();
```

And with the above, your Aurelia application will get two way binding flow seamlessly:

```html
<fast-text-field value.bind="message"></fast-text-field>
<fast-text-area value.bind="description"></fast-text-area>
<fast-slider value.bind="fontSize"></fast-slider>
```
