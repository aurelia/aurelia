---
description: Manage Aurelia's scheduler and task utilities to coordinate asynchronous work, rendering, and tests.
---

# Task Queue

Modern web applications juggle user input, network calls, and rendering. Aurelia's scheduler keeps that work predictable so you can focus on behavior instead of timing hacks.

To manage concurrency, Aurelia provides a task scheduling system. Think of it as an air-traffic controller that ensures every operation is processed in a predictable sequence.

> **Before you start:** Familiarise yourself with [Understanding the binding system](synchronous-binding-system.md) so you know when bindings flush, and review [App tasks](app-tasks.md) if you plan to hook into startup or teardown.

It answers critical questions like:

* **Bulletproof Testing:** How do you reliably test that a data change has updated the DOM? You stop guessing with `setTimeout` and instead wait for the exact moment all work is complete. This makes your tests fast, deterministic, and free of flaky failures.
* **Effortless Concurrency Control:** How do you handle a user typing quickly in a search box without sending conflicting API requests? The scheduler gives you first-class tools to cancel outdated operations, effortlessly preventing race conditions.
* **Synchronized & Predictable Rendering:** How do you perform an action right after Aurelia has painted a change to the screen? Because Aurelia's reactivity system is built on the same task queue, you have a reliable hook into the framework's lifecycle, ensuring your code runs at precisely the right time.

To see it in action, let's start with its most immediate and powerful use case: making your component tests 100% reliable.

{% hint style="info" %}
**Coming from Aurelia 1?** The Aurelia 2 scheduler serves a similar purpose to the v1 `TaskQueue` but with a more powerful and explicit API. See our **Migration Guide** for specific details.
{% endhint %}

## Getting started: reliable component tests

The single most common source of frustration in testing front-end applications is timing. You change a value, but the DOM doesn't update instantly. How long do you wait? If you've ever written a test that uses `setTimeout` to "wait for the UI to catch up," you've felt this pain.

The Aurelia scheduler completely eliminates this guesswork. Let's see how with a simple example.

### The component under test

Imagine a basic `counter` component:

```ts
// counter.ts
export class Counter {
  count = 0;

  increment() {
    this.count++;
  }
}
```

```html
<p>Count: ${count}</p>
<button click.trigger="increment()">Increment</button>
```

### The old, flaky way

Without a scheduler, you might write a test like this, using `setTimeout` with an arbitrary delay to wait for the DOM to update.

```ts
// flaky.spec.ts
it('updates the count after a delay', async () => {
  const { appHost, component } = createFixture('<counter></counter>', Counter);
  const p = appHost.querySelector('p');

  component.increment();

  // Wait 50ms and HOPE the DOM has updated...
  await new Promise(resolve => setTimeout(resolve, 50));

  expect(p.textContent).toContain('Count: 1');
});
```

This test is fragile. It might pass on your fast machine but fail in a slow CI environment. What if the update takes 51ms? The test fails. What if it only takes 5ms? You've wasted 45ms. This is slow, unreliable, and a maintenance nightmare.

### The Aurelia way: deterministic and reliable

With Aurelia, you don't guess. You tell the scheduler to wait until all queued work, including rendering, is finished.

TypeScript

```ts
// reliable.spec.ts
import { tasksSettled } from '@aurelia/runtime';

it('updates the count reliably and instantly', async () => {
  const { appHost, component } = createFixture('<counter></counter>', Counter);
  const p = appHost.querySelector('p');

  component.increment();

  // Wait for Aurelia to finish all its work.
  await tasksSettled();

  // The DOM is guaranteed to be up-to-date.
  expect(p.textContent).toContain('Count: 1');
});
```

That's it. The `await tasksSettled()` call pauses the test and resumes it only after Aurelia's scheduler has processed all pending tasks and updated the DOM.

Your tests are now:

* **Reliable:** They no longer depend on arbitrary timers.
* **Fast:** They wait for the minimum time required, not a millisecond more.
* **Clear:** The intent of the test is immediately obvious.

This is the scheduler's core strength. Now, let's explore the concepts that make it possible.

## Core Concepts

You've seen how `tasksSettled()` can make tests reliable, but how does it work? The Aurelia scheduler is built on a few key concepts that work together. Understanding them helps you control any asynchronous operation in your application.

### `tasksSettled()`: The Key to Reliable Testing

While `queueAsyncTask` is for your application logic, `tasksSettled()` is its counterpart for **testing**. It is the primary tool for making your tests deterministic and reliable. It returns a promise that resolves only when the scheduler is completely idle.

{% hint style="warning" %}
**For Testing Purposes Only**

You should almost exclusively use `tasksSettled()` within your test files (`.spec.ts`). Awaiting it inside a component or service can lead to application deadlocks, as your code would be waiting for a queue that it might be preventing from ever becoming empty.
{% endhint %}

"Idle" means that:

1. The initial queue of tasks is empty.
2. Any asynchronous operations started by those tasks (like promises returned from a callback) have also finished.

This is why it's so effective in tests. It doesn't just wait for one thing to finish; it waits for the *entire chain reaction* of updates and side effects to conclude. It resolves with `true` if any work was done, `false` if the scheduler was already idle, and rejects if any task threw an error.

### `queueAsyncTask()`: Scheduling Controllable Work

`queueAsyncTask()` is your primary tool for adding a *specific* piece of work to the queue. It's designed for any operation that you might need to wait for, delay, or cancel.

You give it a callback function, and it returns a `Task` object, which is your handle to control that operation's lifecycle.

```typescript
import { queueAsyncTask } from 'aurelia';

// Schedule a task to run after a 500ms delay.
const myTask = queueAsyncTask(() => {
  console.log('This runs half a second later.');
}, { delay: 500 });
```

### The `Task` handle

The `Task` object returned by `queueAsyncTask()` is your "receipt" for the scheduled work. It is a "thennable" object, meaning it behaves like a promise, but with additional properties for managing its lifecycle.

#### Directly `await`-able

The `Task` object can be awaited directly to get the result of the operation. Awaiting the task will return your callback's value once it completes, or throw an error if the callback rejects. This is the recommended and most common way to consume a task.

```ts
const products = await queueAsyncTask(() => fetchProducts());
```


#### The `task.status` property

A property to inspect the task's current state (`'pending'`, `'running'`, `'completed'`, or `'canceled'`).

```ts
if (task.status === 'pending') {
  console.log('Task is waiting to run.');
}
```


#### The `task.cancel()` method

A method to abort the task *before* it has a chance to run.

```ts
const task = queueAsyncTask(showTooltip, { delay: 400 });

// Sometime later, before the delay is over...
task.cancel();
```

#### The `task.result` property

For advanced use cases, the underlying `Promise` is accessible via `.result`. This can be useful when interoperating with libraries that require a native promise instance. In most situations, you should `await` the `Task` object directly.

### `queueRecurringTask()`: repeating actions

For actions that need to repeat on a timer, like polling a server for live notifications, `queueRecurringTask()` is the right tool. It runs your callback on a given interval until you explicitly cancel it. It returns a special `RecurringTask` handle that lets you stop the loop with `.cancel()` or wait for the next tick with `await task.next()`, which is very useful for testing.

### A Note on `queueTask()`

You may also see the simpler `queueTask()`. This is a lower-level "fire-and-forget" function. It does not return a `Task` handle and cannot be awaited or canceled directly. It's primarily used internally by the framework and for niche plugin scenarios. For application code, **`queueAsyncTask()` is almost always the correct choice.**

## Practical recipes

Now that you understand the core concepts, let's see how to combine them to solve common development problems. Each recipe here provides a practical, copy-paste-friendly solution you can adapt for your own applications.

### UI & Animation

#### Recipe: Creating a Delayed Hover Tooltip

**Problem:** You want to show a tooltip, but only if the user intentionally hovers over an element for a moment. If they just quickly pass their mouse over it, the tooltip should not appear.

**Solution:** Use `queueAsyncTask` with a `delay` to schedule the tooltip's appearance. If the user's mouse leaves the element before the delay is over, `cancel()` the pending task.

```typescript
import { Task, queueAsyncTask } from 'aurelia';

export class ProfileCard {
  private tooltipTask: Task | null = null;
  public isTooltipVisible = false;

  // Fired when the user's mouse enters the card area.
  onMouseEnter() {
    // Schedule a task to show the tooltip after 400ms.
    this.tooltipTask = queueAsyncTask(() => {
      this.isTooltipVisible = true;
    }, { delay: 400 });
  }

  // Fired when the user's mouse leaves the card area.
  onMouseLeave() {
    // If the mouse leaves before the delay is up, cancel the task.
    // The tooltip will never appear.
    const wasCancelled = this.tooltipTask?.cancel();

    // If the task wasn't cancelled (meaning it's already running or completed),
    // we know the tooltip is visible and we should hide it now.
    if (!wasCancelled) {
      this.isTooltipVisible = false;
    }
  }
}
```

#### Recipe: Preventing Form Double-Submission

**Problem:** A user clicks a "Save" button that triggers a network request. If the request is slow, they might click the button again, sending a duplicate request.

**Solution:** Disable the button as soon as it's clicked. Use `queueAsyncTask` to perform the save operation and re-enable the button in a `finally` block. This guarantees the button becomes interactive again, even if the save operation fails.

```ts
import { HttpClient } from '@aurelia/fetch-client';
import { resolve, queueAsyncTask } from 'aurelia';

export class EditForm {
  private http = resolve(HttpClient);
  public isSaving = false;

  async save() {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    try {
      // queueAsyncTask returns a Task that can be awaited directly.
      await queueAsyncTask(async () => {
        // Perform the actual save operation
        await this.http.fetch('/api/data', { method: 'POST', body: /* ... */ });
      });

      // Handle successful save...
    } catch (e) {
      // Handle errors...
    } finally {
      // This block runs whether the save succeeded or failed,
      // ensuring the form is always unlocked.
      this.isSaving = false;
    }
  }
}
```

```html
<!-- The button is disabled while isSaving is true -->
<button click.trigger="save()" disabled.bind="isSaving">
  ${isSaving ? 'Saving...' : 'Save'}
</button>
```

#### Recipe: Building an Auto-Dismissing Notification

**Problem:** You need to show a "toast" notification that automatically disappears after a few seconds.

**Solution:** Use `queueAsyncTask` with a `delay`. This is a classic "fire-and-forget" scenario. You schedule a task to hide the notification and don't need to manage it further.

```ts
import { queueAsyncTask } from 'aurelia';

export class Notifier {
  public message = '';
  public isVisible = false;

  show(newMessage: string) {
    this.message = newMessage;
    this.isVisible = true;

    // Schedule a task to hide this notification after 5 seconds.
    queueAsyncTask(() => {
      this.isVisible = false;
    }, { delay: 5000 });
  }
}
```

```html
<!-- A simple toast element that appears and disappears -->
<div if.bind="isVisible" class="toast">
  ${message}
</div>
```

### Data & Concurrency

#### Recipe: Managing Component Loading States

**Problem:** You need to show a loading spinner while data is being fetched and ensure it's hidden when the operation is complete, even if the fetch fails.

**Solution:** Use `queueAsyncTask` to wrap your fetch logic. A `try...finally` block provides a rock-solid way to guarantee your `isLoading` flag is set back to `false`, regardless of the outcome.

```ts
import { HttpClient } from '@aurelia/fetch-client';
import { resolve, queueAsyncTask } from 'aurelia';

export class UserProfile {
  public user = null;
  public isLoading = false;

  async attached() {
    this.isLoading = true;

    try {
      // By awaiting the queueAsyncTask call directly, we can use standard try/catch/finally.
      this.user = await queueAsyncTask(async () => {
        const response = await this.http.fetch('/api/user/1');
        if (!response.ok) {
          throw new Error('Failed to fetch user.');
        }
        return response.json();
      });
    } catch (e) {
      // Handle fetch errors, maybe show an error message
      console.error(e);
    } finally {
      // This is guaranteed to run, ensuring the spinner always hides.
      this.isLoading = false;
    }
  }
}
```

```html
<div if.bind="isLoading" class="spinner"></div>
<div else>
</div>
```

#### Recipe: Cancelling Outdated Data Fetches

**Problem:** A component displays data based on a filter. If the user changes the filter quickly, a slow, old request might finish *after* a newer one, overwriting fresh data with stale data.

**Solution:** Store the handle to the current fetch task. When a new fetch is initiated, `cancel()` the previous one before you begin. This ensures only the results from the very last request will be processed.

```ts
import { HttpClient } from '@aurelia/fetch-client';
import { resolve, Task, queueAsyncTask, TaskAbortError } from 'aurelia';

export class ProductList {
  private currentFetch: Task | null = null;
  public products = [];

  async onFilterChange(newFilter: string) {
    // Cancel the previously running fetch to prevent a race condition.
    this.currentFetch?.cancel();

    // Queue the new data fetch with a small delay for better UX.
    this.currentFetch = queueAsyncTask(async () => {
      const response = await this.http.fetch(`/api/products?filter=${newFilter}`);
      return response.json();
    }, { delay: 200 });

    try {
      this.products = await this.currentFetch;
    } catch (error) {
      // A cancelled task rejects with TaskAbortError. It's safe to
      // ignore this, as it's an expected part of the workflow.
      if (!(error instanceof TaskAbortError)) {
        // Handle actual network or server errors here.
        console.error('Data fetch failed:', error);
      }
    }
  }
}
```

### Timers & Periodic Tasks

#### Recipe: Polling a Backend for Live Updates

**Problem:** You need to periodically fetch fresh data from a server to create a "live" experience, like a dashboard, a news feed, or a stock ticker. Managing this with `setInterval` can be messy and lead to memory leaks if not cleaned up properly.

**Solution:** Use `queueRecurringTask` to create a managed, repeating task. It integrates with Aurelia's scheduler and can be easily started and stopped within your component's lifecycle hooks, making it both powerful and safe.

```ts
import { HttpClient } from '@aurelia/fetch-client';
import { resolve, RecurringTask, queueRecurringTask } from 'aurelia';

export class LiveScores {
  private poller: RecurringTask | null = null;
  public scores = [];

  // Start polling when the component is attached to the DOM.
  attached() {
    this.poller = queueRecurringTask(async () => {
      const response = await this.http.fetch('/api/latest-scores');
      this.scores = await response.json();
    }, { interval: 5000 }); // Poll every 5 seconds
  }

  // Stop polling when the component is detached to prevent memory leaks.
  detaching() {
    this.poller?.cancel();
  }
}
```

This pattern is also highly **testable**. In a test environment, you can `await poller.next()` to precisely synchronize your assertions with each polling cycle, eliminating the need for fragile `setTimeout` waits.

{% hint style="info" %}
**Testing a Recurring Task**

Here's how you could write a reliable test for the `LiveScores` component, using `await poller.next()` to control the flow of time. Notice how there are no `setTimeout` hacks.
{% endhint %}

```ts
import { HttpClient } from '@aurelia/fetch-client';
import { tasksSettled } from '@aurelia/runtime';
import { resolve, Registration, RecurringTask, queueRecurringTask } from 'aurelia';


it('polls for new scores and updates the component', async () => {
  let mockScores = [];
  const mockHttpClient = {
    fetch: () => Promise.resolve({
      json: () => Promise.resolve(mockScores),
    }),
  };
  const { component } = createFixture('<live-scores></live-scores>', LiveScores, [Registration.instance(HttpClient, mockHttpClient)]);

  // The poller is created but hasn't run its first callback yet.
  const poller = component.poller as RecurringTask;
  expect(poller).toBeDefined();

  // --- First Poll ---
  mockScores = [{ id: 1, score: '1-0' }];
  // Wait for the next 5-second interval to pass.
  await poller.next();
  // Wait for the async fetch callback and subsequent rendering to finish.
  await tasksSettled();
  expect(component.scores.length).toBe(1);
  expect(component.scores[0].score).toBe('1-0');

  // --- Second Poll ---
  mockScores = [{ id: 1, score: '2-0' }];
  // Wait for the next interval.
  await poller.next();
  await tasksSettled();
  expect(component.scores.length).toBe(1);
  expect(component.scores[0].score).toBe('2-0');

  // Clean up the task to not leak into other tests.
  poller.cancel();
});
```

## Advanced Topics & Best Practices

This section covers specialized functions and patterns for niche scenarios. The tools here are powerful but should be used with care, as they are intended for framework authors, plugin developers, or solving complex integration challenges. For most application development, the recipes in the previous sections are all you'll need.

### When to Use `runTasks()` Synchronously (In Tests)

**Problem:** You're writing a test for a low-level component where the interaction is fundamentally synchronous. The action queues a microtask (like a render update), but you want to keep your test function simple and synchronous without needing `async/await`

**Solution:** Call `runTasks()` to synchronously "flush" the scheduler's queue immediately after your action. This is the non-async equivalent of `await tasksSettled()` that allows you to make your assertions directly in a non-`async` test.

```typescript
import { runTasks } from 'aurelia';

// Note: This test function is NOT async.
it('updates the DOM synchronously when flushed', () => {
  const { appHost, component } = createFixture('<my-element></my-element>');

  // This action queues a render task in the scheduler.
  component.value = 'new value';

  // Force the scheduler to drain its queue now.
  runTasks();

  // The assertion can now be made synchronously.
  expect(appHost.textContent).toContain('new value');
});
```

### Ensuring Clean Tests

#### Cleaning Up All Recurring Tasks

**Problem:** In a large test suite, a `RecurringTask` from one test might not be properly cancelled. It can "leak" into subsequent tests, causing unpredictable behavior and failures that are hard to debug.

**Solution:** Use `getRecurringTasks()` in a global `afterEach` hook in your test setup. This ensures that after every single test, any lingering recurring tasks are found and cancelled.

```typescript
// in your test setup file (e.g., vitest.setup.ts)
import { getRecurringTasks } from 'aurelia';

afterEach(() => {
  // Get a list of any active recurring tasks.
  const leakedTasks = getRecurringTasks();

  if (leakedTasks.length > 0) {
    // Cancel them all to ensure a clean slate for the next test.
    for (const task of leakedTasks) {
      task.cancel();
    }

    // Optionally, fail the test to identify which one is leaking tasks.
    throw new Error(`Test left ${leakedTasks.length} recurring task(s) running.`);
  }
});
```

#### Detecting Leaked Microtasks with `tasksSettled`

**Problem:** A test might start a fire-and-forget async operation but not `await` its completion. This "leaked" work from one test could potentially interfere with the setup or execution of the next test.

**Solution:** Use the boolean return value of `await tasksSettled()` in an `afterEach` hook. If it returns `true`, it means the test that just finished left pending work on the scheduler. You can then fail the test explicitly, forcing you to find and properly await the orphaned task.

```ts
// in your test setup file (e.g., vitest.setup.ts)
import { tasksSettled } from '@aurelia/runtime';

afterEach(async () => {
  const didWork = await tasksSettled();
  if (didWork) {
    // This highlights tests that have un-awaited async operations,
    // which is a potential source of bugs and flaky tests.
    throw new Error('Test left pending work on the Aurelia scheduler.');
  }
});
```

### Plugin Authoring: Using `queueTask`

**Problem:** You are authoring a plugin, like a custom binding behavior, and need to perform a low-level DOM manipulation that must be perfectly synchronized with Aurelia's own rendering life cycle.

**Solution:** Use `queueTask()`. This places your synchronous, fire-and-forget function into the very same microtask queue that Aurelia uses for its bindings. This guarantees your code runs with, not against, the framework's update cycle.

```ts
import { queueTask, queueAsyncTask } from 'aurelia';

// Example: A binding behavior that briefly highlights an element when it's bound.
export class HighlightOnBindBindingBehavior {
  bind(scope, binding) {
    // Queue a task to run after the current microtask completes.
    // By this time, the element will be fully attached and rendered.
    queueTask(() => {
      const el = binding.target; // The element
      el.classList.add('highlight');
      // Use another task to remove the highlight moments later.
      queueAsyncTask(() => el.classList.remove('highlight'), { delay: 500 });
    });
  }

  unbind(scope, binding) { /* ... */ }
}
```

### Advanced Component Logic: Synchronous Flushing with `runTasks`

**Problem:** You need to interact with a third-party, non-async library that *synchronously* reads a DOM property immediately after you've changed the state that controls it.

**Solution:** Call `runTasks()` as an escape hatch to force Aurelia's rendering to complete within the same function call.

{% hint style="danger" %}
**Use with Extreme Caution**

This pattern is a "code smell" and should be avoided. It breaks the natural asynchronous flow of the framework. Before using this, consider if the third-party library offers an asynchronous API or if your component can be restructured. This is a last resort for difficult integrations.
{% endhint %}

```ts
import { MyLegacySyncLibrary } from 'some-library';
import { runTasks } from 'aurelia';

export class ChartComponent {
  public chartContainer: HTMLElement;
  public chartTitle = 'Old Title';

  updateChartTitle(newTitle: string) {
    // 1. Update the Aurelia property. This queues a render task.
    this.chartTitle = newTitle;

    // 2. Force the scheduler to run NOW, updating the DOM.
    runTasks();

    // 3. The third-party library can now synchronously read the updated DOM.
    // Let's say it reads the `data-title` attribute, which is bound to `chartTitle`.
    const domTitle = this.chartContainer.dataset.title; // Will be `newTitle`
    MyLegacySyncLibrary.synchronouslyUpdateChartFromTitle(domTitle);
  }
}
```

```html
<div data-title.bind="chartTitle" ref="chartContainer"></div>
```

## Next steps

- Learn how Aurelia batches DOM updates in [Understanding the binding system](synchronous-binding-system.md).
- Coordinate background work with [App tasks](app-tasks.md) during startup and shutdown.
- Explore [watching data](watching-data.md) to trigger scheduler tasks from property changes.
