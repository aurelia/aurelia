---
description: >-
  Master list rendering in Aurelia with repeat.for. Learn efficient data binding,
  performance optimization, advanced patterns, and real-world techniques for
  dynamic collections including arrays, maps, sets, and custom data structures.
---

# List Rendering

The `repeat.for` binding is Aurelia's powerful list rendering mechanism that creates highly optimized, reactive displays of collection data. It intelligently tracks changes, minimizes DOM updates, and provides rich contextual information for sophisticated data presentation.

## Core Concepts

### The `repeat.for` Binding

`repeat.for` creates a template instance for each item in a collection, similar to a `for...of` loop but with intelligent DOM management:

```html
<ul>
  <li repeat.for="item of items">
    ${item.name}
  </li>
</ul>
```

**JavaScript Analogy:**
```js
for (let item of items) {
  // Aurelia creates DOM element for each item
  console.log(item.name);
}
```

### Change Detection and Updates

Aurelia automatically observes collection changes and updates the DOM efficiently:

```typescript
export class MyComponent {
  items = [{ name: 'John' }, { name: 'Jane' }];

  addItem() {
    // Aurelia detects this change and updates DOM
    this.items.push({ name: 'Bob' });
  }

  updateFirst() {
    // This change is also detected
    this.items[0] = { name: 'Johnny' };
  }
}
```

**Important:** Use array mutating methods (`push`, `pop`, `splice`, `reverse`, `sort`) for automatic detection. Direct index assignment works but requires the array reference to change for detection.

## Performance Optimization with Keys

### Why Keys Matter

Without keys, Aurelia recreates DOM elements when collections change. With keys, it reuses existing elements:

```html
<!-- Without keys: recreates all DOM on reorder -->
<div repeat.for="user of users">
  <input value.bind="user.name">
</div>

<!-- With keys: preserves DOM and form state -->
<div repeat.for="user of users; key.bind: user.id">
  <input value.bind="user.name">
</div>
```

### Key Strategies

**Property-based keys (recommended):**
```html
<!-- Use stable, unique properties -->
<li repeat.for="product of products; key.bind: product.id">
  ${product.name}
</li>
```

**Literal property keys (more efficient):**
```html
<!-- Avoids expression evaluation -->
<li repeat.for="product of products; key: id">
  ${product.name}
</li>
```

**Expression-based keys (flexible but slower):**
```html
<!-- For complex key logic -->
<li repeat.for="item of items; key.bind: item.category + '-' + item.id">
  ${item.name}
</li>
```

### When to Use Keys

- **Dynamic collections** where items are added, removed, or reordered
- **Form inputs** to preserve user input during updates
- **Stateful components** to maintain component state
- **Large lists** for performance optimization
- **Sortable/filterable lists**

**Avoid keys when:**
- Collection is static or append-only
- Items are simple primitives without DOM state
- Performance testing shows no benefit

## Contextual Properties

Every repeat iteration provides rich contextual information:

```html
<div repeat.for="item of items">
  <span class="index">Item ${$index + 1} of ${$length}</span>
  <span class="status">
    ${$first ? 'First' : $last ? 'Last' : $middle ? 'Middle' : ''}
  </span>
  <div class="item ${$even ? 'even' : 'odd'}">
    ${item.name}
  </div>
</div>
```

### Complete Property Reference

| Property | Type | Description |
|----------|------|-------------|
| `$index` | `number` | Zero-based index (0, 1, 2...) |
| `$first` | `boolean` | `true` for the first item |
| `$last` | `boolean` | `true` for the last item |
| `$middle` | `boolean` | `true` for items that aren't first or last |
| `$even` | `boolean` | `true` for even indices (0, 2, 4...) |
| `$odd` | `boolean` | `true` for odd indices (1, 3, 5...) |
| `$length` | `number` | Total number of items |
| `$previous` | `any \| null` | Previous iteration's item (opt-in, see below) |
| `$parent` | `object` | Parent binding context |

### Nested Repeats and $parent

Access parent contexts in nested structures:

```html
<div repeat.for="department of departments">
  <h2>${department.name}</h2>
  <div repeat.for="employee of department.employees">
    <span>
      Dept: ${$parent.department.name},
      Employee #${$index + 1}: ${employee.name}
    </span>
    <!-- Access root context -->
    <span>Company: ${$parent.$parent.companyName}</span>
  </div>
</div>
```

### Accessing Previous Items with $previous

The `$previous` contextual property provides access to the previous iteration's item, enabling powerful comparison and rendering patterns. This is an **opt-in feature** that must be explicitly enabled to avoid any performance overhead.

**Basic usage:**
```html
<!-- Enable with previous.bind: true -->
<div repeat.for="item of items; previous.bind: true">
  <div class="item">
    ${item.name}
    <span if.bind="$previous">
      (Previous: ${$previous.name})
    </span>
  </div>
</div>
```

**Key characteristics:**
- `$previous` is `null` for the first item
- `$previous` is `undefined` when the feature is not enabled
- Zero overhead when not enabled - no memory or performance cost
- Works with all collection types (arrays, Maps, Sets, etc.)
- Compatible with keyed repeats

#### Section Headers and Dividers

A common use case is rendering section headers only when data changes:

```typescript
export class ProductList {
  products = [
    { category: 'Electronics', name: 'Laptop' },
    { category: 'Electronics', name: 'Mouse' },
    { category: 'Books', name: 'JavaScript Guide' },
    { category: 'Books', name: 'TypeScript Handbook' }
  ];
}
```

```html
<!-- Show category header only when it changes -->
<div repeat.for="product of products; previous.bind: true">
  <h2 if.bind="product.category !== $previous?.category">
    ${product.category}
  </h2>
  <div class="product">${product.name}</div>
</div>
```

**Output:**
```
Electronics
  Laptop
  Mouse
Books
  JavaScript Guide
  TypeScript Handbook
```

#### Comparison and Change Indicators

Highlight changes from previous values:

```typescript
export class StockTracker {
  prices = [
    { time: '09:00', price: 100 },
    { time: '09:01', price: 102 },
    { time: '09:02', price: 98 },
    { time: '09:03', price: 98 }
  ];
}
```

```html
<table>
  <tr repeat.for="entry of prices; previous.bind: true">
    <td>${entry.time}</td>
    <td class="${entry.price > $previous?.price ? 'up' : 
                  entry.price < $previous?.price ? 'down' : ''}">
      $${entry.price}
      <span if.bind="$previous && entry.price !== $previous.price">
        ${entry.price > $previous.price ? '↑' : '↓'}
      </span>
    </td>
  </tr>
</table>
```

#### Combining with Keys

You can use both `key` and `previous` together:

```html
<!-- Multiple iterator properties separated by semicolons -->
<div repeat.for="item of items; key: id; previous.bind: true">
  <div class="item-${item.id}">
    ${item.name}
    <span if.bind="$previous">
      Changed from: ${$previous.name}
    </span>
  </div>
</div>
```

#### Conditional Enabling

Enable `$previous` conditionally based on view model properties:

```typescript
export class ConfigurableList {
  items = [...];  
  showComparisons = true; // Toggle feature on/off
}
```

```html
<!-- Enable based on component state -->
<div repeat.for="item of items; previous.bind: showComparisons">
  <!-- $previous is only available when showComparisons is true -->
</div>
```

#### Performance Considerations

**When NOT enabled:**
- Zero memory overhead - `$previous` property is never created
- Negligible CPU cost - single conditional check per item
- No impact on existing applications

**When enabled:**
- One reference per item (approximately 8 bytes on 64-bit systems)
- Minimal CPU cost - just storing a reference
- No impact on rendering performance

**Best practices:**
- Only enable when needed - use `previous.bind: true` only on repeats that need it
- Use with static option for best performance: `previous: true` instead of `previous.bind: expression`
- Consider disabling for large lists if not actively used

## Data Types and Collections

### Arrays

The most common and optimized collection type:

```typescript
export class ProductList {
  products = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 25 }
  ];

  sortByPrice() {
    // Aurelia detects and updates DOM
    this.products.sort((a, b) => a.price - b.price);
  }
}
```

```html
<div repeat.for="product of products; key.bind: product.id">
  <h3>${product.name}</h3>
  <span class="price">${product.price | currency}</span>
</div>
```

### Sets

Useful for unique collections:

```typescript
export class TagManager {
  selectedTags = new Set(['javascript', 'typescript']);

  toggleTag(tag: string) {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }
  }
}
```

```html
<div repeat.for="tag of selectedTags">
  <span class="tag">${tag}</span>
</div>
```

### Maps

Perfect for key-value pairs:

```typescript
export class LocalizationDemo {
  translations = new Map([
    ['en', 'Hello'],
    ['es', 'Hola'],
    ['fr', 'Bonjour']
  ]);
}
```

```html
<!-- Destructure map entries -->
<div repeat.for="[language, greeting] of translations">
  <strong>${language}:</strong> ${greeting}
</div>

<!-- Or access as entry object -->
<div repeat.for="entry of translations">
  <strong>${entry[0]}:</strong> ${entry[1]}
</div>
```

### Number Ranges

Generate sequences quickly:

```html
<!-- Create pagination -->
<nav>
  <a repeat.for="page of totalPages"
     href="/products?page=${page + 1}">
    ${page + 1}
  </a>
</nav>

<!-- Star ratings -->
<div class="rating">
  <span repeat.for="star of 5"
        class="star ${star < rating ? 'filled' : ''}">
    ★
  </span>
</div>
```

## Advanced Patterns

### Destructuring Declarations

Extract multiple values in the repeat declaration:

```typescript
export class OrderHistory {
  orders = [
    { id: 1, items: [{ name: 'Coffee', qty: 2 }] },
    { id: 2, items: [{ name: 'Tea', qty: 1 }] }
  ];
}
```

```html
<!-- Destructure objects -->
<div repeat.for="{ id, items } of orders">
  Order #${id}: ${items.length} items
</div>

<!-- Destructure arrays -->
<div repeat.for="[index, value] of arrayOfPairs">
  ${index}: ${value}
</div>
```

### Integration with Other Template Controllers

**Conditional rendering within repeats:**
```html
<div repeat.for="user of users">
  <div if.bind="user.isActive">
    <strong>${user.name}</strong> - Active
  </div>
  <div else>
    <em>${user.name}</em> - Inactive
  </div>
</div>
```

**Nested conditionals and repeats:**
```html
<div repeat.for="category of categories">
  <h2>${category.name}</h2>
  <div if.bind="category.products.length > 0">
    <div repeat.for="product of category.products; key.bind: product.id">
      ${product.name}
    </div>
  </div>
  <p else>No products in this category</p>
</div>
```

### Working with Async Data

Handle loading states and async operations:

```typescript
export class AsyncDataExample {
  items: Item[] = [];
  isLoading = true;
  error: string | null = null;

  async attached() {
    try {
      this.items = await this.dataService.getItems();
    } catch (err) {
      this.error = err.message;
    } finally {
      this.isLoading = false;
    }
  }
}
```

```html
<div if.bind="isLoading">
  <spinner></spinner> Loading...
</div>

<div else>
  <div if.bind="error">
    <div class="error">Error: ${error}</div>
  </div>

  <div else>
    <div if.bind="items.length === 0">
      <p>No items found</p>
    </div>

    <div else>
      <div repeat.for="item of items; key.bind: item.id">
        ${item.name}
      </div>
    </div>
  </div>
</div>
```

### Complex Object Iteration

Use value converters for non-standard collections:

```typescript
// Object keys converter
export class KeysValueConverter {
  toView(obj: Record<string, any>): string[] {
    return obj ? Object.keys(obj) : [];
  }
}

// Object entries converter
export class EntriesValueConverter {
  toView(obj: Record<string, any>): [string, any][] {
    return obj ? Object.entries(obj) : [];
  }
}
```

```html
<!-- Iterate object keys -->
<div repeat.for="key of settings | keys">
  <label>${key}:</label>
  <input value.bind="settings[key]">
</div>

<!-- Iterate object entries -->
<div repeat.for="[key, value] of configuration | entries">
  <strong>${key}:</strong> ${value}
</div>
```

## Performance Best Practices

### Optimizing Large Lists

**Use keyed iteration:**
```html
<!-- Enables efficient DOM reuse -->
<div repeat.for="item of largeList; key.bind: item.id">
  ${item.name}
</div>
```

**Consider virtual scrolling for very large lists:**
```html
<!-- Use ui-virtualization for very large collecitons of items -->
<div virtual-repeat.for="item of hugeList">
  ${item.name}
</div>
```

This requires using the virtual repeat plugin.

### Memory Management

**Avoid memory leaks in complex scenarios:**
```typescript
export class ListComponent {
  private subscription?: IDisposable;

  attached() {
    // Subscribe to external data changes
    this.subscription = this.dataService.changes.subscribe(
      items => this.items = items
    );
  }

  detaching() {
    // Clean up subscriptions
    this.subscription?.dispose();
  }
}
```

## Custom Collection Handlers

### Built-in Handlers

Aurelia includes handlers for:
- **Arrays** (`Array`, `[]`)
- **Sets** (`Set`)
- **Maps** (`Map`)
- **Numbers** (`5` → creates range 0-4)
- **Array-like objects** (NodeList, HTMLCollection, etc.)
- **Null/undefined** (renders nothing)

### Creating Custom Handlers

For specialized collections:

```typescript
import { IRepeatableHandler, Registration } from 'aurelia';

// Custom handler for immutable lists
class ImmutableListHandler implements IRepeatableHandler {
  handles(value: unknown): boolean {
    return value && typeof value === 'object' && 'size' in value && 'get' in value;
  }

  iterate(value: any, func: (item: unknown, index: number) => void): void {
    for (let i = 0; i < value.size; i++) {
      func(value.get(i), i);
    }
  }
}

// Register the handler
Aurelia.register(
  Registration.singleton(IRepeatableHandler, ImmutableListHandler)
).app(MyApp).start();
```

### Observable Collections

Create reactive custom collections:

```typescript
import { CollectionObserver, ICollectionObserver } from '@aurelia/runtime';

class ReactiveCustomCollection {
  private _items: any[] = [];
  private _observer?: ICollectionObserver;

  get items() { return this._items; }

  add(item: any) {
    this._items.push(item);
    this._observer?.handleCollectionChange(/* change details */);
  }

  // Implement observable pattern...
}
```

## Troubleshooting Common Issues

### Issue: Changes Not Reflecting

**Problem:** Direct array index assignment doesn't trigger updates
```typescript
// This won't update the DOM
this.items[0] = newItem;
```

**Solution:** Use array methods or replace the array
```typescript
// These will update the DOM
this.items.splice(0, 1, newItem);
// or
this.items = [...this.items.slice(0, 0), newItem, ...this.items.slice(1)];
```

### Issue: Form State Lost on Reorder

**Problem:** Input values disappear when list is reordered
```html
<!-- No keys = DOM recreation -->
<div repeat.for="item of items">
  <input value.bind="item.name">
</div>
```

**Solution:** Use stable keys
```html
<!-- Keys preserve DOM elements -->
<div repeat.for="item of items; key.bind: item.id">
  <input value.bind="item.name">
</div>
```

### Issue: Performance with Large Lists

**Problem:** Slow rendering with 1000+ items

**Solutions:**
1. **Use virtual scrolling** for very large lists
2. **Implement pagination** or infinite scroll
3. **Optimize templates** - minimize complex expressions
4. **Use keys** to enable DOM reuse

### Issue: Memory Leaks

**Problem:** Components not disposing properly

**Solution:** Clean up in lifecycle hooks
```typescript
export class MyComponent {
  detaching() {
    // Dispose of subscriptions, timers, etc.
    this.cleanup();
  }
}
```

## Real-World Examples

### Dynamic Product Catalog

```typescript
export class ProductCatalog {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory = '';

  searchTermChanged() {
    this.filterProducts();
  }

  categoryChanged() {
    this.filterProducts();
  }

  private filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory ||
        product.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }
}
```

```html
<div class="filters">
  <input value.bind="searchTerm" placeholder="Search products...">
  <select value.bind="selectedCategory">
    <option value="">All Categories</option>
    <option repeat.for="category of categories"
            value.bind="category">${category}</option>
  </select>
</div>

<div class="product-grid">
  <div repeat.for="product of filteredProducts; key.bind: product.id"
       class="product-card">
    <img src.bind="product.image" alt.bind="product.name">
    <h3>${product.name}</h3>
    <p class="price">${product.price | currency}</p>
    <button click.trigger="addToCart(product)">Add to Cart</button>
  </div>
</div>

<div if.bind="filteredProducts.length === 0" class="no-results">
  No products found matching your criteria.
</div>
```

### Data Table with Sorting

```typescript
export class DataTable {
  data: TableRow[] = [];
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.data.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      const modifier = this.sortDirection === 'asc' ? 1 : -1;

      return aVal < bVal ? -modifier : aVal > bVal ? modifier : 0;
    });
  }
}
```

```html
<table class="data-table">
  <thead>
    <tr>
      <th repeat.for="column of columns"
          click.trigger="sort(column.key)"
          class="${sortColumn === column.key ? 'sorted ' + sortDirection : ''}">
        ${column.title}
        <span if.bind="sortColumn === column.key"
              class="sort-indicator">
          ${sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr repeat.for="row of data; key.bind: row.id">
      <td repeat.for="column of columns">
        ${row[column.key] | column.converter}
      </td>
    </tr>
  </tbody>
</table>
```

## TypeScript Integration

### Type-Safe Repeats

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export class UserList {
  users: User[] = [];

  // Type-safe filtering
  get activeUsers(): User[] {
    return this.users.filter(user => user.isActive);
  }

  // Type-safe operations
  toggleUserStatus(user: User): void {
    user.isActive = !user.isActive;
  }
}
```

```html
<!-- TypeScript provides intellisense and type checking -->
<div repeat.for="user of activeUsers; key.bind: user.id">
  <span>${user.name}</span> <!-- ✓ TypeScript knows user.name exists -->
  <span>${user.email}</span> <!-- ✓ Type safe -->
  <button click.trigger="toggleUserStatus(user)">
    ${user.isActive ? 'Deactivate' : 'Activate'}
  </button>
</div>
```
