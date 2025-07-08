# UI Virtualization

The UI Virtualization plugin provides efficient rendering of large collections by only creating DOM elements for visible items. This dramatically improves performance when working with thousands of items by maintaining a small, consistent number of DOM elements regardless of collection size.

{% hint style="info" %}
**Performance at Scale**: Virtual repeat maintains constant performance whether you have 100 items or 100,000 items, making it essential for data-heavy applications.
{% endhint %}

## How It Works

Instead of creating DOM elements for every item in your collection, virtual repeat:

1. **Calculates visible area**: Determines how many items can fit in the scrollable viewport  
2. **Creates minimal views**: Only renders 2× the visible items (for smooth scrolling)  
3. **Manages buffers**: Uses invisible spacer elements to maintain proper scroll height  
4. **Recycles views**: Reuses existing DOM elements as you scroll, updating their data context  
5. **Handles scroll events**: Efficiently responds to scrolling without expensive DOM operations  

## Installation

Install the plugin via npm:

```bash
npm install @aurelia/ui-virtualization
```

Register the plugin in your application:

```typescript
import { Aurelia } from 'aurelia';
import { DefaultVirtualizationConfiguration } from '@aurelia/ui-virtualization';

Aurelia
  .register(DefaultVirtualizationConfiguration)
  .app(/* your root component */)
  .start();
```

## Basic Usage

### Simple List

Use `virtual-repeat.for` just like the standard `repeat`, with one important requirement: **your container must have a fixed height and `overflow: scroll` or `overflow: auto`**.

### Configuration options

`virtual-repeat` supports several optional, **kebab-cased** configuration properties that can be appended after the `for` statement, separated by semicolons (`;`):

| Option            | Description                                                                                      | Example                             |
|-------------------|--------------------------------------------------------------------------------------------------|-------------------------------------|
| `layout`          | Sets the scrolling direction. Can be `'vertical'` (default) or `'horizontal'`.                   | `layout: horizontal`                |
| `item-height`     | Explicit pixel height for each repeated item. Overrides the automatic first‐item measurement.    | `item-height: 40`                   |
| `item-width`      | Explicit pixel width for each repeated item. Overrides the automatic first‐item measurement.     | `item-width: 120`                   |
| `variable-height` | Enables variable‐height support for vertical layouts. Each item's height is measured individually.| `variable-height: true`             |
| `variable-width`  | Enables variable‐width support for horizontal layouts. Each item's width is measured individually.| `variable-width: true`              |
| `buffer-size`     | Multiplier that determines how many extra view sets are kept rendered above/below (vertical) or left/right (horizontal). Default is `2`. | `buffer-size: 3`                    |
| `min-views`       | Overrides the auto‐calculated minimum number of views needed to fill the viewport.               | `min-views: 10`                     |

Examples:

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

*Names can be in camelCase (`itemHeight`, `itemWidth`, etc.) or kebab-case (`item-height`, `item-width`, etc.).*

## Horizontal Scrolling

The virtual repeat supports horizontal scrolling layouts, allowing you to create efficiently virtualized horizontal lists, carousels, and galleries.

### Basic Horizontal Layout

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

1. Set `overflow: auto` and `white-space: nowrap` on the scrolling container  
2. Use `display: inline-block` (or similar) on items for horizontal arrangement  
3. Specify both width and height for predictable layout  

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
    const newPhotos = await this.photoService.loadMore();
    this.photos.push(...newPhotos);
  }

  public async loadPreviousItems(event: IVirtualRepeatNearTopEvent) {
    const previousPhotos = await this.photoService.loadPrevious();
    this.photos.unshift(...previousPhotos);
  }
}
```

### Use Cases for Horizontal Scrolling

- Image galleries  
- Product carousels  
- Timeline views  
- Tag lists  
- Dashboard widgets  

## Variable Sizing

The virtual repeat supports variable item sizes, which is useful when items have different heights (vertical) or widths (horizontal).

### Variable Height (Vertical Layout)

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

```typescript
export class VariableHeightList {
  public items: ContentItem[] = [];

  public attached() {
    this.items = this.rawData.map(data => ({
      ...data,
      calculatedHeight: this.calculateHeight(data.content)
    }));
  }

  private calculateHeight(content: string): number {
    const baseHeight = 60;
    const lineHeight = 20;
    const estimatedLines = Math.ceil(content.length / 50);
    return baseHeight + (estimatedLines * lineHeight);
  }
}
```

### Performance Considerations

1. Measurement overhead: DOM measurement adds cost  
2. Use sparingly: enable variable sizing only when needed  
3. Pre-calculate sizes when possible  
4. Caching: virtual repeat caches measured sizes  

## Infinite Scroll

The virtual repeat dispatches events to let you load more data when the user scrolls near the top or bottom.

### Event Types

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

- Prevent multiple requests with a loading flag  
- Implement error handling  
- Show loading indicators  
- Consider debouncing rapid scroll events  

## Basic Examples

### Vertical div (default)

```html
<template>
  <div style="height: 400px; overflow: auto;">
    <div virtual-repeat.for="item of items">
      ${$index}: ${item.name}
    </div>
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
  <ul style="height: 500px; overflow: auto;">
    <li virtual-repeat.for="user of users">
      <strong>${user.name}</strong> – ${user.email}
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

### Table Virtualization

For tables, virtual repeat works on table rows while preserving the table structure:

```html
<template>
  <div style="height: 600px; overflow: auto;">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr virtual-repeat.for="user of users">
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td class="${user.active ? 'text-success' : 'text-muted'}">
            ${user.active ? 'Active' : 'Inactive'}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

## Context Properties

Virtual repeat provides all standard repeat context properties:

```html
<template>
  <div style="height: 400px; overflow: auto;">
    <div virtual-repeat.for="item of items"
         class="${$odd ? 'odd-row' : 'even-row'}">
      <span>Index: ${$index}</span>
      <span>Item: ${item.name}</span>
      <span if.bind="$first">👑 First item</span>
      <span if.bind="$last">🏁 Last item</span>
      <span>Total: ${$length}</span>
    </div>
  </div>
</template>
```

**Available context properties**: `$index`, `$length`, `$first`, `$last`, `$middle`, `$even`, `$odd`

## Dynamic Collections

Virtual repeat efficiently handles collection mutations:

```typescript
export class DynamicList {
  items: Item[] = [];

  addItem() {
    this.items.push({
      name: `New Item ${this.items.length}`,
      id: Date.now()
    });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  addBulkItems(count: number) {
    const newItems = Array.from({ length: count }, (_, i) => ({
      name: `Bulk Item ${this.items.length + i}`,
      id: Date.now() + i
    }));
    this.items.push(...newItems);
  }

  clearAll() {
    this.items.length = 0;
  }
}
```

## Container Requirements

### Scrollable Container

Virtual repeat requires a scrollable ancestor with a defined height and `overflow: auto` or `overflow: scroll`:

```css
.virtual-container {
  height: 500px;
  overflow: auto;
  border: 1px solid #ccc;
}
```

### Item Height Requirements

All items must have equal height (measured from the first item):

```html
<!-- ✅ Equal height -->
<div virtual-repeat.for="item of items" style="height: 50px; padding: 10px;">
  ${item.name}
</div>

<!-- ❌ Variable height -->
<div virtual-repeat.for="item of items">
  <div if.bind="item.isExpanded" style="height: 200px;">Expanded</div>
  <div else style="height: 50px;">Collapsed</div>
</div>
```

## Advanced Styling

```html
<template>
  <style>
    .virtual-item {
      height: 60px;
      padding: 15px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
    }
    .odd-row  { background-color: #f9f9f9; }
    .even-row { background-color: white; }
    .first-item { border-top: 3px solid #007bff; }
    .last-item  { border-bottom: 3px solid #007bff; }
  </style>

  <div style="height: 500px; overflow: auto;">
    <div virtual-repeat.for="item of items"
         class="virtual-item ${$odd ? 'odd-row' : 'even-row'} ${$first ? 'first-item' : ''} ${$last ? 'last-item' : ''}">
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    </div>
  </div>
</template>
```

## Performance Considerations

### Best Practices

- Keep item templates simple  
- Use CSS classes instead of inline styles  
- Minimize watchers in item templates  
- Consider pagination for extremely large datasets  

### Memory Usage

Virtual repeat maintains only a small number of views (typically 2× visible count):

```typescript
export class LargeDataset {
  items = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    data: `Large dataset item ${i}`
  }));
}
```

## Common Patterns

### Loading States

1. `<template/>` is not supported as the root element of a virtual repeat template. Items need calculatable dimensions.  
2. Other template controllers (`if`, `with`, etc.) cannot sit on the same element as `virtual-repeat`. Nest them inside the repeated element.  
3. Avoid CSS pseudo-selectors like `:nth-child`; virtual repeat recycles DOM. Use context properties and classes.  
4. Views are reused; lifecycle hooks (`attached`, etc.) may not fire each scroll. Use reactive bindings or change handlers.  
5. **Horizontal layout tips**: `white-space: nowrap`, `display: inline-block`, explicit widths, `vertical-align: top`.  
6. **Variable sizing performance**: Measure only when needed, pre-calculate sizes, test with real data.

### Empty States

```html
<template>
  <div style="height: 400px; overflow: auto;">
    <div if.bind="items.length === 0" class="empty-state">
      <p>No items to display</p>
      <button click.trigger="loadItems()">Load Items</button>
    </div>
    <div else virtual-repeat.for="item of items" style="height: 50px;">
      ${item.name}
    </div>
  </div>
</template>
```

### Filtering and Searching

```typescript
export class SearchableList {
  allItems: Item[] = [];
  searchTerm = '';

  get filteredItems() {
    return this.searchTerm
      ? this.allItems.filter(item =>
          item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      : this.allItems;
  }
}
```

```html
<template>
  <input value.bind="searchTerm" placeholder="Search items...">
  <div style="height: 400px; overflow: auto;">
    <div virtual-repeat.for="item of filteredItems" style="height: 50px;">
      ${item.name}
    </div>
  </div>
</template>
```

### Template Controllers Limitation

Virtual repeat cannot combine with other template controllers on the same element:

```html
<!-- ❌ Won't work -->
<div virtual-repeat.for="item of items" if.bind="showItems">
  ${item.name}
</div>

<!-- ✅ Nest instead -->
<template if.bind="showItems">
  <div virtual-repeat.for="item of items">
    ${item.name}
  </div>
</template>
```

### Root Template Element Limitation

You cannot use `<template>` as the root for a virtual-repeat:

```html
<!-- ❌ Won't work -->
<template virtual-repeat.for="item of items">
  <div>${item.name}</div>
</template>

<!-- ✅ Use a concrete element -->
<div virtual-repeat.for="item of items">
  ${item.name}
</div>
```

### CSS Pseudo-selectors

Avoid selectors that rely on DOM order:

```css
/* ❌ Might misbehave */
.virtual-item:nth-child(odd) {
  background-color: #f0f0f0;
}

/* ✅ Use classes */
.virtual-item.odd-row {
  background-color: #f0f0f0;
}
```

### Component Lifecycle

- `created` and `attached` fire on initial view creation  
- Views are reused on scroll; `binding` happens more frequently  
- Use reactive change handlers instead of relying on lifecycle timing  

### Integration with Other Features

#### With Binding Behaviors

```html
<template>
  <div style="height: 400px; overflow: auto;">
    <div virtual-repeat.for="item of items"
         style="height: 50px;"
         class="${item.isActive & oneTime ? 'active' : 'inactive'}">
      ${item.name & debounce:500}
    </div>
  </div>
</template>
```

#### With Value Converters

```html
<template>
  <div style="height: 400px; overflow: auto;">
    <div virtual-repeat.for="item of items" style="height: 60px;">
      <h4>${item.title | truncate:50}</h4>
      <p>${item.createdAt | dateFormat:'MM/DD/YYYY'}</p>
    </div>
  </div>
</template>
```

### Troubleshooting

**Common Issues**  
- Items not rendering: check container height and overflow  
- Scroll jumps: inconsistent item heights  
- Performance issues: simplify templates, reduce bindings  
- Collection updates: ensure the array or reference updates  

**Debugging**

```typescript
import { VirtualRepeat } from '@aurelia/ui-virtualization';

export class DebugVirtualRepeat {
  virtualRepeat: VirtualRepeat;

  attached() {
    const distances = this.virtualRepeat.getDistances();
    console.log('Top buffer:', distances[0], 'Bottom buffer:', distances[1]);
  }
}
```
