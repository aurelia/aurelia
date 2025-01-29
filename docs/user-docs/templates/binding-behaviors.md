# Binding Behaviors

Binding behaviors are a powerful category of view resources in Aurelia 2, alongside value converters, custom attributes, and custom elements.  They are most analogous to [value converters](value-converters.md) in that you declaratively use them within binding expressions to modify binding behavior.

However, the crucial distinction lies in the scope of access. **Binding behaviors have complete access to the binding instance throughout its entire lifecycle.** This contrasts sharply with value converters, which are limited to intercepting and transforming values as they flow between the model and the view.

This broader access empowers binding behaviors to fundamentally alter the behavior of bindings, unlocking a wide array of capabilities as demonstrated in the examples below.

## Throttle

Aurelia provides several built-in binding behaviors to address common scenarios.  The `throttle` behavior is designed to limit the rate at which updates propagate. This can apply to updates from the view-model to the view (in `to-view` or `one-way` bindings) or from the view to the view-model (in `two-way` bindings).

By default, `throttle` enforces a minimum time interval of 200ms between updates. You can easily customize this interval.

Here are some practical examples:

**Limiting property updates to a maximum of once every 200ms**

```html
<input type="text" value.bind="searchQuery & throttle">
<p>Searching for: ${searchQuery}</p>
```

In this example, the `searchQuery` property in your view model will update at most every 200ms, even if the user types more rapidly in the input field. This is especially useful for search inputs or other scenarios where frequent updates can be inefficient or overwhelming.

You'll notice the `&` symbol, which is used to introduce binding behavior expressions.  The syntax for binding behaviors mirrors that of value converters:

*   **Arguments**: Binding behaviors can accept arguments, separated by colons: `propertyName & behaviorName:arg1:arg2`.
*   **Chaining**: Multiple binding behaviors can be chained together: `propertyName & behavior1 & behavior2:arg1`.
*   **Combined with Value Converters**: Binding expressions can include both value converters and binding behaviors: `${data | valueConverter:arg & bindingBehavior:arg2}`.

Let's see how to customize the throttling interval:

**Limiting property updates to a maximum of once every 850ms**

```html
<input type="text" value.bind="query & throttle:850">
```

The `throttle` behavior is particularly valuable when used with event bindings, especially for events that fire frequently, such as `mousemove`.

**Handling `mousemove` events at most every 200ms**

```html
<div mousemove.delegate="mouseMoveHandler($event) & throttle"></div>
```

In this case, the `mouseMoveHandler` method in your view model will be invoked at most every 200ms, regardless of how frequently the `mousemove` event is triggered as the user moves their mouse.

### Flushing Pending Throttled Updates

In certain situations, you might need to immediately apply any pending throttled updates. Consider a form with throttled input fields.  When a user tabs out of a field after typing, you might want to ensure the latest value is immediately processed, even if the throttle interval hasn't elapsed yet.

The `throttle` binding behavior supports this via a "signal". You can specify a signal name as the second argument to `throttle`. Then, using Aurelia's `ISignaler`, you can dispatch this signal to force a flush of the throttled update.

```html
<input value.bind="formValue & throttle:200:'flushInput'" blur.trigger="signaler.dispatchSignal('flushInput')">
```

```typescript
import { ISignaler, resolve } from 'aurelia';

export class MyApp {
  formValue = '';
  signaler = resolve(ISignaler); // Inject ISignaler

  constructor() {}
}
```

In this example:

-   `value.bind="formValue & throttle:200:'flushInput'"`: The `formValue` binding is throttled to 200ms and associated with the signal `'flushInput'`.
-   `blur.trigger="signaler.dispatchSignal('flushInput')"`: When the input loses focus (`blur` event), `signaler.dispatchSignal('flushInput')` is called. This immediately triggers any pending throttled update associated with the `'flushInput'` signal, ensuring the `formValue` is updated in the view model right away.

You can also specify a list of signals:

```html
<input value.bind="value & throttle :200 :['finishTyping', 'urgentUpdate']">
```

## Debounce

The `debounce` binding behavior is another rate-limiting tool.  `debounce` delays updates until a specified time interval has passed *without any further changes*.  This is ideal for scenarios where you want to react only after a user has paused interacting.

A classic use case is a search input that triggers an autocomplete or search operation.  Making an API call with every keystroke is inefficient.  `debounce` ensures the search logic is invoked only after the user has stopped typing for a moment.

**Updating a property after typing has stopped for 200ms**

```html
<input type="text" value.bind="searchQuery & debounce">
```

**Updating a property after typing has stopped for 850ms**

```html
<input type="text" value.bind="searchQuery & debounce:850">
```

Similar to `throttle`, `debounce` is highly effective with event bindings.

**Calling `mouseMoveHandler` after the mouse stops moving for 500ms**

```html
<div mousemove.delegate="mouseMoveHandler($event) & debounce:500"></div>
```

### Flushing Pending Debounced Calls

Like `throttle`, `debounce` also supports flushing pending updates using signals. This is useful in scenarios like form submission where you want to ensure the most recent debounced values are processed immediately, even if the debounce interval hasn't elapsed.

```html
<input value.bind="formValue & debounce:300:'validateInput'" blur.trigger="signaler.dispatchSignal('validateInput')">
```

```typescript
import { ISignaler, resolve } from 'aurelia';

export class MyApp {
  formValue = '';
  signaler = resolve(ISignaler); // Inject ISignaler

  constructor() {}

  validateInput() {
    console.log('Input validated:', this.formValue);
    // Perform validation logic here
  }
}
```

In this example, the `validateInput` method (which could perform input validation or other actions) will be called when the input field loses focus, even if the 300ms debounce interval isn't fully over, ensuring timely validation.

As with `throttle`, you can also provide a list of signal names to `debounce`.

## UpdateTrigger

The `updateTrigger` binding behavior allows you to customize which DOM events trigger updates from the view to the view model for input elements. By default, Aurelia uses the `change` and `input` events for most input types.

However, you can override this default behavior. For example, you might want to update the view model only when an input field loses focus (`blur` event).

**Updating the view model only on `blur`**

```html
<input value.bind="firstName & updateTrigger:'blur'">
```

You can specify multiple events that should trigger updates:

**Updating the view model on `blur` or `paste` events**

```html
<input value.bind="firstName & updateTrigger:'blur':'paste'">
```

This is useful in scenarios where you need fine-grained control over when view-model updates occur based on specific user interactions with input elements.

## Signal

The `signal` binding behavior provides a mechanism to explicitly tell a binding to refresh itself. This is particularly useful when a binding's result depends on external factors or global state changes that Aurelia's observation system might not automatically detect.

Consider a "translate" value converter that translates keys into localized strings, e.g., `${'greeting.key' | translate}`. If your application allows users to change the language dynamically, how do you refresh all the translation bindings to reflect the new language?

Another example is a value converter that displays a "time ago" string relative to the current time, e.g., `Posted ${post.date | timeAgo}`.  As time progresses, this binding needs to refresh periodically to show updated relative times like "5 minutes ago," "an hour ago," etc.

`signal` binding behavior solves these refresh scenarios:

**Using a Signal to Refresh Bindings**

```html
<p>Last updated: ${lastUpdated | timeAgo & signal:'time-update'}</p>
```

In this example, `signal:'time-update'` assigns the signal name `'time-update'` to this binding.  Multiple bindings can share the same signal name.

To trigger a refresh of all bindings with the signal name `'time-update'`, you use the `ISignaler`:

**Dispatching a Signal to Refresh Bindings**

```typescript
import { ISignaler, resolve } from 'aurelia';

export class MyApp {
  lastUpdated = new Date();
  signaler = resolve(ISignaler);

  constructor() {
    setInterval(() => {
      this.lastUpdated = new Date(); // Update the time
      this.signaler.dispatchSignal('time-update'); // Signal bindings to refresh
    }, 5000); // Refresh every 5 seconds
  }
}
```

Every 5 seconds, the `setInterval` function updates `lastUpdated` and then calls `signaler.dispatchSignal('time-update')`. This tells Aurelia to re-evaluate all bindings that are configured with `& signal:'time-update'`, causing them to refresh and display the updated "time ago" value.

## oneTime

The `oneTime` binding behavior optimizes string interpolation bindings for scenarios where the bound value is not expected to change after the initial render.  Applying `oneTime` indicates to Aurelia that the binding should only be evaluated once.

**One-time String Interpolation Binding**

```html
<span>${staticText & oneTime}</span>
```

`oneTime` bindings are the most efficient type of binding because they eliminate the overhead of property observation. Aurelia doesn't need to track changes to `staticText` after the initial binding, leading to performance improvements, especially in large lists or complex views.

Aurelia also provides binding behaviors for explicitly specifying `toView` and `twoWay` binding modes, although these are less commonly used as binding behaviors since the binding commands (`.to-view`, `.two-way`, `.bind`) are more direct.

**`toView` and `twoWay` binding behaviors**

```html
<input value.bind="dataItem & toView"> <input value.to-view="dataItem"> <!-- Equivalent to .to-view command -->

<input value.bind="userInput & twoWay"> <input value.two-way="userInput"> <!-- Equivalent to .two-way command -->
```

{% hint style="warning" %}
Note the casing difference between binding mode **commands** and **behaviors**. Binding commands (e.g., `.to-view`, `.two-way`) use lowercase, dash-separated names due to HTML case-insensitivity. However, binding behaviors used in expressions (e.g., `toView`, `twoWay`) use camelCase as dashes are not valid in JavaScript variable names.
{% endhint %}

## Self

The `self` binding behavior is used in event bindings to ensure that the event handler only responds to events dispatched directly from the element the listener is attached to, and not from any of its descendant elements due to event bubbling.

Consider a scenario with a panel component:

**Scenario without `self` binding behavior**

```html
<panel>
  <header mousedown.delegate='onMouseDown($event)' ref='headerElement'>
    <button>Settings</button>
    <button>Close</button>
  </header>
</panel>
```

Without `self`, the `onMouseDown` handler will be invoked not only when the user mousedown on the `<header>` element itself, but also on any element *inside* the header, such as the "Settings" and "Close" buttons, due to event bubbling. This might not be the desired behavior if you want the panel to react only to direct interactions with the header, not its contents.

You could handle this in your event handler by checking the `event.target`:

**Event Handler without `self` binding behavior (manual check)**

```typescript
export class PanelComponent {
  headerElement: HTMLElement; // Injected via @ViewChild('headerElement')

  onMouseDown(event: MouseEvent) {
    if (event.target !== this.headerElement) {
      return; // Ignore events from header's descendants
    }
    // Mouse down directly on the header, start panel dragging logic...
    // ...
  }
}
```

However, this mixes DOM event handling logic with component-specific behavior. The `self` binding behavior offers a cleaner, more declarative solution:

**Using `self` binding behavior**

```html
<panel>
  <header mousedown.delegate='onMouseDown($event) & self'>
    <button class='settings'></button>
    <button class='close'></button>
  </header>
</panel>
```

**Event Handler with `self` binding behavior**

```typescript
export class PanelComponent {
  onMouseDown(event: MouseEvent) {
    // No need to check event.target, 'self' behavior ensures
    // this handler is only called for events directly on the header element.
    // Mouse down on header, start panel dragging logic...
    // ...
  }
}
```

By adding `& self` to the event binding, Aurelia ensures that `onMouseDown` is only called when the `mousedown` event originates directly from the `<header>` element, simplifying your event handler logic and separating concerns.

## Custom Binding Behaviors

You can create your own custom binding behaviors to encapsulate reusable binding modifications.  Like value converters, custom binding behaviors are view resources.

Instead of `toView` and `fromView` methods (like value converters), custom binding behaviors implement `bind(binding, scope, [...args])` and `unbind(binding, scope)` methods:

-   **`bind(binding, scope, [...args])`**: This method is called when the binding is created and attached to the DOM.  It's where you implement the behavior modification to the `binding` instance.
    -   `binding`: The binding instance whose behavior you want to alter. It's an object implementing the `IBinding` interface.
    -   `scope`: The binding's scope, providing access to the view model (`scope.bindingContext`) and override context (`scope.overrideContext`).
    -   `[...args]`: Any arguments passed to the binding behavior in the template (e.g., `& myBehavior:arg1:arg2`).

-   **`unbind(binding, scope)`**: This method is called when the binding is detached from the DOM (e.g., when the view is unrendered).  Here, you should clean up any changes made in the `bind` method to restore the binding to its original state and prevent memory leaks.

Let's look at some practical examples of custom binding behaviors.

### Log Binding Context Behavior

This behavior logs the current binding context to the browser's console every time the binding updates its target (view). This is invaluable for debugging and understanding data flow in your Aurelia application.

```typescript
import { bindingBehavior } from '@aurelia/runtime-html';
import { type IBinding, type Scope } from '@aurelia/runtime';

export class LogBindingContextBehavior {
  public bind(scope: Scope, binding: IBinding) {
    const originalUpdateTarget = binding.updateTarget; // Store original updateTarget

    binding.updateTarget = (value) => {
      console.log('Binding context:', scope.bindingContext); // Log context
      originalUpdateTarget.call(binding, value); // Call original updateTarget
    };
  }

  public unbind(scope: Scope, binding: IBinding) {
    // Restore original updateTarget on unbind to avoid side effects
    if (binding.updateTarget !== undefined) {
      binding.updateTarget = binding.updateTarget["originalUpdateTarget"] ?? binding.updateTarget;
    }
  }
}

bindingBehavior('logBindingContext')(LogBindingContextBehavior); // Register behavior
```

**Usage in Template:**

```html
<import from="./log-binding-context-behavior.ts"></import>
<input value.bind="userName & logBindingContext">
```

Now, whenever the `userName` binding updates the input element, you'll see the current binding context logged to the console, helping you inspect the data available at that point.

### Inspect Value Binding Behavior (Tooltip)

This behavior adds a temporary tooltip to the element displaying the binding's current value whenever it updates. This offers a quick way to inspect binding values directly in the UI without resorting to console logs.

```typescript
import { bindingBehavior } from '@aurelia/runtime-html';
import { type IBinding, type Scope } from '@aurelia/runtime';

export class InspectBindingBehavior {
  public bind(scope: Scope, binding: IBinding) {
    const originalUpdateTarget = binding.updateTarget;

    binding.updateTarget = (value) => {
      originalUpdateTarget.call(binding, value);
      binding.target.title = `Current value: ${value}`; // Set tooltip
    };
  }

  public unbind(scope: Scope, binding: IBinding) {
    binding.target.title = null; // Clear tooltip on unbind
  }
}

bindingBehavior('inspect')(InspectBindingBehavior);
```

**Usage in Template:**

```html
<import from="./inspect-binding-behavior.ts"></import>
<input value.bind="itemName & inspect">
```

As the `itemName` binding updates, the input element will temporarily display a tooltip showing the current value, providing immediate visual feedback for debugging.

### Highlight Updates Binding Behavior

This behavior visually highlights an element by briefly changing its background color whenever the binding updates the element's target property. This visual cue helps quickly identify which parts of the UI are reacting to data changes, particularly useful during development and debugging complex views.

```typescript
import { bindingBehavior } from '@aurelia/runtime-html';
import { type IBinding, type Scope } from '@aurelia/runtime';

export class HighlightUpdatesBindingBehavior {
  public bind(scope: Scope, binding: IBinding, highlightColor: string = 'yellow', duration: number = 500) {
    const originalUpdateTarget = binding.updateTarget;

    binding.updateTarget = (value) => {
      originalUpdateTarget.call(binding, value); // Call original updateTarget
      const originalBg = binding.target.style.backgroundColor; // Store original background

      binding.target.style.backgroundColor = highlightColor; // Apply highlight color
      setTimeout(() => {
        binding.target.style.backgroundColor = originalBg; // Restore original color after duration
      }, duration);
    };
  }

  public unbind(scope: Scope, binding: IBinding) {
      binding.target.style.backgroundColor = null; // Optionally clear background on unbind
  }
}

bindingBehavior('highlightUpdates')(HighlightUpdatesBindingBehavior);
```

**Usage in Template:**

```html
<import from="./highlight-updates-binding-behavior.ts"></import>
<div textContent.bind="message & highlightUpdates:'lightblue':'1000'"></div>
```

Whenever the `message` binding updates the `textContent` of the `div`, the div's background will briefly flash light blue for 1 second (1000ms), visually indicating the update. You can customize the highlight color and duration by passing arguments to the binding behavior in the template.
