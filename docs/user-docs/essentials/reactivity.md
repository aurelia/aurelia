# Reactivity

Aurelia's reactivity system automatically tracks changes to your data and updates the UI efficiently. Unlike frameworks that use virtual DOM, Aurelia observes your data directly and surgically updates only what has changed.

## When to Use Which Reactivity Feature?

Aurelia offers several reactivity tools. Here's how to choose:

### Use simple properties (no decorator) when:
- ✅ **You only need UI updates** - Properties bound in templates are automatically observed
- ✅ Most common case - Just declare the property and bind it
- ✅ Example: `todos: Todo[] = []` with `repeat.for="todo of todos"`

### Use getters (computed) when:
- ✅ **Value depends on other properties** and calculation is cheap
- ✅ Automatic dependency tracking - no manual configuration needed
- ✅ Example: `get fullName() { return this.firstName + ' ' + this.lastName; }`

### Use `@computed` decorator when:
- ✅ **Expensive calculations** that should be cached
- ✅ You want to **explicitly control dependencies** (not automatic)
- ✅ Deep observation needed for nested objects
- ✅ Example: Complex filtering, heavy aggregations

### Use `@astTracked` decorator when:
- ✅ **The method** decorated should perform tracking when used in the template
- ✅ You want to **simplify** change tracking for template
- ✅ Deep observation needed for nested objects
- ✅ Example: Complex filtering, heavy aggregations

### Use `@observable` when:
- ✅ **You need to run code** when a property changes (side effects)
- ✅ You want the `propertyChanged(newValue, oldValue)` callback
- ✅ Examples: Validation, analytics tracking, syncing data

### Use `watch()` when:
- ✅ **Complex expressions** - watching multiple properties or nested values
- ✅ Need more flexibility than `@observable`
- ✅ Examples: `@watch('user.address.city')`, `@watch(vm => vm.total > 100)`

### Use manual observation when:
- ✅ Building **libraries or advanced features**
- ✅ Need **fine-grained control** over subscription lifecycle
- ✅ Performance critical code requiring optimization

## Automatic Change Detection

Aurelia automatically observes properties that are bound in your templates. No decorators or special setup required:

```typescript
export class TodoApp {
  todos: Todo[] = [];
  filter: string = 'all';

  addTodo(text: string) {
    // UI updates automatically when todos changes
    this.todos.push({ id: Date.now(), text, completed: false });
  }

  removeTodo(index: number) {
    // UI updates automatically
    this.todos.splice(index, 1);
  }
}
```

```html
<div>
  <h2>Todos (${todos.length})</h2>
  <input value.bind="filter" placeholder="Filter todos">
  <ul>
    <li repeat.for="todo of todos" if.bind="shouldShow(todo)">
      ${todo.text}
      <button click.trigger="removeTodo($index)">Remove</button>
    </li>
  </ul>
</div>
```

The `${todos.length}`, `value.bind="filter"`, and `repeat.for="todo of todos"` create automatic observation - Aurelia tracks changes to these properties and updates the UI accordingly.

## Computed Properties

Getter properties automatically become reactive when their dependencies change:

```typescript
export class ShoppingCart {
  items: CartItem[] = [];
  
  get total() {
    // This computed property automatically updates when items change
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get itemCount() {
    // Also reactive - updates when items array changes
    return this.items.length;
  }

  addItem(product: Product, quantity: number = 1) {
    // UI updates automatically for total, itemCount, and items display
    this.items.push({ ...product, quantity });
  }
}
```

```html
<div class="cart">
  <h3>Cart (${itemCount} items)</h3>
  <div repeat.for="item of items" class="cart-item">
    <span>${item.name}</span>
    <span>$${item.price} x ${item.quantity}</span>
  </div>
  <div class="total">Total: $${total}</div>
</div>
```

### Decorator `computed`

For some reason, it's more preferrable to specify dependencies of a getter manually, rather than automatically tracked on read,
you can use the decorator `@computed` to declare the dependencies, like the following example:

```ts
import { computed } from 'aurelia';

export class ShoppingCart {
  items: CartItem[] = [];

  // we only care when there's a change in the number of items
  // but not when the price or quantity of each item changes
  @computed('items.length')
  get total() {
    // This computed property automatically updates when items change
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // other code ...
}
```

You can also specify multiple properties as dependencies, like the following example:

```ts
import { computed } from 'aurelia';

export class ShoppingCart {
  items: CartItem[] = [];
  gst = .1;

  // we only care when there's a change in the number of items
  // but not when the price or quantity of each item changes
  @computed('items.length', 'gst')
  get total() {
    // This computed property automatically updates when items change
    return this.items.reduce((sum, item) => sum + (item.price * this.tax * item.quantity), 0);
  }

  get tax() {
    return 1 + this.gst;
  }

  // other code ...
}
```

Basides the above basic usages, the `computed` decorator also supports a few more options, depending on the needs of an application.

#### Decorator `astTracked`

When you want to call a method from the template (not a getter) and still want to have Aurelia track the properties read inside that method, use `@astTracked`. It marks the method so the binding system records all property reads during the call and reevaluate the template expression to update the view when any of those dependencies change.

Use `useProxy: true` when you want perform automatic track on read using Aurelia proxy observation. Both the `this` context and the arguments passed to the function call will be wrapped in proxies.

```ts
import { astTracked } from 'aurelia';

export class ProductList {
  filter = '';
  products: Product[] = [];

  @astTracked({ useProxy: true })
  matches(product: Product) {
    return product.name.includes(this.filter);
  }
}
```

```html
<ul>
  <li repeat.for="p of products" if.bind="matches(p)">
    ${p.name}
  </li>
</ul>
```

What's tracked:
- `name` of each product
- `filter` on the `ProductList` component

> [!NOTE]
> Only observation through proxy is supported at the moment, more convinient APIs may be enabled in the futures.

#### Flush timing with `flush`

Like how you can specify flush mode of computed getter with `@computed({ flush: 'sync' })`, flush mode of `@computed` can also be done in a similar way,
like the following example:

```ts
import { computed } from 'aurelia';

export class ShoppingCart {
  items: CartItem[] = [];
  gst = .1;

  // we only care when there's a change in the number of items, or gst
  // but not when the price or quantity of each item changes
  @computed({
    deps: ['items.length', 'gst'],
    flush: 'sync'
  })
  get total() {
    // This computed property automatically updates when items change
    return this.items.reduce((sum, item) => sum + (item.price * this.tax * item.quantity), 0);
  }

  get tax() {
    return 1 + this.gst;
  }

  // other code ...
}
```

#### Deep observation with `deep`

Sometimes you also want to automatically observe all properties of an object recursively, regardless at what level, `deep` option on the `@computed` decorator
can be used to achieve this goal, like the following example:

```ts
import { computed } from 'aurelia';

export class ShoppingCart {
  _cart = {
    items: [],
    gst: 0.1,
  }

  // we care about any changes inside cart items, or gst
  @computed({
    deps: ['_cart'],
    deep: true,
  })
  get total() {
    // This computed property automatically updates when items change
    return this._cart.items.reduce((sum, item) => sum + (item.price * this._cart.gst * item.quantity), 0);
  }

  get tax() {
    return 1 + this.gst;
  }

  // other code ...
}
```

Now whenever `_cart.items[].price` or `_cart.items[].quantity` (or whatever else properties on each element in the `items` array),
or `_cart.gst` changes, the `total` is considered dirty.

> [!WARNING]
> `deep` observation doesn't observe non-existent properties, which means newly added properties won't trigger any changes notification. Replace the entire object instead.

## Deep Observation

Aurelia can observe nested object changes:

```typescript
export class UserProfile {
  user = {
    name: 'John Doe',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      country: 'USA'
    },
    preferences: {
      theme: 'dark',
      notifications: true
    }
  };

  updateAddress(newAddress: Partial<Address>) {
    // Nested property changes are automatically detected
    Object.assign(this.user.address, newAddress);
  }
}
```

## Array Observation

Arrays are automatically observed for mutations:

```typescript
export class TaskList {
  tasks: Task[] = [];

  addTask(task: Task) {
    this.tasks.push(task); // Automatically triggers UI update
  }

  completeTask(index: number) {
    this.tasks[index].completed = true; // Property change observed
  }

  removeTasks(indices: number[]) {
    // Multiple array changes batched into single UI update
    indices.sort((a, b) => b - a).forEach(index => {
      this.tasks.splice(index, 1);
    });
  }
}
```

## When You Need @observable

The `@observable` decorator is only needed when you want to react to property changes in your view-model code (not just the template):

```typescript
import { observable } from 'aurelia';

export class UserProfile {
  @observable userName: string = '';

  // This method is called whenever userName changes
  userNameChanged(newValue: string, oldValue: string) {
    console.log(`Username changed from ${oldValue} to ${newValue}`);
    this.validateUsername(newValue);
  }

  private validateUsername(name: string) {
    // Perform validation when username changes
  }
}
```

```html
<!-- userName is still automatically observed for template updates -->
<input value.bind="userName">
<p>Hello, ${userName}!</p>
```

## Effect Observation

Create side effects that run when observed data changes:

```typescript
import { watch } from 'aurelia';

export class Analytics {
  currentPage: string = '/';
  user: User | null = null;

  constructor() {
    // Watch properties and react to changes
    watch(() => this.currentPage, (newPage) => {
      this.trackPageView(newPage);
    });

    watch(() => this.user, (newUser, oldUser) => {
      if (oldUser) this.trackUserLogout(oldUser);
      if (newUser) this.trackUserLogin(newUser);
    });
  }

  private trackPageView(page: string) {
    console.log(`Page view: ${page}`);
  }
}
```

## Manual Observation Control

For advanced scenarios, manually control observation:

```typescript
import { resolve } from '@aurelia/kernel';
import { IObserverLocator } from '@aurelia/runtime';

export class AdvancedComponent {
  private observerLocator = resolve(IObserverLocator);
  data = { value: 0 };

  attached() {
    // Manually observe a property
    const observer = this.observerLocator.getObserver(this.data, 'value');
    observer.subscribe((newValue, oldValue) => {
      console.log(`Value changed: ${oldValue} -> ${newValue}`);
    });
  }
}
```

## Performance Considerations

Aurelia's observation is highly optimized:

- **Batched Updates**: Multiple changes are batched into single DOM updates
- **Surgical Updates**: Only changed elements are updated, not entire component trees
- **Smart Detection**: Observes only bound properties, not entire objects
- **No Virtual DOM**: Direct DOM manipulation eliminates virtual DOM overhead

## Common Reactivity Patterns

### Pattern: Form Validation with @observable

**Use case**: Validate input as the user types, show errors immediately.

```typescript
import { observable } from 'aurelia';

export class RegistrationForm {
  @observable email: string = '';
  @observable password: string = '';

  emailError: string = '';
  passwordError: string = '';

  emailChanged(newValue: string) {
    // Run validation whenever email changes
    if (!newValue) {
      this.emailError = 'Email is required';
    } else if (!newValue.includes('@')) {
      this.emailError = 'Please enter a valid email';
    } else {
      this.emailError = '';
    }
  }

  passwordChanged(newValue: string) {
    if (newValue.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
    } else {
      this.passwordError = '';
    }
  }

  get isValid(): boolean {
    return !this.emailError && !this.passwordError && this.email && this.password;
  }
}
```

```html
<form>
  <input value.bind="email" type="email" placeholder="Email">
  <span class="error" if.bind="emailError">${emailError}</span>

  <input value.bind="password" type="password" placeholder="Password">
  <span class="error" if.bind="passwordError">${passwordError}</span>

  <button disabled.bind="!isValid" click.trigger="submit()">Register</button>
</form>
```

**Why this works**: `@observable` triggers validation automatically as users type. The `isValid` getter recomputes whenever errors change, enabling/disabling the submit button reactively.

### Pattern: Computed Filtering and Sorting

**Use case**: Filter and sort a list based on user input without re-fetching data.

```typescript
import { observable } from 'aurelia';

export class ProductCatalog {
  products: Product[] = [];

  @observable searchQuery: string = '';
  @observable sortBy: 'name' | 'price' = 'name';
  @observable maxPrice: number = 1000;

  get filteredProducts(): Product[] {
    // Automatically recomputes when searchQuery, maxPrice, or products change
    return this.products
      .filter(p =>
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
        p.price <= this.maxPrice
      )
      .sort((a, b) => {
        if (this.sortBy === 'price') {
          return a.price - b.price;
        }
        return a.name.localeCompare(b.name);
      });
  }

  get resultCount(): number {
    return this.filteredProducts.length;
  }

  async binding() {
    const response = await fetch('/api/products');
    this.products = await response.json();
  }
}
```

```html
<div class="catalog">
  <input value.bind="searchQuery" placeholder="Search products...">

  <select value.bind="sortBy">
    <option value="name">Sort by Name</option>
    <option value="price">Sort by Price</option>
  </select>

  <input type="range" min="0" max="1000" value.bind="maxPrice">
  <span>Max: $${maxPrice}</span>

  <p>${resultCount} products found</p>

  <div repeat.for="product of filteredProducts" class="product-card">
    <h3>${product.name}</h3>
    <p>$${product.price}</p>
  </div>
</div>
```

**Why this works**: The `filteredProducts` getter automatically recomputes when any dependency changes. No manual refresh needed - the UI stays in sync with filters.

### Pattern: Syncing Data with @watch

**Use case**: Keep related data in sync, like saving to localStorage or syncing with a server.

```typescript
import { watch, observable } from 'aurelia';
import { resolve } from '@aurelia/kernel';
import { ILogger } from '@aurelia/kernel';

export class DraftEditor {
  private logger = resolve(ILogger);

  @observable content: string = '';
  @observable title: string = '';

  lastSaved: Date | null = null;
  isSaving: boolean = false;

  constructor() {
    // Load from localStorage on startup
    this.content = localStorage.getItem('draft-content') || '';
    this.title = localStorage.getItem('draft-title') || '';
  }

  // Watch for changes and auto-save
  @watch('content')
  @watch('title')
  async contentChanged() {
    if (this.isSaving) return;

    this.isSaving = true;
    try {
      // Save to localStorage immediately
      localStorage.setItem('draft-content', this.content);
      localStorage.setItem('draft-title', this.title);

      // Debounced server sync (implement as needed)
      await this.syncToServer();

      this.lastSaved = new Date();
      this.logger.debug('Draft saved');
    } finally {
      this.isSaving = false;
    }
  }

  private async syncToServer() {
    // Sync to server with debouncing
  }
}
```

```html
<div class="editor">
  <input value.bind="title" placeholder="Title">
  <textarea value.bind="content" placeholder="Start writing..."></textarea>

  <div class="status">
    <span if.bind="isSaving">Saving...</span>
    <span if.bind="lastSaved && !isSaving">
      Saved at ${lastSaved.toLocaleTimeString()}
    </span>
  </div>
</div>
```

**Why this works**: `@watch` observes both `content` and `title`, automatically saving changes. The pattern prevents data loss and provides user feedback.

### Pattern: Dependent Computations

**Use case**: Chain computed properties where one depends on another.

```typescript
export class OrderSummary {
  items: OrderItem[] = [];

  @observable discountCode: string = '';
  @observable taxRate: number = 0.08;

  get subtotal(): number {
    return this.items.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0
    );
  }

  get discount(): number {
    // Depends on subtotal and discountCode
    if (this.discountCode === 'SAVE10') {
      return this.subtotal * 0.1;
    }
    if (this.discountCode === 'SAVE20') {
      return this.subtotal * 0.2;
    }
    return 0;
  }

  get afterDiscount(): number {
    // Depends on subtotal and discount
    return this.subtotal - this.discount;
  }

  get tax(): number {
    // Depends on afterDiscount and taxRate
    return this.afterDiscount * this.taxRate;
  }

  get total(): number {
    // Final total depends on afterDiscount and tax
    return this.afterDiscount + this.tax;
  }
}
```

```html
<div class="order-summary">
  <p>Subtotal: $${subtotal.toFixed(2)}</p>

  <input value.bind="discountCode" placeholder="Discount code">
  <p if.bind="discount > 0" class="discount">
    Discount: -$${discount.toFixed(2)}
  </p>

  <p>Tax (${(taxRate * 100).toFixed(0)}%): $${tax.toFixed(2)}</p>

  <p class="total">Total: $${total.toFixed(2)}</p>
</div>
```

**Why this works**: Computed properties automatically form a dependency chain. When `subtotal` changes, `discount` updates, which updates `afterDiscount`, then `tax`, and finally `total`. All cascade automatically.

### Pattern: Optimized List Updates with @computed

**Use case**: Expensive computations on large lists that should only recalculate when necessary.

```typescript
import { computed } from 'aurelia';

export class DataAnalytics {
  dataPoints: DataPoint[] = []; // Large array

  @observable dateRange: DateRange;
  @observable selectedMetric: string = 'sales';

  // Only recalculate when dependencies actually change
  @computed('dataPoints.length', 'dateRange', 'selectedMetric')
  get filteredData(): DataPoint[] {
    console.log('Filtering data (expensive)');

    return this.dataPoints.filter(point =>
      point.date >= this.dateRange.start &&
      point.date <= this.dateRange.end &&
      point.metric === this.selectedMetric
    );
  }

  @computed('filteredData.length')
  get statistics(): Statistics {
    console.log('Computing statistics (expensive)');

    const values = this.filteredData.map(d => d.value);
    return {
      mean: this.mean(values),
      median: this.median(values),
      stdDev: this.standardDeviation(values)
    };
  }

  // Heavy computation methods
  private mean(values: number[]): number { /* ... */ }
  private median(values: number[]): number { /* ... */ }
  private standardDeviation(values: number[]): number { /* ... */ }
}
```

**Why this works**: `@computed` with explicit dependencies prevents unnecessary recalculations. Changing individual data point properties won't trigger recalculation - only changes to array length, date range, or metric do.

## Best Practices

### Choose the Right Tool
- ✅ **Start simple** - Use plain properties and getters first
- ✅ Add `@observable` only when you need side effects
- ✅ Use `@computed` for expensive operations, not simple getters
- ❌ Don't over-engineer - most scenarios don't need `@watch` or manual observation

### Keep Computations Pure
- ✅ Computed getters should have no side effects
- ✅ Same inputs should always produce same outputs
- ❌ Don't modify state inside getters
- ❌ Don't make API calls in computed properties

### Optimize Performance
- ✅ Use `@computed` with explicit dependencies for expensive calculations
- ✅ Debounce rapid changes (user input, scroll events)
- ✅ Batch related updates together
- ❌ Don't create unnecessary watchers

### Handle Async Operations
- ✅ Use `@watch` or `propertyChanged` callbacks for async side effects
- ✅ Track loading states during async operations
- ✅ Handle errors gracefully
- ❌ Don't make computed properties async

## What's Next

- Learn about [observing property changes](../getting-to-know-aurelia/observation/observing-property-changes-with-observable.md) in detail
- Explore [effect observation](../getting-to-know-aurelia/observation/effect-observation.md) for advanced reactive patterns
- Understand [watching data](../getting-to-know-aurelia/watching-data.md) strategies
