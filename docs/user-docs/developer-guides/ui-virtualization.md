
## Installation

{% hint style="info" %}
This plugin is in development, expect unstability.
{% endhint %}

Install via npm

```
npm install @aurelia/ui-virtualization
```

Load the plugin

```javascript
import { Aurelia } from 'aurelia';
import { DefaultVirtualizationConfiguration } from '@aurelia/ui-virtualization';

Aurelia
    .register(DefaultVirtualizationConfiguration)
    .app(...)
```

## Using the plugin

Simply bind an array to `virtual-repeat` like you would with the standard `repeat`. The repeated rows are expected to have equal height throughout the list, and one item per row.

### div
```html
<template>
  <div virtual-repeat.for="item of items">
    ${$index} ${item}
  </div>
</template>
```

### list
```html
<template>
  <ul>
    <li virtual-repeat.for="item of items">
    ${$index} ${item}
    </li>
  </ul>
</template>
```

### table
```html
<template>
  <table>
    <tr virtual-repeat.for="item of items">
      <td>${$index}</td>
      <td>${item}</td>
    </tr>
  </table>
</template>
```

```javascript
export class MyVirtualList {
    items = ['Foo', 'Bar', 'Baz'];
}
```

With a surrounding fixed height container with overflow scroll. Note that `overflow: scroll` styling is inlined on the elemenet. It can also be applied from CSS.
An error will be thrown if no ancestor element with style `overflow: scroll` is found.

## Caveats

  1. `<template/>` is not supported as root element of a virtual repeat template. This is due to the difficulty of technique employed: item height needs to be calculatable. With `<tempate/>`, there is no easy and performant way to acquire this value.
  2. Similar to (1), other template controllers cannot be used in conjunction with `virtual-repeat`, unlike `repeat`. I.e: built-in template controllers: `with`, `if`, etc... cannot be used with `virtual-repeat`. This can be workaround'd by nesting other template controllers inside the repeated element, with `<template/>` element, for example:

  ```html
  <template>
    <h1>${message}</h1>
    <div virtual-repeat.for="person of persons">
      <template with.bind="person">
        ${Name}
      </template>
    </div>
  </template>
  ```
  3. Beware of CSS selector `:nth-child` and similar selectors. Virtualization requires appropriate removing and inserting visible items, based on scroll position. This means DOM elements order will not stay the same, thus creating unexpected `:nth-child` CSS selector behavior. To work around this, you can use contextual properties `$index`, `$odd`, `$even` etc... to determine an item position, and apply CSS classes/styles against it, like the following example:

  ```html
  <template>
    <div virtual-repeat.for="person of persons" class="${$odd ? 'odd' : 'even'}-row">
      ${person.name}
    </div>
  </template>
  ```
  4. Similar to (3), virtualization requires appropriate removing and inserting visible items, so not all views will have their lifecycle invoked repeatedly. Rather, their binding contexts will be updated accordingly when the virtual repeat reuses the view and view model. To work around this, you can have your components work in a reactive way, which is natural in an Aurelia application. An example is to handle changes in change handler callback.

## Tobe implemented feature list

- [ ] ability to configure height & many aspects of the virtual repeat
- [ ] infinite scroll
- [ ] horizontal scrolling
- [ ] variable height
- [ ] scrolling direction
