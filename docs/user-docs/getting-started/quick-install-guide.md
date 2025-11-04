---
description: >-
  Get Aurelia running in under 5 minutes with this quick installation guide.
---

# Quick Install Guide

Get Aurelia up and running in 5 minutes or less.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (latest version recommended)
- A code editor of your choice

## Option 1: Try Aurelia Instantly (No Setup Required)

Want to try Aurelia immediately? Copy this into an HTML file and open it in your browser:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Aurelia 2 Quick Try</title>
    <base href="/" />
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/aurelia@latest/+esm" crossorigin fetchpriority="high">
  </head>
  <body>
    <app-root></app-root>
    <script type="module">
      import { Aurelia, CustomElement } from 'https://cdn.jsdelivr.net/npm/aurelia@latest/+esm';

      const App = CustomElement.define({
        name: 'app-root',
        template: `
          <h1>Hello, \${name}!</h1>
          <input value.bind="name" placeholder="Enter your name">
          <p>You typed: \${name}</p>
        `
      }, class {
        name = 'World';
      });

      new Aurelia()
        .app({ component: App, host: document.querySelector('app-root') })
        .start();
    </script>
  </body>
</html>
```

{% hint style="info" %}
**No installation required!** This uses Aurelia directly from a CDN. Perfect for experimentation or simple projects. For a more complete example, see the [realworld-vanilla example](https://github.com/aurelia/aurelia/tree/master/examples/realworld-vanilla) which demonstrates a full application with routing.
{% endhint %}

## Option 2: Create Your App

Aurelia uses the [Makes](https://www.npmjs.com/package/makes) scaffolding tool. No global installs required.

```bash
npx makes aurelia
```

When prompted:
- **Project name**: Enter your project name
- **Setup**: Choose TypeScript (recommended) or ESNext  
- **Install dependencies**: Select "Yes"

{% hint style="info" %}
**Why TypeScript?** Get intellisense, type safety, and better tooling support out of the box.
{% endhint %}

### Run Your App

Navigate to your project and start the development server:

```bash
cd your-project-name
npm start
```

Your browser will automatically open to `http://localhost:8080` showing your new Aurelia app.

## Verify Everything Works

You should see "Hello World!" displayed in your browser. The development server watches for changes and auto-reloads.

## What's Next?

- **New to Aurelia?** Try our [Hello World Tutorial](quick-start-guide/) for a hands-on introduction
- **Ready for more?** Explore our [developer guides](../developer-guides/README.md) and [tutorials](../tutorials/README.md)
- **Need help?** Check out [troubleshooting](../developer-guides/debugging-and-troubleshooting.md)

## Recommended Reading

Want deeper context after the quick start? These guides build on the concepts introduced here:

- **Component basics** – Understand how views and view-models pair up plus when to use imports vs. global registration in [Component essentials](../essentials/components.md).
- **Project structure & conventions** – See how the scaffolded files fit together in the [Complete guide's project structure section](complete-guide.md#step-2-project-structure).
- **Template syntax & binding** – Explore binding commands, loops, and conditionals in the [template syntax overview](../templates/template-syntax/overview.md).
- **Dependency injection** – Learn how Aurelia's DI container works and when to call `resolve()` in the [DI overview](../getting-to-know-aurelia/dependency-injection-di/overview.md).
- **Routing** – When you need multiple pages, follow the [router getting started guide](../router/getting-started.md) to add navigation.

## Core Concepts (Optional Reading)

Aurelia is built on familiar web technologies with a few key concepts:

- **Components**: Made of view-models (`.ts`/`.js`) and views (`.html`)
- **Conventions**: File names and structure follow predictable patterns
- **Dependency Injection**: Built-in system for managing services and dependencies
- **Enhanced HTML**: Templates use familiar HTML with powerful binding syntax

These concepts become clearer as you build with Aurelia. Start with the tutorial above to see them in action!
