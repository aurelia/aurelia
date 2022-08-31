---
description: An element in two places at once.
---

# Portalling elements

There are situations that some elements of a custom element should be rendered at a different location within the document, usually at the bottom of a document body or even inside of another element entirely. Aurelia supports this intuitively with the `portal` custom attribute.

While the location of the rendered element changes, it retains its current binding context. A great use for the `portal` attribute is when you want to ensure an element is displayed in the proper stacking order without needing to use CSS hacks like `z-index:9999`

Using the `portal` attribute without any configuration options will portal the element to beneath the document body.

```markup
<div portal>My markup moves to beneath the body by default</div>
```

## Targeting a CSS selector

If you want to choose where a portalled element is moved to, you can supply a CSS selector where it should be moved.

```markup
<div portal="#somewhere">My markup moves to beneath the body</div>

<div id="somewhere"><!-- The element will be portalled here --></div>
```

## Targeting an element with ref

The portal attribute can also reference other elements with a `ref` attribute on them.

```
<div portal="target.bind: somewhereElement">My markup moves to beneath the body</div>

<div id="somewhere" ref="somewhereElement"><!-- The element will be portalled here --></div>
```
