# Aurelia Templates Cheat Sheet

Quick reference guide for Aurelia 2 templating syntax and common patterns.

## Data Binding

### Binding Modes

| Syntax | Direction | Use Case |
|--------|-----------|----------|
| `.bind` | Auto (two-way for form elements, to-view otherwise) | Default choice for most scenarios |
| `.to-view` | View Model → View | Display-only data (performance) |
| `.two-way` | View Model ↔ View | Form inputs requiring sync |
| `.from-view` | View → View Model | Capture user input only |
| `.one-time` | View Model → View (once) | Static data that never changes |

### Common Bindings

```html
<!-- Text & Attributes -->
<div title.bind="tooltip">${message}</div>
<img src.bind="imageUrl" alt.bind="altText">

<!-- Form Inputs -->
<input value.bind="name">
<input value.two-way="email">
<textarea value.bind="comments"></textarea>

<!-- Boolean Attributes -->
<button disabled.bind="isLoading">Submit</button>
<input required.bind="isRequired">

<!-- Checkboxes -->
<input type="checkbox" checked.bind="isActive">
<input type="checkbox" model.bind="item.id" checked.bind="selectedIds">

<!-- Radio Buttons -->
<input type="radio" model.bind="option1" checked.bind="selectedOption">
<input type="radio" model.bind="option2" checked.bind="selectedOption">

<!-- Select -->
<select value.bind="selectedValue">
  <option repeat.for="opt of options" value.bind="opt.id">${opt.name}</option>
</select>
```

## String Interpolation

```html
<!-- Simple -->
<p>${firstName} ${lastName}</p>

<!-- Expressions -->
<p>${count * 2}</p>
<p>${isActive ? 'Active' : 'Inactive'}</p>

<!-- Optional Chaining -->
<p>${user?.profile?.name ?? 'Guest'}</p>
```

## Event Binding

### Basic Events

```html
<!-- Click Events -->
<button click.trigger="save()">Save</button>
<button click.capture="handleCapture()">Capture Phase</button>

<!-- Form Events -->
<form submit.trigger="handleSubmit($event)">
<input input.trigger="onInput($event)">
<input change.trigger="onChange()">

<!-- Keyboard Events -->
<input keydown.trigger="onKeyDown($event)">
<input keyup.trigger="onKeyUp($event)">

<!-- Mouse Events -->
<div mouseover.trigger="onHover()">
<div mouseout.trigger="onLeave()">
```

### Event Modifiers

```html
<!-- Keyboard Modifiers -->
<input keydown.trigger:ctrl="onCtrlKey()">
<input keydown.trigger:enter="onEnter()">
<input keydown.trigger:ctrl+enter="onCtrlEnter()">

<!-- Mouse Button Modifiers -->
<button click.trigger:left="onLeftClick()">
<button click.trigger:middle="onMiddleClick()">
<button click.trigger:right="onRightClick()">

<!-- Event Control -->
<a click.trigger:prevent="navigate()">Link</a>
<div click.trigger:stop="handleClick()">Stop Propagation</div>
<div click.trigger="handleSelfClick() & self">Only Direct Clicks</div>
```

### Available Key Modifiers

| Category | Modifiers |
|----------|-----------|
| Meta keys | `ctrl`, `alt`, `shift`, `meta` |
| Special keys | `enter`, `escape`, `space`, `tab` |
| Arrow keys | `arrowup`, `arrowdown`, `arrowleft`, `arrowright` |
| Letters | `a`-`z` (case-insensitive) |
| Numbers | `0`-`9` |
| Event control | `prevent`, `stop` |
| Mouse buttons | `left`, `middle`, `right` |

Combine with `+`: `keydown.trigger:ctrl+shift+enter="handler()"`

### Binding Behaviors

```html
<!-- Throttle (max once per interval) -->
<input input.trigger="search($event.target.value) & throttle:300">

<!-- Debounce (wait until user stops) -->
<input input.trigger="search($event.target.value) & debounce:500">

<!-- Update trigger - control when binding updates -->
<input value.bind="name & updateTrigger:'blur'">
<input value.bind="name & updateTrigger:'blur':'paste'">

<!-- Signal - manual update triggering -->
<span>${expensiveComputation | format & signal:'refresh'}</span>
<!-- Then in code: signaler.dispatchSignal('refresh') -->

<!-- Self - only handle events from the element itself -->
<div click.trigger="onClick() & self">
  <button>Click me</button> <!-- Won't trigger onClick -->
</div>
```

## Conditional Rendering

### if.bind vs show.bind vs hide.bind

| Feature | `if.bind` | `show.bind` / `hide.bind` |
|---------|-----------|---------------------------|
| DOM Manipulation | Adds/removes from DOM | Shows/hides (display: none) |
| Performance | Better for infrequent changes | Better for frequent toggles |
| Resources | Cleans up events/bindings | Keeps everything in memory |
| Use When | Content rarely changes | Content toggles frequently |

```html
<!-- if.bind - Removes from DOM -->
<div if.bind="isLoggedIn">Welcome back!</div>
<div else>Please log in</div>

<!-- show.bind - CSS display control -->
<div show.bind="isVisible">Toggled content</div>

<!-- hide.bind - Inverse of show.bind -->
<div hide.bind="isHidden">Hidden when true</div>

<!-- if with caching control -->
<expensive-component if="value.bind: showComponent; cache: false"></expensive-component>
```

{% hint style="info" %}
`hide.bind` is an alias for `show.bind` with inverted logic. `hide.bind="true"` is equivalent to `show.bind="false"`.
{% endhint %}

### switch.bind

```html
<!-- Basic Switch -->
<template switch.bind="status">
  <span case="pending">Waiting...</span>
  <span case="approved">Approved!</span>
  <span case="rejected">Rejected</span>
  <span default-case>Unknown</span>
</template>

<!-- Multiple Cases -->
<template switch.bind="role">
  <admin-panel case.bind="['admin', 'superadmin']"></admin-panel>
  <user-panel case="user"></user-panel>
  <guest-panel default-case></guest-panel>
</template>

<!-- Fall-through -->
<template switch.bind="level">
  <span case="high" fall-through.bind="true">High priority</span>
  <span case="medium">Medium priority</span>
  <span default-case>Low priority</span>
</template>
```

## List Rendering

### Basic Syntax

```html
<!-- Simple Array -->
<ul>
  <li repeat.for="item of items">${item.name}</li>
</ul>

<!-- With Keys (recommended for dynamic lists) -->
<div repeat.for="user of users; key: id">
  ${user.name}
</div>

<!-- With Index -->
<div repeat.for="item of items">
  ${$index + 1}. ${item.name}
</div>

<!-- Number Range -->
<div repeat.for="i of 5">Item ${i}</div>
```

### Contextual Properties

| Property | Type | Description |
|----------|------|-------------|
| `$index` | number | Zero-based index (0, 1, 2...) |
| `$first` | boolean | True for first item |
| `$last` | boolean | True for last item |
| `$middle` | boolean | True for middle items |
| `$even` | boolean | True for even indices |
| `$odd` | boolean | True for odd indices |
| `$length` | number | Total number of items |
| `$parent` | object | Parent binding context |
| `$previous` | any | Previous item (when contextual enabled) |

```html
<!-- Using Contextual Properties -->
<div repeat.for="item of items">
  <span class="${$even ? 'even' : 'odd'}">
    ${$index + 1} of ${$length}: ${item.name}
  </span>
  <span if.bind="$first">👑 First!</span>
  <span if.bind="$last">🏁 Last!</span>
</div>

<!-- Nested Repeats with $parent -->
<div repeat.for="category of categories">
  <h2>${category.name}</h2>
  <div repeat.for="item of category.items">
    ${item.name} in ${$parent.category.name}
  </div>
</div>
```

### Advanced Collection Types

```html
<!-- Sets -->
<div repeat.for="tag of selectedTags">
  ${tag}
</div>

<!-- Maps -->
<div repeat.for="[key, value] of configMap">
  ${key}: ${value}
</div>

<!-- Destructuring -->
<div repeat.for="{ id, name, email } of users">
  ${name} (${email})
</div>
```

## Value Converters

### Syntax

```html
<!-- Basic -->
<p>${price | currency}</p>

<!-- With Parameters -->
<p>${date | dateFormat:'MM/DD/YYYY'}</p>
<p>${text | truncate:50:true}</p>

<!-- Chaining -->
<p>${input | sanitize | capitalize | truncate:100}</p>

<!-- In Bindings -->
<input value.bind="searchTerm | normalize">
```

### Common Built-in Patterns

```typescript
// Create a value converter
import { valueConverter } from 'aurelia';

@valueConverter('currency')
export class CurrencyValueConverter {
  toView(value: number, currencyCode = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(value);
  }
}
```

## Template References

```html
<!-- Element Reference -->
<input ref="searchInput" value.bind="query">
<button click.trigger="searchInput.focus()">Focus Input</button>

<!-- Component (view-model) Reference -->
<my-component component.ref="myComponent"></my-component>
<button click.trigger="myComponent.refresh()">Refresh</button>

<!-- Controller Reference (for advanced use) -->
<my-component controller.ref="myComponentController"></my-component>

<!-- Custom Attribute Reference -->
<div my-tooltip.ref="tooltipInstance" my-tooltip="Hello"></div>
```

| Ref Type | Returns | Use Case |
|----------|---------|----------|
| `ref` | HTMLElement | DOM manipulation |
| `component.ref` | View model instance | Call component methods |
| `controller.ref` | Controller instance | Advanced lifecycle access |
| `my-attr.ref` | Custom attribute instance | Access attribute methods |

## Template Variables

```html
<!-- let - Local Variables (kebab-case converts to camelCase) -->
<let full-name.bind="firstName + ' ' + lastName"></let>
<h1>Hello, ${fullName}</h1>

<!-- let with to-binding-context - Assigns to view model -->
<let to-binding-context computed-value.bind="items.length * 2"></let>
<!-- Now this.computedValue is available in the view model -->

<!-- with - Scope Binding -->
<div with.bind="user">
  <p>${firstName} ${lastName}</p>
  <p>${email}</p>
</div>

<!-- Multiple Variables -->
<let greeting.bind="'Hello'"></let>
<let name.bind="user.name"></let>
<p>${greeting}, ${name}!</p>
```

{% hint style="info" %}
By default, `<let>` creates template-local variables. Add `to-binding-context` to assign values directly to the view model instead.
{% endhint %}

## Class & Style Binding

```html
<!-- Class Binding -->
<div class.bind="isActive ? 'active' : 'inactive'"></div>
<div class.bind="cssClasses"></div>

<!-- Single class toggle -->
<div active.class="isActive"></div>

<!-- Style Binding -->
<div style.bind="{ color: textColor, 'font-size': fontSize + 'px' }"></div>
<div style.background-color.bind="bgColor"></div>
<div style.width.bind="width + 'px'"></div>
```

## Attribute Binding

```html
<!-- Force attribute (not property) binding with & attr -->
<img src.bind="imageUrl & attr">

<!-- Useful for ARIA and data attributes -->
<button aria-label.bind="label & attr" aria-pressed.bind="isPressed & attr">
<div data-id.bind="item.id & attr">

<!-- Without & attr, bindings target DOM properties by default -->
```

## Promises in Templates

```html
<div promise.bind="fetchData()">
  <span pending>Loading...</span>
  <span then="data">
    Loaded: ${data.title}
  </span>
  <span catch="error">
    Error: ${error.message}
  </span>
</div>
```

## Spread Binding

```html
<!-- Spread all bindable properties from an object -->
<user-card ...$bindables="user"></user-card>

<!-- Equivalent explicit syntax -->
<user-card $bindables.spread="user"></user-card>

<!-- Shorthand (expression in attribute name) -->
<user-card ...user></user-card>
```

```typescript
// If user = { name: 'Jane', email: 'jane@example.com', avatarUrl: '...' }
// And UserCard has @bindable name, email, avatarUrl
// Then spread passes all matching properties automatically
```

{% hint style="info" %}
Spread binding is always one-way (to-view). Only properties that exist in the object at evaluation time create bindings.
{% endhint %}

## Custom Attributes

```html
<!-- Using Custom Attributes -->
<div my-attribute="value"></div>
<div my-attribute.bind="dynamicValue"></div>

<!-- With Multiple Parameters -->
<div tooltip="text.bind: tooltipText; position: top; delay: 300"></div>
```

## Component Import & Usage

```html
<!-- Import -->
<import from="./my-component"></import>
<import from="./utils/helpers" as="helpers"></import>

<!-- Usage -->
<my-component title.bind="pageTitle" on-save.bind="handleSave"></my-component>

<!-- Inline Component -->
<template as-custom-element="inline-component">
  <bindable name="title"></bindable>
  <h1>${title}</h1>
</template>

<inline-component title="Hello"></inline-component>
```

## Dynamic Composition

```html
<!-- Compose with component reference -->
<au-compose component.bind="MyComponent"></au-compose>

<!-- Compose with view model and view -->
<au-compose view-model.bind="dynamicViewModel" view.bind="dynamicView"></au-compose>

<!-- Compose with model data -->
<au-compose component.bind="CardComponent" model.bind="{ title: 'Hello', content: cardContent }"></au-compose>

<!-- Compose with string path -->
<au-compose view-model="./components/dynamic-panel"></au-compose>
```

## Focus Management

```html
<!-- Two-way focus binding -->
<input focus.bind="isInputFocused">

<!-- Focus on condition -->
<input focus.bind="shouldFocus">

<!-- Programmatic focus via ref -->
<input ref="nameInput">
<button click.trigger="nameInput.focus()">Focus Input</button>
```

## Quick Decision Trees

### When to use if vs show?

```
Need to toggle visibility?
├─ Toggles frequently (e.g., dropdown, tab content)
│  └─ Use show.bind (faster, preserves state)
└─ Toggles infrequently (e.g., admin panel, authenticated content)
   └─ Use if.bind (saves memory, cleans up resources)
```

### Which binding mode?

```
Binding to form input?
├─ YES → Use .bind (auto two-way)
└─ NO  → Displaying data only?
         ├─ YES → Use .to-view (better performance)
         └─ NO  → Need to capture user changes?
                  ├─ YES → Use .two-way
                  └─ NO  → Static data?
                           └─ Use .one-time
```

### When to use keys in repeat.for?

```
Using repeat.for with dynamic list?
├─ List items can be added/removed/reordered?
│  └─ YES → Always use keys (key.bind or key:)
└─ List is static or append-only?
   └─ Keys optional (but recommended)
```

## Common Patterns

### Loading States

```html
<!-- Using switch for multiple states -->
<template switch.bind="state">
  <div case="loading">Loading...</div>
  <div case="error">Error: ${error.message}</div>
  <div case="empty">No items found</div>
  <div default-case>
    <div repeat.for="item of items; key: id">${item.name}</div>
  </div>
</template>

<!-- Or using nested if/else -->
<div if.bind="isLoading">Loading...</div>
<template else>
  <div if.bind="error">Error: ${error.message}</div>
  <template else>
    <div if.bind="items.length === 0">No items found</div>
    <div else>
      <div repeat.for="item of items; key: id">${item.name}</div>
    </div>
  </template>
</template>
```

### Form Validation Display

```html
<input value.bind="email" class="${errors.email ? 'invalid' : ''}">
<span if.bind="errors.email" class="error">${errors.email}</span>
```

### Computed Display Values

```html
<let total.bind="items.reduce((sum, item) => sum + item.price, 0)"></let>
<p>Total: ${total | currency}</p>
```

### Dynamic CSS Classes

```html
<div class="card ${isActive ? 'active' : ''} ${isHighlighted ? 'highlight' : ''}">
  Content
</div>
```

## Component Lifecycle (Quick Reference)

| Hook | When Called | Common Use |
|------|-------------|------------|
| `constructor` | Instance created | Inject dependencies with `resolve()` |
| `created` | After constructor | Access `$controller` |
| `binding` | Before bindings evaluated | Initialize from bindables |
| `bound` | Bindings connected | Setup dependent on bound values |
| `attaching` | Before DOM attachment | Async setup work |
| `attached` | In DOM | DOM manipulation, third-party libs |
| `detaching` | Before DOM removal | Cleanup, save state |
| `unbinding` | Bindings disconnecting | Cleanup subscriptions |

```typescript
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  // Properties injected via DI
  private api = resolve(IApiService);

  // Lifecycle methods
  binding() { /* Called first */ }
  attached() { /* DOM is ready */ }
  detaching() { /* Cleanup */ }
}
```

## Performance Tips

1. **Use appropriate binding modes**: `.to-view` for display-only data
2. **Add keys to repeat.for**: Enables efficient DOM reuse
3. **Use show.bind for frequent toggles**: Avoids DOM manipulation overhead
4. **Use if.bind for infrequent changes**: Saves memory and resources
5. **Debounce/throttle rapid events**: Prevents excessive handler calls
6. **Keep expressions simple**: Move complex logic to view model
7. **Use value converters**: Separate formatting from view model logic

## Common Gotchas

| Issue | Problem | Solution |
|-------|---------|----------|
| Binding not updating | Object/array mutation | Use `splice()`, reassign, or use observable |
| Event not firing | Wrong event name | Check: `click.trigger` not `onclick.trigger` |
| Style not applied | CSS property name | Use kebab-case: `background-color` not `backgroundColor` |
| Async data undefined | Template renders before data | Use `promise.bind` or `if.bind="data"` |
| `$parent` undefined | Not in a repeat | Only available inside `repeat.for` |

## Accessibility Reminders

```html
<!-- Labels for Form Inputs -->
<label for="email">Email:</label>
<input id="email" value.bind="email">

<!-- ARIA Attributes -->
<button
  aria-label.bind="buttonLabel & attr"
  aria-busy.bind="isLoading & attr"
  disabled.bind="isLoading">
  ${isLoading ? 'Loading...' : 'Submit'}
</button>

<!-- Role Attributes -->
<div role="alert" if.bind="errorMessage">
  ${errorMessage}
</div>
```

## Related Documentation

- [Template Syntax Overview](template-syntax/overview.md)
- [Attribute Binding](template-syntax/attribute-binding.md)
- [Event Binding](template-syntax/event-binding.md)
- [Conditional Rendering](conditional-rendering.md)
- [List Rendering](repeats-and-list-rendering.md)
- [Value Converters](value-converters.md)
- [Binding Behaviors](binding-behaviors.md)
- [Form Inputs](forms/README.md)
- [Class & Style Binding](class-and-style-bindings.md)
- [Spread Binding](spread-binding.md)
- [Local Templates](local-templates.md)
- [Lambda Expressions](lambda-expressions.md)
