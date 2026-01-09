---
description: Add a detail route with parameters and protect it with router guards.
---

# Step 4: Detail route + guards

In this step you will add a parameterized detail route and guard it with `canLoad` and `canUnload`.

## 1. Add the detail route

Update `src/pages/projects-page.ts` to add the detail child route:

```typescript
import { route } from '@aurelia/router';
import { ProjectDetailPage } from './project-detail-page';
import { ProjectsActivityPage } from './projects-activity-page';
import { ProjectsOverviewPage } from './projects-overview-page';

@route({
  routes: [
    { path: ['', 'overview'], component: ProjectsOverviewPage, title: 'Overview' },
    { path: 'activity', component: ProjectsActivityPage, title: 'Activity' },
    { id: 'project-detail', path: 'detail/:id', component: ProjectDetailPage, title: 'Project Detail' }
  ]
})
export class ProjectsPage {}
```

We keep `detail` in the URL to keep the child routes explicit and readable. The `id: 'project-detail'` value is what the Overview page uses in its `route:` instruction, with a `../` prefix to resolve against the parent context.

## 2. Build the detail page

Create `src/pages/project-detail-page.ts`:

```typescript
import { IRouteViewModel, Params } from '@aurelia/router';
import { Project } from '../models';
import { PROJECTS } from '../project-data';

export class ProjectDetailPage implements IRouteViewModel {
  projectId = '';
  project: Project | null = null;
  noteDraft = '';

  canLoad(params: Params): boolean | string {
    const candidate = PROJECTS.find(item => item.id === params.id);
    return candidate ? true : 'projects';
  }

  loading(params: Params): void {
    this.projectId = params.id ?? '';
    this.project = PROJECTS.find(item => item.id === this.projectId) ?? null;
  }

  canUnload(): boolean {
    if (!this.noteDraft.trim()) return true;
    return confirm('You have an unsaved note. Leave this page?');
  }

  saveNote(): void {
    this.noteDraft = '';
  }
}
```

Create `src/pages/project-detail-page.html`:

```html
<import from="../components/app-shell"></import>

<app-shell>
  <h1 au-slot="title">${project?.name ?? 'Project'}</h1>
  <a au-slot="actions" load="../overview">Back to Projects</a>

  <section if.bind="project">
    <p class="project-meta">Project id: ${projectId}</p>

    <label class="note">
      <span>Note</span>
      <textarea value.bind="noteDraft" placeholder="Add a quick note"></textarea>
    </label>
    <button if.bind="noteDraft" click.trigger="saveNote()">Save Note</button>

    <ul class="task-list">
      <li repeat.for="task of project.tasks">
        <span class.bind="task.done ? 'task-item__done' : ''">${task.title}</span>
      </li>
    </ul>
  </section>

  <p if.bind="!project">Project not found.</p>
</app-shell>
```

**Guard recap:**
- `canLoad` prevents invalid IDs and redirects to `projects`.
- `canUnload` prompts when there is unsaved user input.

Next step: [Step 5: Router events + polish](step-5-router-events-and-polish.md)
