---
description: Observe changes to native HTML element properties and attributes in Aurelia.
---

# HTML observation

## Quick introduction

HTML elements are special objects that often require different observation strategies, and most of the time, listening to some specific event is the preferred way. For this reason, Aurelia encourages using events to observe HTML elements.

As an example, the `value` property of an `<input />` element should be observed by listening to the `<input />` change events such as `input` or `change` on the element. Another example is the `value` property of a `<select />` element should be observed by listening to the `change` event on it.

By default, the observation of HTML elements is done using a default node observer locator implementation. This default locator has a basic set of APIs that allows users to teach Aurelia how to observe HTML element observation effectively.

The following is the trimmed interface of the node observer locator, highlighting its capability to learn how to observe HTML elements:

```typescript
export class NodeObserverLocator {
  allowDirtyCheck: boolean;
  handles(obj, key, requestor): boolean;

  useConfig(config): void;
  useConfig(nodeName, key, eventsConfig): void;

  useConfigGlobal(config): void;
  useConfigGlobal(key, eventsConfig): void;
}
```

`useConfig` and `useConfigGlobal` are two methods that can be used to teach the default node observer locator what events can be used to observe a property of a specific element or any element.

## Node observer examples

Using the `nodeObserverLocator` API, we can tell Aurelia how to observe properties of HTML elements for changes. Under the hood, Aurelia already observes properties like values on form inputs, but it is good to understand how this functionality works, especially for custom elements and web components.

### How to teach Aurelia to observe the `value` property of a `<textarea />` element:

```typescript
nodeObserverLocator.useConfig('textarea', 'value', { events: ['input', 'change'] });
```

In this example, the `eventsConfig` argument has the value `{ events: ['input', 'change']}`.

### How to teach Aurelia to observe property `length` of an `<input />` element:

```typescript
nodeObserverLocator.useConfig('input', 'length', { events: ['input'] });
```

In this example, `eventsConfig` argument has the value `{ events: ['input']}`.

### How to teach Aurelia observe property `scrollTop` of all elements:

```typescript
nodeObserverLocator.useConfigGlobal('scrollTop', { events: ['scroll'] });
```

In this example, `eventsConfig` argument has the value `{ events: ['scroll']}`.

## Observing custom elements in Web Components

It should be the same as observing custom (HTML) elements and normal HTML elements. It is common for Web Components to have well-defined events associated with their custom properties, so observing them often means adding a few configuration lines.

An example of how to teach Aurelia to observe the `value` property of a `<my-input />` element, and `<my-input />` dispatches `valueChanged` event when its value has been changed:

```typescript
nodeObserverLocator.useConfig('my-input', 'value', { events: ['valueChanged'] });
```

## Built-in observers and accessors

The runtime already exposes a rich set of observer implementations under `@aurelia/runtime-html`. Understanding what each one does helps you decide whether you really need a custom observer, or whether reusing an existing one is enough.

| Class | Applies to | Purpose |
| --- | --- | --- |
| `ValueAttributeObserver` | Text inputs & textareas | Synchronizes the element's `value` property, batching DOM writes and only notifying subscribers when the value actually changes. |
| `CheckedObserver` | Checkboxes & radio buttons | Handles boolean `checked` state as well as radio-group coordination. |
| `SelectValueObserver` | `<select>` + `<option>` | Keeps the bound value in sync with the currently selected option(s), even when the option list changes dynamically. |
| `ClassAttributeAccessor` / `StyleAttributeAccessor` / `DataAttributeAccessor` | Any element | Provides low-level read/write access to `class`, inline styles, or `data-*` attributes so bindings can update them efficiently. |
| `AttributeNSAccessor` | Namespaced attributes (e.g., SVG) | Ensures SVG-specific attributes such as `xlink:href` are set in the proper namespace. |
| `ISVGAnalyzer` / `SVGAnalyzer` | SVG elements | Detects which SVG attributes map to properties or need namespace-aware setters so the right accessor can be picked automatically. |

All of these observers are registered by `StandardConfiguration`, so you get them for free. When you call `nodeObserverLocator.useConfig` you are not replacing these observers—you are simply telling Aurelia which DOM events should drive an existing observer. If you genuinely need a brand-new observer (for example, to wrap a third-party web component that exposes a custom `model` property), create a class that implements `INodeObserver`, register it, and point the locator at it:

```typescript
import { IContainer, Registration } from '@aurelia/kernel';
import { INodeObserverLocator } from '@aurelia/runtime-html';

class ModelObserver {
  constructor(private element: Element) {}
  // implement getValue, setValue, subscribe, etc.
}

AppTask.creating(IContainer, container => {
  container.register(Registration.singleton(ModelObserver, ModelObserver));
  container.get(INodeObserverLocator).useConfig('fancy-input', 'model', {
    observer: ModelObserver,
    events: ['modelchange']
  });
});
```

By reusing the existing observer interfaces instead of reinventing the wiring, you get consistent change notifications, flush semantics, and tooling support across the entire component tree.
