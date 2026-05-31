---
description: >-
  Get Aurelia running in under 5 minutes with this quick installation guide.
---

# Quick Install Guide

Get Aurelia up and running in 5 minutes or less.

## Prerequisites

- A code editor of your choice
- [Node.js](https://nodejs.org/en/) (latest version recommended) for the scaffolded app path

## Option 1: Try Aurelia in the browser

Want to try Aurelia immediately without installing anything? Use [Run Aurelia in the browser without a build step](browser-no-build.md). That page is the canonical no-build setup and covers module scripts, CDN imports, version pinning, CodePen usage, and package registration.

For a more complete no-build application, see the [realworld-vanilla example](https://github.com/aurelia/aurelia/tree/master/examples/realworld-vanilla), which demonstrates a full application with routing.

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
