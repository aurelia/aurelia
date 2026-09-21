---
description: Add primary routes, a Projects layout, and nested child routes.
---

# Step 2: Routing + nested layouts

In this step you will create the root pages and a Projects layout that hosts child routes.

## 1. Create the dashboard

Create `src/pages/dashboard-page.ts`:

```typescript
export class DashboardPage {}
```

Create `src/pages/dashboard-page.html`:

```html
<import from="../components/app-shell"></import>

<app-shell>
  <h1 au-slot="title">Dashboard</h1>
  <a au-slot="actions" load="../projects">View Projects</a>

  <p>Welcome to Project Pulse. Use the Projects page to manage tasks.</p>
</app-shell>
```

The `load` attribute resolves routes from the routing context that owns the link. Here, `../projects` moves from the Dashboard page to its parent routing context, then selects the parent's `projects` route. A parent routing context can span several URL segments; `../` in a `load` instruction is not a URL-directory operation.

## 2. Create placeholder child pages

We will build these pages in later steps, but we need the files now so the routes can resolve.

Create `src/pages/projects-overview-page.ts`:

```typescript
export class ProjectsOverviewPage {}
```

Create `src/pages/projects-overview-page.html`:

```html
<p>Projects overview goes here.</p>
```

Create `src/pages/projects-activity-page.ts`:

```typescript
export class ProjectsActivityPage {}
```

Create `src/pages/projects-activity-page.html`:

```html
<p>Activity summary goes here.</p>
```

## 3. Create the Projects layout with child routes

Create `src/pages/projects-page.ts`:

```typescript
import { route } from '@aurelia/router';
import { ProjectsActivityPage } from './projects-activity-page';
import { ProjectsOverviewPage } from './projects-overview-page';

@route({
  routes: [
    { path: ['', 'overview'], component: ProjectsOverviewPage, title: 'Overview' },
    { path: 'activity', component: ProjectsActivityPage, title: 'Activity' }
  ]
})
export class ProjectsPage {}
```

Create `src/pages/projects-page.html`:

```html
<import from="../components/app-shell"></import>

<app-shell>
  <h1 au-slot="title">Projects</h1>
  <a au-slot="actions" load="../dashboard">Back to Dashboard</a>

  <nav class="projects-subnav">
    <a load="">Overview</a>
    <a load="activity">Activity</a>
  </nav>

  <au-viewport></au-viewport>
</app-shell>
```

The nested `<au-viewport>` is where the Overview and Activity pages render. The two tab links belong to `ProjectsPage`, so `load="activity"` selects its `activity` child route even when another child page is open. The back link uses `../dashboard` to select a route owned by the parent.

## 4. Wire up the root routes

Update `src/my-app.ts`:

```typescript
import { route } from '@aurelia/router';
import { DashboardPage } from './pages/dashboard-page';
import { ProjectsPage } from './pages/projects-page';

@route({
  routes: [
    { path: ['', 'dashboard'], component: DashboardPage, title: 'Dashboard' },
    { path: 'projects', component: ProjectsPage, title: 'Projects' }
  ]
})
export class MyApp {}
```

Update `src/my-app.html`:

```html
<nav class="main-nav">
  <a load="dashboard">Dashboard</a>
  <a load="projects">Projects</a>
</nav>

<au-viewport></au-viewport>
```

The `activeClass: 'is-active'` option registered in Step 1 makes `load` apply that class to active links. It also works for the Projects layout's child navigation.

These menus deliberately follow layout ownership. For navigation that should instead follow the current application URL, see [Application URL navigation](../../router/application-url-navigation.md). The two approaches can coexist in the same application.

Next step: [Step 3: Overview page + filters + events](step-3-projects-overview.md)
