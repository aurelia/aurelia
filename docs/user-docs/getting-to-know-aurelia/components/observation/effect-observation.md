# Effect observation

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



