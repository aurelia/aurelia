# Binding Behaviors

Binding behaviors are a powerful category of view resources in Aurelia 2 that modify how bindings operate. Unlike value converters which transform data, binding behaviors have complete access to the binding instance throughout its entire lifecycle, allowing them to fundamentally alter binding behavior.

## Overview

Binding behaviors enable you to:
- **Control timing** - throttle, debounce, or trigger updates at specific intervals
- **Modify binding modes** - force one-way, two-way, or one-time binding behavior  
- **Customize event handling** - filter events or change which events trigger updates
- **Add debugging capabilities** - inspect, log, or visualize binding behavior
- **Implement complex logic** - create reusable binding modifications

### Syntax

Binding behaviors use the `&` operator and follow similar syntax to value converters:

```html
<!-- Basic usage -->
<input value.bind="searchQuery & debounce">

<!-- With parameters -->
<input value.bind="query & throttle:500">

<!-- Multiple parameters -->
<input value.bind="data & throttle:200:'signalName'">

<!-- Chaining behaviors -->
<input value.bind="text & debounce:300 & signal:'update'">

<!-- Combined with value converters -->
<span>${price | currency:'USD' & signal:'refresh'}</span>
```

**Parameter syntax flexibility:**
```html
<!-- All of these are equivalent -->
<input value.bind="data & throttle:200:'signal'">
<input value.bind="data & throttle :200 : 'signal'">
<input value.bind="data & throttle: 200 : 'signal'">
```

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

You can also specify multiple signals using an array:

```html
<input value.bind="value & throttle:200:['finishTyping', 'urgentUpdate']">
```

This allows multiple different signals to trigger the same throttled update, providing flexibility in complex scenarios where updates might need to be flushed from different parts of your application.

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

As with `throttle`, you can also provide multiple signal names to `debounce`:

```html
<input value.bind="searchQuery & debounce:500:['search', 'validate']">
```

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

## Binding Mode Behaviors

Aurelia provides binding behaviors that explicitly specify binding modes. While binding commands (`.bind`, `.one-way`, `.two-way`) are more commonly used, these behaviors offer programmatic control over binding modes.

### oneTime

The `oneTime` binding behavior creates the most efficient binding by evaluating the expression only once and never observing it for changes.

```html
<!-- Perfect for static content -->
<span>${appVersion & oneTime}</span>
<img src.bind="logoUrl & oneTime" alt="Company Logo">

<!-- Useful in repeaters for static data -->
<div repeat.for="item of items">
  <span>${item.id & oneTime}</span> <!-- ID never changes -->
  <span>${item.name}</span> <!-- Name might change -->
</div>
```

`oneTime` bindings eliminate observation overhead entirely, making them ideal for:
- Static configuration values
- IDs and other immutable data
- Large lists where some properties never change
- Performance-critical rendering scenarios

### toView (One-Way)

Forces one-way data flow from view-model to view only.

```html
<!-- Equivalent syntaxes -->
<input value.bind="dataItem & toView">
<input value.one-way="dataItem">
```

### fromView

Forces one-way data flow from view to view-model only. The view-model property will be updated when the view changes, but view-model changes won't update the view.

```html
<!-- Input updates view-model, but view-model changes don't update input -->
<input value.bind="userInput & fromView">
<!-- Equivalent to -->
<input value.from-view="userInput">
```

This is useful for scenarios like:
- Collecting user input without reflecting programmatic changes back to the UI
- One-way form submission scenarios
- Performance optimization when you don't need view updates

### twoWay

Forces bidirectional data synchronization between view and view-model.

```html
<!-- Equivalent syntaxes -->
<input value.bind="userInput & twoWay">
<input value.two-way="userInput">
```

### Binding Mode Summary

| Behavior | Direction | Use Case | Command Equivalent |
|----------|-----------|----------|-------------------|
| `oneTime` | None (static) | Static content, performance | N/A |
| `toView` | VM → View | Display-only data | `.one-way` |
| `fromView` | View → VM | Input-only scenarios | `.from-view` |
| `twoWay` | VM ↔ View | Interactive forms | `.two-way` |

{% hint style="info" %}
**Naming Convention**: Binding mode behaviors use camelCase (`toView`, `fromView`, `twoWay`) because they're JavaScript expressions, while binding commands use dash-case (`.to-view`, `.from-view`, `.two-way`) due to HTML's case-insensitive nature.
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

## Attr

The `attr` binding behavior forces a binding to use attribute accessor instead of property accessor. This is particularly useful when working with custom attributes or when you need to ensure the HTML attribute is set rather than just the property.

**Forcing attribute binding:**

```html
<!-- Forces setting the 'data-value' attribute -->
<div data-value.bind="itemValue & attr">

<!-- Useful for custom attributes that need actual HTML attributes -->
<custom-element custom-attr.bind="value & attr">

<!-- CSS class binding as attribute -->
<div class.bind="cssClasses & attr">
```

**When to use `attr`:**
- Custom attributes that require actual HTML attributes to be set
- Interoperability with third-party libraries that read HTML attributes
- SEO considerations where attributes need to be present in the DOM
- Cases where you need the attribute to be visible in browser dev tools

**Example with custom attribute:**

```typescript
// Custom attribute that reads from HTML attribute
export class TooltipCustomAttribute {
  attached() {
    // This requires the actual HTML attribute to be set
    const tooltipText = this.element.getAttribute('tooltip');
    // Setup tooltip with tooltipText
  }
}
```

```html
<!-- Without attr - might not work -->
<div tooltip.bind="helpText">Content</div>

<!-- With attr - ensures HTML attribute is set -->
<div tooltip.bind="helpText & attr">Content</div>
```

## Custom Binding Behaviors

You can create your own custom binding behaviors to encapsulate reusable binding modifications.  Like value converters, custom binding behaviors are view resources.

Custom binding behaviors implement `bind(scope, binding, [...args])` and `unbind(scope, binding)` methods:

-   **`bind(scope, binding, [...args])`**: Called when the binding is created and attached to the DOM. This is where you implement the behavior modification.
    -   `scope`: The binding's scope, providing access to the view model (`scope.bindingContext`) and override context (`scope.overrideContext`)
    -   `binding`: The binding instance whose behavior you want to alter (implements `IBinding` interface)
    -   `[...args]`: Any arguments passed to the binding behavior in the template (e.g., `& myBehavior:arg1:arg2`)

-   **`unbind(scope, binding)`**: Called when the binding is detached from the DOM. Clean up any changes made in the `bind` method to restore the binding to its original state and prevent memory leaks.

**Important:** Note the parameter order - `scope` comes **first**, then `binding`. This is different from some other Aurelia lifecycle methods.

Let's look at some practical examples of custom binding behaviors.

### Log Binding Context Behavior

This behavior logs the current binding context to the browser's console every time the binding updates its target (view). This is invaluable for debugging and understanding data flow in your Aurelia application.

```typescript
import { bindingBehavior } from '@aurelia/runtime-html';
import { type IBinding, type Scope } from '@aurelia/runtime';

export class LogBindingContextBehavior {
  private originalUpdateTarget = new WeakMap<IBinding, Function>();

  public bind(scope: Scope, binding: IBinding) {
    // Store the original updateTarget method
    const original = binding.updateTarget;
    this.originalUpdateTarget.set(binding, original);

    // Override updateTarget to add logging
    binding.updateTarget = (value) => {
      console.log('Binding context:', scope.bindingContext);
      console.log('Binding value:', value);
      original.call(binding, value);
    };
  }

  public unbind(scope: Scope, binding: IBinding) {
    // Restore original updateTarget method
    const original = this.originalUpdateTarget.get(binding);
    if (original) {
      binding.updateTarget = original;
      this.originalUpdateTarget.delete(binding);
    }
  }
}

bindingBehavior('logBindingContext')(LogBindingContextBehavior);
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
  private originalMethods = new WeakMap<IBinding, Function>();

  public bind(scope: Scope, binding: IBinding) {
    const original = binding.updateTarget;
    this.originalMethods.set(binding, original);

    binding.updateTarget = (value) => {
      original.call(binding, value);
      // Add tooltip showing current value
      if (binding.target && 'title' in binding.target) {
        binding.target.title = `Current value: ${JSON.stringify(value)}`;
      }
    };
  }

  public unbind(scope: Scope, binding: IBinding) {
    // Restore original method
    const original = this.originalMethods.get(binding);
    if (original) {
      binding.updateTarget = original;
      this.originalMethods.delete(binding);
    }
    
    // Clear tooltip
    if (binding.target && 'title' in binding.target) {
      binding.target.title = '';
    }
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
  private originalMethods = new WeakMap<IBinding, Function>();
  private timeouts = new WeakMap<IBinding, number>();

  public bind(scope: Scope, binding: IBinding, highlightColor: string = 'yellow', duration: number = 500) {
    const original = binding.updateTarget;
    this.originalMethods.set(binding, original);

    binding.updateTarget = (value) => {
      original.call(binding, value);
      
      // Clear any existing timeout
      const existingTimeout = this.timeouts.get(binding);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      if (binding.target && binding.target.style) {
        const originalBg = binding.target.style.backgroundColor;
        binding.target.style.backgroundColor = highlightColor;
        
        const timeout = setTimeout(() => {
          binding.target.style.backgroundColor = originalBg;
          this.timeouts.delete(binding);
        }, duration);
        
        this.timeouts.set(binding, timeout);
      }
    };
  }

  public unbind(scope: Scope, binding: IBinding) {
    // Restore original method
    const original = this.originalMethods.get(binding);
    if (original) {
      binding.updateTarget = original;
      this.originalMethods.delete(binding);
    }
    
    // Clear any pending timeouts
    const timeout = this.timeouts.get(binding);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(binding);
    }
    
    // Reset background color
    if (binding.target && binding.target.style) {
      binding.target.style.backgroundColor = '';
    }
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

## Built-in Behaviors Reference

### Rate Limiting

| Behavior | Purpose | Default | Parameters | Signals |
|----------|---------|---------|------------|---------|
| `throttle` | Limit update frequency | 200ms | `delay`, `signal` | ✅ |
| `debounce` | Delay until input stops | 200ms | `delay`, `signal` | ✅ |

### Binding Modes

| Behavior | Direction | Use Case |
|----------|-----------|----------|
| `oneTime` | None | Static content, performance |
| `toView` | VM → View | Display-only data |
| `fromView` | View → VM | Input-only scenarios |
| `twoWay` | VM ↔ View | Interactive forms |

### Event & DOM

| Behavior | Purpose | Use Case |
|----------|---------|----------|
| `self` | Filter event source | Prevent event bubbling |
| `updateTrigger` | Custom DOM events | Control when updates occur |
| `attr` | Force attribute access | Custom attributes, SEO |

### Utility

| Behavior | Purpose | Use Case |
|----------|---------|----------|
| `signal` | Manual refresh | Dynamic content, translations |

## Best Practices

### Performance Considerations

**Rate limiting for expensive operations:**
```html
<!-- API calls -->
<input value.bind="searchTerm & debounce:500">

<!-- DOM updates -->
<div scroll.delegate="onScroll($event) & throttle:16">
```

**Static content optimization:**
```html
<!-- Use oneTime for truly static content -->
<span>${config.version & oneTime}</span>
<img src.bind="staticLogoUrl & oneTime">
```

### Memory Management

**Proper cleanup in custom behaviors:**
```typescript
export class MyBehavior {
  private cleanupMethods = new WeakMap();
  
  bind(scope: Scope, binding: IBinding) {
    // Setup with cleanup tracking
  }
  
  unbind(scope: Scope, binding: IBinding) {
    // Always clean up to prevent memory leaks
    const cleanup = this.cleanupMethods.get(binding);
    cleanup?.();
    this.cleanupMethods.delete(binding);
  }
}
```

### Debugging and Development

**Progressive enhancement approach:**
```html
<!-- Development: with debugging -->
<input value.bind="data & logBindingContext & highlightUpdates">

<!-- Production: optimized -->
<input value.bind="data & debounce:300">
```

### Common Patterns

**Form handling:**
```html
<!-- Real-time validation with debounce -->
<input value.bind="email & debounce:300 & signal:'validate'">

<!-- Immediate validation on blur -->
<input value.bind="email & updateTrigger:'blur'" 
       blur.trigger="signaler.dispatchSignal('validate')">
```

**Search functionality:**
```html
<!-- Debounced search -->
<input value.bind="searchQuery & debounce:400">

<!-- Immediate search button -->
<button click.delegate="search() & signal:'search-now'">Search</button>
```

**Dynamic content:**
```html
<!-- Time-sensitive content -->
<span>${timestamp | timeAgo & signal:'time-update'}</span>

<!-- Localized content -->
<span>${'greeting.hello' | translate & signal:'locale-change'}</span>
```

## Summary

Binding behaviors provide powerful ways to customize Aurelia's binding system:

- **Built-in behaviors** cover common scenarios like rate limiting, binding modes, and event handling
- **Custom behaviors** enable unlimited extensibility for specialized requirements  
- **Proper cleanup** is essential to prevent memory leaks in custom implementations
- **Performance benefits** come from using appropriate behaviors for different use cases
- **Debugging capabilities** make development and troubleshooting easier

Use binding behaviors to create more efficient, maintainable, and user-friendly applications by controlling exactly how your data flows between view and view-model.
