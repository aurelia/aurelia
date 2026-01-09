---
description: Add real data, reusable components, filters with query params, and event-driven updates.
---

# Step 3: Overview page + filters + events

In this step you will add real data, reusable components, query param syncing, and deep child-to-parent communication with the Event Aggregator.

## 1. Define shared models and data

Create `src/models.ts`:

```typescript
export type Task = {
  id: string;
  title: string;
  done: boolean;
};

export type Project = {
  id: string;
  name: string;
  tasks: Task[];
};
```

Create `src/project-data.ts`:

```typescript
import { Project } from './models';

export const PROJECTS: Project[] = [
  {
    id: 'alpha',
    name: 'Onboarding',
    tasks: [
      { id: 'alpha-1', title: 'Create welcome pack', done: false },
      { id: 'alpha-2', title: 'Schedule kickoff', done: false }
    ]
  },
  {
    id: 'beta',
    name: 'Release prep',
    tasks: [
      { id: 'beta-1', title: 'Finalize changelog', done: true },
      { id: 'beta-2', title: 'QA smoke test', done: false }
    ]
  }
];
```

## 2. Build reusable components

Create `src/components/project-card.ts`:

```typescript
import { bindable } from 'aurelia';
import { Project } from '../models';

export class ProjectCard {
  @bindable project!: Project;
  @bindable onRemove?: (project: Project) => void;

  remove(): void {
    this.onRemove?.(this.project);
  }
}
```

Create `src/components/project-card.html`:

```html
<import from="./task-list"></import>

<section class="project-card">
  <header class="project-card__header">
    <h3>${project.name}</h3>
    <span class="project-card__count">
      ${project.tasks.length} tasks
    </span>
  </header>

  <task-list tasks.bind="project.tasks" project-id.bind="project.id"></task-list>

  <footer class="project-card__footer">
    <a load="route: ../project-detail; params.bind: { id: project.id }">
      Open project
    </a>
    <button class="project-card__remove" click.trigger="remove()">
      Remove
    </button>
  </footer>
</section>
```

The `route:` instruction uses a route **id**. Because this link lives inside the Overview child route, we prefix with `../` so the router resolves the id from the parent (Projects) route context.

Create `src/components/task-list.ts`:

```typescript
import { bindable } from 'aurelia';
import { Task } from '../models';

export class TaskList {
  @bindable tasks: Task[] = [];
  @bindable projectId = '';
}
```

Create `src/components/task-list.html`:

```html
<import from="./task-item"></import>

<ul class="task-list">
  <li repeat.for="task of tasks">
    <task-item task.bind="task" project-id.bind="projectId"></task-item>
  </li>
</ul>
```

Create `src/components/task-item.ts`:

```typescript
import { IEventAggregator, resolve } from '@aurelia/kernel';
import { bindable } from 'aurelia';
import { Task } from '../models';

export class TaskItem {
  @bindable task!: Task;
  @bindable projectId = '';

  private readonly ea = resolve(IEventAggregator);

  notifyToggle(): void {
    this.ea.publish('task:toggled', {
      projectId: this.projectId,
      taskId: this.task.id,
      done: this.task.done
    });
  }
}
```

Create `src/components/task-item.html`:

```html
<label class="task-item">
  <input type="checkbox" checked.bind="task.done" change.trigger="notifyToggle()" />
  <span class.bind="task.done ? 'task-item__done' : ''">
    ${task.title}
  </span>
</label>
```

## 3. Replace the Overview page with real behavior

Update `src/pages/projects-overview-page.ts`:

```typescript
import { IEventAggregator, IDisposable, resolve } from '@aurelia/kernel';
import { IRouter, IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { observable } from 'aurelia';
import { Project } from '../models';
import { PROJECTS } from '../project-data';

export class ProjectsOverviewPage implements IRouteViewModel {
  @observable searchQuery = '';

  projects: Project[] = structuredClone(PROJECTS);
  filteredProjects: Project[] = this.projects;
  recentActivity: string[] = [];
  newProjectName = '';

  private readonly ea = resolve(IEventAggregator);
  private readonly router = resolve(IRouter);
  private subscription?: IDisposable;

  loading(_params: Params, next: RouteNode): void {
    const query = next.queryParams.get('q');
    this.searchQuery = query ?? '';
    this.applyFilter();
  }

  bound(): void {
    this.subscription = this.ea.subscribe('task:toggled', ({ projectId, taskId, done }) => {
      const project = this.projects.find(item => item.id === projectId);
      const task = project?.tasks.find(item => item.id === taskId);

      if (!project || !task) return;

      const status = done ? 'completed' : 'reopened';
      this.recentActivity.unshift(`${project.name}: ${task.title} ${status}`);
      this.recentActivity = this.recentActivity.slice(0, 5);
    });
  }

  unbinding(): void {
    this.subscription?.dispose();
  }

  searchQueryChanged(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilter();
    this.syncQueryToUrl();
  }

  syncQueryToUrl(): void {
    void this.router.load('overview', {
      context: this,
      queryParams: this.searchQuery ? { q: this.searchQuery } : {}
    });
  }

  handleNewProjectKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.addProject();
    }
  }

  addProject(): void {
    const name = this.newProjectName.trim();
    if (!name) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.projects = [
      ...this.projects,
      { id, name, tasks: [] }
    ];
    this.newProjectName = '';
    this.applyFilter();
  }

  removeProject(project: Project): void {
    this.projects = this.projects.filter(item => item !== project);
    this.applyFilter();
  }

  private applyFilter(): void {
    const term = this.searchQuery.trim().toLowerCase();
    this.filteredProjects = term
      ? this.projects.filter(project => project.name.toLowerCase().includes(term))
      : this.projects;
  }
}
```

Update `src/pages/projects-overview-page.html`:

```html
<import from="../components/project-card"></import>

<section class="toolbar">
  <input
    value.bind="searchQuery"
    placeholder="Search projects" />
  <button if.bind="searchQuery" click.trigger="clearSearch()">
    Clear
  </button>
  <button if.bind="searchQuery" click.trigger="syncQueryToUrl()">
    Share Filter
  </button>
</section>

<section class="project-create">
  <input
    value.bind="newProjectName"
    placeholder="New project name"
    keydown.trigger="handleNewProjectKeydown($event)" />
  <button disabled.bind="!newProjectName.trim()" click.trigger="addProject()">
    Add project
  </button>
</section>

<div class="project-grid">
  <project-card
    repeat.for="project of filteredProjects"
    project.bind="project"
    on-remove.bind="(project) => removeProject(project)">
  </project-card>
</div>

<aside class="activity" if.bind="recentActivity.length">
  <h2>Recent activity</h2>
  <ul>
    <li repeat.for="entry of recentActivity">${entry}</li>
  </ul>
</aside>
```

The `loading` hook reads the query params from `next.queryParams`. The Share Filter button uses `IRouter.load()` to update the URL.

## 4. Replace the Activity page with real data

Update `src/pages/projects-activity-page.ts`:

```typescript
import { PROJECTS } from '../project-data';

export class ProjectsActivityPage {
  totalProjects = PROJECTS.length;

  get totalTasks(): number {
    return PROJECTS.reduce((total, project) => total + project.tasks.length, 0);
  }

  get completedTasks(): number {
    return PROJECTS.reduce(
      (total, project) => total + project.tasks.filter(task => task.done).length,
      0
    );
  }
}
```

Update `src/pages/projects-activity-page.html`:

```html
<section class="activity-summary">
  <h2>Activity Summary</h2>
  <p>Total projects: ${totalProjects}</p>
  <p>Tasks completed: ${completedTasks} / ${totalTasks}</p>
</section>
```

Next step: [Step 4: Detail route + guards](step-4-project-detail-and-guards.md)
