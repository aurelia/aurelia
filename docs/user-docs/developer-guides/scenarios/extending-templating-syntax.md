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

In the next section we will look into how to teach Aurelia such knowledge. Before diving in, keep the following mental model in mind:

1. **Attribute patterns** (`@attributePattern`) split attribute names into `target` + `command` pairs. Use them when you want to teach the compiler new syntaxes such as `[(value)]`. See [Attribute Patterns](./attributepattern.md) for a full walkthrough.
2. **Attribute syntax mapper** (`IAttrMapper`) decides whether `value.bind` really means `value.two-way`, and how attribute names map onto DOM properties.
3. **Node observer locator** (`INodeObserverLocator`) teaches the runtime how to observe those DOM properties (which events fire, whether values are readonly, etc.).

All three steps are optional, but more advanced templating extensions usually need at least 2 and 3.

## Using the Attribute Syntax Mapper

The Attribute Syntax Mapper decides which binding command Aurelia should use when you write `.bind`. Built-in rules already cover native elements (`value.bind` on `<input>` becomes `.two-way`, `checked.bind` on `checkbox` becomes `.two-way`, etc.). When you integrate with design systems or Web Components, you nearly always need to extend the mapper so that your terse syntax keeps working.

Every Aurelia application uses a single mapper instance. Grab it with `resolve(IAttrMapper)` wherever you configure your app (typically via `AppTask`).

```typescript
import { IAttrMapper, resolve } from 'aurelia';

export class MyCustomElement {
  private attrMapper = resolve(IAttrMapper);

  constructor() {
    // do something with this.attrMapper
  }
}
```

`IAttrMapper` exposes:

- `useMapping(config)` — map attributes (by tag name) to DOM properties.
- `useGlobalMapping(config)` — same mapping, but applied to every tag.
- `useTwoWay(predicate)` — force `.bind` to behave like `.two-way` for certain `(element, attrName)` pairs. `attrName` is the kebab-case attribute name; return `true` to enable two-way.

Example: teach Aurelia that `<fast-text-field value.bind="...">` should become `value.two-way`.

```typescript
attrMapper.useTwoWay((element, attrName) => {
  switch (element.tagName) {
    case 'FAST-TEXT-FIELD':
    case 'ION-INPUT':
    case 'PAPER-INPUT':
      return attrName === 'value';
    default:
      return false;
  }
});
```

## Combining the attribute syntax mapper with the node observer locator

Teaching Aurelia to map `value.bind` to `value.two-way` is the first half of the story. The second half ensures the runtime knows **how** to observe that DOM property. Do this via the Node Observer Locator. Retrieve it with `resolve(INodeObserverLocator)` from `@aurelia/runtime`:

```typescript
import { resolve } from 'aurelia';
import { INodeObserverLocator } from '@aurelia/runtime';

export class MyCustomElement {
  private nodeObserverLocator = resolve(INodeObserverLocator);

  constructor() {
    // do something with this.nodeObserverLocator
  }
}
```

After grabbing the locator, call `useConfig()` (per-tag) or `useConfigGlobal()` (all tags). Each config object describes:

- `events: string[]` — events to subscribe to.
- `readonly?: boolean` — if `true`, Aurelia never writes to the property (useful for `files`).
- `default?: unknown` — fallback value when a binding sets `null`/`undefined`.
- `type?: INodeObserverConstructor` — provide a custom observer implementation.

Example: watch `<fast-text-field value>` via the `change` event.

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
    value: { events: ['change'] }
  }
})
```
{% endhint %}

## Putting it together

Combine both extensions inside `AppTask.creating` so they run before Aurelia instantiates your root component. The example below integrates a subset of [Microsoft FAST](https://explore.fast.design/components/fast-text-field) controls:

```typescript
import Aurelia, { AppTask, IAttrMapper } from 'aurelia';
import { INodeObserverLocator } from '@aurelia/runtime';

Aurelia
  .register(
    AppTask.creating(IAttrMapper, attrMapper => {
      attrMapper.useTwoWay((el, attrName) => {
        switch (el.tagName) {
          case 'FAST-TEXT-FIELD':
          case 'FAST-TEXT-AREA':
          case 'FAST-SLIDER':
            return attrName === 'value';
          default:
            return false;
        }
      });
    }),
    AppTask.creating(INodeObserverLocator, nodeObserverLocator => {
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

With the above, your Aurelia application now understands the concise `value.bind` syntax and listens to the correct events:

```html
<fast-text-field value.bind="message"></fast-text-field>
<fast-text-area value.bind="description"></fast-text-area>
<fast-slider value.bind="fontSize"></fast-slider>
```

## Troubleshooting and best practices

- **Duplicate mapping errors** – `IAttrMapper` throws if you register the same tag/attribute twice. Remove or consolidate the previous registration before adding new rules.
- **Verify DOM property names** – `useMapping` expects actual property names (`valueAsNumber`, `formNoValidate`, etc.). Typos silently fall back to camelCase conversion.
- **Mind attribute casing** – The mapper receives attributes in kebab-case. If your component exposes camelCase properties (common for Web Components), map `'my-prop'` → `'myProp'`.
- **Use `'new'` containers sparingly** – When augmenting `INodeObserverLocator`, you rarely need custom observers. Prefer event-only configs before writing a new observer type.
- **Test with devtools** – Toggle your custom elements in the browser and inspect `element.value`. If the value updates but Aurelia bindings do not, double-check the observer config. If bindings update but DOM does not, revisit `useMapping`.

Once you understand the flow—pattern → mapper → observer—you can make nearly any third-party component feel native inside Aurelia templates.
