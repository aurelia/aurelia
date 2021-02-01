---
description: Observe changes in your applications.
---

# Observation

## Observation Basic

Aurelia observation system is built using observers and subscribers. By default, an observer locator is used to create observers and subscribe to them for change notification. 

**A basic observer has the following interface:**

```typescript
interface IObserver {
  subscribe(subscriber)
  unsubscribe(subscriber)
}
```

The `subscribe` method of an observer can be used to subscribe to the changes that it observes. This method takes a subscriber as its argument.

**A basic subscriber has the following interface:**

```typescript
interface ISubscriber {
  handleChange(newValue, oldValue)
}
```

An observer of an object property can be retrieved using an observer locator. 

**An example of this is:**

```typescript
// getting the observer for property 'value'
const observer = observerLocator.getObserver(obj, 'value')
```

**And to subscribe to changes emitted by this observer:**

```typescript
const subscriber = {
  handleChange(newValue) {
    console.log('new value of object is:', newValue)
  }
}

observer.subscribe(subscriber)

// and to stop subscribing
observer.unsubscribe(subscriber)
```

## The observable decorator

TODO: describe the decorator here

### Effect Observation

Based on the basic above for how observation works, Aurelia provides a higher-level API for simplifying some common tasks to handle a common reactivity intent in any application: run a function again, when any of its dependencies have been changed. This function is called an effect, and the dependencies are typically\(1\) tracked when they are accessed \(read\) inside this effect function. The builtin `@observable` decorator from Aurelia enables this track-on-read capability by default.

1: Aurelia provides a few ways to declare a dependency for an effect function, the most common one is the track "on read" of a reactive property

**In the following example:**

```typescript
class MouseTracker {
  @observable
  coord = [0, 0];
}
```

The property `coord` of a `MouseTracker` instance will be turned into a reactive property and is also aware of effect function dependency tracking.

### Creating an Effect

The effect API is provided via the default implementation of an interface named `IObservation`. 

An example to retrieve an instance of this interface is per following:

1. Getting from a container directly

   ```typescript
    import { IObservation } from 'aurelia';

    ...
    const observation = someContainer.get(IObservation);
   ```

2. Getting through injection

   ```typescript
    import { inject, IObservation } from 'aurelia';
 
    @inject(IObservation)
    class MyElement {
      constructor(observation) {
        // ...
      }
    }
   ```

3. Autoinjection \(if you are using TypeScript\)

   ```typescript
    class MyElement {
      constructor(@IObservation readonly observation) {
        // ...
      }
    }
   ```

After getting ahold of an `IObservation` instance, an effect can be created via the method `run` of it:

```typescript
const effect = observation.run(() => {
  // code here
});
```

Note that the effect function will be run immediately.

By default, an effect is independent of any application lifecycle, which means it does not stop when the application that owns the `observation` instance has stopped. To stop/destroy an effect, call the method `stop()` on the effect object:

```typescript
const effect = IObservation.run(() => {
  // code here
});

// stop the effect like this
effect.stop();
```

### Effect Observation & Reaction Examples

1. Creating an effect that logs the user mouse movement on the document

   ```typescript
    import { inject, IObservation, observable } from 'aurelia'

    class MouseTracker {
      @observable coord = [0, 0]; // x: 0, y: 0 is the default value
    }

    // Inside an application:
    @inject(IObservation)
    class App {
      constructor(observation) {
        const mouseTracker = new MouseTracker();
     
        document.addEventListener('mousemove', (e) => {
          mouseTracker.coord = [e.pageX, e.pageY]
        });
     
        observation.run(() => {
          console.log(mouseTracker.coord)
        });
      }
    }
   ```

   Now whenever the user moves the mouse around, a log will be added to the console with the coordinate of the mouse.  

2. Creating an effect that sends a request whenever user focus/unfocus the browser tab

   ```typescript
    import { inject, IObservation, observable } from 'aurelia'

    class PageActivity {
      @observable active = false
    }

    // Inside an application:
    @inject(IObservation)
    class App {
      constructor(observation) {
        const pageActivity = new PageActivity();
     
        document.addEventListener(visibilityChange, (e) => {
          pageActivity.active = !document.hidden;
        });
     
        observation.run(() => {
          fetch('my-game/user-activity', { body: JSON.stringify({ active: pageActivity.active }) })
        });
      }
    }
   ```

## HTML Observation

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

## Webcomponent - Custom Element Observation

It should be the same observing custom \(HTML\) elements and normal HTML elements. It is common for Web Components to have well-defined events associated with their custom properties, so observing them often means adding a few lines of configuration.

* An example of how to teach Aurelia to observe the `value` property of a `<my-input />` element, and `<my-input />` dispatches `valueChanged` event when its value has been changed:

  ```typescript
  nodeObserverLocator.useConfig('my-input', 'value', { events: ['valueChanged'] });
  ```

