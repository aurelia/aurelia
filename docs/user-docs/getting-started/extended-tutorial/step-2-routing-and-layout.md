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

**Note:** Links inside routed components are resolved relative to the current route. Use `../` when you want to navigate to a sibling at the parent level.

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

The nested `<au-viewport>` is where the Overview and Activity pages render.

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

Notice the `is-active` class when you navigate between Dashboard and Projects.

Next step: [Step 3: Overview page + filters + events](step-3-projects-overview.md)
