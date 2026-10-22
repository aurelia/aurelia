---
description: Understand property notifications, computed observation, and the delivery boundaries of batch().
---

# Understanding Aurelia's Binding System and State Management

A property assignment changes the value immediately. When Aurelia observes that property, it can also notify subscribers. Ordinary property change notifications are synchronous; computed observers use asynchronous delivery by default. `batch()` lets you group changes before delivering the batched notifications.

These are different parts of an update. Reading a property, notifying an observer, and rendering a binding do not necessarily happen at the same time. The examples below make the notification timing visible.

> **Before you start:** Review [Watching data](watching-data.md) for component watchers, [Using observerLocator](observation/using-observerlocator.md) for manual subscriptions, and [Task queue](task-queue.md) for waiting on queued work.

## Synchronous vs Asynchronous Updates

### Observable Properties: Synchronous

An `@observable` property's change callback runs when its value changes:

```typescript
import { observable } from 'aurelia';

class User {
  @observable firstName = '';

  firstNameChanged(value: string, oldValue: string) {
    console.log(`${oldValue} -> ${value}`);
  }
}

const user = new User();
user.firstName = 'John'; // Logs " -> John" before the assignment returns.
```

The decorator's `firstNameChanged` callback is separate from an observer's `handleChange` subscriptions. That distinction matters for batching: `batch()` coalesces subscriber notifications, but does not defer this callback.

### Computed Properties: Asynchronous by Default

When a getter is observed, its computed observer tracks the properties it reads. By default, dependency changes queue a recalculation and notification, allowing several synchronous writes to settle before subscribers receive the result.

```typescript
import { computed } from 'aurelia';

class NameTag {
  firstName = 'Ada';
  lastName = 'Lovelace';

  @computed({ flush: 'async' }) // Also the default when flush is omitted.
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

The decorator configures observation; it does not start a subscription by itself. A binding or an explicit subscriber must observe the getter. Reading `fullName` directly returns its current value, including when its observer is dirty and a notification is still queued. Asynchronous delivery does not mean that direct reads must return the previous value.

## Understanding State Tearing

If a subscriber runs between two related writes, it can see a mixture of old and new state. For example, changing a first and last name separately can briefly produce the new first name with the old last name.

### Example: Synchronous Computed Properties Can Still Tear

This component explicitly subscribes to `fullName`, so the notification sequence can be inspected. The manual subscription is for demonstration; a template binding or watcher would normally consume the value.

```typescript
import { resolve } from '@aurelia/kernel';
import { computed, IObserverLocator } from 'aurelia';

export class NameTag {
  firstName = 'Ada';
  lastName = 'Lovelace';

  private readonly observerLocator = resolve(IObserverLocator);
  private readonly fullNameObserver = this.observerLocator.getObserver(this, 'fullName');
  private readonly subscriber = {
    handleChange(value: string) {
      console.log(value);
    },
  };

  @computed({ flush: 'sync' })
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  binding() {
    this.fullNameObserver.subscribe(this.subscriber);
  }

  update(first: string, last: string) {
    this.firstName = first;
    this.lastName = last;
  }

  unbinding() {
    this.fullNameObserver.unsubscribe(this.subscriber);
  }
}
```

After the component binds, call `update('Grace', 'Hopper')`, for example from a button:

```html
<button type="button" click.trigger="update('Grace', 'Hopper')">Update name</button>
```

The subscriber logs both values synchronously:

```text
Grace Lovelace
Grace Hopper
```

The first notification sees the updated `firstName` before `lastName` has been assigned. If a callback acts on the whole name, that intermediate value may be undesirable.

## Managing State Updates with Batch

`batch()` runs its callback synchronously. Assignments take effect as they execute, while batched change notifications wait until the callback exits. Repeated writes to one observed property are coalesced: its subscribers receive the first old value and the final new value. If the final value equals the initial value under that observer's equality check, no value-change notification is sent.

Coalescing is **per observer**. Changing four distinct observed properties still gives their subscribers four separate notifications. Batching does not turn those properties into one combined event.

### Fixing State Tearing with Batch

Keep the same observed `NameTag` component and import `batch` from `aurelia`. Change only its `update` method:

```typescript
update(first: string, last: string) {
  batch(() => {
    this.firstName = first;
    this.lastName = last;
  });
}
```

On a fresh instance, the same `update('Grace', 'Hopper')` call now logs:

```text
Grace Hopper
```

Both assignments finish before the property change notifications reach the computed observer. Its first recalculation sees the complete name. This example produces one computed-value notification because the resulting string is unchanged by the later dependency notification; it is not a promise that every getter runs only once per batch.

### Nested batches

An inner `batch()` flushes changes recorded inside it before returning to the outer callback. If it changes a property that already has an outer pending change, that notification includes the earlier change too. Other outer records stay pending. Writes made after the inner call returns join the resumed outer batch.

The following component records both notifications and checkpoints. Call `demonstrate()` from a button or another component method:

```typescript
import { resolve } from '@aurelia/kernel';
import { batch, IObserverLocator } from 'aurelia';

export class BatchExample {
  private readonly observerLocator = resolve(IObserverLocator);

  demonstrate(): string[] {
    const state = { count: 0, other: 0 };
    const log: string[] = [];
    const countObserver = this.observerLocator.getObserver(state, 'count');
    const otherObserver = this.observerLocator.getObserver(state, 'other');
    const countSubscriber = {
      handleChange(value: number, oldValue: number) {
        log.push(`count: ${oldValue} -> ${value}`);
      },
    };
    const otherSubscriber = {
      handleChange(value: number, oldValue: number) {
        log.push(`other: ${oldValue} -> ${value}`);
      },
    };
    countObserver.subscribe(countSubscriber);
    otherObserver.subscribe(otherSubscriber);

    try {
      batch(() => {
        state.other = 1;
        state.count = 1;
        batch(() => {
          state.count = 2;
          log.push('inside inner');
        });
        log.push('after inner');
        state.count = 3;
        state.count = 4;
        log.push('end of outer callback');
      });
      log.push('after outer');
      return log;
    } finally {
      countObserver.unsubscribe(countSubscriber);
      otherObserver.unsubscribe(otherSubscriber);
    }
  }
}
```

The returned log is:

```text
inside inner
count: 0 -> 2
after inner
end of outer callback
other: 0 -> 1
count: 2 -> 4
after outer
```

At the inner boundary, `count` is delivered from its original value `0` to `2`. The `other` observer was not changed by the inner callback, so it waits for the outer boundary. The later writes to `count` form a new pending change, from `2` to `4`. The inner result is not delivered again when the outer batch finishes.

If several values must be set before any of these subscriber notifications run, put their assignments in one callback without an intervening nested batch. A helper that opens its own batch introduces its own delivery boundary.

### What batching does not defer

You can read the changed state inside the callback. Aurelia's dirty notifications, which mark dependent observations for reevaluation, also run synchronously. As a result, reading a computed getter midway through a batch can expose the intermediate state.

Callbacks attached directly to a property keep their own timing. In particular, an `@observable` change callback such as `firstNameChanged` is not held until the batch ends. A subscriber that writes another value during the flush can also cause a synchronous notification before that subscriber returns.

`batch()` is not a transaction: an exception does not undo assignments. The callback's exit starts flushing even when the callback throws; a throwing subscriber can stop delivery to later subscribers. Batching state is restored for subsequent work, but error handling and recovery belong to the application.

The callback must contain the synchronous writes you want to group. `batch()` does not await an asynchronous callback or schedule a browser frame. Fetch data first, then use a batch to apply the result; choose an explicit task or timer when work needs to yield to the browser.

### Comparing Sync vs Async Computed Properties

Flush timing controls subscriber delivery. This example observes both getters and keeps a log of their notifications:

```typescript
import { resolve } from '@aurelia/kernel';
import { computed, IObserverLocator } from 'aurelia';
import { tasksSettled } from '@aurelia/runtime';

export class ComparisonExample {
  count = 0;
  private readonly observerLocator = resolve(IObserverLocator);

  @computed({ flush: 'async' })
  get asyncDouble() { return this.count * 2; }

  @computed({ flush: 'sync' })
  get syncDouble() { return this.count * 2; }

  async demonstrateDifference(): Promise<string[]> {
    const log: string[] = [];
    const asyncObserver = this.observerLocator.getObserver(this, 'asyncDouble');
    const syncObserver = this.observerLocator.getObserver(this, 'syncDouble');
    const asyncSubscriber = {
      handleChange(value: number) { log.push(`async: ${value}`); },
    };
    const syncSubscriber = {
      handleChange(value: number) { log.push(`sync: ${value}`); },
    };
    asyncObserver.subscribe(asyncSubscriber);
    syncObserver.subscribe(syncSubscriber);

    try {
      this.count = 1;
      this.count = 2;
      log.push(`direct read: ${this.asyncDouble}`);
      await tasksSettled();
      return log;
    } finally {
      asyncObserver.unsubscribe(asyncSubscriber);
      syncObserver.unsubscribe(syncSubscriber);
    }
  }
}
```

On a fresh instance, `demonstrateDifference()` returns:

```text
sync: 2
sync: 4
direct read: 4
async: 4
```

The asynchronous subscriber waits for queued work, but the direct read already sees the current value. With a synchronous subscriber, each unbatched write can trigger work immediately.

## When to Use Sync vs Async Computed Properties

### Use Async Computed Properties (Default) When:

Keep the default when consumers can wait for queued delivery and several synchronous dependency changes may occur together. This can avoid work for intermediate values. Use `tasksSettled()` when a test needs to wait for Aurelia's queued updates, as in the comparison above.

### Use Sync Computed Properties When:

Use synchronous delivery when a subscriber must react before the operation that triggers its notification returns. Keep that reaction small, and consider batching related writes when intermediate notifications would be undesirable. Directly reading a getter does not require `flush: 'sync'`.

## Benefits of Using Batch

Batching can reduce repeated subscriber work for several writes to the same observed property or several mutations of a collection. It also lets you finish a group of assignments before delivering their batched change notifications, as the `NameTag` example shows. The benefit depends on what is observed and what its subscribers do; batching does not guarantee one render or one recomputation.

## Best Practices

- Group the synchronous writes that belong to one operation. Check whether helpers open nested batches.
- Keep computed getters free of mutations. A batch does not make intermediate reads atomic.
- Dispose manual subscriptions when their owner stops using them.
- Handle errors where the operation starts; batching does not roll back application state.

## Next steps

- Use [watching data](watching-data.md) for component-level change callbacks with managed lifetimes.
- Learn how Aurelia observes DOM primitives in [HTML observation](observation/html-observation.md).
- Coordinate queued work with the [task queue](task-queue.md).
- See [performance optimization techniques](../advanced-scenarios/performance-optimization-techniques.md#observable-batching) for batching collection updates.
