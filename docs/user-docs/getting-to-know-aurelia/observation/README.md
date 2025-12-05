---
description: Observe changes in your applications.
---

# Observation

Aurelia provides a multitude of different wants to observe properties in your components and call a callback function when they change.

The following sections in the observation documentation will help you decide which observation strategy is appropriate for your applications, from the most commonly used to more advanced observation strategies.

## The @observable approach

The easiest way to watch for changes to specific view model properties is using the `@observable` decorator which provides an easy way to watch for changes to properties and react accordingly.

{% content-ref url="observing-property-changes-with-observable.md" %}
[observing-property-changes-with-observable.md](observing-property-changes-with-observable.md)
{% endcontent-ref %}

## Effect observation approach

While still using the `@observable` API, the effect observation approach has more boilerplate and is convenient for instances where you want to observe one or more effects. Examples include when the user moves their mouse or other changes you might want to watch, independent of the component lifecycle.

{% content-ref url="effect-observation.md" %}
[effect-observation.md](effect-observation.md)
{% endcontent-ref %}

## HTML observation approach

Unlike other forms of observation, HTML observation is when you want to watch for changes to specific properties on elements, especially for web component properties.

{% content-ref url="html-observation.md" %}
[html-observation.md](html-observation.md)
{% endcontent-ref %}

## The observer locator approach

The observer locator API allows you to observe properties for changes manually. In many instances, you will want to use `@observer` or `@watch` however, the observer locator can be useful in situations where you want to watch the properties of objects.

{% content-ref url="using-observerlocator.md" %}
[using-observerlocator.md](using-observerlocator.md)
{% endcontent-ref %}

## Controlling Binding Flush Order

Aurelia batches `to-view`/`from-view` updates through the `IFlushQueue` service that ships in `@aurelia/runtime-html`. The default implementation (`FlushQueue`) ensures breadth-first ordering so two-way bindings stay in sync even when nested deeply, but you can replace it when you need deterministic ordering or to integrate with custom schedulers.

### Swapping the Flush Queue

```typescript
import { IFlushQueue, IFlushable } from '@aurelia/runtime-html';
import { Registration } from '@aurelia/kernel';

class IdleFlushQueue implements IFlushQueue {
  private readonly pending = new Set<IFlushable>();
  private draining = false;

  get count() {
    return this.pending.size;
  }

  add(flushable: IFlushable) {
    this.pending.add(flushable);
    if (!this.draining) {
      this.draining = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  private flush() {
    this.pending.forEach(item => {
      this.pending.delete(item);
      item.flush();
    });
    this.draining = false;
  }
}

Aurelia
  .register(Registration.singleton(IFlushQueue, IdleFlushQueue));
```

Registering a singleton for `IFlushQueue` causes every `PropertyBinding` to use your implementation when it needs to schedule target-to-source writes. Advanced scenarios include:

- Forcing synchronous ordering (call `flushable.flush()` immediately inside `add`)
- Syncing binding updates with browser painting (`requestAnimationFrame`, `requestIdleCallback`)
- Instrumenting `count` to detect runaway binding loops during testing

Because `IFlushQueue` is a regular interface, you can also inject it manually (`resolve(IFlushQueue)`) inside diagnostics tools to inspect or drain queued updates on demand.
