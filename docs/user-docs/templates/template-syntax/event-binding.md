# Event Binding

Event binding in Aurelia 2 offers a streamlined approach to managing DOM events directly within your templates. By declaratively attaching event listeners in your view templates, you can effortlessly respond to user interactions like clicks, keystrokes, form submissions, and more. This guide explores the intricacies of event binding in Aurelia 2, providing detailed explanations and practical examples to deepen your understanding and effective utilization of this feature.

## Understanding Event Binding

Aurelia 2 simplifies the connection between DOM events and your view model methods. It employs a clear and concise syntax, enabling you to specify the event type and the corresponding method to be invoked in your view model when that event occurs.

### Event Binding Syntax

The general syntax for event binding in Aurelia 2 follows this pattern:

```html
<element event.command="methodName(argument1, argument2, ...)">
```

- `<element>`:  The HTML element to which you are attaching the event listener.
- `event`: The name of the DOM event you wish to listen for (e.g., `click`, `input`, `mouseover`).
- `.command`:  The binding command that instructs Aurelia how to handle the event. Common commands are `.trigger` and `.capture`.
- `methodName`: The name of the method in your view model that will be executed when the event is dispatched.
- `argument1`, `argument2`, ...:  Optional arguments that you can pass to the `methodName`.

### Event Binding Commands: `.trigger` and `.capture`

Aurelia 2 primarily offers two commands for event binding, each controlling the event listening phase:

1.  **`.trigger`**: This command attaches an event listener that reacts to events during the **bubbling phase**. This is the most frequently used and generally recommended command for event binding as it aligns with typical event handling patterns in web applications. Events are first captured by the deepest element and then propagate upwards through the DOM tree.

2.  **`.capture`**: This command listens for events during the **capturing phase**.  Capturing is the less common phase where events propagate downwards from the window to the target element.  `.capture` is typically used in specific scenarios, such as when you need to intercept an event before it reaches child elements, potentially preventing default behaviors or further propagation.

{% hint style="info" %}
The `.delegate` command from Aurelia 1 has been removed in Aurelia 2. If you need to migrate from Aurelia 1 code that uses `.delegate`, you can use the `@aurelia/compat-v1` package, or simply replace `.delegate` with `.trigger` in most cases, as `.trigger` in Aurelia 2 efficiently handles event bubbling for dynamic content.
{% endhint %}

#### Example: Click Event Binding using `.trigger`

To bind a click event on a button to a method named `handleClick` in your view model, you would use:

```html
<button click.trigger="handleClick()">Click Me</button>
```

When a user clicks the "Click Me" button, Aurelia will execute the `handleClick` method defined in your associated view model.

### Shorthand syntax for events (`@event`)

To make it easier for teams migrating from Vue or other frameworks, Aurelia also understands the `@event="handler"` shorthand. The compiler converts it to the equivalent `event.trigger` binding, including modifiers after a colon.

```html
<!-- These two lines are identical -->
<button click.trigger="save()">Save</button>
<button @click="save()">Save</button>

<!-- Modifiers work the same way -->
<button @click:ctrl+enter="send()">Send (Ctrl + Enter)</button>
```

Use whichever style you prefer—the generated instructions are the same. If you need capturing semantics, use the explicit `event.capture` syntax because the shorthand only targets the bubbling (`.trigger`) command.

### Passing Event Data to Handlers

Often, you need access to the event object or want to pass additional data to your event handler method. Aurelia provides a straightforward way to do this.

To pass the DOM event object itself to your handler, use the `$event` special variable:

```html
<button click.trigger="handleClick($event)">Click Me</button>
```

In your view model, the `handleClick` method would accept the event object as a parameter:

```typescript
export class MyViewModel {
  handleClick(event: MouseEvent) {
    console.log('Button clicked!', event);
    // Access event properties like event.target, event.clientX, etc.
  }
}
```

You can also pass custom arguments along with the event:

```html
<button click.trigger="removeItem(item.id, $event)">Remove Item</button>
```

```typescript
export class MyViewModel {
  removeItem(itemId: number, event: MouseEvent) {
    console.log(`Removing item with ID: ${itemId}`, event);
    // Logic to remove the item
  }
}
```

## Common DOM Events

Aurelia 2 supports binding to all standard DOM events. Here are some frequently used events in web development:

### `click`

The `click` event is triggered when a pointing device button (typically a mouse button) is both pressed and released while the pointer is inside the element. It is commonly used for buttons, links, and interactive elements.

```html
<button click.trigger="submitForm()">Submit</button>
<a href="#" click.trigger="openModal()">Learn More</a>
```

### `input`

The `input` event fires when the value of an `<input>`, `<textarea>`, or `<select>` element has been changed. It's useful for real-time validation or dynamic updates based on user input.

```html
<input type="text" input.trigger="updateSearchQuery($event.target.value)" placeholder="Search..." />
```

### `change`

The `change` event is fired when the value of an element has been changed *and* the element loses focus. This is often used for `<input>`, `<select>`, and `<textarea>` elements when you want to react after the user has finished making changes.

```html
<select change.trigger="selectTheme($event.target.value)">
  <option value="light">Light Theme</option>
  <option value="dark">Dark Theme</option>
</select>
```

### `mouseover` and `mouseout`

The `mouseover` event occurs when the mouse pointer is moved onto an element, and `mouseout` occurs when it is moved off of an element. These are useful for hover effects and interactive UI elements.

```html
<div mouseover.trigger="highlight()" mouseout.trigger="unhighlight()">Hover Me</div>
```

### `keydown`, `keyup`, and `keypress`

These keyboard events are triggered when a key is pressed down, released, or pressed and released, respectively.  `keydown` and `keyup` are generally preferred for capturing special keys like arrows, `Ctrl`, `Shift`, etc., while `keypress` is more suited for character input.

```html
<input type="text" keydown.trigger="handleKeyDown($event)" />
```

## Controlling Event Propagation

In DOM event handling, events can "bubble" up the DOM tree (from the target element up to the document) or "capture" down (from the document to the target element).  Sometimes you need to control this propagation. Within your event handler methods, you can use methods of the event object to manage propagation:

- `event.stopPropagation()`: Prevents the event from further bubbling up the DOM tree to parent elements.
- `event.preventDefault()`: Prevents the default action associated with the event (if it's cancelable), without stopping event propagation. For example, `preventDefault` on a click event of a link (`<a>`) would stop the browser from navigating to the link's `href`.

## Advanced Event Binding Techniques

Aurelia 2 provides capabilities beyond basic event binding, allowing for performance optimization and handling specific scenarios.

### Throttling and Debouncing Event Handlers

For events that fire rapidly and repeatedly, such as `mousemove`, `scroll`, or `input`, calling an event handler function on every event can be performance-intensive. Aurelia's binding behaviors offer `throttle` and `debounce` to limit the rate at which your handler is invoked.

**Throttling**: Ensures a function is called at most once in a specified time interval.

```html
<div mousemove.trigger="trackMouse($event) & throttle:50">Move mouse here</div>
```

In this example, `trackMouse` will be executed at most every 50 milliseconds, even if `mousemove` events are firing more frequently.

**Debouncing**: Delays the execution of a function until after a certain amount of time has passed since the *last* time the event was triggered. Useful for autocomplete or search features to avoid making API calls on every keystroke.

```html
<input type="text" input.trigger="searchQuery($event.target.value) & debounce:300" placeholder="Search" />
```

Here, `searchQuery` will be called 300ms after the user *stops* typing, reducing the number of search requests.

#### Performance Considerations

When using throttling and debouncing, consider these performance best practices:

- **Choose appropriate delays**: Too short delays may not provide performance benefits, while too long delays can make the UI feel unresponsive.
- **Monitor handler complexity**: Ensure that even throttled/debounced handlers are optimized for performance.
- **Use signals for immediate updates**: When you need to force immediate execution of a throttled/debounced handler (e.g., on form submission), use signals:

```html
<input input.trigger="search($event.target.value) & debounce:300:'immediate'">
<button click.trigger="signaler.dispatchSignal('immediate')">Search Now</button>
```

### Custom Events

Aurelia 2 fully supports custom events, which are essential when working with custom elements or integrating third-party libraries that dispatch their own events.

```html
<my-custom-element data-loaded.trigger="handleDataLoaded($event)"></my-custom-element>
```

In this scenario, `data-loaded` is a custom event emitted by `<my-custom-element>`.  `handleDataLoaded` in the parent view model will be invoked when this custom event is dispatched.

## Event Binding Examples and Use Cases

To solidify your understanding, let's explore practical examples showcasing different event binding scenarios in Aurelia 2.

### Self-Delegating Events with `.self`

The `self` binding behavior ensures that an event handler is only triggered if the event originated directly from the element to which the listener is attached, and not from any of its child elements (due to event bubbling).

```html
<div click.trigger="divClicked() & self">
  <p>Clicking here will trigger divClicked</p>
  <button click.trigger="buttonClicked()">Clicking button will NOT trigger divClicked</button>
</div>
```

In this setup, `divClicked()` will only be executed if the click originates directly on the `<div>` element. Clicks on the `<button>` (a child element) will trigger `buttonClicked()` but will *not* bubble up to trigger `divClicked()` due to the `& self` behavior.

### Checkbox `change` Event and Two-Way Binding

Combine event binding with two-way binding for interactive form elements like checkboxes.

```html
<input type="checkbox" checked.bind="isAgreed" change.trigger="agreementChanged()" id="agreementCheckbox">
<label for="agreementCheckbox">I agree to the terms</label>
```

```typescript
export class MyViewModel {
  isAgreed = false;

  agreementChanged() {
    console.log('Agreement status changed:', this.isAgreed);
    // Perform actions based on checkbox state
  }
}
```

Here, `checked.bind="isAgreed"` keeps the `isAgreed` property in sync with the checkbox state (two-way binding).  `change.trigger="agreementChanged()"` additionally allows you to execute custom logic when the checkbox state changes.

### Handling Keyboard Events for Specific Keys

React to specific key presses within input fields.

```html
<input type="text" keydown.trigger="handleKeyDown($event)" placeholder="Type here">
```

```typescript
export class MyViewModel {
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      console.log('Enter key pressed!');
      // Perform action on Enter key press (e.g., submit form)
      event.preventDefault(); // Prevent default form submission if inside a form
    } else if (event.key === 'Escape') {
      console.log('Escape key pressed!');
      // Handle Escape key press (e.g., clear input)
    }
    // ... handle other keys as needed
  }
}
```

This example shows how to check `event.key` to handle specific keys like "Enter" and "Escape".

### Event Delegation for Dynamic Lists

Event delegation is a powerful technique for efficiently handling events on dynamically generated lists. Attach a single event listener to the parent `<ul>` or `<div>` instead of individual listeners to each list item using `.trigger`.

```html
<ul click.trigger="listItemClicked($event)">
  <li repeat.for="item of items" data-item-id="${item.id}">${item.name}</li>
</ul>
```

```typescript
export class MyViewModel {
  items = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];

  listItemClicked(event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'LI') {
      const itemId = target.dataset.itemId;
      console.log(`List item clicked, ID: ${itemId}`);
      // Logic to handle click on list item with ID itemId
    }
  }
}
```

The `listItemClicked` handler attached to the `<ul>` will be triggered for clicks on any `<li>` within it due to event bubbling. We check `event.target` to ensure the click originated from an `<li>` and extract the `data-item-id`. This approach provides efficient event handling for dynamic lists without requiring individual listeners on each item.

### Custom Event Communication Between Components

Parent components can listen for and react to custom events dispatched by child custom elements.

**Custom Element (Child):**

```typescript
import { bindable, customElement, resolve } from 'aurelia';
import { INode } from '@aurelia/runtime-html';

@customElement({ name: 'my-button', template: `<button click.trigger="handleClick()">\${label}</button>` })
export class MyButton {
  private element = resolve(INode) as HTMLElement;
  @bindable label = 'Click Me';

  handleClick() {
    this.element.dispatchEvent(new CustomEvent('button-clicked', {
      bubbles: true, // Allow event to bubble up
      detail: { message: 'Button with label "' + this.label + '" was clicked' }
    }));
  }
}
```

**Parent Component (Parent):**

```html
<my-button label="Action Button" button-clicked.trigger="handleButtonClick($event)"></my-button>
```

```typescript
export class ParentViewModel {
  handleButtonClick(event: CustomEvent) {
    console.log('Custom event "button-clicked" received:', event.detail.message);
    // Handle the custom event
  }
}
```

When the button in `<my-button>` is clicked, it dispatches a custom event `button-clicked`. The parent component listens for this event using `button-clicked.trigger` and executes `handleButtonClick`, receiving event details in `$event.detail`.

### Autocomplete with Debounced Input

Implement autocomplete functionality with debouncing to reduce API calls during typing.

```html
<input type="text" input.trigger="autocomplete($event.target.value) & debounce:500" placeholder="Start typing..." />
<ul if.bind="suggestions.length">
  <li repeat.for="suggestion of suggestions">${suggestion}</li>
</ul>
```

```typescript
export class MyViewModel {
  searchQuery = '';
  suggestions = [];

  autocomplete(query: string) {
    this.searchQuery = query;
    if (query.length > 2) {
      // Simulate API call for suggestions (replace with actual API call)
      setTimeout(() => {
        this.suggestions = [`${query} suggestion 1`, `${query} suggestion 2`, `${query} suggestion 3`];
      }, 300);
    } else {
      this.suggestions = [];
    }
  }
}
```

The `autocomplete` method will be called 500ms after the last `input` event. This delay allows users to finish typing before triggering the (simulated) autocomplete API call, improving performance.

### Event Modifiers: Enhancing Event Handling

Event modifiers provide a declarative way to apply conditions or actions to event bindings directly in your templates. Event modifiers are appended to the event name after a colon:

```html
<element event.trigger[:modifier]="methodName()">
```

Aurelia provides built-in modifiers for common event handling scenarios, and you can extend them with custom mappings.

| Modifier | Works with | Description |
| --- | --- | --- |
| `prevent` | Any event | Calls `event.preventDefault()` before running your handler. |
| `stop` | Any event | Calls `event.stopPropagation()` before running your handler. |
| `ctrl`, `alt`, `shift`, `meta` | Keyboard/Mouse events | Ensures the corresponding meta key is pressed. Multiple keys can be chained (`:ctrl+enter`). |
| Named keys (`enter`, `escape`, `tab`, `a`, `ArrowUp`, etc.) | Keyboard events | Only invokes your handler when the pressed key matches. |
| `left`, `middle`, `right` | Mouse events | Filters mouse buttons. |

```html
<!-- Submit only on Ctrl + Enter, prevent default form submission -->
<textarea @keydown:ctrl+enter.prevent="submitDraft()"></textarea>

<!-- Ignore bubbling clicks; only fire when the element itself is clicked -->
<button click.trigger="destroy()" @click:left.stop.prevent></button>

<!-- When using dot syntax, the command still comes first -->
<div scroll.trigger="syncScroll($event)" @scroll.prevent></div>
```

Modifiers are additive: `@click:ctrl+enter.prevent` checks modifier keys first and only then calls your handler (after canceling the DOM default). If a modifier check fails (for example, the required key is not pressed) the handler simply does not run.

#### Mouse and Keyboard Event Modifiers

Aurelia has built-in support for modifiers related to mouse buttons and keyboard keys.

**Example: `ctrl` Key Modifier**

Execute `onCtrlClick()` only when the button is clicked *and* the `Ctrl` key is pressed.

```html
<button click.trigger:ctrl="onCtrlClick()">Ctrl + Click</button>
```

**Example: `ctrl+enter` Key Combination**

Execute `send()` only when the `Enter` key is pressed *while* the `Ctrl` key is also held down. Modifiers can be combined using `+`.

```html
<textarea keydown.trigger:ctrl+enter="send()"></textarea>
```

#### `prevent` and `stop` Modifiers

Declaratively call `event.preventDefault()` and `event.stopPropagation()` using modifiers.

**Example: `prevent` and `stop` Modifiers**

Call `validate()` when the button is clicked, and also prevent the default button behavior and stop event propagation.

```html
<button click.trigger:stop:prevent="validate()">Validate</button>
```

#### Mouse Button Modifiers: `left`, `middle`, `right`

Handle clicks based on specific mouse buttons.

**Example: `middle` Mouse Button Modifier**

Execute `newTab()` only when the button is clicked with the middle mouse button.

```html
<button click.trigger:middle="newTab()">Open in New Tab (Middle Click)</button>
```

#### Keyboard Key Mappings and Custom Modifiers

You can use character codes as modifiers for keyboard events. For example, `75` is the char code for uppercase 'K'.

**Example: `Ctrl + K` using Char Code Modifier**

Execute `openSearchDialog()` when `Ctrl + K` is pressed in the textarea.

```html
<textarea keydown.trigger:ctrl+75="openSearchDialog()"></textarea>
```

While using char codes works, it can be less readable. You can create custom key mappings to use more descriptive modifier names. For example, map `upper_k` to the key code for 'K'.

**Custom Key Mapping Setup (in your main application file, e.g., `main.ts`):**

```typescript
import Aurelia, { AppTask, IKeyMapping } from 'aurelia';

Aurelia.register(
  AppTask.creating(IKeyMapping, mapping => {
    mapping.keys.upper_k = 'K'; // Map 'upper_k' to 'K'
  })
);
```

Now you can use `:upper_k` as a modifier:

```html
<textarea keydown.trigger:ctrl+upper_k="openSearchDialog()"></textarea>
```

This makes your template more readable as `:ctrl+upper_k` is more self-explanatory than `:ctrl+75`.

{% hint style="info" %}
Aurelia provides default key mappings for lowercase letters 'a' through 'z' (both as key codes and letter names). For uppercase letters, only key code mappings are provided by default (e.g., `:65` for 'A'). You can extend these mappings as shown above to create more semantic modifier names.
{% endhint %}

#### Extending modifier handling

The runtime registers `EventModifier`, `IModifiedEventHandlerCreator`, and a set of default creators (mouse, keyboard, generic) inside `EventModifierRegistration`. If you need custom semantics—gestures, wheel direction checks, or application-specific shortcuts—add your own creator and register it with the container:

```typescript
import { EventModifierRegistration, IModifiedEventHandlerCreator } from '@aurelia/runtime-html';
import { Registration } from '@aurelia/kernel';

class WheelModifier implements IModifiedEventHandlerCreator {
  public readonly type = 'wheel';
  public getHandler(modifier: string) {
    const parts = modifier.split('.');
    return (event: WheelEvent) => {
      if (parts.includes('vertical') && Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return false; // Ignore horizontal scrolls
      }
      if (parts.includes('invert')) {
        event.deltaY *= -1;
      }
      return true;
    };
  }
}

Aurelia.register(
  EventModifierRegistration,
  Registration.singleton(IModifiedEventHandlerCreator, WheelModifier)
);
```

After registration you can bind to `@wheel:vertical.invert="onScroll($event)"`. Returning `false` from the handler vetoes the event (your view-model method will not be called), while returning `true` allows the binding to proceed.

## Common Pitfalls and Troubleshooting

### Event Handler Issues

1. **Event not firing**: Verify that the event name is correct and the element supports that event type.
2. **Handler not found**: Ensure the method exists in your view model and is properly spelled.
3. **Context issues**: Remember that event handlers execute in the context of the view model, so `this` refers to the view model instance.

### Performance Issues

1. **Frequent event handlers**: Use throttling or debouncing for events that fire rapidly (e.g., `mousemove`, `scroll`, `input`).
2. **Complex handlers**: Keep event handlers lightweight. Move heavy processing to separate methods called asynchronously.
3. **Memory leaks**: Aurelia automatically manages event listener cleanup, but be cautious with manual event listeners in your handlers.

### Binding Behavior Conflicts

1. **Multiple rate limiters**: You cannot apply both `throttle` and `debounce` to the same binding (Error AUR9996).
2. **Duplicate behaviors**: Avoid applying the same binding behavior multiple times (Error AUR0102).
3. **Behavior order**: When chaining behaviors, order matters: `event.trigger="handler() & behavior1 & behavior2"`.

### Event Modifier Issues

1. **Incorrect syntax**: Modifiers must be placed after the command: `click.trigger:ctrl` not `click:ctrl.trigger`.
2. **Unsupported modifiers**: Verify that the modifier is supported for the event type.
3. **Custom modifiers**: Ensure custom key mappings are registered before use.

### Debugging Tips

1. **Console logging**: Add console.log statements to verify event firing:
   ```typescript
   handleClick(event: MouseEvent) {
     console.log('Click handler called', event);
     // Your logic here
   }
   ```

2. **Browser dev tools**: Use the browser's event listener inspection to verify bindings are attached.

3. **Event object inspection**: Log the entire event object to understand available properties:
   ```typescript
   handleEvent(event: Event) {
     console.log('Event details:', {
       type: event.type,
       target: event.target,
       currentTarget: event.currentTarget
     });
   }
   ```

## Conclusion

Event binding in Aurelia 2 is a powerful and intuitive mechanism for creating interactive web applications. By mastering the syntax, commands, event modifiers, and advanced techniques like throttling and custom events, you can effectively handle user interactions and build dynamic, responsive user interfaces. Leverage the `.trigger` command for typical scenarios and `.capture` when you need to intercept events during the capturing phase. With these tools and patterns, you can craft a seamless and engaging user experience in your Aurelia 2 applications.
