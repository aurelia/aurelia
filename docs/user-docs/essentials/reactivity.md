# Reactivity

Aurelia's reactivity system automatically tracks changes to your data and updates the UI efficiently. Unlike frameworks that use virtual DOM, Aurelia observes your data directly and surgically updates only what has changed.

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
import { observerLocator } from 'aurelia';

export class AdvancedComponent {
  data = { value: 0 };
  
  constructor(
    @IObserverLocator private observerLocator: IObserverLocator
  ) {}

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

## What's Next

- Learn about [observing property changes](../getting-to-know-aurelia/observation/observing-property-changes-with-observable.md) in detail
- Explore [effect observation](../getting-to-know-aurelia/observation/effect-observation.md) for advanced reactive patterns
- Understand [watching data](../getting-to-know-aurelia/watching-data.md) strategies