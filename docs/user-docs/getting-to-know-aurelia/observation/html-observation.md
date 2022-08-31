# HTML observation

HTML elements are special objects that often require different observation strategies, and most of the time, listening to some specific event is the preferred way. For this reason, Aurelia encourages using events to observe HTML elements.

As an example, the `value` property of an `<input />` element should be observed by listening to the `<input />` change events such as `input` or `change` on the element. Another example is the `value` property of a `<select />` element should be observed by listening to the `change` event on it.

By default, the observation of HTML elements is done using a default node observer locator implementation. This default locator has a basic set of API that allows users to teach Aurelia how to observe HTML element observation effectively.

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

`useConfig` and `useConfigGlobal` are two methods that can be used to teach the default node observer locator what events can be used to observe a property of a specific element, or any element.

* An example of how to teach Aurelia to observe the `value` property of a `<textarea />` element:

  ```typescript
  nodeObserverLocator.useConfig('textarea', 'value', { events: ['input', 'change'] });
  ```

  In this example, the `eventsConfig` argument has the value `{ events: ['input', 'change']}`.

* Another example of how to teach Aurelia to observe property `length` of an `<input />` element:

  ```typescript
  nodeObserverLocator.useConfig('input', 'length', { events: ['input'] });
  ```

  In this example, `eventsConfig` argument has the value `{ events: ['input']}`.

* Another example of how to teach Aurelia observe property `scrollTop` of all elements:

  ```typescript
  nodeObserverLocator.useConfigGlobal('scrollTop', { events: ['scroll'] });
  ```

  In this example, `eventsConfig` argument has the value `{ events: ['scroll']}`.

## Observing custom elements in Web Components

It should be the same observing custom \(HTML\) elements and normal HTML elements. It is common for Web Components to have well-defined events associated with their custom properties, so observing them often means adding a few lines of configuration.

* An example of how to teach Aurelia to observe the `value` property of a `<my-input />` element, and `<my-input />` dispatches `valueChanged` event when its value has been changed:

  ```typescript
  nodeObserverLocator.useConfig('my-input', 'value', { events: ['valueChanged'] });
  ```

