---
description: Observe changes in your applications.
---

# Observation Basic 

Aurelia observation system is built using observers and subscribers. By default, an observer locator is used to create observers and subscribe to them for change notification. A basic observer has the following interface:

```ts
interface IObserver {
  subscribe(subscriber)
  unsubscribe(subscriber)
}
```

The method `.subscribe()` of an observer can be used subscribe to the changes it observes. This method takes a subscriber as its argument. A basic subscriber has the following interface:

```ts
interface ISubscriber {
  handleChange(newValue, oldValue)
}
```

An observer of an object property can be retrieved using an observer locator. An example is:

```ts
// getting the observer for property 'value'
const observer = observerLocator.getObserver(obj, 'value')
```

And to subscribe to changes emitted by this observer:
```ts
const subscriber = {
  handleChange(newValue) {
    console.log('new value of object is:', newValue)
  }
}

observer.subscribe(subscriber)

// and to stop subscribing
observer.unsubscribe(subscriber)
```

# HTML Observation

HTML elements are special objects that often require different observation strategies, and most of the time, listening to some specific event is the preferred way. For this reason, Aurelia encourages using events to observe HTML elements.

As an example, the `value` property of an `<input />` element should be observed by listening to the `<input />` change events such as `input` or `change` on the element. Another example is the `value` property of a `<select />` element should be observed by listening to the `change` event on it.

By default, the observation of HTML elements are done using a node observer locator. This default locator has a basic set of API that allows users to teach Aurelia how to observe html element observation effectively. Following is the trimmed interface of the node observer locator, highlighting its capability to learn how to observe HTML elements:

```ts
export interface INodeObserverLocator {
  allowDirtyCheck: boolean;
  handles(obj, key, requestor): boolean;

  useConfig(config): void;
  useConfig(nodeName, key, eventsConfig): void;

  useGlobalConfig(config): void;
  useGlobalConfig(key, eventsConfig): void;
}
```

`useConfig` and `useGlobalConfig` are two methods that can be used to teach the default node observer locator what events can be used to observe a property of a specific element, or any element.

- An example of how to teach Aurelia observe property `value` of a `<textarea />` element:
  ```ts
  nodeObserverLocator.useConfig('textarea', 'value', { events: ['input', 'change'] });
  ```
  In this example, `eventsConfig` argument has the value `{ events: ['input', 'change']}`.

- Another example of how to teach Aurelia observe property `length` of an `<input />` element:
  ```ts
  nodeObserverLocator.useConfig('input', 'length', { events: ['input'] });
  ```
  In this example, `eventsConfig` argument has the value `{ events: ['input']}`.

- Another example of how to teach Aurelia observe property `scrollTop` of all elements:
  ```ts
  nodeObserverLocator.useGlobalConfig('scrollTop', { events: ['scroll'] });
  ```
  In this example, `eventsConfig` argument has the value `{ events: ['scroll']}`.

# Webcomponent - Custom Element Observation

It should be the same observing custom (HTML) elements and normal HTML elements. It is common for webcomponents to have well defined events associated with their custom properties, so observing them often means adding a few lines of configuration.

- An example of how to teach Aurelia observe property `value` of a `<my-input />` element, and `<my-input />` dispatches `valueChanged` event when its value has been changed:

  ```ts
  nodeObserverLocator.useConfig('my-input', 'value', { events: ['valueChanged'] });
  ```
