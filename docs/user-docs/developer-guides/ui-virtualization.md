# UI Virtualization

The UI Virtualization plugin provides efficient rendering of large collections by only creating DOM elements for visible items. This dramatically improves performance when working with thousands of items by maintaining a small, consistent number of DOM elements regardless of collection size.

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

```html
<template>
  <div style="height: 400px; overflow: auto;">
    <div virtual-repeat.for="item of items">
      ${$index}: ${item.name}
    </div>
  </div>
</template>
```

```typescript
export class ItemList {
  items = Array.from({ length: 10000 }, (_, i) => ({
    name: `Item ${i}`,
    id: i
  }));
}
```

### Unordered/Ordered Lists

Virtual repeat automatically detects list containers and handles them appropriately:

```html
<template>
  <ul style="height: 500px; overflow: auto;">
    <li virtual-repeat.for="user of users">
      <strong>${user.name}</strong> - ${user.email}
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

Virtual repeat provides all the standard repeat context properties:

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

**Available context properties:**
- `$index`: Zero-based index of the current item
- `$length`: Total number of items in the collection
- `$first`: `true` if this is the first item
- `$last`: `true` if this is the last item
- `$middle`: `true` if this is neither first nor last
- `$even`: `true` if the index is even
- `$odd`: `true` if the index is odd

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

Virtual repeat requires a scrollable ancestor with:
- **Fixed height**: The container must have a defined height
- **Overflow scrolling**: `overflow: auto` or `overflow: scroll`

```css
.virtual-container {
  height: 500px;
  overflow: auto;
  border: 1px solid #ccc;
}
```

### Item Height Requirements

**Important**: All items in a virtual repeat must have **equal height**. Virtual repeat calculates item height from the first item and applies this to all items.

```html
<!-- ✅ Good: All items have the same height -->
<div virtual-repeat.for="item of items" style="height: 50px; padding: 10px;">
  ${item.name}
</div>

<!-- ❌ Bad: Variable height items -->
<div virtual-repeat.for="item of items">
  <div if.bind="item.isExpanded" style="height: 200px;">Expanded content</div>
  <div else style="height: 50px;">Collapsed content</div>
</div>
```

## Advanced Styling

### CSS Classes and Conditional Styling

Use context properties for conditional styling:

```html
<template>
  <style>
    .virtual-item {
      height: 60px;
      padding: 15px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
    }

    .odd-row { background-color: #f9f9f9; }
    .even-row { background-color: white; }
    .first-item { border-top: 3px solid #007bff; }
    .last-item { border-bottom: 3px solid #007bff; }
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

### Responsive Item Heights

While all items must have the same height, you can make this height responsive:

```css
.virtual-item {
  height: 80px; /* Default height */
}

@media (max-width: 768px) {
  .virtual-item {
    height: 100px; /* Larger height on mobile */
  }
}
```

## Performance Considerations

### Best Practices

1. **Keep item templates simple**: Complex nested components in virtual repeat items can impact performance
2. **Use CSS classes instead of inline styles**: This reduces the work done during binding updates
3. **Minimize watchers in item templates**: Avoid complex computations in item bindings
4. **Consider pagination for extremely large datasets**: While virtual repeat handles large collections well, consider pagination for collections over 50,000 items

### Memory Usage

Virtual repeat maintains only a small number of views in memory (typically 2x the visible count), making it very memory efficient:

```typescript
// Even with 100,000 items, only ~20-40 DOM elements exist at any time
export class LargeDataset {
  items = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    data: `Large dataset item ${i}`
  }));
}
```

## Common Patterns

### Loading States

Handle loading states in your view model:

```html
<template>
  <div style="height: 400px; overflow: auto;">
    <div if.bind="isLoading" class="loading-state">
      Loading items...
    </div>
    <div else virtual-repeat.for="item of items" style="height: 50px;">
      ${item.name}
    </div>
  </div>
</template>
```

### Empty States

Provide meaningful empty states:

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

Virtual repeat works seamlessly with filtered collections:

```typescript
export class SearchableList {
  allItems: Item[] = [];
  searchTerm = '';

  get filteredItems() {
    if (!this.searchTerm) {
      return this.allItems;
    }
    return this.allItems.filter(item =>
      item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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

## Important Limitations

### Template Controllers

Virtual repeat cannot be combined with other template controllers on the same element:

```html
<!-- ❌ This won't work -->
<div virtual-repeat.for="item of items" if.bind="showItems">
  ${item.name}
</div>

<!-- ✅ Use nesting instead -->
<template if.bind="showItems">
  <div virtual-repeat.for="item of items">
    ${item.name}
  </div>
</template>
```

### Root Template Element

Virtual repeat cannot use `<template>` as its root element:

```html
<!-- ❌ This won't work -->
<template virtual-repeat.for="item of items">
  <div>${item.name}</div>
</template>

<!-- ✅ Use a concrete element -->
<div virtual-repeat.for="item of items">
  ${item.name}
</div>
```

### CSS Pseudo-selectors

Be careful with CSS pseudo-selectors like `:nth-child` as DOM elements are recycled:

```css
/* ❌ This might not work as expected */
.virtual-item:nth-child(odd) {
  background-color: #f0f0f0;
}

/* ✅ Use context properties instead */
.virtual-item.odd-row {
  background-color: #f0f0f0;
}
```

### Component Lifecycle

Virtual repeat recycles views, so component lifecycle methods in repeated items behave differently:
- `created` and `attached` are called when views are first created
- Views are reused as you scroll, so `binding` occurs more frequently than `created`
- Use reactive patterns and change handlers instead of relying on lifecycle timing

## Integration with Other Features

### With Binding Behaviors

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

### With Value Converters

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

## Troubleshooting

### Common Issues

**Items not rendering correctly**
- Ensure your scrollable container has a fixed height
- Verify that `overflow: auto` or `overflow: scroll` is set
- Check that all items have equal height

**Scroll position jumping**
- This can happen if item heights are inconsistent
- Ensure all CSS that affects height is applied consistently

**Performance issues**
- Simplify item templates
- Reduce the number of bindings per item
- Consider if you really need virtual repeat for smaller collections (< 100 items)

**Collection updates not reflecting**
- Virtual repeat observes the collection properly, but ensure you're modifying the array reference if needed
- For complex scenarios, manually trigger change detection

### Debugging

You can access virtual repeat information programmatically:

```typescript
import { VirtualRepeat } from '@aurelia/ui-virtualization';

export class DebugVirtualRepeat {
  virtualRepeat: VirtualRepeat;

  attached() {
    // Access the virtual repeat instance
    const distances = this.virtualRepeat.getDistances();
    console.log('Top buffer:', distances[0], 'Bottom buffer:', distances[1]);
  }
}
```

## Future Enhancements

The following features are planned for future releases:

- **Variable item heights**: Support for items with different heights
- **Horizontal scrolling**: Virtual repeat for horizontal layouts
- **Infinite scroll integration**: Built-in support for loading more data
- **Advanced configuration**: Customizable buffer sizes and scroll behavior
- **Performance optimizations**: Even better performance for edge cases
