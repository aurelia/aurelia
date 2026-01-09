---
description: Add router event listeners and polish the navigation experience.
---

# Step 5: Router events + polish

In this step you will listen to router events and surface navigation state in the UI.

## 1. Listen to router events in the Projects layout

Update `src/pages/projects-page.ts`:

```typescript
import { IDisposable, resolve } from '@aurelia/kernel';
import { IRouterEvents, NavigationEndEvent, route } from '@aurelia/router';
import { ProjectsActivityPage } from './projects-activity-page';
import { ProjectsOverviewPage } from './projects-overview-page';

@route({
  routes: [
    { path: ['', 'overview'], component: ProjectsOverviewPage, title: 'Overview' },
    { path: 'activity', component: ProjectsActivityPage, title: 'Activity' }
  ]
})
export class ProjectsPage {
  lastNavigation = '';

  private readonly events = resolve(IRouterEvents);
  private subscription?: IDisposable;

  bound(): void {
    this.subscription = this.events.subscribe(
      'au:router:navigation-end',
      (event: NavigationEndEvent) => {
        this.lastNavigation = event.instructions.toPath();
      }
    );
  }

  unbinding(): void {
    this.subscription?.dispose();
  }
}
```

Update `src/pages/projects-page.html`:

```html
<import from="../components/app-shell"></import>

<app-shell>
  <h1 au-slot="title">Projects</h1>
  <a au-slot="actions" load="../dashboard">Back to Dashboard</a>

  <nav class="projects-subnav">
    <a load="./">Overview</a>
    <a load="activity">Activity</a>
  </nav>

  <p class="nav-meta" if.bind="lastNavigation">
    Last navigation: ${lastNavigation}
  </p>

  <au-viewport></au-viewport>
</app-shell>
```

## 2. Recap the routing features used

You now have:

- Root routes and child routes
- Active navigation styling via `activeClass`
- Query params synced from the UI
- Programmatic navigation via `IRouter.load`
- Router events via `IRouterEvents`
- Guards (`canLoad` and `canUnload`) for real-world UX

If you want, expand this app by adding child routes under `projects/detail/:id`, or persist notes to storage.

Next step: [Step 6: Route data + auth roles](step-6-route-data-and-roles.md)
