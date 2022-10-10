# Event Handling

Using Aurelia's intuitive event binding syntax, you can listen to mouse clicks, keyboard events, mouse movements, touches and other native browser events that are accessible via Javascript.

If you have familiarized yourself with other aspects of Aurelia's template binding, a lot of this will look similar to you. Due to differences in how certain events function (bubbling vs non-bubbling), there are some nuances to be aware of when working with them.

You can listen to events using three different types of event bindings; `delegate`, `trigger` and `capture`.  The syntax for event binding is the event name you want to target, followed by one of the above event bindings.

To listen to a `click` event on a button, for example, you would do something like this:

```
<button click.trigger="myClickFunction()">Click me!</button>
```

Inside of the quotation marks, you specify the name of a function to be called inside of your view model.

### Common events

There are several events that you will bind onto in your Aurelia applications.

#### click

You will listen to the `click` event on buttons and links using either `click.trigger` or `click.delegate`

#### keypress

The native `keypress` event using `keypress.trigger` will allow you to listen to keypress events on inputs and other elements.

### Delegate vs Trigger vs Capture

Aurelia supports three different means of working with event bindings. In most situations, you will use `trigger` as it does not suffer from side effects and is generally the recommended approach for working with events.

Any native event can be used with `trigger` from mouse clicks to keyboard events. Where an event is valid, it can usually be captured. Mozilla's wonderful MDN reference on Events [here](https://developer.mozilla.org/en-US/docs/Web/Events) is a great resource for learning more about what events are available.

In Aurelia 1 the documentation recommended using `delegate` and then opting for `trigger` where needed for performance reasons. In Aurelia 2, it is recommended that you use `trigger` as it does not suffer from the same side effects that `delegate` does (capturing all bubbled events).

One such side effect to be aware of using `delegate` is buttons containing children. If you use `click.delegate` on a button that is disabled, but the button contains other elements (spans, icons and so forth), the children cause the click event to fire which is bad. There are also some caveats with the way in which Safari on iOS handles click events where delegation could break.

With event delegation, handlers are not attached to individual elements. Instead, a single event handler is attached to a top-level node such as the body element. When an event bubbles up to this shared top-level handler the event delegation logic calls the appropriate handler based on the event's [target](https://developer.mozilla.org/en-US/docs/Web/API/Event/target).&#x20;

Using `delegate` is recommended for situations where you will have many events (think of a list of to-do items with a delete button).  Only events that bubble can be used with Aurelia's `delegate` binding command. **The `blur`, `focus`, `load` and `unload` events do not bubble so you'll need to use the `trigger` binding command to subscribe to these events.**

### **Capturing event binding**

The `capture` event binding command should only be used as a last resort. Primarily in situations where an event is fired too early before Aurelia can capture it (third party plugins, for example) or an event is being stopped using `event.preventDefault` capture can be used to guarantee the event is captured (hence the name).

In most situations, `delegate` and `trigger` will be more than sufficient.
