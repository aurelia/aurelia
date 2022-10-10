# Event handling

Using Aurelia's intuitive event binding syntax, you can listen to mouse clicks, keyboard events, mouse movements, touches and other native browser events that are accessible via Javascript.

If you have familiarized yourself with other aspects of Aurelia's template binding, a lot of this will look similar to you. Due to differences in how certain events function (bubbling vs non-bubbling), there are some nuances to be aware of when working with them.

You can listen to events using two different types of event bindings; `trigger` and `capture`. The syntax for event binding is the event name you want to target, followed by one of the above event bindings.

To listen to a `click` event on a button, for example, you would do something like this:

```html
<button click.trigger="myClickFunction()">Click me!</button>
```

Inside of the quotation marks, you specify the name of a function to be called inside of your view model.

### Common events

There are several events that you will bind onto in your Aurelia applications.

#### click

You will listen to the `click` event on buttons and links using `click.trigger`

#### keypress

The native `keypress` event using `keypress.trigger` will allow you to listen to keypress events on inputs and other elements.

### **Capturing event binding**

The `capture` event binding command should only be used as a last resort. Primarily in situations where an event is fired too early before Aurelia can capture it (third-party plugins, for example) or an event is being stopped using `event.preventDefault` capture can be used to guarantee the event is captured (hence the name).

In most situations, `trigger` will be more than sufficient.
