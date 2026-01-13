---
description: Centralise application state using @aurelia/state for predictable data management.
---

# Step 10: State management

In this step you will refactor Project Pulse to use centralized state management. You will migrate the auth service and project data to a single store, making data flow more predictable and easier to debug.

## 1. Define the application state

Create `src/state/app-state.ts`:

```typescript
import { Project } from '../models';
import { PROJECTS } from '../project-data';

export type User = {
  name: string;
  roles: string[];
};

export type AppState = {
  user: User | null;
  projects: Project[];
  locale: string;
};

export const initialState: AppState = {
  user: {
    name: 'Taylor',
    roles: ['member']
  },
  projects: structuredClone(PROJECTS),
  locale: 'en-GB'
};
```

The state is a plain object containing all application data. Using `structuredClone` ensures we start with a fresh copy of the initial project data.

## 2. Define actions

Create `src/state/actions.ts`:

```typescript
import { Project, Task } from '../models';

export type AppAction =
  | { type: 'user/toggleRole'; role: string }
  | { type: 'user/logout' }
  | { type: 'projects/add'; project: Project }
  | { type: 'projects/remove'; projectId: string }
  | { type: 'projects/update'; projectId: string; name: string; budget: number }
  | { type: 'tasks/toggle'; projectId: string; taskId: string }
  | { type: 'tasks/add'; projectId: string; task: Task }
  | { type: 'locale/set'; locale: string };
```

Actions are plain objects describing what happened. The `type` property identifies the action, and additional properties carry the payload. Using a discriminated union provides type safety when handling actions.

## 3. Create action handlers

Create `src/state/handlers.ts`:

```typescript
import { AppState } from './app-state';
import { AppAction } from './actions';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'user/toggleRole': {
      if (!state.user) return state;

      const hasRole = state.user.roles.includes(action.role);
      const newRoles = hasRole
        ? state.user.roles.filter(r => r !== action.role)
        : [...state.user.roles, action.role];

      return {
        ...state,
        user: { ...state.user, roles: newRoles }
      };
    }

    case 'user/logout': {
      return { ...state, user: null };
    }

    case 'projects/add': {
      return {
        ...state,
        projects: [...state.projects, action.project]
      };
    }

    case 'projects/remove': {
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.projectId)
      };
    }

    case 'projects/update': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.projectId
            ? { ...p, name: action.name, budget: action.budget }
            : p
        )
      };
    }

    case 'tasks/toggle': {
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.projectId
            ? {
                ...project,
                tasks: project.tasks.map(task =>
                  task.id === action.taskId
                    ? { ...task, done: !task.done }
                    : task
                )
              }
            : project
        )
      };
    }

    case 'tasks/add': {
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.projectId
            ? { ...project, tasks: [...project.tasks, action.task] }
            : project
        )
      };
    }

    case 'locale/set': {
      return { ...state, locale: action.locale };
    }

    default:
      return state;
  }
}
```

Action handlers (reducers) are pure functions that take the current state and an action, then return a new state. They must not mutate the existing state; instead, they create new objects using the spread operator.

## 4. Register the state plugin

Update `src/main.ts` to register the state configuration:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { I18nConfiguration } from '@aurelia/i18n';
import { ValidationI18nConfiguration } from '@aurelia/validation-i18n';
import { DialogConfigurationStandard } from '@aurelia/dialog';
import { StateDefaultConfiguration } from '@aurelia/state';
import { MyApp } from './my-app';
import { RoleHook } from './role-hook';
import { IProjectDialogService } from './services/dialog-service';
import { enGB } from './locales/en-gb';
import { enUS } from './locales/en-us';
import { initialState } from './state/app-state';
import { appReducer } from './state/handlers';

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
    IProjectDialogService,
    StateDefaultConfiguration.init(initialState, appReducer)
  )
  .app(MyApp)
  .start();
```

`StateDefaultConfiguration.init()` creates the store with the initial state and registers the action handler. You can pass multiple handlers if needed.

## 5. Refactor the auth status component

Update `src/components/auth-status.ts` to use state:

```typescript
import { IStore } from '@aurelia/state';
import { resolve } from '@aurelia/kernel';
import { I18N } from '@aurelia/i18n';
import { AppState } from '../state/app-state';
import { AppAction } from '../state/actions';

export class AuthStatus {
  private readonly store = resolve<IStore<AppState, AppAction>>(IStore);
  private readonly i18n = resolve(I18N);

  get user() {
    return this.store.getState().user;
  }

  get signedInMessage(): string {
    const user = this.user;
    if (!user) return '';
    return this.i18n.tr('dashboard.signedInAs', { name: user.name });
  }

  toggleAdmin(): void {
    this.store.dispatch({ type: 'user/toggleRole', role: 'admin' });
  }
}
```

The `IStore` interface provides access to the state and dispatch method. `getState()` returns the current state snapshot. `dispatch()` sends an action to update the state.

Update `src/components/auth-status.html`:

```html
<section class="auth-status">
  <p if.bind="user">
    ${signedInMessage}
    <br />
    <span t="dashboard.roles">Roles</span>: ${user.roles.join(', ')}
  </p>
  <p if.bind="!user" t="dashboard.signedOut">Signed out.</p>

  <button click.trigger="toggleAdmin()" t="dashboard.toggleAdmin">Toggle Admin Role</button>
</section>
```

## 6. Refactor the role hook

Update `src/role-hook.ts` to read from state:

```typescript
import { resolve } from '@aurelia/kernel';
import { lifecycleHooks } from '@aurelia/runtime-html';
import { IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { IStore } from '@aurelia/state';
import { AppState } from './state/app-state';

@lifecycleHooks()
export class RoleHook {
  private readonly store = resolve<IStore<AppState>>(IStore);

  canLoad(_viewModel: IRouteViewModel, _params: Params, next: RouteNode): boolean | string {
    const requiredRoles = next.data?.roles as string[] | undefined;
    const fallbackRoute = (next.data?.fallbackRoute as string | undefined) ?? 'forbidden';

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const state = this.store.getState();
    const userRoles = state.user?.roles ?? [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    return hasRequiredRole ? true : fallbackRoute;
  }
}
```

The role hook now reads user roles directly from the store instead of an auth service.

## 7. Refactor the locale switcher

Update `src/components/locale-switcher.ts` to sync with state:

```typescript
import { resolve } from '@aurelia/kernel';
import { IStore } from '@aurelia/state';
import { I18N } from '@aurelia/i18n';
import { AppState } from '../state/app-state';
import { AppAction } from '../state/actions';

export class LocaleSwitcher {
  private readonly store = resolve<IStore<AppState, AppAction>>(IStore);
  private readonly i18n = resolve(I18N);

  locales = ['en-GB', 'en-US'];

  get currentLocale(): string {
    return this.store.getState().locale;
  }

  async setLocale(locale: string): Promise<void> {
    await this.i18n.setLocale(locale);
    this.store.dispatch({ type: 'locale/set', locale });
    localStorage.setItem('locale', locale);
  }

  async binding(): Promise<void> {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && this.locales.includes(savedLocale)) {
      await this.setLocale(savedLocale);
    }
  }
}
```

## 8. Refactor the projects overview page

Update `src/pages/projects-overview-page.ts`:

```typescript
import { IEventAggregator, IDisposable, resolve } from '@aurelia/kernel';
import { IRouter, IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { IStore } from '@aurelia/state';
import { observable } from 'aurelia';
import { Project } from '../models';
import { AppState } from '../state/app-state';
import { AppAction } from '../state/actions';

export class ProjectsOverviewPage implements IRouteViewModel {
  @observable searchQuery = '';

  filteredProjects: Project[] = [];
  recentActivity: string[] = [];

  private readonly ea = resolve(IEventAggregator);
  private readonly router = resolve(IRouter);
  private readonly store = resolve<IStore<AppState, AppAction>>(IStore);
  private subscription?: IDisposable;

  get projects(): Project[] {
    return this.store.getState().projects;
  }

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
    this.store.dispatch({ type: 'projects/remove', projectId: project.id });
    this.applyFilter();
  }

  updateProject(project: Project): void {
    // The store already has the updated project from the dialog
    this.applyFilter();
  }

  private applyFilter(): void {
    const term = this.searchQuery.trim().toLowerCase();
    this.filteredProjects = term
      ? this.projects.filter(project => project.name.toLowerCase().includes(term))
      : [...this.projects];
  }
}
```

## 9. Refactor the project card

Update `src/components/project-card.ts`:

```typescript
import { bindable } from 'aurelia';
import { resolve } from '@aurelia/kernel';
import { IStore } from '@aurelia/state';
import { Project } from '../models';
import { IProjectDialogService } from '../services/dialog-service';
import { AppState } from '../state/app-state';
import { AppAction } from '../state/actions';

export class ProjectCard {
  @bindable project!: Project;
  @bindable onRemove?: (project: Project) => void;
  @bindable onUpdate?: (project: Project) => void;

  private readonly dialogService = resolve(IProjectDialogService);
  private readonly store = resolve<IStore<AppState, AppAction>>(IStore);

  async remove(): Promise<void> {
    const confirmed = await this.dialogService.confirmDelete(this.project.name);

    if (confirmed) {
      this.onRemove?.(this.project);
    }
  }

  async edit(): Promise<void> {
    const result = await this.dialogService.editProject(this.project);

    if (result) {
      this.store.dispatch({
        type: 'projects/update',
        projectId: this.project.id,
        name: result.name,
        budget: result.budget
      });
      this.onUpdate?.(this.project);
    }
  }
}
```

## 10. Refactor the task item

Update `src/components/task-item.ts` to dispatch through the store:

```typescript
import { IEventAggregator, resolve } from '@aurelia/kernel';
import { IStore } from '@aurelia/state';
import { bindable } from 'aurelia';
import { Task } from '../models';
import { AppState } from '../state/app-state';
import { AppAction } from '../state/actions';

export class TaskItem {
  @bindable task!: Task;
  @bindable projectId = '';

  private readonly ea = resolve(IEventAggregator);
  private readonly store = resolve<IStore<AppState, AppAction>>(IStore);

  toggleTask(): void {
    this.store.dispatch({
      type: 'tasks/toggle',
      projectId: this.projectId,
      taskId: this.task.id
    });

    // Keep the event for the activity log
    this.ea.publish('task:toggled', {
      projectId: this.projectId,
      taskId: this.task.id,
      done: !this.task.done
    });
  }
}
```

Update `src/components/task-item.html`:

```html
<label class="task-item">
  <input type="checkbox" checked.bind="task.done" change.trigger="toggleTask()" />
  <span class.bind="task.done ? 'task-item__done' : ''">
    ${task.title}
  </span>
</label>
```

## 11. Refactor the project form page

Update `src/pages/project-form-page.ts`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter, IRouteViewModel, Params } from '@aurelia/router';
import { IValidationRules, IValidationController } from '@aurelia/validation-html';
import { IStore } from '@aurelia/state';
import { I18N } from '@aurelia/i18n';
import { AppState } from '../state/app-state';
import { AppAction } from '../state/actions';

type ProjectFormData = {
  name: string;
  description: string;
  budget: number;
};

export class ProjectFormPage implements IRouteViewModel {
  private readonly router = resolve(IRouter);
  private readonly rules = resolve(IValidationRules);
  private readonly controller = resolve(IValidationController);
  private readonly store = resolve<IStore<AppState, AppAction>>(IStore);
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
      const projects = this.store.getState().projects;
      const existing = projects.find(item => item.id === projectId);
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
      this.store.dispatch({
        type: 'projects/update',
        projectId: this.editingProjectId,
        name: this.project.name,
        budget: this.project.budget
      });
    } else {
      const id = this.project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      this.store.dispatch({
        type: 'projects/add',
        project: {
          id,
          name: this.project.name,
          tasks: [],
          createdAt: new Date(),
          budget: this.project.budget
        }
      });
    }

    await this.router.load('../overview');
  }

  async cancel(): Promise<void> {
    await this.router.load('../overview');
  }
}
```

## 12. Clean up unused files

You can now remove the auth service since we're using state instead:

- Delete `src/services/auth-service.ts`

Update any remaining imports that reference the auth service to use the store instead.

## Recap

- `StateDefaultConfiguration.init(initialState, reducer)` creates the global store.
- State is a plain object; actions are plain objects with a `type` property.
- Reducers are pure functions: `(state, action) => newState`.
- Use `store.getState()` to read the current state.
- Use `store.dispatch(action)` to update state.
- State changes are immutable: always create new objects, never mutate.
- Components can mix state with local reactive properties as needed.
- The store integrates with existing patterns like Event Aggregator and dialogs.

## What you have built

Congratulations! You have completed the extended Project Pulse tutorial. Your application now includes:

- **Routing**: Nested routes, route guards, query parameters, and active navigation styling
- **Component communication**: Event Aggregator, bindable properties, and parent callbacks
- **Internationalization**: Multi-locale support with date and number formatting
- **Form validation**: Fluent validation rules with localized error messages
- **Dialogs**: Reusable confirmation and edit dialogs with lifecycle hooks
- **State management**: Centralized state with actions and reducers

These patterns form the foundation for building robust Aurelia 2 applications at any scale.

Back to: [Extended Tutorial overview](README.md)
