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

### Configuration options

`virtual-repeat` supports several optional, **kebab-cased** configuration properties that can be appended after the `for` statement, separated by semicolons (`;`).

| Option | Description | Example |
| ------ | ----------- | ------- |
| `item-height` | Explicit pixel height for each repeated item. Overrides the automatic first-item measurement. | `item-height: 40` |
| `buffer-size` | Multiplier that determines how many extra view sets are kept rendered above and below the viewport. Default is `2`. | `buffer-size: 3` |
| `min-views` | Overrides the auto-calculated minimum number of views needed to fill the viewport. Useful when the container height is dynamic but known ahead of time. | `min-views: 10` |

The full syntax mirrors normal repeater multi-attribute support, e.g.:

```html
<div virtual-repeat.for="row of rows; item-height: 40; buffer-size: 3; min-views: 5">
  ${row}
</div>
```

You may mix and match any combination of the options. Names can be written in camelCase (`itemHeight`) or kebab-case (`item-height`).

## Infinite Scroll

The virtual repeat supports infinite scroll functionality through event-based callbacks. When the user scrolls near the top or bottom of the list, events are dispatched that you can handle to load more data.

### Event Types

The virtual repeat dispatches two events:

- `near-top`: Fired when scrolling approaches the beginning of the list
- `near-bottom`: Fired when scrolling approaches the end of the list

Both events include useful information in their `detail` property:

```typescript
interface IVirtualRepeatNearTopEvent extends CustomEvent {
  readonly type: 'near-top';
  readonly detail: {
    readonly firstVisibleIndex: number;
    readonly itemCount: number;
  };
}

interface IVirtualRepeatNearBottomEvent extends CustomEvent {
  readonly type: 'near-bottom';
  readonly detail: {
    readonly lastVisibleIndex: number;
    readonly itemCount: number;
  };
}
```

### Usage Example

```html
<template>
  <div
    style="height: 400px; overflow: auto;"
    near-bottom.trigger="loadMoreItems($event)"
    near-top.trigger="loadPreviousItems($event)"
  >
    <div virtual-repeat.for="item of items" style="height: 50px;">
      ${item.name}
    </div>
  </div>
</template>
```

```typescript
import {
  IVirtualRepeatNearBottomEvent,
  IVirtualRepeatNearTopEvent
} from '@aurelia/ui-virtualization';

export class InfiniteScrollList {
  public items: Item[] = [];
  private loading = false;

  public async loadMoreItems(event: IVirtualRepeatNearBottomEvent) {
    if (this.loading) return;

    this.loading = true;
    try {
      const { lastVisibleIndex, itemCount } = event.detail;
      const newItems = await this.dataService.loadMore(itemCount);
      this.items.push(...newItems);
    } finally {
      this.loading = false;
    }
  }

  public async loadPreviousItems(event: IVirtualRepeatNearTopEvent) {
    if (this.loading) return;

    this.loading = true;
    try {
      const { firstVisibleIndex, itemCount } = event.detail;
      const previousItems = await this.dataService.loadPrevious(firstVisibleIndex);
      this.items.unshift(...previousItems);
    } finally {
      this.loading = false;
    }
  }
}
```

### Best Practices for Infinite Scroll

1. **Prevent Multiple Requests**: Use a loading flag to prevent multiple simultaneous requests
2. **Handle Errors**: Implement proper error handling for failed data loads
3. **Loading Indicators**: Show loading states to improve user experience
4. **Debouncing**: Consider debouncing rapid scroll events if needed

```typescript
export class InfiniteScrollList {
  public items: Item[] = [];
  public isLoadingMore = false;
  public isLoadingPrevious = false;

  public async loadMoreItems(event: IVirtualRepeatNearBottomEvent) {
    if (this.isLoadingMore) return;

    this.isLoadingMore = true;
    try {
      const newItems = await this.dataService.loadMore();
      this.items.push(...newItems);
    } catch (error) {
      this.logger.error('Failed to load more items', error);
    } finally {
      this.isLoadingMore = false;
    }
  }
}
```

## Basic Examples

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

## To be implemented feature list

- [ ] horizontal scrolling
- [ ] variable height
- [ ] scrolling direction
