# Decontainerize observer locator

## Context

One can understand Aurelia through 3 aspects: templating, binding and observation.

* **Templating**: work related to template (parsing, compilation), resources (element, attribute etc...), instantiation and lifecycle
* **Binding**: work related to connecting objects: setting up observation, subscribing to changes
* **observation**: work related to determining strategies to observe changes on objects.

Currently, Aurelia draws the application border encapsulating all those 3 aspects, which means templating, binding and observation strategies in one app will not influence another.
This works greatly most of the time, but there are oddities, and complexity:

- **Oddities**: Observers are cached by their owning objects, which means the 2nd call to get an observer in a different application may not get the right observer with different set of strategies. One can disable caching but it still won't resolve the issue completely.

  Even with caching disabled, there are computed observers, which employs observers that are dependent on other observers. Computed observers make the oddity hard to resolve, as they need to also know the strategies that they should use to retrieve the observers they depend on. Further more, observers often need to install getters/setters on their corresponding object, without caching, it'd get quite complicated to orchestrate these getters/setters.

  
- **Complexity**: All usage involving observation in Aurelia typically goes from the observer locator. This means in order to get an observer of an object, devs need to figure out the right DI container, then injecting the locator and finally call `getObserver` from there.

  The above three steps add more concepts to learn & understand to the observer retrieval process, and requires extra infrastructure for setup in our templating/binding system.

## Proposal

Make the observation system static, or we can simply say make the observer locator a module scoped based static singleton.

Node observer locator, adapters and svg analyzer will also go static:

* **Node observer locator**: Will be turned into a static singleton export in `runtime-html`, enabled by a function call export in `runtime` package from `aurelia` package:
  ```ts
  // in aurelia package
  import { NodeObserverLocator } from '@aurelia/runtime-html';
  import { ObserverLocator } from '@aurelia/runtime';

  ObserverLocator.use(NodeObserverLocator);

  // or bring your own:
  ObserverLocator.use({
    type: 'node',
    getAccessor: (node, key) => IAccessor | null,
    getObserver: (node, key) => IObserver | null,
  })
  ```

* **Dirty checker**: Will be turned into a static singleton export in `aurelia` package, and can be enabled by a export function call in `runtime` package:
  ```ts
  // in aurelia package

  import { ObserverLocator } from '@aurelia/runtime';

  // use the default
  ObserverLocator.use(DirtyChecker);
  // or bring your own
  ObserverLocator.use({
    type: 'dirty',
    getObserver: (node, key) => IObserver | null,
  })
  ```

  The `NodeObserverLocator` will also be using this dirty checker
  ```ts
  // in aurelia package

  import { NodeObserverLocator } from '@aurelia/runtime-html';

  NodeObserverLocator.use(DirtyChecker)
  ```

* **Adapters**: will be turned into a static list used for all objects, and can be enabled via a function call in `runtime` package export;
  ```ts
  import { ObserverLocator } from '@aurelia/runtime';

  ObserverLocator.use({
    type: 'adapter',
    getAccessor: (object, key) => Accessor | null,
    getObserver: (object, key) => Observer | null,
  });
  ```

* **Svg Analyzer**: Will be turned into a static singleton export in `aurelia` package, runtime html should export a function to allow the set of static svg analyzer instance to use

### Issues with the new design

* There's no more separation between applications, anything register will need to be aware that they are global
* There's parts of the observation system that rely on the availability of some global functions (timeout, taskqueue, requestAnimationFrame) resulting in the need to have a global object providing those
