# Task Queue

Not to be confused with the task queue in Aurelia 1, the TaskQueue in Aurelia is an advanced scheduler designed to handle synchronous and asynchronous tasks efficiently. It provides a robust solution to common issues like timing problems, memory leaks, and race conditions often arising from traditional JavaScript timing functions like `setTimeout`, `setInterval`, and unmanaged promises.

## Benefits of Using the Task Queue

- **Improved Performance:** By managing tasks more efficiently, the TaskQueue enhances the performance of applications.
- **Synchronous and Asynchronous Support:** It supports both synchronous and asynchronous tasks, providing greater flexibility in handling tasks.
- **Deterministic Task Execution:** Facilitates testing by providing deterministic ways to wait for task completion, reducing test flakiness.
- **Avoids Common Pitfalls:** Helps avoid common issues associated with `setTimeout` and `setInterval`, such as memory leaks and race conditions.

{% hint style="info" %}
We highly recommend using the task queue to replace existing uses of `setTimeout` and `setInterval` for better-performing applications.
{% endhint %}

## Examples and Use Cases

### Replacing `setTimeout` (Synchronous)

Instead of `setTimeout, ' the TaskQueue offers a more reliable way to queue tasks without delay.

```typescript
import { PLATFORM } from 'aurelia';

const task = PLATFORM.taskQueue.queueTask(() => {
  // Task to be executed after the delay
  doStuff();
}, { delay: 100 });

// Cancel the task if needed
task.cancel();
```

If you were to use a native `setTimout`, it would look like this:

```typescript
// Queue
const handle = setTimeout(() => {
  doStuff();
}, 100);

// Cancel
clearTimeout(handle);
```

#### Advantages Over `setTimeout`

- **Testability:* You can await `PLATFORM.taskQueue.yield()` or use `PLATFORM.taskQueue.flush()` in tests for predictable task execution.
- **Improved Reliability:** Reduces the chances of intermittent and hard-to-debug failures.

### setTimeout (asynchronous)

For asynchronous operations, the TaskQueue can handle tasks without the issues of floating promises.

```typescript
import { PLATFORM } from 'aurelia';

const task = PLATFORM.taskQueue.queueTask(async () => {
  await doAsyncStuff();
}, { delay: 100 });

// Await the result of the task
await task.result;

// Cancel if necessary
task.cancel();
```

### Implementing setInterval

The TaskQueue can mimic `setInterval` functionality, offering more control and reliability.

```typescript
import { PLATFORM } from 'aurelia';

const task = PLATFORM.taskQueue.queueTask(() => {
  // Repeated task
  poll();
}, { delay: 100, persistent: true });

// Cancel the repeating task
task.cancel();
```

### Replacing requestAnimationFrame

For tasks that need to synchronize with the browser's repaint, `domWriteQueue` is a safer alternative to `requestAnimationFrame`.

```typescript
import { PLATFORM } from 'aurelia';

PLATFORM.domWriteQueue.queueTask(() => {
  // Update styles or DOM
  applyStyles();
});
```

### Animation Loop with requestAnimationFrame

For continuous animations, the TaskQueue can be used to create a loop, similar to `requestAnimationFrame`.

```typescript
import { PLATFORM } from 'aurelia';

const task = PLATFORM.domWriteQueue.queueTask(() => {
  // Update animation properties in each frame
  updateAnimationProps();
}, { persistent: true });

// Stop the animation
task.cancel();
```
