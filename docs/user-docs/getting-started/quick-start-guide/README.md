---
description: >-
  Learn the basics of Aurelia by building an interactive Hello, World!
  application from scratch
---

# Hello World Tutorial

Build your first Aurelia app in 10 minutes! This complete guide takes you from zero to a working interactive application with live data binding.

## What You'll Build

An interactive hello world app where typing in a text field instantly updates the greeting. No page refreshes, no complex setup - just pure Aurelia magic.

{% embed url="https://stackblitz.com/edit/aurelia-hello-world?embed=1&file=my-app.html" %}

## Prerequisites

- Recent version of [Node.js](https://nodejs.org/en/) installed
- Basic knowledge of JavaScript, HTML, and CSS

## Step 1: Create Your Project

Open your terminal and create a new Aurelia project:

```bash
npx makes aurelia
```

When prompted:
- Project name: `hello-world`
- Setup: Choose TypeScript or ESNext (JavaScript) 
- Install dependencies: `yes`

Navigate to your project and start the development server:

```bash
cd hello-world
npm start
```

A browser window opens showing "Hello World". Congratulations! You just ran your first Aurelia app.

## Step 2: Understand the Basics

Aurelia apps are built with **components** that have two parts:
- **View-model** (`.ts`/`.js`): Your logic and data
- **View** (`.html`): Your template

Open `src/my-app.ts` to see your first view-model:

```typescript
export class MyApp {
  message = 'Hello World!';
}
```

And `src/my-app.html` for the view:

```html
<div class="message">${message}</div>
```

The `${message}` syntax is **string interpolation** - it displays the value from your view-model.

## Step 3: Create an Interactive Component

Let's build something more interesting. Create a new component for personalized greetings.

Create `src/hello-name.ts`:

```typescript
export class HelloName {
  name = 'World';
}
```

Create `src/hello-name.html`:

```html
<div>
  <h2>Hello, ${name}!</h2>
  <p>
    <label>Enter your name:</label>
    <input type="text" value.bind="name">
  </p>
</div>
```

The magic is in `value.bind="name"` - this creates **two-way binding** between the input and your view-model property. Change one, and the other updates automatically.

## Step 4: Use Your Component

Update `src/my-app.html` to use your new component:

```html
<import from="./hello-name"></import>

<div class="app">
  <h1>My Aurelia App</h1>
  <hello-name></hello-name>
</div>
```

**Important:** The `<import>` element is required to use your component. It tells Aurelia to load the `hello-name` component from the specified path. Without it, the `<hello-name>` tag won't work and nothing will render (with no error message).

**Alternative:** You can also [register components globally](../../essentials/components.md#option-2-global-registration) in `main.ts` if you want to use them everywhere without imports.

## Step 5: Test Your App

Save your files and watch the browser automatically refresh. You'll see:
- A heading that says "Hello, World!"
- A text input with "World" pre-filled
- As you type in the input, the heading updates instantly

That's it! You've built a reactive Aurelia application with:
- Custom components
- Data binding
- Real-time updates

## Key Concepts You Learned

1. **Components**: Building blocks made of view-models and views
2. **String Interpolation**: `${property}` displays data in templates
3. **Two-way Binding**: `value.bind` keeps input and data synchronized
4. **Component Registration**: `<import>` and custom element tags
5. **Conventions**: File names become component names

## Next Steps

Ready to dive deeper? Explore:

- [Template Syntax](../../templates/template-syntax/overview.md) - loops, conditionals, and more bindings
- [Component Lifecycle](../../components/components.md) - hooks for advanced behavior  
- [Dependency Injection](../../essentials/dependency-injection.md) - sharing services between components
- [Router](../../router/getting-started.md) - multi-page applications

The fundamentals you learned here apply to every Aurelia app you'll build. Start experimenting and see what you can create!

