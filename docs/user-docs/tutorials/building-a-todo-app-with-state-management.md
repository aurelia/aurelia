---
description: Learn state management in Aurelia by building a todo application with @aurelia/state
---

# Building a Todo App with State Management

This tutorial walks you through building a todo application using the `@aurelia/state` plugin. You'll learn how to manage application state centrally, handle actions, use middleware, and persist data—all while building a real, functioning app.

## What You'll Learn

By the end of this tutorial, you'll understand:

- How to install and configure `@aurelia/state`
- Creating and managing global state
- Writing action handlers to update state
- Binding templates to state with `.state` and `.dispatch`
- Using the `@fromState` decorator in components
- Adding middleware for logging and persistence
- Memoizing expensive derived state computations
- Integrating Redux DevTools for debugging

## Prerequisites

Before starting, you should be familiar with:

- [Aurelia components](../components/components.md) and [template syntax](../templates/template-syntax/overview.md)
- [Dependency injection with `resolve()`](../getting-to-know-aurelia/dependency-injection-di/)
- Basic TypeScript or JavaScript

## What We're Building

A todo application with these features:

- Add, complete, and delete todos
- Filter todos by status (all, active, completed)
- Display todo statistics (total, active, completed)
- Persist todos to localStorage
- Undo/redo support via Redux DevTools

## Step 1: Create the Project

Use the Aurelia CLI to scaffold a new project:

```bash
npx makes aurelia todo-state-app
```

When prompted, choose TypeScript (recommended for better type safety with state).

Navigate into your project:

```bash
cd todo-state-app
```

## Step 2: Install @aurelia/state

Install the state management plugin:

```bash
npm install @aurelia/state
```

## Step 3: Define Your State Shape

Create a new file `src/state/app-state.ts` to define your application state structure:

```typescript
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type TodoFilter = 'all' | 'active' | 'completed';

export interface AppState {
  todos: Todo[];
  filter: TodoFilter;
  newTodoText: string;
}

export const initialState: AppState = {
  todos: [
    {
      id: '1',
      text: 'Learn Aurelia 2',
      completed: false,
      createdAt: Date.now() - 3600000
    },
    {
      id: '2',
      text: 'Build something with @aurelia/state',
      completed: false,
      createdAt: Date.now() - 1800000
    },
    {
      id: '3',
      text: 'Deploy to production',
      completed: false,
      createdAt: Date.now()
    }
  ],
  filter: 'all',
  newTodoText: ''
};
```

This defines a clear structure for our application state. Everything that needs to be shared across components or persisted will live here.

## Step 4: Create Action Handlers

Action handlers are pure functions that take the current state and an action, then return a new state. They're similar to reducers in Redux.

Create `src/state/action-handlers.ts`:

```typescript
import { AppState, Todo, TodoFilter } from './app-state';

// Action types
export type TodoAction =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'UPDATE_TODO_TEXT'; text: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'DELETE_TODO'; id: string }
  | { type: 'SET_FILTER'; filter: TodoFilter }
  | { type: 'CLEAR_COMPLETED' };

/**
 * Main action handler that processes all todo-related actions.
 * Returns a new state object for each action—never mutates the existing state.
 */
export function todoActionHandler(state: AppState, action: unknown): AppState {
  const typedAction = action as TodoAction;

  switch (typedAction.type) {
    case 'ADD_TODO': {
      if (!typedAction.text.trim()) {
        return state;
      }

      const newTodo: Todo = {
        id: Date.now().toString(),
        text: typedAction.text.trim(),
        completed: false,
        createdAt: Date.now()
      };

      return {
        ...state,
        todos: [newTodo, ...state.todos],
        newTodoText: '' // Clear input after adding
      };
    }

    case 'UPDATE_TODO_TEXT': {
      return {
        ...state,
        newTodoText: typedAction.text
      };
    }

    case 'TOGGLE_TODO': {
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === typedAction.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    }

    case 'DELETE_TODO': {
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== typedAction.id)
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: typedAction.filter
      };
    }

    case 'CLEAR_COMPLETED': {
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };
    }

    default:
      return state;
  }
}
```

**Key principles:**

- Action handlers are pure functions—no side effects
- Always return a new state object instead of mutating the existing one
- Use the spread operator (`...state`) to preserve unchanged properties
- Return the original state if the action doesn't apply

## Step 5: Create Middleware

Middleware intercepts actions before or after they're processed. Let's create logging and persistence middleware.

Create `src/state/middleware.ts`:

```typescript
import { IStateMiddleware, MiddlewarePlacement } from '@aurelia/state';
import { AppState } from './app-state';

/**
 * Logging middleware that logs every action and the resulting state.
 * Runs BEFORE action handlers process the action.
 */
export const loggingMiddleware: IStateMiddleware<AppState> = (state, action) => {
  console.group(`[ACTION] ${(action as any).type || 'UNKNOWN'}`);
  console.log('Action:', action);
  console.log('Current State:', state);
  console.groupEnd();

  // Return state unchanged—just logging
  return state;
};

/**
 * Persistence middleware that saves todos to localStorage after each state change.
 * Runs AFTER action handlers have processed the action.
 */
export const persistenceMiddleware: IStateMiddleware<AppState> = (state, action) => {
  try {
    const dataToSave = {
      todos: state.todos,
      filter: state.filter
    };

    localStorage.setItem('aurelia-todos', JSON.stringify(dataToSave));
    console.log('[PERSISTENCE] Saved to localStorage');
  } catch (error) {
    console.error('[PERSISTENCE] Failed to save:', error);
  }

  return state;
};

/**
 * Loads persisted state from localStorage.
 * Call this before registering the state plugin.
 */
export function loadPersistedState(): Partial<AppState> | null {
  try {
    const stored = localStorage.getItem('aurelia-todos');
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    console.log('[PERSISTENCE] Loaded from localStorage');
    return parsed;
  } catch (error) {
    console.error('[PERSISTENCE] Failed to load:', error);
    return null;
  }
}
```

**How middleware works:**

- Middleware with `placement: 'before'` runs before action handlers
- Middleware with `placement: 'after'` runs after action handlers
- Return `false` to block an action from proceeding
- Return `undefined` or the state to continue processing

## Step 6: Configure the State Plugin

Now register the state plugin in your app. Update `src/main.ts`:

```typescript
import Aurelia from 'aurelia';
import { StateDefaultConfiguration, MiddlewarePlacement } from '@aurelia/state';
import { MyApp } from './my-app';

import { initialState, AppState } from './state/app-state';
import { todoActionHandler } from './state/action-handlers';
import { loggingMiddleware, persistenceMiddleware, loadPersistedState } from './state/middleware';

// Load persisted state and merge with initial state
const persistedState = loadPersistedState();
const mergedState: AppState = {
  ...initialState,
  ...persistedState,
  newTodoText: '' // Always start with empty input
};

Aurelia
  .register(
    StateDefaultConfiguration.init(
      mergedState,
      {
        middlewares: [
          {
            middleware: loggingMiddleware,
            placement: MiddlewarePlacement.Before
          },
          {
            middleware: persistenceMiddleware,
            placement: MiddlewarePlacement.After
          }
        ],
        devToolsOptions: {
          name: 'Aurelia Todo App',
          maxAge: 50 // Keep last 50 actions for time-travel debugging
        }
      },
      todoActionHandler
    )
  )
  .app(MyApp)
  .start();
```

**Configuration breakdown:**

- `mergedState`: Combines initial state with persisted data from localStorage
- `middlewares`: Registers our logging and persistence middleware
- `devToolsOptions`: Enables Redux DevTools integration (install the browser extension to use it)
- `todoActionHandler`: Registers our action handler

## Step 7: Create the Todo Input Component

Create `src/components/todo-input.ts`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IStore } from '@aurelia/state';
import { AppState } from '../state/app-state';

export class TodoInput {
  private store = resolve<IStore<AppState>>(IStore);

  addTodo() {
    const text = this.store.getState().newTodoText;
    if (text.trim()) {
      this.store.dispatch({ type: 'ADD_TODO', text });
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addTodo();
    }
    return true; // Allow default browser behavior
  }
}
```

Create `src/components/todo-input.html`:

```html
<div class="todo-input">
  <input
    type="text"
    class="new-todo"
    placeholder="What needs to be done?"
    value.state="newTodoText"
    input.dispatch="{ type: 'UPDATE_TODO_TEXT', text: $event.target.value }"
    keypress.trigger="handleKeyPress($event)"
    autofocus>
  <button click.trigger="addTodo()" class="add-btn">Add</button>
</div>
```

**Key concepts:**

- `value.state="newTodoText"`: Binds input value to the `newTodoText` property in global state
- `input.dispatch="..."`: Dispatches an action on every input event to update state
- `resolve(IStore)`: Injects the state store using Aurelia's dependency injection

## Step 8: Create the Todo List Component

Create `src/components/todo-list.ts`:

```typescript
import { resolve } from '@aurelia/kernel';
import { fromState, createStateMemoizer } from '@aurelia/state';
import { IStore } from '@aurelia/state';
import { AppState, Todo } from '../state/app-state';

/**
 * Memoized selector that filters todos based on the current filter.
 * Only recalculates when todos or filter change.
 */
const selectFilteredTodos = createStateMemoizer(
  (state: AppState) => state.todos,
  (state: AppState) => state.filter,
  (todos, filter) => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }
);

/**
 * Memoized selector for todo statistics.
 */
const selectStats = createStateMemoizer(
  (state: AppState) => state.todos,
  (todos) => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  })
);

export class TodoList {
  private store = resolve<IStore<AppState>>(IStore);

  // Automatically syncs with state changes
  @fromState(selectFilteredTodos)
  filteredTodos!: Todo[];

  @fromState(selectStats)
  stats!: { total: number; active: number; completed: number };

  @fromState(state => state.filter)
  currentFilter!: string;

  toggleTodo(id: string) {
    this.store.dispatch({ type: 'TOGGLE_TODO', id });
  }

  deleteTodo(id: string) {
    this.store.dispatch({ type: 'DELETE_TODO', id });
  }

  setFilter(filter: 'all' | 'active' | 'completed') {
    this.store.dispatch({ type: 'SET_FILTER', filter });
  }

  clearCompleted() {
    this.store.dispatch({ type: 'CLEAR_COMPLETED' });
  }
}
```

Create `src/components/todo-list.html`:

```html
<div class="todo-list">
  <div class="filters">
    <button
      repeat.for="filter of ['all', 'active', 'completed']"
      click.trigger="setFilter(filter)"
      class="filter-btn ${currentFilter === filter ? 'active' : ''}">
      ${filter}
    </button>
  </div>

  <div class="stats">
    <span>${stats.total} total</span>
    <span>${stats.active} active</span>
    <span>${stats.completed} completed</span>
  </div>

  <ul class="todos">
    <li repeat.for="todo of filteredTodos" class="todo-item ${todo.completed ? 'completed' : ''}">
      <input
        type="checkbox"
        checked.bind="todo.completed"
        click.trigger="toggleTodo(todo.id)">
      <span class="todo-text">\${todo.text}</span>
      <button click.trigger="deleteTodo(todo.id)" class="delete-btn">×</button>
    </li>
  </ul>

  <div class="actions" if.bind="stats.completed > 0">
    <button click.trigger="clearCompleted()">Clear Completed</button>
  </div>
</div>
```

**Advanced concepts:**

- `@fromState(selector)`: Automatically keeps component properties in sync with state
- `createStateMemoizer()`: Optimizes performance by caching computed values
- Selectors only recalculate when their dependencies change (by reference)

## Step 9: Create the Main App Component

Update `src/my-app.ts`:

```typescript
export class MyApp {
  message = 'Todo App with State Management';
}
```

Update `src/my-app.html`:

```html
<import from="./components/todo-input"></import>
<import from="./components/todo-list"></import>

<div class="app">
  <header>
    <h1>\${message}</h1>
  </header>

  <main>
    <todo-input></todo-input>
    <todo-list></todo-list>
  </main>
</div>
```

## Step 10: Add Styling

Create or update `src/my-app.css`:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.app {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

header {
  background: #667eea;
  color: white;
  padding: 30px;
  text-align: center;
}

header h1 {
  margin: 0;
  font-size: 2em;
}

main {
  padding: 20px;
}

.todo-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.new-todo {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.new-todo:focus {
  border-color: #667eea;
}

.add-btn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #5568d3;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.filter-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.todos {
  list-style: none;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #f5f5f5;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-item input[type="checkbox"] {
  margin-right: 12px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
}

.delete-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 20px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.todo-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #ee5a6f;
}

.actions {
  margin-top: 20px;
  text-align: center;
}

.actions button {
  padding: 10px 20px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.actions button:hover {
  background: #ee5a6f;
}
```

## Step 11: Run Your App

Start the development server:

```bash
npm start
```

Your browser should open automatically. Try:

- Adding new todos
- Toggling todo completion
- Deleting todos
- Switching between filters (all, active, completed)
- Refreshing the page (todos persist via localStorage)

## Step 12: Debug with Redux DevTools

Install the Redux DevTools browser extension:

- [Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

Open the extension and you'll see:

- **Action History**: Every action dispatched in your app
- **State Inspector**: Current state at any point in time
- **Time Travel**: Jump back and forth through state changes
- **State Diff**: See exactly what changed between states

Try dispatching actions and watch them appear in real-time!

## Understanding the Data Flow

Here's how state flows through your application:

1. **User Action**: User types in input or clicks a button
2. **Dispatch**: Component calls `store.dispatch({ type: 'ACTION_NAME', ... })`
3. **Before Middleware**: Logging middleware logs the action
4. **Action Handler**: `todoActionHandler` processes the action and returns new state
5. **After Middleware**: Persistence middleware saves to localStorage
6. **State Update**: Store updates its internal state
7. **Subscriber Notification**: All `@fromState` properties automatically update
8. **Template Re-render**: Aurelia updates the DOM with new values

## Best Practices

### 1. Keep State Normalized

Instead of nested structures, keep data flat:

```typescript
// ❌ Avoid deeply nested state
interface BadState {
  users: {
    [id: string]: {
      todos: Todo[];
      profile: { ... };
    }
  }
}

// ✅ Prefer normalized, flat structure
interface GoodState {
  users: User[];
  todos: Todo[];
  profiles: Profile[];
}
```

### 2. Use Memoized Selectors for Expensive Computations

```typescript
// ✅ Good: Only recalculates when dependencies change
const selectSortedTodos = createStateMemoizer(
  (state: AppState) => state.todos,
  (todos) => [...todos].sort((a, b) => b.createdAt - a.createdAt)
);

// ❌ Avoid: Recalculates on every state change
@fromState(state => [...state.todos].sort((a, b) => b.createdAt - a.createdAt))
sortedTodos!: Todo[];
```

### 3. Keep Action Handlers Pure

Action handlers should be pure functions with no side effects:

```typescript
// ✅ Good: Pure function
export function todoHandler(state: AppState, action: TodoAction): AppState {
  if (action.type === 'ADD_TODO') {
    return { ...state, todos: [...state.todos, action.todo] };
  }
  return state;
}

// ❌ Avoid: Side effects in action handler
export function badHandler(state: AppState, action: TodoAction): AppState {
  if (action.type === 'ADD_TODO') {
    fetch('/api/todos', { method: 'POST', ... }); // ❌ Side effect!
    return { ...state, todos: [...state.todos, action.todo] };
  }
  return state;
}
```

Put side effects (API calls, etc.) in your components or middleware instead.

### 4. Use TypeScript for Type Safety

Define action types to catch errors at compile time:

```typescript
export type TodoAction =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'DELETE_TODO'; id: string };

// TypeScript will catch typos and missing properties
store.dispatch({ type: 'ADD_TODOO', text: 'Test' }); // ❌ Error: 'ADD_TODOO' doesn't exist
store.dispatch({ type: 'ADD_TODO' }); // ❌ Error: 'text' is required
```

## Next Steps

Now that you've built a todo app with state management, explore:

- **[State Outcome Recipes](../aurelia-packages/state-outcome-recipes.md)**: Patterns for optimistic updates, rollback, and more
- **[State Plugin Guide](../aurelia-packages/state.md)**: Complete reference documentation
- **[Middleware](../aurelia-packages/state.md#middleware)**: Advanced middleware patterns
- **Testing**: Learn to test components that use state (coming soon)

## Common Questions

### When should I use @aurelia/state vs local component state?

Use `@aurelia/state` when:

- Data needs to be shared across multiple components
- You need a single source of truth
- You want time-travel debugging
- You need to persist state between sessions

Use local component state when:

- Data is only used within one component
- State is ephemeral (like UI state)
- You want simpler, lighter-weight code

### Can I use @aurelia/state with the router?

Yes! State management works great with routing. You might store the current route, route parameters, or data loaded for specific routes in your global state.

### How does this compare to Redux?

`@aurelia/state` is inspired by Redux but simplified:

- Action handlers combine reducers and action creators
- Middleware works the same way
- Redux DevTools integration is built-in
- Less boilerplate required

### Can I dispatch actions from templates?

Yes! Use the `.dispatch` binding command:

```html
<button click.dispatch="{ type: 'INCREMENT' }">+</button>
```

This is convenient for simple actions. For complex logic, dispatch from your component instead.

## Summary

You've built a complete todo application with centralized state management! You learned:

✅ Installing and configuring `@aurelia/state`
✅ Defining state shape and initial state
✅ Writing action handlers to update state
✅ Using `.state` and `.dispatch` in templates
✅ Decorating properties with `@fromState`
✅ Creating middleware for logging and persistence
✅ Optimizing with memoized selectors
✅ Debugging with Redux DevTools

The patterns you learned here scale to applications of any size. As your app grows, you can split action handlers into multiple files, add more middleware, and create reusable selectors.

Happy state managing!
