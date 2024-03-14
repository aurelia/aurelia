---
description: An element in two places at once.
---

# Portalling elements

There are situations that some elements of a custom element should be rendered at a different location within the document, usually at the bottom of a document body or even inside of another element entirely. Aurelia supports this intuitively with the `portal` custom attribute.

While the location of the rendered element changes, it retains its current binding context. A great use for the `portal` attribute is when you want to ensure an element is displayed in the proper stacking order without needing to use CSS hacks like `z-index:9999`

Using the `portal` attribute without any configuration options will portal the element to beneath the document body (before the closing body tag).

```html
<div portal>My markup moves to beneath the body by default</div>
```

## Targeting CSS selectors

If you want to choose where a portalled element is moved to, you can supply a CSS selector where it should be moved.

Target an element with an ID of `somewhere:`

{% code overflow="wrap" %}
```html
<div portal="#somewhere">My markup moves toto DIV with ID somewhere</div>

<div id="somewhere"><!-- The element will be portalled here --></div>
```
{% endcode %}

Target an element by class:

{% code overflow="wrap" %}
```html
<div portal=".somewhere">My markup moves to DIV with class somewhere</div>

<div class="somewhere"><!-- The element will be portalled here --></div>
```
{% endcode %}

Target an element by tagName:

{% code overflow="wrap" %}
```html
<div portal="body">My markup moves to beneath the body (just before the closing tag)</div>
```
{% endcode %}

## Targeting elements

The portal attribute can also reference other elements with a `ref` attribute on them.

{% code overflow="wrap" %}
```html
<div portal="target.bind: somewhereElement">My markup moves to beneath the body</div>

<div ref="somewhereElement"><!-- The element will be portalled here --></div>
```
{% endcode %}

You can also target elements not using the `ref` attribute too. A good example is a custom element. Maybe you want to portal a section of a child element to the parent element.

{% code overflow="wrap" %}
```typescript
import { INode } from 'aurelia';

export class MyComponent {
    constructor(@INode readonly element: HTMLElement) {}
}
```
{% endcode %}

We can do things with the injected element instance, like access the parentElement or other non-standard scenarios you might encounter.

```html
<div>
    <div class="header" portal="target.bind: element.parentElement"></div>
</div>
```

You could also do this with query calls such as `querySelector` and so forth as well aliased to class properties.

## Determining the position

By default, the `portal` attribute will portal your elements before the closing tag of your target. By default using `portal` without any configuration values will portal it just before the closing `</body>` tag.

We can override this behavior using the `position` property and the following values:

* `beforebegin`
* `afterbegin`
* `beforeend` (the default value)
* `afterend`

{% code overflow="wrap" %}
```html
<div portal="target: body; position: afterbegin;">My markup moves to beneath the body by default</div>
```
{% endcode %}

In this example, our element will move to just after the opening body tag `<body>` the other values are self-explanatory.
