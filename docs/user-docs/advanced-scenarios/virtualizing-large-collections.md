---
description: Learn how to efficiently render thousands of items using UI virtualization for optimal performance in large-scale applications.
---

# Virtualizing Large Collections

When building data-intensive applications, you'll often need to display large collections—thousands or even hundreds of thousands of items. Rendering all items at once creates severe performance bottlenecks: excessive DOM nodes, slow initial render, high memory consumption, and sluggish scrolling.

**UI virtualization** solves this by rendering only the visible items plus a small buffer, recycling DOM elements as the user scrolls. This maintains constant performance regardless of collection size.

## Why This Is an Advanced Scenario

Virtualization is critical for:
- **Data grids** with thousands of rows
- **Infinite scroll** implementations
- **Large catalogs** (products, media, documents)
- **Log viewers** with continuous data streams
- **High-frequency data** displays (stock tickers, metrics)

While the basic API is straightforward, production implementations require understanding:
- Buffer sizing and performance tuning
- Variable-height item handling
- Integration with infinite scroll
- Horizontal scrolling layouts
- Table virtualization strategies

## Complete Guide

For comprehensive documentation on UI virtualization in Aurelia, including:
- Installation and setup
- Basic and advanced usage patterns
- Horizontal and vertical scrolling
- Variable sizing support
- Infinite scroll integration
- Performance optimization techniques
- Common pitfalls and troubleshooting

**See the complete guide:** [UI Virtualization](../developer-guides/ui-virtualization.md)

## Quick Example

Here's a minimal example to get you started:

```typescript
// my-component.ts
export class MyComponent {
  items = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }));
}
```

```html
<!-- my-component.html -->
<div style="height: 500px; overflow: auto;">
  <div virtual-repeat.for="item of items" style="height: 50px;">
    ${item.id}: ${item.name}
  </div>
</div>
```

**Key Requirements:**
- Container must have a **constrained size** with `overflow: auto` or `overflow: scroll`
  - Can use fixed height (`height: 500px`), percentage (`height: 100%`), flexbox (`flex: 1`), grid, viewport units (`height: 100vh`), or any CSS that creates a bounded scrollable area
- Items should have consistent height (or use `variable-height: true` for variable sizing)
- Use `virtual-repeat.for` instead of `repeat.for`

**Flexible Container Examples:**

```html
<!-- Fixed height -->
<div style="height: 500px; overflow: auto;">
  <div virtual-repeat.for="item of items">...</div>
</div>

<!-- Percentage height (parent must have defined height) -->
<div style="height: 100%; overflow: auto;">
  <div virtual-repeat.for="item of items">...</div>
</div>

<!-- Flexbox -->
<div style="display: flex; flex-direction: column; height: 100vh;">
  <div style="flex: 1; overflow: auto;">
    <div virtual-repeat.for="item of items">...</div>
  </div>
</div>

<!-- Viewport units -->
<div style="height: calc(100vh - 60px); overflow: auto;">
  <div virtual-repeat.for="item of items">...</div>
</div>

<!-- CSS Grid -->
<div style="display: grid; grid-template-rows: auto 1fr; height: 100vh;">
  <header>Header</header>
  <div style="overflow: auto;">
    <div virtual-repeat.for="item of items">...</div>
  </div>
</div>
```

## What You'll Learn

The full guide covers:

1. **Installation** - Adding `@aurelia/ui-virtualization` to your project
2. **Basic Usage** - Vertical and horizontal lists
3. **Configuration** - `item-height`, `buffer-size`, `layout` options
4. **Variable Sizing** - Handling items with different heights/widths
5. **Infinite Scroll** - Loading more data with `near-top` and `near-bottom` events
6. **Table Virtualization** - Efficient large tables
7. **Performance Tuning** - Buffer sizing and optimization strategies
8. **Common Patterns** - Filtering, searching, dynamic collections
9. **Troubleshooting** - Solving common issues

## Performance Impact

With virtual repeat:
- **100,000 items**: Constant ~50 DOM elements (vs 100,000)
- **Initial render**: 50-100ms (vs 10+ seconds)
- **Memory**: ~5MB (vs 500MB+)
- **Scroll FPS**: 60fps (vs <10fps)

The performance difference is not incremental—it's transformational for large datasets.

---

**Ready to implement virtualization?** Head to the [complete UI Virtualization guide](../developer-guides/ui-virtualization.md).

