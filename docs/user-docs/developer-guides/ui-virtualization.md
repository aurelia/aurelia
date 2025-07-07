## Installation

{% hint style="info" %}
**Performance at Scale**: Virtual repeat maintains constant performance whether you have 100 items or 100,000 items, making it essential for data-heavy applications.
{% endhint %}

## How It Works

Instead of creating DOM elements for every item in your collection, virtual repeat:

1. **Calculates visible area**: Determines how many items can fit in the scrollable viewport  
2. **Creates minimal views**: Only renders 2x the visible items (for smooth scrolling)  
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

`virtual-repeat` supports several optional, **kebab-cased** configuration properties that can be appended after the `for` statement, separated by semicolons (`;`).

| Option            | Description                                                                                      | Example                             |
|-------------------|--------------------------------------------------------------------------------------------------|-------------------------------------|
| `layout`          | Sets the scrolling direction. Can be `'vertical'` (default) or `'horizontal'`.                   | `layout: horizontal`                |
| `item-height`     | Explicit pixel height for each repeated item. Overrides the automatic first‐item measurement.    | `item-height: 40`                   |
| `item-width`      | Explicit pixel width for each repeated item. Overrides the automatic first‐item measurement.     | `item-width: 120`                   |
| `variable-height` | Enables variable‐height support for vertical layouts. Each item's height is measured individually. | `variable-height: true`             |
| `variable-width`  | Enables variable‐width support for horizontal layouts. Each item's width is measured individually. | `variable-width: true`              |
| `buffer-size`     | Multiplier that determines how many extra view sets are kept rendered above/below (vertical) or left/right (horizontal). Default is `2`. | `buffer-size: 3`                    |
| `min-views`       | Overrides the auto‐calculated minimum number of views needed to fill the viewport.               | `min-views: 10`                     |

Example:

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

### Styling Considerations

Ensure your container has `overflow: auto` and `white-space: nowrap`, and your items use `display: inline-block` (or similar) with explicit dimensions.

### Infinite Scroll

Combine `layout: horizontal` with `near-bottom.trigger` and `near-top.trigger` to load more items as the user scrolls.

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

### Vertical table

*(Insert your vertical table example here.)*

## Advanced Styling

### CSS Classes and Conditional Styling

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

With a surrounding fixed height (vertical) or fixed width (horizontal) container with overflow scroll. An error will be thrown if no ancestor element with `overflow: scroll` or `auto` is found.

## Common Patterns

### Loading States

1. `<template/>` is not supported as the root element of a virtual repeat template. Item dimensions need to be calculatable; `<template/>` doesn’t provide that.  
2. Other template controllers (e.g. `if`, `with`) cannot be used on the same element as `virtual-repeat`. Work around by nesting them inside the repeated element.  
3. Avoid CSS pseudo-selectors like `:nth-child`—views are recycled and their DOM order changes. Use context properties (`$index`, `$odd`, `$even`, etc.) and apply classes instead.  
4. Views are reused; lifecycle hooks like `attached` may not fire each time. Rely on reactive bindings or change handlers in your view-model.  
5. **Horizontal layout tips**:  
   - `white-space: nowrap` on container  
   - `display: inline-block` on items  
   - Explicit widths for consistency  
   - `vertical-align: top` to align items  
6. **Variable sizing performance**: Measuring each item adds overhead. Enable `variable-height`/`variable-width` only when necessary, pre-calculate sizes if possible, and test with your real data.