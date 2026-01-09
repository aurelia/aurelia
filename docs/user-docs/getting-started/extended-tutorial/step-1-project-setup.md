---
description: Set up Project Pulse, enable the router, and build the shared app shell.
---

# Step 1: Project setup + app shell

In this step you will create the project, enable the router, and build a shared layout component.

## 1. Create the project

```bash
npx makes aurelia
# Name: project-pulse
# Select TypeScript
cd project-pulse
npm run dev
```

## 2. Enable the router and active link styling

Update `src/main.ts` to register the router and configure an active class for navigation links:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration.customize({ activeClass: 'is-active' }))
  .app(MyApp)
  .start();
```

Any `<a load="...">` link will now get the `is-active` class when the route is active.

## 3. Create the app shell

Create the folders `src/components` and `src/pages` if you do not have them yet.

Create `src/components/app-shell.ts`:

```typescript
export class AppShell {}
```

Create `src/components/app-shell.html`:

```html
<div class="shell">
  <header class="shell__header">
    <div class="shell__title">
      <au-slot name="title">Project Pulse</au-slot>
    </div>
    <div class="shell__actions">
      <au-slot name="actions"></au-slot>
    </div>
  </header>

  <main class="shell__body">
    <au-slot></au-slot>
  </main>
</div>
```

Next step: [Step 2: Routing + nested layouts](step-2-routing-and-layout.md)
