---
description: >-
  Watch data changes reactively with the @watch decorator. Support for properties, 
  expressions, and computed values with automatic dependency tracking.
---

# Watching Data

The `@watch` decorator enables reactive programming in Aurelia by automatically responding to changes in your view model properties or computed expressions. When data changes, your callback is invoked with the new and old values.

```typescript
import { watch } from '@aurelia/runtime-html';

class UserProfile {
  firstName = 'John';
  lastName = 'Doe';

  @watch('firstName')
  nameChanged(newName, oldName) {
    console.log(`Name changed from ${oldName} to ${newName}`);
  }
}
```

Watchers activate after the `binding` lifecycle and deactivate before `unbinding`, so changes during component initialization or cleanup won't trigger callbacks.

## Two Ways to Use @watch

| Name                         | Type                          | Description                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expressionOrPropertyAccessFn` | `string` or `IPropertyAccessFn` | Specifies the value to watch. When a string is provided, it is used as an expression (similar to Aurelia templating). When a function is provided, it acts as a computed getter that returns the value to observe.                                                                          |
| `changeHandlerOrCallback`      | `string` or `IWatcherCallback`  | Optional. The callback invoked when the watched value changes. If a string is provided, it is used to resolve a method name (resolved only once, so subsequent changes to the method are not tracked). If a function is provided, it is called with three parameters: new value, old value, and the instance. |
| `options`                      | `IWatchOptions`               | Optional. Configuration options for the watcher, including flush timing control.                                                                                                                                                                                                              |

### Watch Options

The `options` parameter accepts an `IWatchOptions` object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `flush` | `'async'` \| `'sync'` | `'async'` | Controls when the watcher callback is executed. `'async'` (default) defers execution to the next microtask, while `'sync'` executes immediately. |

---

**Method Decorator** (most common):
```typescript
class UserSettings {
  @watch('theme')
  themeChanged(newTheme, oldTheme) {
    document.body.className = `theme-${newTheme}`;
  }
}
```

**Class Decorator** (with separate callback):
```typescript
@watch('status', (newStatus, oldStatus, vm) => vm.updateUI(newStatus))
class OrderTracker {
  status = 'pending';
  
  updateUI(status) {
    // Update UI based on status
  }
}
```

## What You Can Watch

### Simple Properties
```typescript
class Product {
  price = 100;
  
  @watch('price') 
  priceChanged(newPrice, oldPrice) {
    if (newPrice > oldPrice) {
      this.showPriceIncreaseWarning();
    }
  }
}
```

### Nested Properties
```typescript
class ShoppingCart {
  user = { preferences: { currency: 'USD' } };
  
  @watch('user.preferences.currency')
  currencyChanged(newCurrency) {
    this.recalculatePrices(newCurrency);
  }
}
```

### Array Properties
```typescript
class TodoList {
  todos = [];
  
  @watch('todos.length')
  todoCountChanged(newCount, oldCount) {
    this.updateCounter(newCount);
    if (newCount === 0) {
      this.showEmptyState();
    }
  }
}
```

### Symbol Properties
```typescript
class AdvancedComponent {
  [Symbol.for('internal-state')] = 'hidden';
  
  @watch(Symbol.for('internal-state'))
  internalStateChanged(newValue) {
    console.log('Internal state changed:', newValue);
  }
}
```

### Numeric Property Keys
```typescript
class IndexedComponent {
  0 = 'first';
  1 = 'second';
  
  @watch(0)  // Watch numeric property
  firstChanged(value) {
    this.updateDisplay(value);
  }
}
```

---

## Computed Watchers

When you need to watch multiple properties or complex expressions, use a computed function that returns the value to observe:

```typescript
class ProfileCard {
  firstName = 'John';
  lastName = 'Doe';
  title = 'Developer';

  @watch(profile => `${profile.firstName} ${profile.lastName}`)
  fullNameChanged(newFullName, oldFullName) {
    this.updateDisplayName(newFullName);
  }

  @watch(profile => profile.firstName && profile.lastName && profile.title)
  isCompleteChanged(isComplete) {
    this.toggleCompleteStatus(isComplete);
  }
}
```

The computed function receives your view model as its first parameter. Aurelia automatically tracks which properties your function accesses and will re-run it when any of those properties change.

### Complex Computed Example

```typescript
class TaskManager {
  tasks = [];
  filter = 'all'; // 'all', 'completed', 'pending'

  @watch(vm => vm.tasks.filter(task => 
    vm.filter === 'all' || 
    (vm.filter === 'completed' && task.done) ||
    (vm.filter === 'pending' && !task.done)
  ).length)
  filteredCountChanged(count) {
    this.updateCountDisplay(count);
  }
}
```

This watcher automatically re-runs when:
- Items are added/removed from `tasks`
- The `done` property changes on any task
- The `filter` property changes

## Real-World Examples

### API Data Synchronization
```typescript
class WeatherWidget {
  location = 'New York';
  weatherData = null;
  
  @watch('location')
  async locationChanged(newLocation) {
    if (newLocation) {
      this.weatherData = await this.fetchWeather(newLocation);
    }
  }
}
```

### Form Validation
```typescript
class RegistrationForm {
  email = '';
  password = '';
  confirmPassword = '';
  
  @watch(form => form.password === form.confirmPassword)
  passwordsMatchChanged(passwordsMatch) {
    this.showPasswordError = !passwordsMatch && this.confirmPassword.length > 0;
  }
  
  @watch('email')
  emailChanged(newEmail) {
    this.emailValid = this.validateEmail(newEmail);
  }
}
```

### State Management
```typescript
class ShoppingCart {
  items = [];
  discount = 0;
  
  @watch(cart => cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  subtotalChanged(subtotal) {
    this.subtotal = subtotal;
    this.total = subtotal - (subtotal * this.discount / 100);
  }
  
  @watch('discount')
  discountChanged() {
    // Recalculate total when discount changes
    this.subtotalChanged(this.subtotal);
  }
}
```

### Dynamic UI Updates
```typescript
class MediaPlayer {
  currentTime = 0;
  duration = 0;
  
  @watch(player => player.currentTime / player.duration * 100)
  progressChanged(percentage) {
    this.updateProgressBar(percentage);
  }
  
  @watch('currentTime')
  timeChanged(time) {
    this.updateTimeDisplay(this.formatTime(time));
  }
}
```

## Watcher Lifecycle

Watchers follow component lifecycle and only respond to changes when the component is properly bound:

| Lifecycle Phase | Watcher Active? | Example |
|-----------------|-----------------|---------|
| `binding` | ❌ No | Setup code won't trigger watchers |
| `bound` → `detaching` | ✅ Yes | All changes trigger callbacks |
| `unbinding` | ❌ No | Cleanup code won't trigger watchers |

```typescript
class DataManager {
  items = [];
  
  @watch('items.length')
  itemCountChanged(count) {
    console.log('Items count:', count);
  }
  
  binding() {
    // This won't trigger the watcher
    this.items.push({ id: 1, name: 'Initial item' });
  }
  
  bound() {
    // This WILL trigger the watcher
    this.items.push({ id: 2, name: 'Added after bound' });
    // Console output: "Items count: 2"
  }
  
  unbinding() {
    // This won't trigger the watcher
    this.items.length = 0;
  }
}
```

This lifecycle integration prevents watchers from firing during component initialization and cleanup, avoiding unwanted side effects.

## Flush Modes

Control when watcher callbacks execute with flush modes:

```typescript
class PerformanceMonitor {
  // Default: 'async' - deferred to next microtask (recommended)
  @watch('cpuUsage')
  updateCpuDisplay(usage) {
    this.cpuChart.update(usage);
  }
  
  // 'sync' - immediate execution (use sparingly)
  @watch('criticalError', { flush: 'sync' })
  handleCriticalError(error) {
    if (error) {
      this.emergencyShutdown();
    }
  }
}
```

**Async (Default):** Batches multiple changes and executes callbacks asynchronously. Prevents infinite loops and improves performance.

**Sync:** Executes callbacks immediately. Use only when you need instant feedback or in testing scenarios.

## Manual Watcher Classes

The decorator syntax is sugar over two exported classes: `ComputedWatcher` (getter-based) and `ExpressionWatcher` (template expression–based). Creating them directly is handy when you are writing tooling, want to observe arbitrary objects, or need to opt in/out of watching at runtime.

### `ComputedWatcher`

```typescript
import { ComputedWatcher } from '@aurelia/runtime-html';
import { IObserverLocator } from '@aurelia/runtime';
import { resolve } from '@aurelia/kernel';

export class MetricsPanel {
  measurements = [];
  total = 0;

  private readonly observerLocator = resolve(IObserverLocator);
  private readonly totalWatcher = new ComputedWatcher(
    this, // object whose properties are read
    this.observerLocator,
    vm => vm.measurements.reduce((sum, m) => sum + m.value, 0),
    (newTotal) => { this.total = newTotal; },
    'sync' // flush immediately so charts do not lag behind
  );

  binding() {
    this.totalWatcher.bind();
  }

  unbinding() {
    this.totalWatcher.unbind();
  }
}
```

- Pass the object you want to observe as the first argument.
- The getter runs inside Aurelia's dependency tracker; any property you touch becomes a dependency.
- Always call `unbind()` (for example, during the `unbinding` lifecycle) so observers are released.

### `ExpressionWatcher`

`ExpressionWatcher` observes a parsed Aurelia expression, making it ideal for runtime-configurable dashboards or devtools.

```typescript
import { ExpressionWatcher } from '@aurelia/runtime-html';
import { IExpressionParser, ExpressionType, IObserverLocator, Scope } from '@aurelia/runtime';
import { IContainer, resolve } from '@aurelia/kernel';

export class RouteProbe {
  private readonly parser = resolve(IExpressionParser);
  private readonly observerLocator = resolve(IObserverLocator);
  private readonly locator = resolve(IContainer);
  private watcher?: ExpressionWatcher;

  binding(_initiator: unknown, scope: Scope) {
    const expression = this.parser.parse('currentRoute.path', ExpressionType.IsProperty);
    this.watcher = new ExpressionWatcher(
      scope,
      this.locator,
      this.observerLocator,
      expression,
      (path: string) => console.debug('Route changed:', path),
      'async'
    );
    this.watcher.bind();
  }

  unbinding() {
    this.watcher?.unbind();
  }
}
```

Because watchers are plain classes, you can create them inside services or diagnostics tooling as well. The only requirements are an `IObserverLocator`, an `IServiceLocator` (usually `IContainer`), and manual lifecycle management.

## How Dependency Tracking Works

Aurelia uses transparent proxy-based observation. When your computed function runs, it automatically tracks every property you access:

```typescript
class TeamStats {
  players = [];
  
  @watch(team => {
    // Aurelia automatically tracks:
    // - team.players (array reference)  
    // - team.players.length (when .filter() iterates)
    // - player.isActive for each player
    return team.players.filter(player => player.isActive).length;
  })
  activeCountChanged(count) {
    this.updateDisplay(count);
  }
}
```

The watcher re-runs whenever:
- The `players` array changes (items added/removed)
- Any player's `isActive` property changes
- You replace the entire `players` array

### Manual Dependency Registration

In environments without proxy support, you receive a second parameter to manually register dependencies:

```typescript
class LegacyBrowser {
  items = [];
  
  @watch((vm, watcher) => {
    // Manually register what properties to observe
    watcher.observe(vm, 'firstName');
    watcher.observe(vm, 'lastName');
    watcher.observeCollection(vm.items); // For arrays, Maps, Sets
    return `${vm.firstName} ${vm.lastName}`;
  })
  nameChanged(fullName) {
    this.updateDisplay(fullName);
  }
}
```

The watcher parameter provides:
- `observe(obj, key)` - Watch a property
- `observeCollection(collection)` - Watch arrays, Maps, or Sets

## Callback Signature Details

All watch callbacks receive three parameters:

```typescript
class CallbackExample {
  name = 'John';
  
  @watch('name')
  nameChanged(newValue, oldValue, viewModel) {
    console.log('New:', newValue);      // The new value
    console.log('Old:', oldValue);      // The previous value  
    console.log('VM:', viewModel);      // Reference to this instance
    console.log('Context:', this);      // Also points to this instance
  }
}
```

### Class Decorator with Callback Function
```typescript
@watch('status', function(newVal, oldVal, vm) {
  // 'this' refers to the component instance
  this.updateStatusIcon(newVal);
  
  // 'vm' is also the component instance (same as 'this')
  vm.logStatusChange(newVal, oldVal);
})
class StatusComponent {
  status = 'idle';
}
```

### Method Name as String Callback
```typescript
@watch('theme', 'handleThemeChange')
class ThemeManager {
  theme = 'light';
  
  handleThemeChange(newTheme, oldTheme, vm) {
    // Method is resolved once at class definition time
    console.log(`Theme changed from ${oldTheme} to ${newTheme}`);
  }
}
```

> **Important**: When using method name strings, the method is resolved only once when the class is defined. Dynamically changing the method later won't affect the watcher.

## Best Practices

### ✅ Do's

**Keep computed functions pure:**
```typescript
// Good - just return a value
@watch(user => `${user.first} ${user.last}`)
displayNameChanged(name) { 
  this.updateUI(name); 
}
```

**Use descriptive callback names:**
```typescript
class ProductList {
  @watch('searchTerm')
  searchTermChanged(term) { /* clear */ }
  
  @watch(vm => vm.items.filter(i => i.inStock).length)
  availableItemsCountChanged(count) { /* update */ }
}
```

**Prefer method decorators over class decorators:**
```typescript
// Preferred - cleaner and more intuitive
class Settings {
  @watch('theme')
  themeChanged(newTheme) {
    this.applyTheme(newTheme);  
  }
}
```

### ❌ Don'ts  

**Don't mutate data in computed functions:**
```typescript
// Wrong - causes infinite loops
@watch(vm => vm.counter++) // Don't increment here!
counterChanged() {}

// Wrong - mutating arrays
@watch(vm => vm.items.push(newItem)) // Don't modify here!
itemsChanged() {}
```

**Don't use async functions:**
```typescript
// Wrong - dependency tracking breaks
@watch(async vm => await vm.fetchData())
dataChanged() {}

// Right - handle async in the callback
@watch('dataId')
async dataIdChanged(id) {
  this.data = await this.fetchData(id);
}
```

**Don't create infinite loops:**
```typescript
class Counter {
  count = 0;
  
  @watch('count')
  countChanged(newCount) {
    // Wrong - this creates an infinite loop!
    this.count = newCount + 1;
  }
}
```

### Performance Tips

- Use `{ flush: 'async' }` (default) for better performance
- Avoid deeply nested property access in hot paths
- Consider debouncing expensive operations:

```typescript
class SearchComponent {
  searchTerm = '';
  
  @watch('searchTerm')
  searchChanged(term) {
    // Debounce expensive search operations
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch(term);
    }, 300);
  }
}
```

## Common Errors and Troubleshooting

### 1. Choose the Right Flush Mode

### 2. Avoid Mutating Dependencies in Computed Getters

```typescript
// Use async flush (default) for most cases
@watch('data', { flush: 'async' })
onDataChange(newData) {
  // Safe for most DOM updates and side effects
  this.processData(newData);
}

// Use sync flush for immediate DOM updates
@watch('scrollPosition', { flush: 'sync' })
onScrollChange(position) {
  // Immediate DOM update to prevent layout thrashing
  this.updateScrollIndicator(position);
}

### 2. Optimize Complex Expressions

```typescript
// ✅ Good: Simple, focused watchers
@watch('user.name')
onNameChange(name) { /* ... */ }

// ⚠️ Caution: Complex computation
@watch(vm => vm.items.filter(i => i.active).map(i => i.name).join(', '))
onActiveNamesChange(names) { /* ... */ }

// ✅ Better: Break into smaller watchers
@watch(vm => vm.items.filter(i => i.active))
onActiveItemsChange(items) {
  this.activeNames = items.map(i => i.name).join(', ');
}
```

### 3. Understand Collection Observation

```typescript
// ✅ Observable: Array query methods
@watch(vm => vm.items.find(i => i.selected))
@watch(vm => vm.items.filter(i => i.active).length)
@watch(vm => vm.items.some(i => i.hasError))

// ✅ Observable: Map/Set operations
@watch(vm => vm.settings.get('theme'))
@watch(vm => vm.categories.has('work'))
@watch(vm => vm.collection.size)

// ❌ Not directly observable: Mutation methods
// (but they trigger watchers that observe content/length)
addItem(item) { this.items.push(item); }
```

### 4. Avoid Mutating Dependencies in Computed Getters

Do not alter properties or collections when returning a computed value:
```typescript
// ❌ This will throw AUR0773
@watch('counter', 'nonExistentMethod')
class App {
  counter = 0;
  // Method name doesn't exist!
}

// ✅ Fix: Use correct method name
@watch('counter', 'counterChanged')  
class App {
  counter = 0;
  counterChanged(newValue) { /* ... */ }
}
```

### 5. Be Cautious with Object Identity

### Error: AUR0774 - Static Method Decoration
```typescript
// ❌ This will throw AUR0774
class App {
  @watch('counter')
  static handleChange() { /* ... */ }
}
```

// ✅ Fix: Use instance methods only
class App {
  @watch('counter') 
  handleChange() { /* ... */ }
}
```

### Error: AUR0772 - Null/Undefined Expression
```typescript
// ❌ This will throw AUR0772
@watch(null)
nullHandler() { /* ... */ }

@watch(undefined)
undefinedHandler() { /* ... */ }

// ✅ Fix: Provide valid expression
@watch('validProperty')
validHandler() { /* ... */ }
```

### Computed Function Errors
When computed functions throw errors, callbacks won't execute:

```typescript
class DataProcessor {
  data = null;
  
  @watch(vm => vm.data.length) // Throws if data is null
  dataLengthChanged(length) {
    // This won't be called if getter throws
    console.log('Length:', length);
  }
  
  // ✅ Better: Guard against null
  @watch(vm => vm.data?.length ?? 0)
  safeLengthChanged(length) {
    console.log('Safe length:', length);
  }
}
```

### 6. Do Not Return Promises or Async Functions

### Circular Dependencies
Avoid modifying watched properties in their own callbacks:

```typescript
class ProblematicCounter {
  count = 0;
  
  @watch('count')
  countChanged(newCount) {
    // ❌ Creates infinite loop!
    this.count = newCount + 1;
  }
}
```

---

## Advanced Watch Patterns

### Deep Object Observation

The `@watch` decorator can observe deeply nested properties and complex expressions:

```typescript
import { watch } from '@aurelia/runtime-html';

interface Address {
  street: string;
  city: string;
  primary: boolean;
}

interface Person {
  name: string;
  addresses: Address[];
  profile: {
    avatar: string;
    bio: string;
  };
}

class UserProfile {
  person: Person = {
    name: 'John',
    addresses: [
      { street: '123 Main St', city: 'Boston', primary: true },
      { street: '456 Oak Ave', city: 'Cambridge', primary: false }
    ],
    profile: {
      avatar: 'default.png',
      bio: 'Software developer'
    }
  };

  // Watch for changes to the primary address street name
  @watch((user: UserProfile) => user.person.addresses.find(addr => addr.primary)?.street)
  onPrimaryAddressChange(newStreet: string, oldStreet: string) {
    console.log(`Primary address changed from ${oldStreet} to ${newStreet}`);
  }

  // Watch nested object properties
  @watch((user: UserProfile) => user.person.profile.avatar)
  onAvatarChange(newAvatar: string, oldAvatar: string) {
    console.log(`Avatar changed from ${oldAvatar} to ${newAvatar}`);
  }

  // Watch array length with complex filtering
  @watch((user: UserProfile) => user.person.addresses.filter(addr => addr.primary).length)
  onPrimaryAddressCountChange(count: number) {
    if (count === 0) {
      console.log('No primary address set!');
    } else if (count > 1) {
      console.log('Multiple primary addresses detected!');
    }
  }
}
```

### Collection Observation Patterns

#### Observable Array Methods

Different array methods have varying levels of observability:

```typescript
import { watch } from '@aurelia/runtime-html';

class TaskManager {
  tasks: Task[] = [];

  // These array methods ARE observable and will trigger watchers:
  @watch((manager: TaskManager) => manager.tasks.filter(t => t.completed).length)
  onCompletedTasksChange(count: number) {
    console.log(`Completed tasks: ${count}`);
  }

  @watch((manager: TaskManager) => manager.tasks.find(t => t.priority === 'high'))
  onHighPriorityTaskChange(task: Task) {
    console.log('High priority task changed:', task);
  }

  @watch((manager: TaskManager) => manager.tasks.some(t => t.overdue))
  onOverdueTasksChange(hasOverdue: boolean) {
    console.log(`Has overdue tasks: ${hasOverdue}`);
  }

  @watch((manager: TaskManager) => manager.tasks.every(t => t.completed))
  onAllTasksCompleteChange(allComplete: boolean) {
    console.log(`All tasks complete: ${allComplete}`);
  }

  // Array iteration methods ARE observable:
  @watch((manager: TaskManager) => {
    const result = [];
    for (const task of manager.tasks) {
      result.push(task.name);
    }
    return result.join(', ');
  })
  onTaskNamesChange(names: string) {
    console.log('Task names:', names);
  }

  // Array mutating methods (push, pop, etc.) are NOT directly observable
  // but changes to array length or content will trigger watchers
  addTask(task: Task) {
    this.tasks.push(task); // This will trigger watchers that observe array content
  }
}
```

#### Map and Set Observation

```typescript
import { watch } from '@aurelia/runtime-html';

class UserPreferences {
  settings: Map<string, any> = new Map();
  categories: Set<string> = new Set();

  // Observable Map operations:
  @watch((prefs: UserPreferences) => prefs.settings.get('theme'))
  onThemeChange(theme: string) {
    console.log('Theme changed to:', theme);
  }

  @watch((prefs: UserPreferences) => prefs.settings.has('notifications'))
  onNotificationSettingChange(hasNotifications: boolean) {
    console.log('Notification setting exists:', hasNotifications);
  }

  @watch((prefs: UserPreferences) => prefs.settings.size)
  onSettingsCountChange(count: number) {
    console.log('Settings count:', count);
  }

  // Observable Set operations:
  @watch((prefs: UserPreferences) => prefs.categories.has('work'))
  onWorkCategoryChange(hasWork: boolean) {
    console.log('Work category enabled:', hasWork);
  }

  @watch((prefs: UserPreferences) => prefs.categories.size)
  onCategoryCountChange(count: number) {
    console.log('Category count:', count);
  }

  // Iterating over Map/Set is observable:
  @watch((prefs: UserPreferences) => {
    const result = [];
    for (const [key, value] of prefs.settings.entries()) {
      result.push(`${key}:${value}`);
    }
    return result.join(', ');
  })
  onSettingsStringChange(settingsString: string) {
    console.log('Settings string:', settingsString);
  }
}
```

### Flush Timing Control

The `flush` option controls when watcher callbacks are executed:

```typescript
import { watch } from '@aurelia/runtime-html';

class FlushExamples {
  counter = 0;

  // Async flush (default) - callback runs in next microtask
  @watch('counter', { flush: 'async' })
  onCounterChangeAsync(newValue: number, oldValue: number) {
    console.log(`Async: ${oldValue} -> ${newValue}`);
  }

  // Sync flush - callback runs immediately
  @watch('counter', { flush: 'sync' })
  onCounterChangeSync(newValue: number, oldValue: number) {
    console.log(`Sync: ${oldValue} -> ${newValue}`);
  }

  increment() {
    this.counter++;
    console.log('After increment');
    // Output order:
    // 1. "Sync: 0 -> 1"
    // 2. "After increment"
    // 3. "Async: 0 -> 1" (in next microtask)
  }
}
```

### Performance Considerations

#### When to Use Different Patterns

```typescript
import { watch } from '@aurelia/runtime-html';

class PerformanceExamples {
  // ✅ Good: Simple property watching
  @watch('userName')
  onUserNameChange(name: string) {
    this.updateUserDisplay(name);
  }

  // ✅ Good: Computed value that depends on multiple properties
  @watch((example: PerformanceExamples) => 
    `${example.firstName} ${example.lastName}`.trim()
  )
  onFullNameChange(fullName: string) {
    this.updateFullNameDisplay(fullName);
  }

  // ⚠️ Caution: Expensive computed getter
  @watch((example: PerformanceExamples) => {
    // This runs every time any dependency changes
    return example.items
      .filter(item => item.active)
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 10);
  })
  onTopItemsChange(topItems: Item[]) {
    this.renderTopItems(topItems);
  }

  // ✅ Better: Use sync flush for immediate DOM updates
  @watch('scrollPosition', { flush: 'sync' })
  onScrollPositionChange(position: number) {
    // Update DOM immediately to prevent layout thrashing
    this.updateScrollIndicator(position);
  }

  // ✅ Good: Watch for specific conditions
  @watch((example: PerformanceExamples) => 
    example.items.some(item => item.hasErrors)
  )
  onErrorStateChange(hasErrors: boolean) {
    this.toggleErrorDisplay(hasErrors);
  }
}
```

#### Optimizing Watch Expressions

```typescript
import { watch } from '@aurelia/runtime-html';

class OptimizationExamples {
  items: Item[] = [];
  selectedId: string = '';

  // ❌ Avoid: Complex computation in getter
  @watch((example: OptimizationExamples) => {
    // This entire computation runs on every dependency change
    const selected = example.items.find(item => item.id === example.selectedId);
    return selected ? selected.details.map(d => d.value).join(', ') : '';
  })
  onSelectedDetailsChange(details: string) {
    console.log('Selected details:', details);
  }

  // ✅ Better: Break into smaller watchers
  @watch((example: OptimizationExamples) => 
    example.items.find(item => item.id === example.selectedId)
  )
  onSelectedItemChange(item: Item) {
    this.selectedItem = item;
  }

  @watch((example: OptimizationExamples) => 
    example.selectedItem?.details.map(d => d.value).join(', ') || ''
  )
  onSelectedItemDetailsChange(details: string) {
    console.log('Selected details:', details);
  }

  // ✅ Good: Use caching for expensive computations
  private cachedResults = new Map<string, any>();

  @watch((example: OptimizationExamples) => {
    const key = `${example.selectedId}-${example.items.length}`;
    if (!example.cachedResults.has(key)) {
      const result = example.computeExpensiveValue();
      example.cachedResults.set(key, result);
    }
    return example.cachedResults.get(key);
  })
  onExpensiveValueChange(value: any) {
    console.log('Expensive value:', value);
  }
}
```
