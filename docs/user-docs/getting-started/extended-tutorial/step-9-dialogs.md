---
description: Add modal dialogs for confirmations and editing using @aurelia/dialog.
---

# Step 9: Dialogs

In this step you will add modal dialogs to Project Pulse. You will create a reusable confirmation dialog for delete actions and an edit dialog that integrates with the validation from Step 8.

## 1. Register the dialog plugin

Update `src/main.ts` to register the dialog configuration:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { I18nConfiguration } from '@aurelia/i18n';
import { ValidationI18nConfiguration } from '@aurelia/validation-i18n';
import { DialogConfigurationStandard } from '@aurelia/dialog';
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
    }),
    DialogConfigurationStandard
  )
  .app(MyApp)
  .start();
```

The `DialogConfigurationStandard` registers the dialog service with sensible defaults. Dialogs will use the native HTML `<dialog>` element for proper modal behaviour and accessibility.

## 2. Add dialog translations

Update `src/locales/en-gb.ts` to add dialog-related translations:

```typescript
export const enGB = {
  // ... existing translations ...
  dialog: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
    deleteTitle: 'Delete {{name}}',
    deleteMessage: 'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
    editTitle: 'Edit {{name}}',
    unsavedChanges: 'You have unsaved changes. Close anyway?'
  },
  // ... rest of translations ...
};
```

Update `src/locales/en-us.ts` with the same dialog translations:

```typescript
export const enUS = {
  // ... existing translations ...
  dialog: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
    deleteTitle: 'Delete {{name}}',
    deleteMessage: 'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
    editTitle: 'Edit {{name}}',
    unsavedChanges: 'You have unsaved changes. Close anyway?'
  },
  // ... rest of translations ...
};
```

## 3. Create a confirmation dialog

Create `src/dialogs/confirm-dialog.ts`:

```typescript
import { IDialogController } from '@aurelia/dialog';
import { resolve } from '@aurelia/kernel';
import { I18N } from '@aurelia/i18n';

export type ConfirmDialogModel = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

export class ConfirmDialog {
  private readonly dialogController = resolve(IDialogController);
  private readonly i18n = resolve(I18N);

  title = '';
  message = '';
  confirmLabel = '';
  cancelLabel = '';
  danger = false;

  activate(model: ConfirmDialogModel): void {
    this.title = model.title;
    this.message = model.message;
    this.confirmLabel = model.confirmLabel ?? this.i18n.tr('dialog.confirm');
    this.cancelLabel = model.cancelLabel ?? this.i18n.tr('dialog.cancel');
    this.danger = model.danger ?? false;
  }

  confirm(): void {
    this.dialogController.ok(true);
  }

  cancel(): void {
    this.dialogController.cancel();
  }
}
```

Create `src/dialogs/confirm-dialog.html`:

```html
<dialog class="dialog confirm-dialog">
  <header class="dialog__header">
    <h2>${title}</h2>
  </header>

  <div class="dialog__body">
    <p>${message}</p>
  </div>

  <footer class="dialog__footer">
    <button type="button" click.trigger="cancel()" class="btn btn--secondary">
      ${cancelLabel}
    </button>
    <button
      type="button"
      click.trigger="confirm()"
      class="btn ${danger ? 'btn--danger' : 'btn--primary'}">
      ${confirmLabel}
    </button>
  </footer>
</dialog>
```

The `activate` method receives the model passed when opening the dialog. `dialogController.ok()` closes the dialog with a successful result, while `dialogController.cancel()` closes it as cancelled.

## 4. Create an edit project dialog

Create `src/dialogs/edit-project-dialog.ts`:

```typescript
import { IDialogController } from '@aurelia/dialog';
import { resolve } from '@aurelia/kernel';
import { IValidationRules, IValidationController } from '@aurelia/validation-html';
import { I18N } from '@aurelia/i18n';
import { Project } from '../models';

export type EditProjectDialogModel = {
  project: Project;
};

export type EditProjectDialogResult = {
  name: string;
  budget: number;
};

export class EditProjectDialog {
  private readonly dialogController = resolve(IDialogController);
  private readonly rules = resolve(IValidationRules);
  private readonly validationController = resolve(IValidationController);
  private readonly i18n = resolve(I18N);

  originalProject!: Project;
  editedProject = {
    name: '',
    budget: 0
  };

  title = '';

  activate(model: EditProjectDialogModel): void {
    this.originalProject = model.project;
    this.editedProject = {
      name: model.project.name,
      budget: model.project.budget
    };
    this.title = this.i18n.tr('dialog.editTitle', { name: model.project.name });

    this.setupValidation();
  }

  private setupValidation(): void {
    this.rules
      .on(this.editedProject)
      .ensure('name')
        .displayName(this.i18n.tr('validation.displayNames.projectName'))
        .required()
        .minLength(3)
        .maxLength(50)
      .ensure('budget')
        .displayName(this.i18n.tr('validation.displayNames.budget'))
        .required()
        .min(0)
        .max(1000000);
  }

  get hasChanges(): boolean {
    return (
      this.editedProject.name !== this.originalProject.name ||
      this.editedProject.budget !== this.originalProject.budget
    );
  }

  async save(): Promise<void> {
    const result = await this.validationController.validate();

    if (!result.valid) {
      return;
    }

    const output: EditProjectDialogResult = {
      name: this.editedProject.name,
      budget: this.editedProject.budget
    };

    this.dialogController.ok(output);
  }

  cancel(): void {
    this.dialogController.cancel();
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (this.hasChanges) {
      return confirm(this.i18n.tr('dialog.unsavedChanges'));
    }
    return true;
  }
}
```

Create `src/dialogs/edit-project-dialog.html`:

```html
<dialog class="dialog edit-dialog">
  <header class="dialog__header">
    <h2>${title}</h2>
  </header>

  <form class="dialog__body" submit.trigger="save()">
    <div class="form-field">
      <label for="editName" t="form.projectName">Project name</label>
      <input
        id="editName"
        type="text"
        value.bind="editedProject.name & validate" />
      <span class="validation-errors" validation-errors="for.bind: 'name'; controller.bind: validationController">
        <span repeat.for="error of $errors">${error.message}</span>
      </span>
    </div>

    <div class="form-field">
      <label for="editBudget" t="form.budget">Budget</label>
      <input
        id="editBudget"
        type="number"
        value.bind="editedProject.budget & validate"
        step="100" />
      <span class="validation-errors" validation-errors="for.bind: 'budget'; controller.bind: validationController">
        <span repeat.for="error of $errors">${error.message}</span>
      </span>
    </div>
  </form>

  <footer class="dialog__footer">
    <button type="button" click.trigger="cancel()" class="btn btn--secondary" t="form.cancel">
      Cancel
    </button>
    <button type="button" click.trigger="save()" class="btn btn--primary" t="form.update">
      Update
    </button>
  </footer>
</dialog>
```

The `canDeactivate` lifecycle method prevents the dialog from closing when there are unsaved changes. This works the same way as route guards but for dialogs.

## 5. Create a dialog service helper

Create `src/services/dialog-service.ts`:

```typescript
import { IDialogService } from '@aurelia/dialog';
import { DI, resolve } from '@aurelia/kernel';
import { I18N } from '@aurelia/i18n';
import { ConfirmDialog } from '../dialogs/confirm-dialog';
import { EditProjectDialog, EditProjectDialogResult } from '../dialogs/edit-project-dialog';
import { Project } from '../models';

export const IProjectDialogService = DI.createInterface<IProjectDialogService>(
  'IProjectDialogService',
  x => x.singleton(ProjectDialogService)
);

export interface IProjectDialogService extends ProjectDialogService {}

export class ProjectDialogService {
  private readonly dialogService = resolve(IDialogService);
  private readonly i18n = resolve(I18N);

  async confirmDelete(name: string): Promise<boolean> {
    const { dialog } = await this.dialogService.open({
      component: () => ConfirmDialog,
      model: {
        title: this.i18n.tr('dialog.deleteTitle', { name }),
        message: this.i18n.tr('dialog.deleteMessage', { name }),
        confirmLabel: this.i18n.tr('dialog.delete'),
        danger: true
      }
    });

    const result = await dialog.closed;
    return result.status === 'ok';
  }

  async editProject(project: Project): Promise<EditProjectDialogResult | null> {
    const { dialog } = await this.dialogService.open({
      component: () => EditProjectDialog,
      model: { project }
    });

    const result = await dialog.closed;

    if (result.status === 'ok') {
      return result.value as EditProjectDialogResult;
    }

    return null;
  }
}
```

The helper service simplifies dialog usage throughout the app. `dialogService.open()` returns immediately with a reference to the dialog. Awaiting `dialog.closed` waits for the user to close the dialog and returns the result.

## 6. Register the dialog service

Update `src/main.ts` to register the dialog service:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { I18nConfiguration } from '@aurelia/i18n';
import { ValidationI18nConfiguration } from '@aurelia/validation-i18n';
import { DialogConfigurationStandard } from '@aurelia/dialog';
import { MyApp } from './my-app';
import { RoleHook } from './role-hook';
import { IProjectDialogService } from './services/dialog-service';
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
    }),
    DialogConfigurationStandard,
    IProjectDialogService
  )
  .app(MyApp)
  .start();
```

## 7. Use dialogs in the project card

Update `src/components/project-card.ts`:

```typescript
import { bindable } from 'aurelia';
import { resolve } from '@aurelia/kernel';
import { Project } from '../models';
import { IProjectDialogService } from '../services/dialog-service';

export class ProjectCard {
  @bindable project!: Project;
  @bindable onRemove?: (project: Project) => void;
  @bindable onUpdate?: (project: Project) => void;

  private readonly dialogService = resolve(IProjectDialogService);

  async remove(): Promise<void> {
    const confirmed = await this.dialogService.confirmDelete(this.project.name);

    if (confirmed) {
      this.onRemove?.(this.project);
    }
  }

  async edit(): Promise<void> {
    const result = await this.dialogService.editProject(this.project);

    if (result) {
      this.project.name = result.name;
      this.project.budget = result.budget;
      this.onUpdate?.(this.project);
    }
  }
}
```

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
    <button type="button" click.trigger="edit()" t="form.editProject">
      Edit
    </button>
    <button type="button" class="project-card__remove" click.trigger="remove()" t="projects.remove">
      Remove
    </button>
  </footer>
</section>
```

## 8. Update the overview page to handle updates

Update `src/pages/projects-overview-page.ts`:

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

  updateProject(_project: Project): void {
    // Trigger reactivity by reassigning the array
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

Update `src/pages/projects-overview-page.html` to pass the update handler:

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
    on-remove.bind="(project) => removeProject(project)"
    on-update.bind="(project) => updateProject(project)">
  </project-card>
</div>

<aside class="activity" if.bind="recentActivity.length">
  <h2 t="projects.recentActivity">Recent activity</h2>
  <ul>
    <li repeat.for="entry of recentActivity">${entry}</li>
  </ul>
</aside>
```

## 9. Add basic dialog styles

Create `src/dialogs/dialog.css` and import it in your app, or add these styles to your main stylesheet:

```css
.dialog {
  border: none;
  border-radius: 8px;
  padding: 0;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.dialog__header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.dialog__header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.dialog__body {
  padding: 1.5rem;
}

.dialog__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn--danger {
  background: #dc3545;
  color: white;
}

.btn--danger:hover {
  background: #c82333;
}
```

## Recap

- `DialogConfigurationStandard` registers the dialog service with the native `<dialog>` element.
- `IDialogService.open()` opens a dialog and returns a reference to track it.
- `dialog.closed` is a promise that resolves with the dialog result when closed.
- Dialog components use `IDialogController.ok(value)` and `cancel()` to close.
- The `activate(model)` lifecycle receives data passed when opening the dialog.
- The `canDeactivate()` lifecycle can prevent closing (e.g., for unsaved changes).
- Creating a wrapper service simplifies dialog usage across the application.

Next step: [Step 10: State management](step-10-state-management.md)

Back to: [Extended Tutorial overview](README.md)
