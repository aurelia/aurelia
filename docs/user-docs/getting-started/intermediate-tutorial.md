# Intermediate Tutorial: Building a Todo App with Categories

Take your Aurelia skills to the next level by building a feature-rich todo application. This tutorial covers component composition, filtering, local storage, and real-world patterns.

## What You'll Learn

- Creating multiple components and composing them
- Component communication with bindable properties
- Advanced list rendering and filtering
- Form handling with validation
- Local storage persistence
- Computed properties and reactive updates
- Template patterns for real apps

## Prerequisites

- Completed the [Hello World Tutorial](quick-start-guide/README.md)
- Basic understanding of [Templates](../templates/template-syntax/overview.md)
- Familiarity with TypeScript

## The App We're Building

A todo application with:
- ✅ Add, complete, and delete tasks
- 🏷️ Categorize tasks (Work, Personal, Shopping)
- 🔍 Filter by category and completion status
- 💾 Auto-save to local storage
- 📊 Task statistics

## Step 1: Project Setup

```bash
npx makes aurelia
# Name: todo-app
# Select TypeScript
cd todo-app
npm run dev
```

## Step 2: Data Models

Create `src/models.ts`:

```typescript
export interface Todo {
  id: string;
  title: string;
  description: string;
  category: Category;
  completed: boolean;
  createdAt: Date;
}

export type Category = 'work' | 'personal' | 'shopping';

export const CATEGORIES: Category[] = ['work', 'personal', 'shopping'];

export const CATEGORY_LABELS: Record<Category, string> = {
  work: 'Work',
  personal: 'Personal',
  shopping: 'Shopping'
};

export const CATEGORY_COLORS: Record<Category, string> = {
  work: '#3b82f6',
  personal: '#10b981',
  shopping: '#f59e0b'
};
```

## Step 3: Storage Service

Create `src/storage-service.ts`:

```typescript
import { DI } from 'aurelia';

export const IStorageService = DI.createInterface<IStorageService>(
  'IStorageService',
  x => x.singleton(StorageService)
);

export interface IStorageService extends StorageService {}

export class StorageService {
  private readonly STORAGE_KEY = 'aurelia-todos';

  saveTodos(todos: any[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }

  loadTodos(): any[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load todos:', error);
      return [];
    }
  }

  clearTodos(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

The service is automatically registered as a singleton via `DI.createInterface`.

## Step 4: Main App Component

Update `src/my-app.ts`:

```typescript
import { resolve } from 'aurelia';
import { IStorageService } from './storage-service';
import { Todo, Category, CATEGORIES } from './models';

export class MyApp {
  private readonly storage = resolve(IStorageService);

  todos: Todo[] = [];
  filterCategory: Category | 'all' = 'all';
  filterCompleted: 'all' | 'active' | 'completed' = 'all';

  constructor() {
    this.loadTodos();
  }

  // Computed property for filtered todos
  get filteredTodos(): Todo[] {
    let filtered = this.todos;

    // Filter by category
    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(todo => todo.category === this.filterCategory);
    }

    // Filter by completion status
    if (this.filterCompleted === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (this.filterCompleted === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    return filtered;
  }

  // Statistics computed properties
  get totalTodos(): number {
    return this.todos.length;
  }

  get activeTodos(): number {
    return this.todos.filter(todo => !todo.completed).length;
  }

  get completedTodos(): number {
    return this.todos.filter(todo => todo.completed).length;
  }

  get categories(): (Category | 'all')[] {
    return ['all', ...CATEGORIES];
  }

  // Todo operations
  addTodo(todo: Omit<Todo, 'id' | 'createdAt'>): void {
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };

    this.todos.push(newTodo);
    this.saveTodos();
  }

  toggleTodo(todo: Todo): void {
    todo.completed = !todo.completed;
    this.saveTodos();
  }

  deleteTodo(todo: Todo): void {
    const index = this.todos.indexOf(todo);
    if (index > -1) {
      this.todos.splice(index, 1);
      this.saveTodos();
    }
  }

  clearCompleted(): void {
    this.todos = this.todos.filter(todo => !todo.completed);
    this.saveTodos();
  }

  // Persistence
  private saveTodos(): void {
    this.storage.saveTodos(this.todos);
  }

  private loadTodos(): void {
    const loaded = this.storage.loadTodos();
    this.todos = loaded.map(todo => ({
      ...todo,
      createdAt: new Date(todo.createdAt)
    }));
  }
}
```

## Step 5: Create Todo Form Component

Create `src/todo-form.ts`:

```typescript
import { bindable } from 'aurelia';
import { Category, CATEGORIES, CATEGORY_LABELS } from './models';

export class TodoForm {
  @bindable onSubmit?: (data: any) => void;

  formData = {
    title: '',
    description: '',
    category: 'work' as Category
  };

  categories = CATEGORIES;
  categoryLabels = CATEGORY_LABELS;

  get isValid(): boolean {
    return this.formData.title.trim().length > 0;
  }

  handleSubmit(): void {
    if (!this.isValid) return;

    this.onSubmit?.({
      title: this.formData.title.trim(),
      description: this.formData.description.trim(),
      category: this.formData.category,
      completed: false
    });

    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      category: 'work'
    };
  }
}
```

Create `src/todo-form.html`:

```html
<div class="todo-form">
  <h2>Add New Todo</h2>
  <form submit.trigger="handleSubmit()">
    <div class="form-group">
      <label for="title">Title *</label>
      <input
        id="title"
        type="text"
        value.bind="formData.title"
        placeholder="Enter todo title"
        required />
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        value.bind="formData.description"
        placeholder="Optional description"
        rows="3"></textarea>
    </div>

    <div class="form-group">
      <label for="category">Category</label>
      <select id="category" value.bind="formData.category">
        <option repeat.for="cat of categories" value.bind="cat">
          ${categoryLabels[cat]}
        </option>
      </select>
    </div>

    <button type="submit" disabled.bind="!isValid">
      Add Todo
    </button>
  </form>
</div>
```

## Step 6: Create Todo Item Component

Create `src/todo-item.ts`:

```typescript
import { bindable } from 'aurelia';
import { Todo, CATEGORY_LABELS, CATEGORY_COLORS } from './models';

export class TodoItem {
  @bindable todo!: Todo;
  @bindable onToggle?: (todo: Todo) => void;
  @bindable onDelete?: (todo: Todo) => void;

  categoryLabels = CATEGORY_LABELS;
  categoryColors = CATEGORY_COLORS;

  get categoryColor(): string {
    return this.categoryColors[this.todo.category];
  }

  handleToggle(): void {
    this.onToggle?.(this.todo);
  }

  handleDelete(): void {
    if (confirm(`Delete "${this.todo.title}"?`)) {
      this.onDelete?.(this.todo);
    }
  }

  get formattedDate(): string {
    return this.todo.createdAt.toLocaleDateString();
  }
}
```

Create `src/todo-item.html`:

```html
<div class="todo-item ${todo.completed ? 'completed' : ''}">
  <div class="todo-content">
    <label class="todo-checkbox">
      <input
        type="checkbox"
        checked.bind="todo.completed"
        change.trigger="handleToggle()" />
      <span class="checkmark"></span>
    </label>

    <div class="todo-details">
      <h3 class="todo-title">${todo.title}</h3>
      <p if.bind="todo.description" class="todo-description">
        ${todo.description}
      </p>
      <div class="todo-meta">
        <span class="todo-category" style="background-color: ${categoryColor}">
          ${categoryLabels[todo.category]}
        </span>
        <span class="todo-date">${formattedDate}</span>
      </div>
    </div>
  </div>

  <button
    class="delete-btn"
    click.trigger="handleDelete()"
    title="Delete todo">
    ×
  </button>
</div>
```

## Step 7: Main App Template

Update `src/my-app.html`:

```html
<import from="./todo-form"></import>
<import from="./todo-item"></import>

<div class="app">
  <header class="app-header">
    <h1>📝 Aurelia Todo App</h1>
    <div class="stats">
      <span class="stat">Total: ${totalTodos}</span>
      <span class="stat">Active: ${activeTodos}</span>
      <span class="stat">Completed: ${completedTodos}</span>
    </div>
  </header>

  <main class="app-main">
    <div class="sidebar">
      <todo-form on-submit.bind="(data) => addTodo(data)"></todo-form>
    </div>

    <div class="content">
      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label>Category:</label>
          <select value.bind="filterCategory">
            <option value="all">All Categories</option>
            <option repeat.for="cat of categories" value.bind="cat">
              ${cat === 'all' ? 'All' : cat}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select value.bind="filterCompleted">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          if.bind="completedTodos > 0"
          click.trigger="clearCompleted()"
          class="clear-btn">
          Clear Completed
        </button>
      </div>

      <!-- Todo List -->
      <div class="todo-list">
        <div if.bind="filteredTodos.length === 0" class="empty-state">
          <p>No todos found!</p>
          <small if.bind="filterCategory !== 'all' || filterCompleted !== 'all'">
            Try changing your filters
          </small>
        </div>

        <todo-item
          repeat.for="todo of filteredTodos; key: id"
          todo.bind="todo"
          on-toggle.bind="(todo) => toggleTodo(todo)"
          on-delete.bind="(todo) => deleteTodo(todo)">
        </todo-item>
      </div>
    </div>
  </main>
</div>
```

## Step 8: Styling

Update `src/my-app.css`:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
  color: #333;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin-bottom: 1rem;
}

.stats {
  display: flex;
  gap: 2rem;
}

.stat {
  font-size: 0.9rem;
  color: #666;
}

.app-main {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
}

/* Todo Form */
.todo-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.todo-form h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover:not(:disabled) {
  background: #2563eb;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Filters */
.filters {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group {
  flex: 1;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.clear-btn {
  background: #ef4444;
}

.clear-btn:hover {
  background: #dc2626;
}

/* Todo List */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  background: white;
  padding: 3rem;
  border-radius: 8px;
  text-align: center;
  color: #999;
}

/* Todo Item */
.todo-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.todo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-content {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.todo-checkbox {
  cursor: pointer;
  position: relative;
}

.todo-checkbox input {
  cursor: pointer;
}

.todo-details {
  flex: 1;
}

.todo-title {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
}

.todo-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.todo-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.todo-category {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: white;
  font-weight: 500;
}

.todo-date {
  font-size: 0.8rem;
  color: #999;
}

.delete-btn {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1.5rem;
  line-height: 1;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
}

@media (max-width: 768px) {
  .app-main {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }
}
```

## What You've Learned

- **Component Composition** - Created reusable TodoForm and TodoItem components
- **Component Communication** - Used `@bindable` and `.call` for parent-child communication
- **Dependency Injection** - Created and injected StorageService
- **Computed Properties** - Implemented filtered lists and statistics
- **List Rendering** - Used `repeat.for` with keys for efficient updates
- **Conditional Rendering** - Showed/hid elements based on state
- **Form Handling** - Built forms with validation and submission
- **Local Storage** - Persisted data across sessions
- **Template Patterns** - Applied real-world templating techniques

## Next Steps

Enhance your app with:
- **Drag-and-drop** reordering
- **Edit mode** for todos
- **Due dates** and reminders
- **Search** functionality
- **Dark mode** toggle
- **Export/import** todos

## Related Documentation

- [Templates Overview](../templates/README.md)
- [Component Basics](../components/components.md)
- [Extended Tutorial](extended-tutorial/README.md)
- [Dependency Injection](../essentials/dependency-injection.md)
- [Form Handling](../templates/forms/README.md)
- [List Rendering](../templates/repeats-and-list-rendering.md)
