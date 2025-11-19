---
description: >-
  Complete getting started guide for Aurelia 2 - from installation to building your first interactive application in 15 minutes.
---

# Complete Getting Started Guide

**Build a real Aurelia application in 15 minutes.** This hands-on guide shows you why developers choose Aurelia for its performance, simplicity, and standards-based approach. No prior Aurelia experience required.

## What You'll Discover

Build a polished task management app while experiencing Aurelia's key advantages:
- **🚀 Instant two-way data binding** - no boilerplate code required
- **⚡ Blazing fast rendering** - direct DOM updates, no virtual DOM overhead
- **🎯 Intuitive component model** - clean, testable architecture
- **🛠️ Modern TypeScript development** - with built-in dependency injection

**The result?** A production-quality app with clean, maintainable code in just 15 minutes.

## Prerequisites

You'll need:
- **Node.js 18+ (recommended latest LTS)** ([Download here](https://nodejs.org/))
- **A code editor** ([VS Code](https://code.visualstudio.com/) recommended)
- **Basic knowledge** of HTML, CSS, and JavaScript

## Quick Try (No Installation)

Want to see Aurelia in action immediately? Copy this into an HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Aurelia 2 Demo</title>
</head>
<body>
  <my-app></my-app>

  <script type="module">
    import Aurelia, { CustomElement } from 'https://cdn.jsdelivr.net/npm/aurelia@latest/+esm';

    const App = CustomElement.define({
      name: 'my-app',
      template: `
        <h1>Hello, \${name}!</h1>
        <input value.bind="name" placeholder="Enter your name">
        <p>You typed: \${name}</p>
      `
    }, class {
      name = 'World';
    });

    new Aurelia()
      .app({ component: App, host: document.querySelector('my-app') })
      .start();
  </script>
</body>
</html>
```

Open it in your browser and start typing! This demonstrates Aurelia's automatic two-way data binding.

## Create Your First Project

### Step 1: Initialize Project

Create a new project using the makes command:

```bash
npx makes aurelia
```

When prompted:
- **Project name**: `my-task-app`
- Choose **TypeScript** or **JavaScript** template (TypeScript recommended)
- **Install dependencies**: `Yes`

```bash
cd my-task-app
npm run dev
```

Your app opens at `http://localhost:9000` showing "Hello World!"

### Step 2: Project Structure

Your new project contains:

```
my-task-app/
├── src/
│   ├── main.ts          # Application entry point
│   ├── my-app.html      # Root component template
│   ├── my-app.ts        # Root component logic
│   └── my-app.css       # Component styles
├── index.html           # Main HTML file
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

**Key files to understand:**
- **`main.ts`**: Starts your Aurelia application
- **`my-app.ts`**: Your root component's logic (TypeScript)
- **`my-app.html`**: Your root component's template (HTML)

## Understanding Aurelia Components

Aurelia apps are built with **components**. Each component has two parts:

### View-Model (Logic)
**`src/my-app.ts`**:
```typescript
export class MyApp {
  message = 'Hello World!';

  // Methods and properties go here
}
```

### View (Template)
**`src/my-app.html`**:
```html
<h1>${message}</h1>
<!-- HTML template goes here -->
```

The `${}` syntax binds data from your view-model to the template. When `message` changes, the `<h1>` automatically updates!

## Build Your Task App

Let's transform the hello world app into a task manager. We'll build it step by step.

### Step 3: Update the Template

Replace contents of **`src/my-app.html`**:

```html
<div class="app">
  <h1>My Task Manager</h1>

  <!-- Add new task form -->
  <div class="add-task">
    <input
      value.bind="newTaskText"
      placeholder="Enter a new task..."
      keydown.trigger="addTaskOnEnter($event)">
    <button click.trigger="addTask()">Add Task</button>
  </div>

  <!-- Task counter -->
  <p class="task-count">
    ${tasks.length} task${tasks.length === 1 ? '' : 's'} total
  </p>

  <!-- Task list -->
  <ul class="task-list">
    <li repeat.for="task of tasks" class="task-item">
      <label class="task-label">
        <input
          type="checkbox"
          checked.bind="task.completed"
          change.trigger="updateTaskCount()">
        <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
      </label>
      <button click.trigger="removeTask(task)" class="remove-btn">×</button>
    </li>
  </ul>

  <!-- Empty state -->
  <p if.bind="tasks.length === 0" class="empty-state">
    No tasks yet. Add one above!
  </p>

  <!-- Completed tasks counter -->
  <p if.bind="completedTaskCount > 0" class="completed-count">
    ✅ ${completedTaskCount} completed
  </p>
</div>
```

### Step 4: Update the Logic

Replace contents of **`src/my-app.ts`**:

```typescript
export class MyApp {
  newTaskText = '';
  tasks: Task[] = [
    { id: 1, text: 'Learn Aurelia basics', completed: false },
    { id: 2, text: 'Build a task app', completed: false },
    { id: 3, text: 'Celebrate! 🎉', completed: false }
  ];
  private nextId = 4;

  get completedTaskCount(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  addTask(): void {
    if (this.newTaskText.trim()) {
      this.tasks.push({
        id: this.nextId++,
        text: this.newTaskText.trim(),
        completed: false
      });
      this.newTaskText = '';
    }
  }

  addTaskOnEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.addTask();
    }
  }

  removeTask(taskToRemove: Task): void {
    this.tasks = this.tasks.filter(task => task !== taskToRemove);
  }

  updateTaskCount(): void {
    // This method triggers reactivity update for computed properties
    // In most cases, Aurelia handles this automatically
  }
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
}
```

### Step 5: Add Styles

Replace contents of **`src/my-app.css`**:

```css
/* Reset and base styles */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 300;
}

/* Add task form */
.add-task {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.add-task input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.add-task input:focus {
  outline: none;
  border-color: #667eea;
}

.add-task button {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.add-task button:hover {
  background: #5a6fd8;
}

/* Task counters */
.task-count, .completed-count {
  color: #666;
  font-size: 0.9rem;
  margin: 1rem 0;
}

.completed-count {
  color: #22c55e;
  font-weight: 500;
}

/* Task list */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
}

.task-item:hover {
  border-color: #667eea;
  background: #f8fafc;
}

.task-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex: 1;
}

.task-label input[type="checkbox"] {
  margin-right: 0.75rem;
  transform: scale(1.2);
}

.task-label span.completed {
  text-decoration: line-through;
  color: #9ca3af;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #dc2626;
}

/* Empty state */
.empty-state {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 2rem;
}
```

### Step 6: See It Work!

Save your files and check your browser. You now have a fully functional task manager! Try:

- **Adding tasks** by typing and clicking "Add Task" or pressing Enter
- **Completing tasks** by checking the checkboxes
- **Removing tasks** by clicking the × button
- **Watching the counters** update automatically

## Key Concepts You Just Learned

### 1. **Data Binding**
```html
<input value.bind="newTaskText">
<span>${task.text}</span>
```
Aurelia automatically keeps your HTML in sync with your TypeScript properties.

### 2. **Event Handling**
```html
<button click.trigger="addTask()">Add Task</button>
<input keydown.trigger="addTaskOnEnter($event)">
```
Connect user interactions to your methods seamlessly.

### 3. **Conditional Rendering**
```html
<p if.bind="tasks.length === 0">No tasks yet!</p>
```
Show or hide elements based on conditions.

### 4. **List Rendering**
```html
<li repeat.for="task of tasks">
  ${task.text}
</li>
```
Display dynamic lists that update automatically.

### 5. **Computed Properties**
```typescript
get completedTaskCount(): number {
  return this.tasks.filter(task => task.completed).length;
}
```
Derived values that update automatically when dependencies change.

## Next Steps

Congratulations! You've built a real Aurelia application. Here's what to explore next:

### Immediate Next Steps
- **[Components Guide](../components/components.md)** - Create reusable components
- **[Templates Deep Dive](../templates/template-syntax/overview.md)** - Master Aurelia's templating
- **[Dependency Injection](../getting-to-know-aurelia/dependency-injection.md)** - Manage services and data

### Building Real Apps
- **[Router](../router/getting-started.md)** - Add navigation between pages
- **[Forms](../templates/forms.md)** - Handle complex user input
- **[HTTP Client](../aurelia-packages/fetch-client/overview.md)** - Connect to APIs

### Development Workflow
- **[Build Tools](../developer-guides/bundlers/)** - Optimize your development setup
- **[Testing](../developer-guides/testing/overview.md)** - Test your applications
- **[Debugging](../developer-guides/debugging-and-troubleshooting.md)** - Debug effectively

## Common Questions

### **"Should I use TypeScript or JavaScript?"**
TypeScript is recommended for better development experience, error catching, and IntelliSense. But JavaScript works perfectly fine too.

### **"How does this compare to React/Vue/Angular?"**
Aurelia focuses on standards-based development with minimal learning curve. If you know HTML, CSS, and JavaScript, you already know most of Aurelia.

### **"Can I use this in production?"**
Absolutely! Aurelia 2 is production-ready and used by companies worldwide. The framework is stable, performant, and well-tested.

### **"What if I get stuck?"**
- **[Documentation](../README.md)** - Comprehensive guides and API docs
- **[GitHub Discussions](https://github.com/aurelia/aurelia/discussions)** - Community Q&A
- **[Discord](https://discord.gg/RBtyM6u)** - Real-time chat with the community

## You're Ready!

You now understand Aurelia's core concepts and have built a working application. The framework's strength lies in its simplicity - what you just learned covers 80% of what you'll use in real applications.

Ready to build something amazing? Dive into the guides above or start building your next project with Aurelia!
