---
description: >-
  Get Aurelia running in under 5 minutes with this quick installation guide.
---

# Quick Install Guide

Get Aurelia up and running in 5 minutes or less.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (latest version recommended)
- A code editor of your choice

## Create Your App

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

## Run Your App

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

## Core Concepts (Optional Reading)

Aurelia is built on familiar web technologies with a few key concepts:

- **Components**: Made of view-models (`.ts`/`.js`) and views (`.html`)
- **Conventions**: File names and structure follow predictable patterns
- **Dependency Injection**: Built-in system for managing services and dependencies
- **Enhanced HTML**: Templates use familiar HTML with powerful binding syntax

These concepts become clearer as you build with Aurelia. Start with the tutorial above to see them in action!
