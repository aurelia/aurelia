# 💬 RFC

## 🔦 Context

At the moment, in order to access the observation system, one needs to inject the observer locator, and use its APIs.

For normal objects, the observer locator observes properties by installing property interceptors (getters/setters) that are associated with observers. These observers may or may not need to have access to the observer locator for future use, e.g a computed observer needs to get the observers of many object properties, and then subscribe to them.

For html objects (nodes), the observer locator observes properties by mapping the configured events needed to listen on the given node, based on the node properties (nodeName, property to observer etc...). Similar to normal object observation, some of these observers may or may not need to have access to the observer locator for future use, e.g a select observer may need to observe the incoming array to be able to set right selected attributes.

For performance reasons, observers are cached, and with this, so do the observer locator associated with those observers, if they keep the reference.

The observer locator is designed to be a boundary or a layer to separate the observation system of different apps. This works well until the boundary is crossed.

When an object from one application is used in another, and an observer for a property on that object is already cached, it creates some potential issues if an observer locator from a different app tries to retrieve an observer for the same property. The 2nd app observer locator will have to either override the previous interceptors/observer or reuse them. If the 2nd observer locator chose to override, the first observer would stop working. If the choice was to reuse, the observer created by the 2nd observer locator may not work properly, since each locator may have their own configuration caching/configuration.

Most of the applications have a single app running inside them so it's unlikely to be an issue. And for applications that have multiple apps running, they often don't have conflicting observation strategy for the same objects & properties. So while the potential issues above are there, they are unlikely to cause issues.

While we can leave it alone, there's some potentially good outcomes if we are to change the way the way observer locator work. These potentials are around API simplicifcation, new APIs, capabilities & optimization enablement, and maybe the ability to work in perfect harmony with the new incoming official decorator, since it's also static.

## 📍 Proposal

Make the observation system static, so all apps in an application will use the same observation system. This will allow the framework and applications built on top to have simpler stories around observation. Some examples:

* Existing
  ```ts
  import { ObserverLocator } from 'aurelia';
  
  @inject(ObserverLocator)
  class MyClass {
    constructor(observerLocator) {
      this.observerLocator = observerLocator;
    }
  
    binding() {
      this.observerLocator.getObserver(this.details, 'name').subscribe({ ... })
    }
  }
  ```

* Proposal
  ```ts
  import { getObserver } from 'aurelia'

  class MyClass {
    binding() {
      getObserver(this.details, 'name').subscribe({ ... })

      getObserver(this.details, (d) => d.name).subscribe({ ... })
    }
  }
  ```

## API challenges

As mentioned above, one problem that comes with static APIs is that there's no more a boundary between applications on the same page, with regards to observation. This happens to both normal & special HTML objects (elements). While currently, there's an adaptor API that can be used to mitigate this to a certain degree, it still requires care around organising the adaptors so that they dont override each other.

To better solve this issue, there should be a hierarchy of observer locating strategies so that one application/usage can ensure their observation is not overriden by any other accidental global config.

An example of this hierarchy is per the following:
  - Check `au:observe` symbol on the node itself, if exist, then call ...
  - global static config of event based observation, similar to how current node observer locator works.
  - `au:observe` symbol on the node constructor
  
These 3 layers of observation locator should allow enough flexibility for multiple applications to work together in harmony without worrying about conflict. Example: all applications in a page may use the same event based configuration for `<input>` elements, but for an input with some special custom attribute, the custom attribute could assign a value to the `Symbol('au:observe')` key on the `<input>` element so that it will observe have its own way of observing some properties:

```ts
// import the symbol
import { nodeObserve } from 'aurelia';

input[nodeObserve] = (node, name) => {
    if (name === 'value') return mySpecialValueObserver

    // null/undefined returns allow the locator to continue with different strategy to figure out the right observer
    return null;
}
```

## Migration potential issues

For application migrating from v1, issues can be prevented by exporting a class `ObserverLocator` that use these new static APIs under the hood. This should provide similar experience.