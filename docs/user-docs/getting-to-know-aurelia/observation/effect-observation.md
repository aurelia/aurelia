# Effect observation

Aurelia provides a higher-level API for simplifying some common tasks to handle a common reactivity intent in any application: run a function again when any of its dependencies have been changed.&#x20;

This function is called an effect, and the dependencies are typically tracked when they are accessed (read) inside this effect function. The builtin `@observable` decorator from Aurelia enables this track-on-read capability by default.

Aurelia provides a few ways to declare a dependency for an effect function. The most common one is the track "on read" of a reactive property.

**In the following example:**

```typescript
class MouseTracker {
  @observable
  coord = [0, 0];
}
```

The property `coord` of a `MouseTracker` instance will be turned into a reactive property and is also aware of effect function dependency tracking.

{% hint style="info" %}
Properties decorated with `@observable` and any proxy based property accesses will be tracked as dependencies of the effect
{% endhint %}

The effect APIs are provided via the default implementation of the interface `IObservation`, which can be retrieved like one of the following examples:

  - **Getting from a container directly**:
  ```typescript
  import { IObservation } from 'aurelia';

  ...
  const observation = someContainer.get(IObservation);
  ```

  - **Getting through injection**:
  ```typescript
  import { inject, IObservation } from 'aurelia';

  @inject(IObservation)
  class MyElement {
    constructor(observation) {
      // ...
    }
  }
  ```
  Or

  ```typescript
  class MyElement {
    constructor(@IObservation readonly observation) {
      // ...
    }
  }
  ```

After getting the observation object, there are two APIs that can be used to created effects as described in the following sections:

## Watch effect

Watch effect is a way to describe a getter based observation of an object. An example to create watch effect is per the following:

```typescript
import { inject, IObservation } from 'aurelia';

@inject(IObservation)
class PersonalInfo {
  constructor(observation) {
    const effect = observation.watch(this.primaryInfo, (primaryInfo) => primaryInfo.name, function nameChanged(newName, oldName) {
      // do something with name
    });

    // effect.stop() later when necessary
  }
}
```

Note that the effect function will be run immediately. If you do not want to run the callback immediately, pass an option `immediate: false` as the 4th parameter:
```typescript
observation.watch(obj, getter, callback, { immediate: false });
```

By default, a watch effect is independent of any application lifecycle, which means it does not stop when the application that owns the `observation` instance has stopped. To stop/destroy an effect, call the method `stop()` on the effect object.

## Run effect

Run effects describe a function to be called repeatedly whenever any dependency tracked inside it changes.

### Creating an Effect

After getting an `IObservation` instance, a run effect can be created via the method `run` of it:

```typescript
const effect = observation.run(() => {
  // code here
});
```

Note that the effect function will be run immediately.

By default, a effect is independent of any application lifecycle, which means it does not stop when the application that owns the `observation` instance has stopped. To stop/destroy an effect, call the method `stop()` on the effect object:

```typescript
const effect = IObservation.run(() => {
  // code here
});

// stop the effect like this
effect.stop();
```

## Effect examples

The following section gives some examples of what it looks like when combining `@observable` and run effect.

### Creating a run effect that logs the user mouse movement on the document

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

### Creating a run effect that sends a request whenever user focus/unfocus the browser tab

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
