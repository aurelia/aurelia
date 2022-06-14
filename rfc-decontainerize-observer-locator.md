# Decontainerize observer locator

## Context

One can understand Aurelia through 3 aspects: templating, binding and observation.

* **Templating**: work related to template (parsing, compilation), resources (element, attribute etc...), instantiation and lifecycle
* **Binding**: work related to connecting objects: setting up observation, subscribing to changes
* **observation**: work related to determining strategies to observe changes on objects.

Currently, Aurelia draws the application border encapsulating all those 3 aspects, which means templating, binding and observation strategies in one app will not influence another.
This works greatly most of the time, but there are oddities, and complexity:

- **Oddities**: Observers are cached by their owning objects, which means the 2nd call to get an observer in a different application may not get the right observer with different set of strategies. One can disable caching but it still won't resolve the issue completely.

  Even with caching disabled, there are computed observers, which employs observers that are dependent on other observers. Computed observers make the oddity hard to resolve, as they need to also know the strategies that they should use to retrieve the observers they depend on.
- **Complexity**: All usage involving observation in Aurelia typically goes from the observer locator. This means in order to get an observer of an object, devs need to figure out the right DI container, then injecting the locator and finally call `getObserver` from there.

  The above three steps add more concepts to learn & understand to the observer retrieval process, and requires extra infrastructure for setup in our templating/binding system.

## Proposal

Make the observation system static, or we can simply say make the observer locator a module scoped based static singleton.

Dirty checking, node observer locator and adapters will also go static:
* **Dirty checker**: Disabled by default, and can be enabled by a export function call in runtime package
* **Node observer locator**: Should be turned into an adapter and enabled by a function call export in runtime-html package. Repeated call should not add this adapter more than once


