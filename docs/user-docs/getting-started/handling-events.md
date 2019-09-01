---
description: Respond to user input and any HTML element.
---

# Handling Events

Chances are, your app isn't going to accomplish much if it can't respond to user interaction. Fortunately, Aurelia makes it easy react to both standard and custom DOM events.

{% hint style="success" %}
**Here's what you'll learn...**

* Executing methods when DOM events fire.
* Leveraging event delegation for better performance.
* When it's best to use delegate, trigger, and capture commands.
{% endhint %}

## DOM Events

The binding system supports binding to standard and custom DOM events. A DOM event binding will execute a JavaScript expression whenever the specified DOM event occurs. Event binding declarations have three parts and take the form `event.command="expression"`.

* `event`:  the name of a DOM event, without the "on" prefix.
* `command`: one of Aurelia's event binding commands:
  * `trigger`: attaches an event handler directly to the element. When the event fires, the expression will be invoked.
  * `delegate`: attaches a single event handler to the document \(or nearest shadow DOM boundary\) which handles all events of the specified type in **bubbling** phase, properly dispatching them back to their original targets for invocation of the associated expression.
  * `capture`: attaches a single event handler to the document \(or nearest shadow DOM boundary\) which handles all events of the specified type in **capturing** phase, properly dispatching them back to their original targets for invocation of the associated expression.
* `expression`: a JavaScript expression. Use the special `$event` property to access the DOM event in your binding expression.

Below are a few examples.

\`\`\`HTML DOM Event Binding Examples

Cancel

Yes No

```text
The cancel button uses the `trigger` command to attach an event listener to the button element that will call the view-model's `cancel` method. The yes and no buttons use the `delegate` command which will use the event delegation pattern. The input elements have binding expressions that use the special `$event` property to access the [DOM event](https://developer.mozilla.org/en-US/docs/Web/API/Event).

Aurelia will automatically call [`preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) on events handled with `delegate` or `trigger` binding. Most of the time this is the behavior you want. To turn this off, return `true` from your event handler function.

## Delegate vs. Trigger

So, when should you use `delegate` and when should you use `trigger`? The short answer is: **Use `delegate` except when you cannot use `delegate`.**

Event delegation is a technique used to improve application performance. It drastically reduces the number of event subscriptions by leveraging the "bubbling" characteristic of most DOM events. With event delegation, handlers are not attached to individual elements. Instead, a single event handler is attached to a top-level node such as the body element. When an event bubbles up to this shared top-level handler the event delegation logic calls the appropriate handler based on the event's [target](https://developer.mozilla.org/en-US/docs/Web/API/Event/target).

To find out if [event delegation](https://davidwalsh.name/event-delegate) can be used with a particular event, google *`mdn [event name] event`*. In fact, preceding any web platform related google search with `mdn` often returns a high quality result from the Mozilla Developer Network. Once you're on the event's MDN page, check whether the event `bubbles`. Only events that bubble can be used with Aurelia's `delegate` binding command. **The `blur`, `focus`, `load` and `unload` events do not bubble so you'll need to use the `trigger` binding command to subscribe to these events.**

Here's the [MDN page for blur](https://developer.mozilla.org/en-US/docs/Web/Events/blur). It has further info on event delegation techniques for the `blur` and `focus` events.

### Exceptions to the Rule

#### Use `trigger` on buttons when the following conditions are met:
1. You need to disable the button.
2. The button's content is made up of other elements (as opposed to just text).

This will ensure clicks on disabled button's children won't bubble up to the delegate event handler.

#### Use `trigger` for `click` in certain iOS use-cases:

iOS does not bubble click events on elements other than `a`, `button`, `input` and `select`. If you're subscribing to `click` on a non-input element like a `div` and are targeting iOS, use the `trigger` binding command.
More info [here](http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html).

## Delegate vs. Capture

In most situations, `delegate` and `trigger` are enough for you to handle user interaction. However, `delegate` and `trigger` can sometimes be too late to react to an event. Some other times, events may never reach to your `delegate` or `trigger` handlers. This is the case when you interact with content (elements) generated by 3rd party plugins.

`delegate` and `trigger` will fail in the following example:

```HTML Capture command example
<div class='my-plugin-container' click.delegate='onClickPluginContainer()'>
  <!--
    Content inside here is generated by a plugin.
    That will call `event.stopPropagation()` on any click events.
  -->
</div>
```

This is where you may need another way to listen to the `click` event, via the `capture` binding command:

\`\`\`HTML Capture command example

\`\`\`

In the 2nd example, `onClickPluginContainer()` is guaranteed to happen regardless of whether `event.stopPropagation()` is called or not inside the container.

With the `capture` binding command, you may ask "Which is best command for event handling?".

Well, the short answer above remains true, **Use `delegate` except when you cannot use `delegate`.** `capture` is not normally needed. It's provided in order to assist in handling edge cases, primarily around 3rd party code.

