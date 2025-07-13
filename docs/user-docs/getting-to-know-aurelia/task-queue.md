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

For tasks that need to synchronize with the browser's repaint, `domQueue` is a safer alternative to `requestAnimationFrame`.

```typescript
import { PLATFORM } from 'aurelia';

PLATFORM.domQueue.queueTask(() => {
  // Update styles or DOM
  applyStyles();
});
```

### Animation Loop with requestAnimationFrame

For continuous animations, the TaskQueue can be used to create a loop, similar to `requestAnimationFrame`.

```typescript
import { PLATFORM } from 'aurelia';

const task = PLATFORM.domQueue.queueTask(() => {
  // Update animation properties in each frame
  updateAnimationProps();
}, { persistent: true });

// Stop the animation
task.cancel();
```

## Modern Task Queue API

For more advanced task management, Aurelia provides dedicated functions from `@aurelia/runtime`:

```typescript
import { queueTask, queueAsyncTask, runTasks, tasksSettled } from '@aurelia/runtime';

// Queue a synchronous task
queueTask(() => {
  console.log('Synchronous task executed');
});

// Queue an async task with full Task control
const task = queueAsyncTask(async () => {
  const result = await fetchData();
  return result;
}, { delay: 100 });

// Handle the task result
task.result.then(result => {
  console.log('Task completed with result:', result);
}).catch(error => {
  console.error('Task failed:', error);
});

// Cancel if needed
task.cancel();
```

## Advanced Task Queue Features

### Task Status and Lifecycle

Every task has a status that tracks its lifecycle:

```typescript
import { PLATFORM } from 'aurelia';

const task = PLATFORM.taskQueue.queueTask(() => {
  console.log('Task running');
});

console.log(task.status); // 'pending' | 'running' | 'completed' | 'canceled'
console.log(task.id);     // Unique incrementing ID
console.log(task.createdTime); // When the task was created
console.log(task.queueTime);   // When the task was queued
```

### Advanced Task Options

#### `preempt` Option

The `preempt` option allows tasks to run immediately if the queue is currently processing:

```typescript
// Runs synchronously if queue is currently flushing
PLATFORM.taskQueue.queueTask(() => {
  console.log('Runs immediately during queue flush');
}, { preempt: true });

// Note: preempt cannot be combined with delay > 0 or persistent: true
```

#### `suspend` Option

The `suspend` option blocks the queue until the task completes:

```typescript
// Blocks subsequent tasks until this async task completes
PLATFORM.taskQueue.queueTask(async () => {
  await longRunningOperation();
  console.log('Queue was suspended until this completed');
}, { suspend: true });
```

### Multiple Queue Types

Aurelia provides different queue types for different use cases:

```typescript
import { PLATFORM } from 'aurelia';

// Basic task queue (setTimeout-based)
PLATFORM.taskQueue.queueTask(() => {
  console.log('Basic task');
});

// DOM queue (requestAnimationFrame-based)
PLATFORM.domQueue.queueTask(() => {
  // Perfect for DOM updates and animations
  element.style.opacity = '1';
});
```

### Task Cancellation

Tasks can be canceled before or during execution:

```typescript
// Cancel before execution
const task = PLATFORM.taskQueue.queueTask(() => {
  console.log('This might not run');
}, { delay: 1000 });

const canceled = task.cancel(); // Returns true if successfully canceled

// Cancel persistent tasks
const persistentTask = PLATFORM.taskQueue.queueTask(() => {
  if (shouldStop) {
    persistentTask.cancel(); // Stops the recurring execution
  }
}, { persistent: true });
```

### Error Handling

The task queue provides sophisticated error handling:

```typescript
import { PLATFORM } from 'aurelia';
import { queueTask, queueAsyncTask, runTasks, tasksSettled } from '@aurelia/runtime';

// Individual task errors
queueTask(() => {
  throw new Error('Task failed');
});

// Multiple task failures are collected
queueTask(() => { throw new Error('First failure'); });
queueTask(() => { throw new Error('Second failure'); });

try {
  await tasksSettled();
} catch (error) {
  if (error instanceof AggregateError) {
    console.log('Multiple failures:', error.errors.length);
    error.errors.forEach(err => console.log(err.message));
  }
}
```

### Testing with Task Queues

The task queue provides several utilities for testing:

```typescript
import { PLATFORM } from 'aurelia';
import { runTasks, tasksSettled } from '@aurelia/runtime';

// In your tests:

// 1. Flush all pending tasks synchronously
runTasks(); // Immediately executes all queued tasks

// 2. Wait for all tasks to complete (including async)
await tasksSettled();

// Note: For DOM-related tasks, use PLATFORM.domQueue for animation frame scheduling
```

### Performance Optimization

#### Task Batching

```typescript
// Batch multiple DOM updates
PLATFORM.domQueue.queueTask(() => {
  // Multiple DOM changes in one frame
  element1.style.left = '100px';
  element2.style.top = '200px';
  element3.textContent = 'Updated';
});
```

#### Deadlock Protection

The task queue automatically detects potential infinite loops:

```typescript
// The queue will throw an error if too many tasks are queued recursively
PLATFORM.taskQueue.queueTask(function recursive() {
  PLATFORM.taskQueue.queueTask(recursive); // This will eventually throw
});
```

### Best Practices

1. **Use the appropriate queue type**:
   - `taskQueue` for general logic and business operations
   - `domQueue` for DOM updates and animations

2. **Handle async tasks properly**:
   - Use `suspend: true` for critical async operations that must complete before other tasks
   - Use `await task.result` to wait for individual task completion

3. **Clean up persistent tasks**:
   - Always keep references to persistent tasks for cancellation
   - Cancel persistent tasks when components are destroyed

4. **Use testing utilities**:
   - Use `runTasks()` for synchronous testing
   - Use `tasksSettled()` for async task completion
   - Use `yield()` to wait for queue idle state

5. **Monitor performance**:
   - Enable tracing in development to debug queue behavior
   - Use the DOM queue for animation-related tasks to sync with browser repaints
