---
description: >-
  A beginner-friendly guide to adding animations to your Aurelia applications,
  starting with simple CSS animations and progressing to more dynamic techniques.
---

# Adding Animation

Animations bring your Aurelia applications to life, providing visual feedback and improving the user experience. This guide will help you get started with animations, from simple CSS transitions to more dynamic approaches.

## Why Add Animations?

Animations serve several important purposes:

- **Visual feedback** - Confirm user actions (button clicks, form submissions)
- **State changes** - Smoothly show/hide content or transition between states
- **Guide attention** - Draw users' eyes to important changes or new content
- **Polish** - Make your app feel more professional and responsive

## Starting Simple: CSS Transitions

The easiest way to add animations is with CSS transitions. They're perfect for simple state changes.

### Example: Animated Button

Let's create a button that changes color smoothly when hovered:

```typescript
export class MyApp {
  private count = 0;

  increment() {
    this.count++;
  }
}
```

```html
<button click.trigger="increment()" class="animated-button">
  Clicked ${count} times
</button>
```

```css
.animated-button {
  padding: 12px 24px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.animated-button:hover {
  background-color: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.animated-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
```

The `transition` property makes all property changes happen smoothly over 0.3 seconds.

## Show/Hide Content with Animations

A common need is to animate content when it appears or disappears. You can do this by binding CSS classes to your data.

### Example: Expandable Card

```typescript
export class MyApp {
  private isExpanded = false;

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
```

```html
<div class="card">
  <div class="card-header" click.trigger="toggle()">
    <h3>Click to ${isExpanded ? 'collapse' : 'expand'}</h3>
    <span class="icon">${isExpanded ? '▼' : '▶'}</span>
  </div>
  <div class="card-body" class.bind="isExpanded ? 'expanded' : 'collapsed'">
    <p>This content smoothly expands and collapses.</p>
    <p>The animation makes the transition feel natural.</p>
  </div>
</div>
```

```css
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  padding: 16px;
  background: #f5f5f5;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header:hover {
  background: #e0e0e0;
}

.card-body {
  padding: 0 16px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.card-body.expanded {
  max-height: 500px;
  padding: 16px;
}

.icon {
  transition: transform 0.3s ease;
}

.expanded ~ .icon {
  transform: rotate(90deg);
}
```

## CSS Keyframe Animations

For more complex animations, use CSS `@keyframes`. These let you define multi-step animations.

### Example: Loading Spinner

```typescript
export class MyApp {
  private isLoading = false;

  async loadData() {
    this.isLoading = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.isLoading = false;
  }
}
```

```html
<button click.trigger="loadData()" disabled.bind="isLoading">
  ${isLoading ? 'Loading...' : 'Load Data'}
</button>

<div if.bind="isLoading" class="spinner"></div>
```

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Animating Lists

When adding or removing items from a list, animations can make the changes feel smoother and easier to follow.

### Example: Animated Todo List

```typescript
export class MyApp {
  private todos = ['Learn Aurelia', 'Build an app', 'Deploy to production'];
  private newTodo = '';

  addTodo() {
    if (this.newTodo.trim()) {
      this.todos.push(this.newTodo);
      this.newTodo = '';
    }
  }

  removeTodo(index: number) {
    this.todos.splice(index, 1);
  }
}
```

```html
<div class="todo-app">
  <div class="todo-input">
    <input
      type="text"
      value.bind="newTodo"
      placeholder="Add a new todo..."
      keydown.trigger="$event.key === 'Enter' ? addTodo() : true">
    <button click.trigger="addTodo()">Add</button>
  </div>

  <ul class="todo-list">
    <li repeat.for="todo of todos" class="todo-item">
      <span>${todo}</span>
      <button click.trigger="removeTodo($index)" class="delete-btn">×</button>
    </li>
  </ul>
</div>
```

```css
.todo-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  margin: 8px 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.delete-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background: #d32f2f;
}
```

## Quick Tips for Better Animations

1. **Keep it subtle** - Animations should enhance, not distract. Usually 200-400ms is plenty.
2. **Use easing** - `ease-in-out` feels more natural than `linear`.
3. **Be consistent** - Use similar timing and easing across your app.
4. **Performance matters** - Animate `transform` and `opacity` for best performance. Avoid animating `width`, `height`, or `left`/`top` when possible.
5. **Respect user preferences** - Some users prefer reduced motion (covered in the [comprehensive animation guide](../developer-guides/animation.md#accessibility-considerations)).

## What's Next?

This guide covered CSS-based animations, which handle most common scenarios. For more advanced techniques, check out:

- **[Comprehensive Animation Guide](../developer-guides/animation.md)** - Web Animations API, lifecycle hooks, third-party libraries
- **[Component Lifecycles](../components/component-lifecycles.md)** - Understanding when components attach/detach for animation timing

## Common Patterns Quick Reference

| Pattern | Best Approach | Example |
|---------|---------------|---------|
| Hover effects | CSS `:hover` with `transition` | Button color changes |
| Show/hide content | CSS class binding with `transition` | Expandable sections |
| Loading indicators | CSS `@keyframes` animation | Spinners, pulsing dots |
| List item additions | CSS `@keyframes` on new elements | Slide-in animations |
| Button clicks | CSS `:active` state | Scale or position shift |
| Disabled states | CSS `transition` on opacity | Fading out disabled elements |

Start with these simple approaches, and you'll have smooth, professional animations in no time!
