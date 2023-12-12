# Event Binding

Using Aurelia's intuitive event binding syntax, you can listen to mouse clicks, keyboard events, mouse movements, touches and other native browser events that are accessible via Javascript.

If you have familiarized yourself with other aspects of Aurelia's template binding, a lot of this will look similar to you. Due to differences in how certain events function (bubbling vs non-bubbling), there are some nuances to be aware of when working with them.

You can listen to events using two types of event bindings; `trigger` and `capture`. The syntax for event binding is the event name you want to target, followed by one of the above event bindings.

To listen to an `click` event on a button, for example, you would do something like this:

```html
<button click.trigger="myClickFunction()">Click me!</button>
```

Inside the quotation marks, you specify the function's name to be called inside your view model.

## Common events

There are several events that you will bind onto in your Aurelia applications. These events are native events that Aurelia can bind to.

### click

You will listen to the `click` event on buttons and links using `click.trigger`

### keypress

The native `keypress` event using `keypress.trigger` will allow you to listen to keypress events on inputs and other elements.

## **Capturing event bindings**

The `capture` event binding command should only be used as a last resort. Primarily, when an event is fired too early before Aurelia can capture it (third-party plugins, for example) or an event is being stopped using `event.preventDefault`, capture can guarantee the event is captured (hence the name).

In most situations, `trigger` will be more than sufficient.
