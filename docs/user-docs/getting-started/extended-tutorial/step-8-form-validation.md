---
description: Add form validation with localized error messages using @aurelia/validation and @aurelia/validation-i18n.
---

# Step 8: Form validation with i18n

In this step you will add form validation to Project Pulse. You will use the validation plugin with i18n integration so that validation messages are translated to the current locale.

## 1. Register the validation plugins

Update `src/main.ts` to register the validation configuration:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { I18nConfiguration } from '@aurelia/i18n';
import { ValidationI18nConfiguration } from '@aurelia/validation-i18n';
import { MyApp } from './my-app';
import { RoleHook } from './role-hook';
import { enGB } from './locales/en-gb';
import { enUS } from './locales/en-us';

Aurelia
  .register(
    RouterConfiguration.customize({ activeClass: 'is-active' }),
    RoleHook,
    I18nConfiguration.customize(options => {
      options.initOptions = {
        resources: {
          'en-GB': { translation: enGB },
          'en-US': { translation: enUS }
        },
        lng: 'en-GB',
        fallbackLng: 'en-GB',
        interpolation: {
          escapeValue: false
        }
      };
    }),
    ValidationI18nConfiguration.customize(options => {
      options.DefaultNamespace = 'translation';
      options.DefaultKeyPrefix = 'validation';
    })
  )
  .app(MyApp)
  .start();
```

The `ValidationI18nConfiguration` wraps the standard validation plugin and integrates it with i18n. The `DefaultKeyPrefix` tells the plugin to look for validation messages under the `validation` key in your translation files.

## 2. Add validation messages to locale files

Update `src/locales/en-gb.ts` to add validation messages:

```typescript
export const enGB = {
  app: {
    title: 'Project Pulse'
  },
  nav: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    admin: 'Admin'
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome to Project Pulse',
    intro: 'Use the Projects page to manage tasks.',
    signedInAs: 'Signed in as {{name}}',
    roles: 'Roles',
    signedOut: 'Signed out',
    toggleAdmin: 'Toggle Admin Role'
  },
  projects: {
    title: 'Projects',
    overview: 'Overview',
    activity: 'Activity',
    searchPlaceholder: 'Search projects',
    clear: 'Clear',
    shareFilter: 'Share Filter',
    newProjectPlaceholder: 'New project name',
    addProject: 'Add project',
    openProject: 'Open project',
    remove: 'Remove',
    tasks: '{{count}} task',
    tasks_plural: '{{count}} tasks',
    recentActivity: 'Recent activity',
    activitySummary: 'Activity Summary',
    totalProjects: 'Total projects',
    tasksCompleted: 'Tasks completed',
    createdOn: 'Created on',
    lastUpdated: 'Last updated',
    budget: 'Budget'
  },
  detail: {
    title: 'Project Detail',
    backToOverview: 'Back to Overview',
    notes: 'Notes',
    notesPlaceholder: 'Add notes about this project...',
    save: 'Save',
    unsavedChanges: 'You have unsaved changes. Discard them?'
  },
  admin: {
    title: 'Admin',
    backToDashboard: 'Back to Dashboard',
    adminOnly: 'Only admins can access this page.'
  },
  forbidden: {
    title: 'Access denied',
    message: 'You do not have permission to view that page.'
  },
  locale: {
    switchTo: 'Switch to {{locale}}',
    'en-GB': 'British English',
    'en-US': 'American English'
  },
  common: {
    colour: 'Colour',
    favourite: 'Favourite',
    organisation: 'Organisation',
    centre: 'Centre',
    cancelled: 'Cancelled'
  },
  form: {
    createProject: 'Create Project',
    editProject: 'Edit Project',
    projectName: 'Project name',
    description: 'Description',
    budget: 'Budget',
    create: 'Create',
    update: 'Update',
    cancel: 'Cancel'
  },
  validation: {
    required: '{{$displayName}} is required.',
    minLength: '{{$displayName}} must be at least {{$config.length}} characters.',
    maxLength: '{{$displayName}} must be no more than {{$config.length}} characters.',
    min: '{{$displayName}} must be at least {{$config.constraint | nf}}.',
    max: '{{$displayName}} must be no more than {{$config.constraint | nf}}.',
    range: '{{$displayName}} must be between {{$config.min | nf}} and {{$config.max | nf}}.',
    displayNames: {
      projectName: 'Project name',
      description: 'Description',
      budget: 'Budget'
    }
  }
};
```

Update `src/locales/en-us.ts` with the same structure:

```typescript
export const enUS = {
  app: {
    title: 'Project Pulse'
  },
  nav: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    admin: 'Admin'
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome to Project Pulse',
    intro: 'Use the Projects page to manage tasks.',
    signedInAs: 'Signed in as {{name}}',
    roles: 'Roles',
    signedOut: 'Signed out',
    toggleAdmin: 'Toggle Admin Role'
  },
  projects: {
    title: 'Projects',
    overview: 'Overview',
    activity: 'Activity',
    searchPlaceholder: 'Search projects',
    clear: 'Clear',
    shareFilter: 'Share Filter',
    newProjectPlaceholder: 'New project name',
    addProject: 'Add project',
    openProject: 'Open project',
    remove: 'Remove',
    tasks: '{{count}} task',
    tasks_plural: '{{count}} tasks',
    recentActivity: 'Recent activity',
    activitySummary: 'Activity Summary',
    totalProjects: 'Total projects',
    tasksCompleted: 'Tasks completed',
    createdOn: 'Created on',
    lastUpdated: 'Last updated',
    budget: 'Budget'
  },
  detail: {
    title: 'Project Detail',
    backToOverview: 'Back to Overview',
    notes: 'Notes',
    notesPlaceholder: 'Add notes about this project...',
    save: 'Save',
    unsavedChanges: 'You have unsaved changes. Discard them?'
  },
  admin: {
    title: 'Admin',
    backToDashboard: 'Back to Dashboard',
    adminOnly: 'Only admins can access this page.'
  },
  forbidden: {
    title: 'Access denied',
    message: 'You do not have permission to view that page.'
  },
  locale: {
    switchTo: 'Switch to {{locale}}',
    'en-GB': 'British English',
    'en-US': 'American English'
  },
  common: {
    colour: 'Color',
    favourite: 'Favorite',
    organisation: 'Organization',
    centre: 'Center',
    cancelled: 'Canceled'
  },
  form: {
    createProject: 'Create Project',
    editProject: 'Edit Project',
    projectName: 'Project name',
    description: 'Description',
    budget: 'Budget',
    create: 'Create',
    update: 'Update',
    cancel: 'Cancel'
  },
  validation: {
    required: '{{$displayName}} is required.',
    minLength: '{{$displayName}} must be at least {{$config.length}} characters.',
    maxLength: '{{$displayName}} must be no more than {{$config.length}} characters.',
    min: '{{$displayName}} must be at least {{$config.constraint | nf}}.',
    max: '{{$displayName}} must be no more than {{$config.constraint | nf}}.',
    range: '{{$displayName}} must be between {{$config.min | nf}} and {{$config.max | nf}}.',
    displayNames: {
      projectName: 'Project name',
      description: 'Description',
      budget: 'Budget'
    }
  }
};
```

The `{{$displayName}}` and `{{$config.*}}` placeholders are automatically filled by the validation plugin. The `displayNames` object provides translated names for each validated property.

## 3. Create a project form component

Create `src/pages/project-form-page.ts`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter, IRouteViewModel, Params } from '@aurelia/router';
import { IValidationRules, IValidationController } from '@aurelia/validation-html';
import { I18N } from '@aurelia/i18n';
import { Project } from '../models';
import { PROJECTS } from '../project-data';

type ProjectFormData = {
  name: string;
  description: string;
  budget: number;
};

export class ProjectFormPage implements IRouteViewModel {
  private readonly router = resolve(IRouter);
  private readonly rules = resolve(IValidationRules);
  private readonly controller = resolve(IValidationController);
  private readonly i18n = resolve(I18N);

  project: ProjectFormData = {
    name: '',
    description: '',
    budget: 0
  };

  isEditMode = false;
  editingProjectId?: string;

  loading(params: Params): void {
    const projectId = params.id as string | undefined;

    if (projectId) {
      const existing = PROJECTS.find(item => item.id === projectId);
      if (existing) {
        this.isEditMode = true;
        this.editingProjectId = projectId;
        this.project = {
          name: existing.name,
          description: '',
          budget: existing.budget
        };
      }
    }

    this.setupValidation();
  }

  private setupValidation(): void {
    this.rules
      .on(this.project)
      .ensure('name')
        .displayName(this.i18n.tr('validation.displayNames.projectName'))
        .required()
        .minLength(3)
        .maxLength(50)
      .ensure('description')
        .displayName(this.i18n.tr('validation.displayNames.description'))
        .maxLength(500)
      .ensure('budget')
        .displayName(this.i18n.tr('validation.displayNames.budget'))
        .required()
        .min(0)
        .max(1000000);
  }

  async save(): Promise<void> {
    const result = await this.controller.validate();

    if (!result.valid) {
      return;
    }

    if (this.isEditMode && this.editingProjectId) {
      const existing = PROJECTS.find(item => item.id === this.editingProjectId);
      if (existing) {
        existing.name = this.project.name;
        existing.budget = this.project.budget;
      }
    } else {
      const id = this.project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      PROJECTS.push({
        id,
        name: this.project.name,
        tasks: [],
        createdAt: new Date(),
        budget: this.project.budget
      });
    }

    await this.router.load('../overview');
  }

  async cancel(): Promise<void> {
    await this.router.load('../overview');
  }
}
```

The `IValidationRules` interface provides the fluent API for defining validation rules. The `IValidationController` manages validation state and runs validation when requested.

Create `src/pages/project-form-page.html`:

```html
<import from="../components/app-shell"></import>

<app-shell>
  <h1 au-slot="title" t="${isEditMode ? 'form.editProject' : 'form.createProject'}">
    ${isEditMode ? 'Edit Project' : 'Create Project'}
  </h1>
  <a au-slot="actions" load="../overview" t="detail.backToOverview">Back to Overview</a>

  <form submit.trigger="save()" class="project-form">
    <div class="form-field">
      <label for="projectName" t="form.projectName">Project name</label>
      <input
        id="projectName"
        type="text"
        value.bind="project.name & validate" />
      <span class="validation-errors" validation-errors="for.bind: 'name'; controller.bind: controller">
        <span repeat.for="error of $errors">${error.message}</span>
      </span>
    </div>

    <div class="form-field">
      <label for="description" t="form.description">Description</label>
      <textarea
        id="description"
        value.bind="project.description & validate"
        rows="4">
      </textarea>
      <span class="validation-errors" validation-errors="for.bind: 'description'; controller.bind: controller">
        <span repeat.for="error of $errors">${error.message}</span>
      </span>
    </div>

    <div class="form-field">
      <label for="budget" t="form.budget">Budget</label>
      <input
        id="budget"
        type="number"
        value.bind="project.budget & validate"
        step="100" />
      <span class="validation-errors" validation-errors="for.bind: 'budget'; controller.bind: controller">
        <span repeat.for="error of $errors">${error.message}</span>
      </span>
    </div>

    <div class="form-actions">
      <button type="button" click.trigger="cancel()" t="form.cancel">Cancel</button>
      <button type="submit" t="${isEditMode ? 'form.update' : 'form.create'}">
        ${isEditMode ? 'Update' : 'Create'}
      </button>
    </div>
  </form>
</app-shell>
```

The `& validate` binding behavior connects the input to the validation controller. When the user changes the input, validation runs automatically. The `validation-errors` custom attribute displays error messages for a specific property.

## 4. Add the form route

Update `src/pages/projects-page.ts`:

```typescript
import { route } from '@aurelia/router';
import { ProjectDetailPage } from './project-detail-page';
import { ProjectFormPage } from './project-form-page';
import { ProjectsActivityPage } from './projects-activity-page';
import { ProjectsOverviewPage } from './projects-overview-page';

@route({
  routes: [
    {
      id: 'overview',
      path: ['', 'overview'],
      component: ProjectsOverviewPage,
      title: 'Overview'
    },
    {
      id: 'activity',
      path: 'activity',
      component: ProjectsActivityPage,
      title: 'Activity'
    },
    {
      id: 'project-detail',
      path: 'project/:id',
      component: ProjectDetailPage,
      title: 'Project Detail'
    },
    {
      id: 'project-create',
      path: 'new',
      component: ProjectFormPage,
      title: 'Create Project'
    },
    {
      id: 'project-edit',
      path: 'edit/:id',
      component: ProjectFormPage,
      title: 'Edit Project'
    }
  ]
})
export class ProjectsPage {}
```

## 5. Add navigation to the form

Update `src/pages/projects-overview-page.html` to replace the inline project creation with a link to the form:

```html
<import from="../components/project-card"></import>

<section class="toolbar">
  <input
    value.bind="searchQuery"
    t="[placeholder]projects.searchPlaceholder"
    placeholder="Search projects" />
  <button if.bind="searchQuery" click.trigger="clearSearch()" t="projects.clear">
    Clear
  </button>
  <button if.bind="searchQuery" click.trigger="syncQueryToUrl()" t="projects.shareFilter">
    Share Filter
  </button>
  <a load="route:../project-create" class="btn" t="projects.addProject">
    Add project
  </a>
</section>

<div class="project-grid">
  <project-card
    repeat.for="project of filteredProjects"
    project.bind="project"
    on-remove.bind="(project) => removeProject(project)">
  </project-card>
</div>

<aside class="activity" if.bind="recentActivity.length">
  <h2 t="projects.recentActivity">Recent activity</h2>
  <ul>
    <li repeat.for="entry of recentActivity">${entry}</li>
  </ul>
</aside>
```

Update `src/pages/projects-overview-page.ts` to remove the inline add functionality:

```typescript
import { IEventAggregator, IDisposable, resolve } from '@aurelia/kernel';
import { IRouter, IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { observable } from 'aurelia';
import { Project } from '../models';
import { PROJECTS } from '../project-data';

export class ProjectsOverviewPage implements IRouteViewModel {
  @observable searchQuery = '';

  projects: Project[] = PROJECTS;
  filteredProjects: Project[] = this.projects;
  recentActivity: string[] = [];

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

  removeProject(project: Project): void {
    const index = PROJECTS.indexOf(project);
    if (index >= 0) {
      PROJECTS.splice(index, 1);
    }
    this.projects = [...PROJECTS];
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

## 6. Add an edit button to project cards

Update `src/components/project-card.html`:

```html
<import from="./task-list"></import>

<section class="project-card">
  <header class="project-card__header">
    <h3>${project.name}</h3>
    <span class="project-card__count" t="projects.tasks" t-params.bind="{ count: project.tasks.length }">
      ${project.tasks.length} tasks
    </span>
  </header>

  <div class="project-card__meta">
    <span t="projects.createdOn">Created on</span>: ${project.createdAt | df}
    <br />
    <span t="projects.budget">Budget</span>: ${project.budget | nf:'currency'}
  </div>

  <task-list tasks.bind="project.tasks" project-id.bind="project.id"></task-list>

  <footer class="project-card__footer">
    <a load="route: ../project-detail; params.bind: { id: project.id }" t="projects.openProject">
      Open project
    </a>
    <a load="route: ../project-edit; params.bind: { id: project.id }" t="form.editProject">
      Edit
    </a>
    <button class="project-card__remove" click.trigger="remove()" t="projects.remove">
      Remove
    </button>
  </footer>
</section>
```

## Recap

- `ValidationI18nConfiguration` integrates validation with i18n for localized messages.
- The `DefaultKeyPrefix` option specifies where validation messages are located in translation files.
- Use the fluent API `rules.on(object).ensure('property').required()` to define validation rules.
- The `& validate` binding behavior connects inputs to the validation controller.
- The `validation-errors` custom attribute displays errors for a specific property.
- Call `controller.validate()` to run validation and check `result.valid` before proceeding.
- Validation messages automatically re-translate when the locale changes.

Next step: [Step 9: Dialogs](step-9-dialogs.md)

Back to: [Extended Tutorial overview](README.md)
