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

## How the portal attribute works

`portal` is a template controller. When applied, Aurelia hoists the host element into an off-document view and leaves behind a lightweight marker so bindings stay intact. During activation the controller resolves a target element, moves the marker pair next to that target, and renders the view there. Because the original binding context and scope travel with the view, all events, one-way/two-way bindings, and child components continue to function as if they were never moved.

When deactivated, Aurelia deactivates the synthetic view and removes the temporary markers, so no stray placeholder nodes remain in the DOM. If a target cannot be resolved the controller silently falls back to `document.body` unless strict mode is enabled.

## Targeting CSS selectors

If you want to choose where a portalled element is moved to, you can supply a CSS selector where it should be moved. Any string you pass to `portal` is sent through `querySelector` (scoped by `renderContext` if provided). An empty string falls back to `document.body` unless `strict` is `true`, in which case the attribute throws a descriptive error. Element instances, `ref`s, or computed DOM references bypass selector resolution entirely.

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
import { INode } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

export class MyComponent {
    readonly element: HTMLElement = resolve(INode);
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

## Target resolution rules

The runtime follows a consistent set of rules when resolving the final DOM node:

| Value supplied to `target` | Result |
| --- | --- |
| `string` | Runs `querySelector` against `renderContext` (or `document` if none). `null` matches cause a fallback to `document.body` unless `strict` is `true`. |
| `''` (empty string) | Immediately falls back to `document.body` or throws `portal_query_empty` when `strict` is `true`. |
| `Element`/`Node` | Used directly without further inspection. This includes DOM nodes pulled via `resolve(INode)`, `element.parentElement`, or a `ref`. |
| `null`/`undefined` | Falls back to `document.body` or throws `portal_no_target` if `strict` is `true`. |

`renderContext` itself accepts either a selector string or an `Element`; the next section dives deeper into scoping and dynamic updates.

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

You can data-bind `position` as well. Whenever the value changes, the controller simply moves the existing anchor nodes relative to the resolved target—no teardown or re-rendering occurs.

## Render context

When using string selectors for targeting, you can limit the query scope using the `renderContext` property. This is useful when you have duplicate selectors in your document and want to target within a specific container.

{% code overflow="wrap" %}
```html
<div id="container1">
  <div class="target">Target 1</div>
</div>
<div id="container2">
  <div class="target">Target 2</div>
</div>

<!-- Portal to .target within #container2 -->
<div portal="target: .target; renderContext: #container2">
  This will go to Target 2, not Target 1
</div>
```
{% endcode %}

You can also bind to element references for render context:

{% code overflow="wrap" %}
```html
<div ref="myContainer">
  <div class="nested-target">Nested element</div>
</div>

<div portal="target: .nested-target; renderContext.bind: myContainer">
  Portalled within myContainer scope
</div>
```
{% endcode %}

Internally the render context bindable is wired up with the `targetChanged` callback, so when this value changes at runtime the controller re-resolves the selector without forcing a full deactivate/reactivate cycle.

## Lifecycle callbacks

The portal attribute supports lifecycle callbacks that are called during the portal activation and deactivation process. These callbacks receive the target element and the synthetic view as parameters.

```typescript
export class MyComponent {
  onPortalActivating(target: Element, view: ISyntheticView) {
    console.log('Portal is about to activate', target);
    // Return a promise for async operations
  }

  onPortalActivated(target: Element, view: ISyntheticView) {
    console.log('Portal has been activated', target);
  }

  onPortalDeactivating(target: Element, view: ISyntheticView) {
    console.log('Portal is about to deactivate', target);
  }

  onPortalDeactivated(target: Element, view: ISyntheticView) {
    console.log('Portal has been deactivated', target);
  }
}
```

Each callback can return a `Promise`. The portal waits for that promise to settle before continuing so you can perform async work (such as measuring the DOM or loading data) without race conditions. By default `this` inside the callbacks is set to the component's binding context, but you can override it via `callbackContext`.

```typescript
import { ILogger, resolve } from '@aurelia/kernel';

export class PortalWithLogger {
  private logger = resolve(ILogger);

  callbackContext = this;

  onPortalActivated(target: Element) {
    this.logger.debug('Activated at', target);
  }
}
```

If you need the callbacks to run against a different object entirely, expose that instance from your view-model and bind `callbackContext` in your template.

```typescript
import { resolve } from '@aurelia/kernel';
import { AnalyticsService } from '../services/analytics';

export class PortalHost {
  public analyticsService = resolve(AnalyticsService);
}
```

```html
<div portal="target: #destination;
            activated.bind: analyticsService.trackActivation;
            callbackContext.bind: analyticsService">
  Analytics-aware content
</div>
```

Use these callbacks in your template:

{% code overflow="wrap" %}
```html
<div portal="target: #destination; 
            activating.bind: onPortalActivating;
            activated.bind: onPortalActivated;
            deactivating.bind: onPortalDeactivating;
            deactivated.bind: onPortalDeactivated">
  Portal content with lifecycle hooks
</div>
```
{% endcode %}

## Strict mode

By default, the portal attribute is forgiving - if a target cannot be found, it falls back to the document body. You can enable strict mode to throw errors when targets cannot be resolved:

{% code overflow="wrap" %}
```html
<div portal="target: #nonexistent; strict: true">
  This will throw an error if #nonexistent is not found
</div>
```
{% endcode %}

The runtime surfaces three dedicated error types when strict mode is enabled:

1. `portal_query_empty` when the selector string is empty
2. `portal_no_target` when a selector or bound element cannot be found
3. `portal_invalid_insert_position` when you provide a position outside of the valid `InsertPosition` union

## Dynamic targeting

Portal targets can be changed dynamically during runtime. When the target changes, the portal will automatically move the content to the new location:

```typescript
export class DynamicPortal {
  currentTarget = '#target1';

  switchTarget() {
    this.currentTarget = '#target2';
  }
}
```

```html
<div id="target1">Target 1</div>
<div id="target2">Target 2</div>

<div portal="target.bind: currentTarget">
  This content will move when currentTarget changes
</div>

<button click.trigger="switchTarget()">Switch Target</button>
```

The same mechanism powers `position.bind` and `renderContext.bind`. When either value changes, the controller re-runs the lightweight move logic instead of destroying and recreating the synthetic view, so updates stay cheap even inside loops.

## Integration with template controllers

Portals work seamlessly with other template controllers like `if` and `repeat`:

### With conditional rendering:

{% code overflow="wrap" %}
```html
<div id="modal-container"></div>

<div portal="#modal-container" if.bind="showModal">
  <div class="modal">Modal content</div>
</div>
```
{% endcode %}

### With repeat:

{% code overflow="wrap" %}
```html
<div id="notifications"></div>

<div portal="#notifications" repeat.for="notification of notifications">
  <div class="notification">${notification.message}</div>
</div>
```
{% endcode %}

## Error handling

The portal attribute can encounter several error conditions:

1. **Empty query string** - When using strict mode with an empty target string
2. **Target not found** - When using strict mode and the target element doesn't exist  
3. **Invalid position** - When specifying an invalid insertion position

These errors will be thrown during portal activation when strict mode is enabled.

## API Reference

### Portal Bindable Properties

The portal attribute supports the following bindable properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `target` | `string \| Element \| null \| undefined` | `undefined` | The target element or CSS selector where content should be portalled. When null/undefined, defaults to document body |
| `position` | `InsertPosition` | `'beforeend'` | Where to insert the content relative to the target. Values: `'beforebegin'`, `'afterbegin'`, `'beforeend'`, `'afterend'` |
| `renderContext` | `string \| Element \| null \| undefined` | `undefined` | Limits the scope of string selector queries to within this element |
| `strict` | `boolean` | `false` | When true, throws errors if target cannot be resolved instead of falling back to document body |
| `activating` | `PortalLifecycleCallback` | `undefined` | Callback called before portal activation. Receives `(target, view)` parameters |
| `activated` | `PortalLifecycleCallback` | `undefined` | Callback called after portal activation. Receives `(target, view)` parameters |
| `deactivating` | `PortalLifecycleCallback` | `undefined` | Callback called before portal deactivation. Receives `(target, view)` parameters |
| `deactivated` | `PortalLifecycleCallback` | `undefined` | Callback called after portal deactivation. Receives `(target, view)` parameters |
| `callbackContext` | `unknown` | Current binding context | The `this` context for lifecycle callback functions |

### Types

```typescript
type PortalTarget = string | Element | null | undefined;
type PortalLifecycleCallback = (target: PortalTarget, view: ISyntheticView) => void | Promise<void>;
```

### Usage Examples

#### Basic usage:
```html
<div portal>Content goes to body</div>
```

#### With all options:
```html
<div portal="target: #destination; 
            position: afterbegin;
            renderContext: #scope;
            strict: true;
            activating.bind: onActivating;
            activated.bind: onActivated;
            deactivating.bind: onDeactivating;
            deactivated.bind: onDeactivated;
            callbackContext.bind: this">
  Fully configured portal
</div>
```
