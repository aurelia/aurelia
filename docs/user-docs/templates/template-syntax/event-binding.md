# Event Binding

Event binding in Aurelia 2 provides a seamless way to handle DOM events within your application. By attaching event listeners directly in your view templates, you can easily respond to user interactions such as clicks, key presses, and more. This guide will delve into the specifics of event binding in Aurelia 2, offering detailed explanations and examples to enhance your understanding and usage of this feature.

## Understanding Event Binding

Aurelia 2 simplifies the process of binding events to methods in your view model. It uses a straightforward syntax that allows you to specify the type of event and the corresponding method to invoke when that event occurs.

### Event Binding Syntax

The general syntax for event binding in Aurelia 2 is as follows:

```html
<element event.trigger="methodName(argument1, argument2, ...)">
```

- `element` represents the HTML element to which you want to attach the event listener.
- `event` is the event you want to listen for (e.g., `click`, `keypress`).
- `.trigger` is the binding command that tells Aurelia to listen for the specified event and call the method when the event is fired.
- `methodName` is the method's name in your view-model that will be called when the event occurs.
- `argument1`, `argument2`, ... are optional arguments you can pass to the method.

### Event Binding Commands

Aurelia 2 offers two primary commands for event binding:

1. `.trigger`: This command attaches an event listener that responds to events during the bubbling phase. It is the most commonly used event-binding command and is suitable for most use cases.

2. `.capture`: This command listens for events during the capturing phase. It is generally reserved for special circumstances, such as when you need to intercept events before they reach a target element that may prevent their propagation.

#### Example: Click Event Binding

To listen for a click event on a button and call a method named `handleClick`, you would write:

```html
<button click.trigger="handleClick()">Click me!</button>
```

When the button is clicked, your view-model's `handleClick` method will be executed.

### Passing Event Data

You can pass the event object itself or other custom data to your event handler method. For instance, to pass the event object to the `handleClick` method, you would modify the binding like this:

```html
<button click.trigger="handleClick($event)">Click me!</button>
```

In your view model, the `handleClick` method would accept the event object as a parameter:

```javascript
export class MyViewModel {
  handleClick(event) {
    // Handle the click event
  }
}
```

## Common Events

Aurelia 2 allows you to bind to any standard DOM event. Here are some common events you might use:

### Click

The `click` event is frequently used for buttons, links, and other clickable elements.

```html
<a href="#" click.trigger="navigate()">Go somewhere</a>
```

### Keypress

The `keypress` event is useful for responding to user input in text fields or when handling keyboard navigation.

```html
<input type="text" keypress.trigger="validateInput($event)" />
```

### Mouseover

The `mouseover` event can trigger interactions when the user hovers over an element.

```html
<div mouseover.trigger="showTooltip()">Hover over me!</div>
```

## Handling Event Propagation

Sometimes, you may want to stop an event from bubbling up the DOM tree or prevent the default action associated with that event. You can do this within your event handler methods using the event object's methods:

- `event.stopPropagation()`: Prevents further propagation of the event in the bubbling or capturing phase.
- `event.preventDefault()`: Cancels the event if it is cancelable without stopping further propagation.

## Advanced Event Binding

While the `.trigger` and `.capture` commands cover most use cases, Aurelia 2 also allows for more advanced scenarios, such as throttling event handlers for performance reasons or handling custom events.

### Throttling Events

To improve performance, especially for events that can fire rapidly like `mousemove` or `scroll`, you can throttle the event handler invocation using Aurelia's binding behaviors.

```html
<div mousemove.trigger="handleMouseMove() & throttle:100">Move your mouse over me</div>
```

In the above example, the `handleMouseMove` method will be called at most once every 100 milliseconds, no matter how often the `mousemove` event is fired.

### Custom Events

Aurelia 2 supports custom events, which can be useful when integrating with third-party libraries or creating your own custom components.

```html
<custom-element my-event.trigger="handleCustomEvent($event)"></custom-element>
```

In this example, `my-event` is a custom event emitted by `custom-element`, and `handleCustomEvent` is the method that will respond to it.

## Event Binding: Examples and Scenarios

To help you better understand event binding in Aurelia 2, we've compiled a collection of examples and scenarios demonstrating different techniques and best practices. These should give you the insights to handle events in your applications effectively.

### Event Binding with Modifiers

#### Self Binding Behavior

To ensure that an event only triggers a method if the event originated from the element itself (and not from its children), you can use the `self` binding behavior.

```html
<div click.trigger="divClicked() & self">
  <button click.trigger="buttonClicked()">Button</button>
</div>
```

This setup guarantees that clicking the button will not trigger the `divClicked()` method, as the `self` binding behaviour filters out events bubbling from child elements.

### Combining Two-Way Binding with Events

#### Checkbox Change Event

A checkbox's change in state can be combined with the `change` event to perform actions in response to user interaction.

```HTML
<input type="checkbox" checked.bind="agree" change.trigger="onAgreementChange()" />
```

```javascript
export class MyViewModel {
  agree = false;

  onAgreementChange() {
    // Logic to handle checkbox state change
  }
}
```

### Keyboard Interaction

#### Handling Specific Key Presses

To react to specific key presses, such as "Enter" or "Escape", you can inspect the `event` object within your method.

```html
<input type="text" keydown.trigger="handleKeydown($event)" />
```

```javascript
export class MyViewModel {
  handleKeydown(event) {
    switch (event.key) {
      case 'Enter':
        // Handle Enter key press
        break;
      case 'Escape':
        // Handle Escape key press
        break;
      // Add more cases as needed
    }
  }
}
```

### Working with Dynamic Content

#### Event Delegation for Lists

Event delegation is useful for handling events on dynamically generated content, such as a list of items.

```html
<ul click.trigger="listClicked($event)">
  <li repeat.for="item of items" data-id="${item.id}">${item.name}</li>
</ul>
```

```javascript
export class MyViewModel {
  items = []; // Your dynamic array of items

  listClicked(event) {
    const itemId = event.target.getAttribute('data-id');
    if (itemId) {
      // Logic to handle the click event on an item
    }
  }
}
```

### Custom Events and Arguments

#### Emitting and Responding to Custom Events

Custom elements can publish custom events with associated data, which parent components can listen for and handle.

Custom element:

```javascript
export class CustomElement {
  // inject host element to dispatch custom event
  host = resolve(Element);
  someMethod() {
    const data = { /* Payload data */ };
    this.host.dispatchEvent(new CustomEvent({ detail: data }))
  }
}
```

Parent component:

```html
<custom-element my-custom-event.trigger="handleCustomEvent($event)"></custom-element>
```

Parent view-model:

```javascript
export class ParentViewModel {
  handleCustomEvent(event) {
    const data = event.detail;
    // Logic to handle the custom event and its data
  }
}
```

### Autocomplete and Search Inputs

#### Throttling Input for Autocomplete Features

For features like search or autocomplete, where user input can trigger frequent updates, throttling can prevent excessive processing.

```html
<input type="text" input.trigger="search($event.target.value) & debounce:300">
```

```javascript
export class MyViewModel {
  search(query) {
    // Logic to perform search based on query
  }
}
```

Here, the `search` function is called only after the user has stopped typing for 300 milliseconds, improving performance and user experience.

These examples showcase the versatility of event binding in Aurelia 2. By understanding and applying these patterns, you can create interactive and efficient applications that respond to user actions in a controlled and performant manner.

### Event modifiers

When you need to ensure some conditions are met before processing an event, you can use event modifiers. Event modifiers can be specified via event syntax, follow by a colon and modifiers:

```
[event].trigger[:modifier]="[expression]"
```

By default, Aurelia handles 2 set of common events: mouse and keyboard events. An example is as follow:

```html
<button click.trigger:ctrl="onCtrlClick()">Next page</button>
```

In the example above, the handler `onCtrlClick()` will only be called when the button is clicked while the `Ctrl` key being pressed.
Keyboard event sometimes employ even more complex condition, as per the following example:

```html
<textarea keydown.trigger:ctrl+enter="send()">
```
In this example, we will only call `send()` when the user hits the `Enter` + `Ctrl` key combo. This example also demonstrates how to use multiple modifiers, they can be separated by the character `+` as delimiter.

#### Prevent default and stop propagation

`preventDefault` and `stopPropagation` are two functions commonly called on any events. Event modifiers can be used to declaratively and easily call those functions, as per following example:

```html
<button click.trigger:stop:prevent="validate()">Validate</button>
```

#### Mouse button modifiers

When handling mouse event, it sometimes requires a specific mouse button. By default, Aurelia provides 3 modifiers `left`, `middle` and `right` to support mouse button verification. An example is as follow:

```html
<button click.trigger:middle="newTab()">Open in new tab</button>
```

#### Keyboard mapping

When using keyboard event modifier, sometimes a certain key is used as modifier.
You can use the char code representing the key as the modifier, like the following example, where we want to handle the combo `Ctrl + K` (notice its the upper `K`):

```html
<textarea keydown.trigger:ctrl+75="openSearchDialog()">
```
`75` is the charcode of the upper case letter `K`.

Even though direct, it's not always clear `75` means when looking at the template, so it's often desirable to use the real letter `K` instead.
Though Aurelia is not taught to, by default, understand the letter `K` means the code `75`. You can teach Aurelia by adding to the `IKeyMapping`:

```typescript
import { AppTask, IKeyMapping } from 'aurelia';

Aurelia.register(
  AppTask.creating(IKeyMapping, mapping => {
    mapping.keys.upper_k = 'K';
  })
)
```
After this enhancement, the `:ctrl+upper_k` modifier will be understood as `ctrl+75` or `ctrl` + upper `K` key.

Note that we cannot use the upper case letter `K` as modifier in HTML because HTML is case insensitive. We use, in this example, `upper_k` as an alternative for that, and add the mapping accordingly.

{% hint style="info" %}
By default, Aurelia provides mapping for all lower case a-z letters in both keycode and leter so both `:ctrl+a` and `:ctrl+97` works.
For upper case letter, only keycode mapping is provided, for example: `:65` for upper letter A works.
{% endhint %}


## Conclusion

Event binding in Aurelia 2 is a powerful and intuitive feature that enables you to create dynamic and responsive applications. By understanding the syntax and capabilities of event binding, you can harness the full potential of Aurelia 2 to handle user interactions gracefully and effectively. Remember to leverage the `.trigger` command for most scenarios and reserve `.capture` for special cases where you need to intercept events earlier in the event propagation cycle. With these tools, you can craft a seamless user experience that responds to every click, keypress, and interaction.
