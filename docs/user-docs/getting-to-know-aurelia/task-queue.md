# Task Queue

Not to be confused with task queue in Aurelia 1, the TaskQueue is a sophisticated scheduler designed to prevent a variety of timing issues, memory leaks, race conditions and more bad things that tend to result from `setTimeout`, `setInterval`, floating promises, etc.

The benefit of using the task queue is both synchronous and asynchronous tasks are supported.

{% hint style="info" %}
We highly recommend using the task queue to replace existing uses of `setTimeout` and `setInterval` for better-performing applications.
{% endhint %}

## setTimeout (synchronous)

In the following example, we use the `delay` configuration property to configure a task with a timeout of 100 milliseconds. This would replace using `setTimeout` in your applications.

```typescript
import { PLATFORM } from 'aurelia';

// Queue
const task = PLATFORM.taskQueue.queueTask(() => {
  doStuff();
}, { delay: 100 });

// Cancel
task.cancel();
```

If you were to use a native `setTimout` it would look like this:

```typescript
// Queue
const handle = setTimeout(() => {
  doStuff();
}, 100);

// Cancel
clearTimeout(handle);
```

Now, in your unit/integration/e2e tests or other components, you can `await PLATFORM.taskQueue.yield()` to deterministically wait for the task to be done (and not a millisecond longer than needed) or even `PLATFORM.taskQueue.flush()` to immediately run all queued tasks.&#x20;

Result: no more flaky tests or flaky code in general. No more intermittent and hard-to-debug failures.

## setTimeout (asynchronous)

We performed a synchronous equivalent of a setTimeout. Now we can go one step further and do an asynchronous setTimeout, minus the floating promises and memory leaks.

```typescript
import { PLATFORM } from 'aurelia';

// Queue
const task = PLATFORM.taskQueue.queueTask(async () => {
  await doAsyncStuff();
}, { delay: 100 });

// Await
await task.result;

// Cancel
task.cancel();
```

## setInterval

By supply the `persistent` configuration value, we can specify a task will remain and not be cleared by the task queue. This gives us `setInterval` functionality.

```typescript
import { PLATFORM } from 'aurelia';

// Queue
const task = PLATFORM.taskQueue.queueTask(() => {
  poll();
}, { delay: 100, persistent: true /* runs until canceled */ });

// Stop
task.cancel();
```

## requestAnimationFrame

By leveraging the `domWriteQueue` we can also replace `requestAnimationFrame` with a safer alternative.

```typescript
import { PLATFORM } from 'aurelia';

PLATFORM.domWriteQueue.queueTask(() => {
  applyStyles();
});
```

## requestAnimationFrame (loop)

In situations where `requestAnimationFrame` is being used in a loop capacity (such as high frame rate animations), we can loop. The queue greatly simplifies this again with the `persistent` configuration option we saw above.

```typescript
// Start
const task = PLATFORM.domWriteQueue.queueTask(() => {
  updateAnimationProps();
}, { persistent: true });
// Stop
task.cancel();
```
