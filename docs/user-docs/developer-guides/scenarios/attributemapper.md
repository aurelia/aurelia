---
description: >-
  Learn about binding values to attributes of DOM elements and
  how to extend the attribute mapping with great ease.
---

# Attribute mapping

Attribute mapping is Aurelia's way of keeping template syntax concise. After an attribute pattern parses the attribute name but before a binding command emits instructions, the mapper answers two questions:

1. Which DOM property does this attribute target?
2. Should `.bind` implicitly behave like `.two-way` for this attribute?

This is the mechanism that lets you write `<input value.bind="message">` and automatically get a two-way binding. By teaching the mapper about your own elements, you can bring the same ergonomics to Web Components, design systems, or DSLs.

## When to extend `IAttrMapper`

Reach for the mapper when:

- **Bridging custom elements** – Third-party components often expose camelCase properties such as `valueAsDate` or `formNoValidate`.
- **Designing DSLs** – Attributes like `data-track` or `foo-bar` need to land on specific DOM properties regardless of casing.
- **Improving authoring ergonomics** – Upgrading `progress.bind` to two-way on slider-like controls keeps templates readable.

If you need to invent new attribute syntaxes (`[(value)]`, `@click`, etc.), start with [attribute patterns](./attributepattern.md). If you need to observe DOM properties, follow up with the [node observer locator](./extending-templating-syntax.md#combining-the-attribute-syntax-mapper-with-the-node-observer-locator).

## How the mapper decides

When Aurelia encounters an attribute that does not belong to a custom element bindable, it walks through the mapper logic:

1. Check tag-specific mappings registered via `useMapping`.
2. Fall back to global mappings from `useGlobalMapping`.
3. If no mapping exists, camelCase the attribute name.
4. If the binding command is `bind`, ask each predicate registered via `useTwoWay` whether the attribute should become two-way.

Your extensions only run for attributes that are not already handled by custom element bindables, so you can layer mappings without unintentionally overriding component contracts.

## Registering mappings during startup

Use `AppTask.creating` to register mappings before Aurelia instantiates the root component:

```typescript
import Aurelia, { AppTask, IAttrMapper } from 'aurelia';

Aurelia.register(
  AppTask.creating(IAttrMapper, attrMapper => {
    attrMapper.useMapping({
      'MY-CE': { 'fizz-buzz': 'FizzBuzz' },
      INPUT: { 'fizz-buzz': 'fizzbuzz' },
    });
    attrMapper.useGlobalMapping({
      'foo-bar': 'FooBar',
    });
  })
);
```

Keys inside `useMapping` must match the element's `tagName` (uppercase). The destination values must match the actual DOM property names exactly (`formNoValidate`, not `formnovalidate`).

With the mapping above in place, templates stay clean:

```html
<input fizz-buzz.bind="userLimit" foo-bar.bind="hint" ref="input">
<my-ce fizz-buzz.bind="42" foo-bar.bind="43" ref="myCe"></my-ce>
```

```typescript
export class App {
  private input!: HTMLInputElement;
  private myCe!: HTMLElement & { FizzBuzz?: number; FooBar?: number };

  public attached() {
    console.log(this.input.fizzbuzz); //  userLimit
    console.log(this.myCe.FizzBuzz);  //  42
  }
}
```

## Enabling implicit two-way bindings

Some controls should default to two-way binding even when authors write `.bind`. Use `useTwoWay` to register a predicate `(element, attrName) => boolean`:

```typescript
import Aurelia, { AppTask, IAttrMapper } from 'aurelia';

Aurelia.register(
  AppTask.creating(IAttrMapper, attrMapper => {
    attrMapper.useTwoWay((element, attrName) =>
      element.tagName === 'MY-CE' && attrName === 'fizz-buzz');
  })
);
```

Predicates receive the live element, so you can inspect classes, attributes, or even dataset values before opting into two-way. Keep the logic lightweight—these predicates run for every `*.bind` attribute Aurelia encounters.

## Troubleshooting and best practices

- **Uppercase tag names** – Browsers expose `element.tagName` in uppercase; use the same casing in `useMapping`.
- **Avoid duplicates** – Registering the same tag/attribute combination twice throws. Remove or consolidate old mappings before adding new ones.
- **Destination accuracy** – Mistyped destination properties silently fall back to camelCase conversion. Inspect the element in devtools and read `Object.keys(element)` if unsure.
- **Predicate order matters** – `useTwoWay` predicates run in registration order. Put the most specific check first.
- **Verify manually** – Toggle the DOM property in devtools. If the UI updates but Aurelia does not, revisit the observer configuration. If neither updates, revisit the mapping.
- **Pair with observers** – Mapping alone does not teach Aurelia how to observe custom properties. Follow up with `INodeObserverLocator.useConfig` so bindings know which events to listen to.

With the mapper tailored to your components, you can keep templates expressive while relying on the full power of Aurelia's binding system.
