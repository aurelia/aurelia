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
| `layout` | Sets the scrolling direction. Can be `'vertical'` (default) or `'horizontal'`. | `layout: horizontal` |
| `item-height` | Explicit pixel height for each repeated item. Overrides the automatic first-item measurement. Used for vertical layouts. | `item-height: 40` |
| `item-width` | Explicit pixel width for each repeated item. Overrides the automatic first-item measurement. Used for horizontal layouts. | `item-width: 120` |
| `variable-height` | Enables variable height support for vertical layouts. When enabled, each item's height is measured individually. | `variable-height: true` |
| `variable-width` | Enables variable width support for horizontal layouts. When enabled, each item's width is measured individually. | `variable-width: true` |
| `buffer-size` | Multiplier that determines how many extra view sets are kept rendered above/below (vertical) or left/right (horizontal) of the viewport. Default is `2`. | `buffer-size: 3` |
| `min-views` | Overrides the auto-calculated minimum number of views needed to fill the viewport. Useful when the container dimensions are dynamic but known ahead of time. | `min-views: 10` |

The full syntax mirrors normal repeater multi-attribute support, e.g.:

```html
<!-- Vertical layout (default) -->
<div virtual-repeat.for="row of rows; item-height: 40; buffer-size: 3; min-views: 5">
  ${row}
</div>

<!-- Horizontal layout -->
<div virtual-repeat.for="item of items; layout: horizontal; item-width: 120; buffer-size: 2">
  ${item}
</div>

<!-- Variable height -->
<div virtual-repeat.for="post of posts; variable-height: true; buffer-size: 3">
  ${post.content}
</div>

<!-- Variable width horizontal -->
<div virtual-repeat.for="tag of tags; layout: horizontal; variable-width: true; buffer-size: 2">
  ${tag.name}
</div>
```

You may mix and match any combination of the options. Names can be written in camelCase (`itemHeight`, `itemWidth`, `variableHeight`, `variableWidth`) or kebab-case (`item-height`, `item-width`, `variable-height`, `variable-width`).

## Horizontal Scrolling

The virtual repeat supports horizontal scrolling layouts, allowing you to create efficiently virtualized horizontal lists, carousels, and galleries.

### Basic Horizontal Layout

To enable horizontal scrolling, set the `layout` option to `horizontal` and specify the `item-width`:

```html
<template>
  <div style="width: 600px; height: 100px; overflow: auto; white-space: nowrap;">
    <div virtual-repeat.for="item of items; layout: horizontal; item-width: 140"
         style="display: inline-block; width: 120px; height: 80px;">
      ${item.name}
    </div>
  </div>
</template>
```

### Styling Considerations for Horizontal Layouts

When using horizontal layouts, ensure your CSS is configured properly:

1. **Container styling**: Set `overflow: auto` and `white-space: nowrap` on the scrolling container
2. **Item styling**: Use `display: inline-block` or similar for horizontal arrangement
3. **Explicit dimensions**: Specify both width and height for predictable layout

```css
.horizontal-scroller {
  width: 600px;
  height: 120px;
  overflow: auto;
  white-space: nowrap;
  border: 1px solid #ccc;
}

.horizontal-item {
  display: inline-block;
  width: 150px;
  height: 100px;
  margin: 10px;
  vertical-align: top;
}
```

### Horizontal with Configuration Options

You can combine horizontal layout with other configuration options:

```html
<template>
  <div class="horizontal-scroller">
    <div virtual-repeat.for="item of items; layout: horizontal; item-width: 160; buffer-size: 3; min-views: 4"
         class="horizontal-item">
      <img src.bind="item.imageUrl" alt.bind="item.title">
      <h4>${item.title}</h4>
    </div>
  </div>
</template>
```

### Horizontal Infinite Scroll

Horizontal layouts work seamlessly with infinite scroll events:

```html
<template>
  <div
    class="horizontal-scroller"
    near-bottom.trigger="loadMoreItems($event)"
    near-top.trigger="loadPreviousItems($event)"
  >
    <div virtual-repeat.for="photo of photos; layout: horizontal; item-width: 200"
         class="photo-item">
      <img src.bind="photo.thumbnailUrl" alt.bind="photo.title">
    </div>
  </div>
</template>
```

```typescript
export class HorizontalGallery {
  public photos: Photo[] = [];

  public async loadMoreItems(event: IVirtualRepeatNearBottomEvent) {
    // Load more photos to the right
    const newPhotos = await this.photoService.loadMore();
    this.photos.push(...newPhotos);
  }

  public async loadPreviousItems(event: IVirtualRepeatNearTopEvent) {
    // Load previous photos to the left
    const previousPhotos = await this.photoService.loadPrevious();
    this.photos.unshift(...previousPhotos);
  }
}
```

### Use Cases for Horizontal Scrolling

- **Image galleries**: Horizontally scrolling photo thumbnails
- **Product carousels**: E-commerce product listings
- **Timeline views**: Chronological data display
- **Tag lists**: Long lists of tags or categories
- **Dashboard widgets**: Horizontal panels or cards

## Variable Sizing

The virtual repeat supports variable item sizes, allowing you to create efficiently virtualized lists where items have different heights (vertical layout) or widths (horizontal layout). This is particularly useful for content-driven lists where item dimensions vary based on the data.

### Variable Height (Vertical Layout)

When you have items with different heights, enable variable height support by setting `variable-height: true`:

```html
<template>
  <div style="height: 400px; overflow: auto;">
    <div virtual-repeat.for="post of blogPosts; variable-height: true"
         style="height: ${post.contentHeight}px; padding: 20px; border-bottom: 1px solid #eee;">
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <div if.bind="post.hasImage">
        <img src.bind="post.imageUrl" alt.bind="post.title">
      </div>
    </div>
  </div>
</template>
```

### Variable Width (Horizontal Layout)

For horizontal layouts with varying item widths, use `variable-width: true`:

```html
<template>
  <div style="width: 600px; height: 150px; overflow: auto; white-space: nowrap;">
    <div virtual-repeat.for="tag of tags; layout: horizontal; variable-width: true"
         style="display: inline-block; width: ${tag.width}px; height: 120px; margin: 10px;">
      <span>${tag.name}</span>
      <div class="tag-count">${tag.count} items</div>
    </div>
  </div>
</template>
```

### Combining Variable Sizing with Other Options

Variable sizing can be combined with other configuration options:

```html
<template>
  <div style="height: 500px; overflow: auto;">
    <div virtual-repeat.for="item of items; variable-height: true; buffer-size: 3; min-views: 5"
         style="height: ${item.calculatedHeight}px;">
      ${item.content}
    </div>
  </div>
</template>
```

### Data-Driven Variable Sizing

You can calculate item sizes based on your data:

```typescript
export class VariableHeightList {
  public items: ContentItem[] = [];

  public attached() {
    // Pre-calculate heights based on content
    this.items = this.rawData.map(data => ({
      ...data,
      calculatedHeight: this.calculateHeight(data.content)
    }));
  }

  private calculateHeight(content: string): number {
    // Simple calculation - you could use more sophisticated methods
    const baseHeight = 60;
    const lineHeight = 20;
    const estimatedLines = Math.ceil(content.length / 50);
    return baseHeight + (estimatedLines * lineHeight);
  }
}
```

### Performance Considerations

When using variable sizing:

1. **Measurement Overhead**: Each item needs to be measured, which adds some computational cost
2. **Use Sparingly**: Only enable variable sizing when you actually need different item sizes
3. **Pre-calculation**: When possible, calculate sizes ahead of time rather than relying on DOM measurement
4. **Caching**: The virtual repeat automatically caches measured sizes to avoid re-measurement

```html
<!-- Good: Only enable when needed -->
<div virtual-repeat.for="item of items; variable-height: true">
  <!-- Items have genuinely different heights -->
</div>

<!-- Better: Pre-calculated sizes -->
<div virtual-repeat.for="item of items; variable-height: true"
     style="height: ${item.preCalculatedHeight}px">
  <!-- Heights calculated beforehand -->
</div>
```

### Use Cases for Variable Sizing

- **Content feeds**: Social media posts, blog entries, news articles with varying content length
- **Product listings**: E-commerce items with different image sizes and descriptions
- **Chat messages**: Messaging interfaces where messages have different lengths
- **Dashboard cards**: Widgets with varying amounts of content
- **Image galleries**: Photos with different aspect ratios
- **Tag clouds**: Tags with different text lengths and importance levels

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

### Vertical div (default)
```html
<template>
  <div virtual-repeat.for="item of items">
    ${$index} ${item}
  </div>
</template>
```

### Horizontal div
```html
<template>
  <div style="overflow: auto; white-space: nowrap;">
    <div virtual-repeat.for="item of items; layout: horizontal; item-width: 150"
         style="display: inline-block; width: 120px;">
      ${$index} ${item}
    </div>
  </div>
</template>
```

### Vertical list
```html
<template>
  <ul>
    <li virtual-repeat.for="item of items">
    ${$index} ${item}
    </li>
  </ul>
</template>
```

### Horizontal list
```html
<template>
  <ul style="overflow: auto; white-space: nowrap; list-style: none; padding: 0;">
    <li virtual-repeat.for="item of items; layout: horizontal; item-width: 200"
        style="display: inline-block; width: 180px;">
      ${$index} ${item}
    </li>
  </ul>
</template>
```

### Vertical table
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

### Horizontal table (columns)
```html
<template>
  <table style="overflow: auto; white-space: nowrap;">
    <tr>
      <td virtual-repeat.for="item of items; layout: horizontal; item-width: 120"
          style="display: inline-block; width: 100px;">
        ${$index}: ${item}
      </td>
    </tr>
  </table>
</template>
```

### Variable height content
```html
<template>
  <div style="height: 400px; overflow: auto;">
    <div virtual-repeat.for="post of posts; variable-height: true"
         style="height: ${post.height}px; padding: 15px; border-bottom: 1px solid #ddd;">
      <h4>${post.title}</h4>
      <p>${post.content}</p>
    </div>
  </div>
</template>
```

### Variable width horizontal
```html
<template>
  <div style="width: 600px; height: 120px; overflow: auto; white-space: nowrap;">
    <div virtual-repeat.for="tag of tags; layout: horizontal; variable-width: true"
         style="display: inline-block; width: ${tag.width}px; height: 100px; margin: 5px;">
      ${tag.name} (${tag.count})
    </div>
  </div>
</template>
```

```javascript
export class MyVirtualList {
    items = ['Foo', 'Bar', 'Baz'];

    posts = [
      { title: 'Short post', content: 'Brief content', height: 80 },
      { title: 'Medium post', content: 'Some longer content here...', height: 120 },
      { title: 'Long post', content: 'Much longer content with more details...', height: 160 }
    ];

    tags = [
      { name: 'JavaScript', count: 45, width: 120 },
      { name: 'HTML', count: 23, width: 80 },
      { name: 'TypeScript', count: 67, width: 140 }
    ];
}
```

With a surrounding fixed height (vertical) or fixed width (horizontal) container with overflow scroll. Note that `overflow: scroll` styling is inlined on the element. It can also be applied from CSS. An error will be thrown if no ancestor element with style `overflow: scroll` is found.

## Caveats

  1. `<template/>` is not supported as root element of a virtual repeat template. This is due to the difficulty of technique employed: item dimensions (height for vertical, width for horizontal) need to be calculatable. With `<template/>`, there is no easy and performant way to acquire this value.

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

  5. **Horizontal Layout Considerations**: When using horizontal layouts, ensure proper CSS styling:
     - Set `white-space: nowrap` on the container to prevent line breaks
     - Use `display: inline-block` or similar on repeated items for horizontal arrangement
     - Specify explicit widths for consistent layout
     - Consider `vertical-align: top` to align items consistently

  ```html
  <!-- Good horizontal layout example -->
  <div style="overflow: auto; white-space: nowrap;">
    <div virtual-repeat.for="item of items; layout: horizontal; item-width: 200"
         style="display: inline-block; width: 180px; vertical-align: top;">
      ${item.name}
    </div>
  </div>
  ```

  6. **Variable Sizing Performance**: Variable sizing requires DOM measurement of each item, which adds computational overhead compared to fixed sizing. Consider these guidelines:
     - Only enable variable sizing (`variable-height` or `variable-width`) when items actually have different sizes
     - Pre-calculate item dimensions when possible rather than relying on DOM measurement
     - For large datasets with variable sizing, consider implementing pagination or limiting the total number of items
     - Test performance with your actual data and item complexity

  ```html
  <!-- Avoid: Unnecessary variable sizing -->
  <div virtual-repeat.for="item of items; variable-height: true" style="height: 50px;">
    <!-- All items have the same height -->
  </div>

  <!-- Better: Use fixed sizing for uniform items -->
  <div virtual-repeat.for="item of items; item-height: 50">
    <!-- All items have the same height -->
  </div>

  <!-- Good: Variable sizing when actually needed -->
  <div virtual-repeat.for="post of posts; variable-height: true" style="height: ${post.calculatedHeight}px;">
    <!-- Items have genuinely different heights -->
  </div>
  ```

## To be implemented feature list

- [ ] scrolling direction
