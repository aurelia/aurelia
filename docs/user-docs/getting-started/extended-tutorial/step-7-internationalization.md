---
description: Add multi-locale support with British and American English using @aurelia/i18n.
---

# Step 7: Internationalization (i18n)

In this step you will add internationalization to Project Pulse. You will create British English (en-GB) and American English (en-US) locales, format dates and numbers according to the user's locale, and build a locale switcher component.

## 1. Register the i18n plugin

Update `src/main.ts` to register the i18n configuration:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { I18nConfiguration } from '@aurelia/i18n';
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
    })
  )
  .app(MyApp)
  .start();
```

The `I18nConfiguration` wraps the popular i18next library. The `resources` object maps locale codes to translation objects. Setting `lng` determines the initial locale.

## 2. Create locale files

Create `src/locales/en-gb.ts`:

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
  }
};
```

Create `src/locales/en-us.ts`:

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
  }
};
```

Notice the spelling differences in the `common` section. British English uses "colour", "favourite", and "organisation" while American English uses "color", "favorite", and "organization". Both locales also format dates and numbers differently, which we will see when using the formatting value converters.

## 3. Create a locale switcher component

Create `src/components/locale-switcher.ts`:

```typescript
import { resolve } from '@aurelia/kernel';
import { I18N } from '@aurelia/i18n';

export class LocaleSwitcher {
  private readonly i18n = resolve(I18N);

  locales = ['en-GB', 'en-US'];
  currentLocale = this.i18n.getLocale();

  async setLocale(locale: string): Promise<void> {
    await this.i18n.setLocale(locale);
    this.currentLocale = locale;
    localStorage.setItem('locale', locale);
  }

  binding(): void {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && this.locales.includes(savedLocale)) {
      void this.setLocale(savedLocale);
    }
  }
}
```

Create `src/components/locale-switcher.html`:

```html
<section class="locale-switcher">
  <button
    repeat.for="locale of locales"
    click.trigger="setLocale(locale)"
    class.bind="locale === currentLocale ? 'active' : ''"
    t="locale.${locale}">
    ${locale}
  </button>
</section>
```

The `t` attribute uses the i18n translation. `t="locale.${locale}"` dynamically selects the translation key based on the locale code, displaying "British English" or "American English" instead of the raw locale code.

## 4. Update the main navigation

Update `src/my-app.html`:

```html
<import from="./components/locale-switcher"></import>

<header class="app-header">
  <nav class="main-nav">
    <a load="dashboard" t="nav.dashboard">Dashboard</a>
    <a load="projects" t="nav.projects">Projects</a>
    <a load="admin" t="nav.admin">Admin</a>
  </nav>
  <locale-switcher></locale-switcher>
</header>

<au-viewport></au-viewport>
```

## 5. Update the dashboard page

Update `src/pages/dashboard-page.html`:

```html
<import from="../components/app-shell"></import>
<import from="../components/auth-status"></import>

<app-shell>
  <h1 au-slot="title" t="dashboard.title">Dashboard</h1>
  <a au-slot="actions" load="../projects" t="projects.title">View Projects</a>

  <p t="dashboard.welcome">Welcome to Project Pulse</p>
  <p t="dashboard.intro">Use the Projects page to manage tasks.</p>

  <auth-status></auth-status>
</app-shell>
```

The `t` attribute replaces the element's text content with the translated string. The original text serves as a fallback if the translation is missing.

## 6. Update the auth status component

Update `src/components/auth-status.ts`:

```typescript
import { resolve } from '@aurelia/kernel';
import { I18N } from '@aurelia/i18n';
import { IAuthService, User } from '../services/auth-service';

export class AuthStatus {
  private readonly auth = resolve(IAuthService);
  private readonly i18n = resolve(I18N);

  user: User | null = this.auth.getCurrentUser();

  get signedInMessage(): string {
    if (!this.user) return '';
    return this.i18n.tr('dashboard.signedInAs', { name: this.user.name });
  }

  toggleAdmin(): void {
    this.auth.toggleRole('admin');
    this.user = this.auth.getCurrentUser();
  }
}
```

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

The `signedInMessage` getter demonstrates programmatic translation with interpolation. The `i18n.tr()` method takes a key and an options object with values to interpolate into the translation string.

## 7. Update the projects overview with date and number formatting

First, update the models to include dates and budgets. Update `src/models.ts`:

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
  createdAt: Date;
  budget: number;
};
```

Update `src/project-data.ts`:

```typescript
import { Project } from './models';

export const PROJECTS: Project[] = [
  {
    id: 'alpha',
    name: 'Onboarding',
    tasks: [
      { id: 'alpha-1', title: 'Create welcome pack', done: false },
      { id: 'alpha-2', title: 'Schedule kickoff', done: false }
    ],
    createdAt: new Date('2024-06-15'),
    budget: 15000
  },
  {
    id: 'beta',
    name: 'Release prep',
    tasks: [
      { id: 'beta-1', title: 'Finalize changelog', done: true },
      { id: 'beta-2', title: 'QA smoke test', done: false }
    ],
    createdAt: new Date('2024-09-01'),
    budget: 42500.50
  }
];
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
    <button class="project-card__remove" click.trigger="remove()" t="projects.remove">
      Remove
    </button>
  </footer>
</section>
```

The `df` value converter formats dates according to the current locale. British English displays "15/06/2024" while American English displays "6/15/2024". The `nf` value converter with the `'currency'` option formats numbers as currency, using the locale's default currency symbol and formatting.

## 8. Update remaining pages

Update `src/pages/projects-page.html`:

```html
<nav class="sub-nav">
  <a load="route:overview" t="projects.overview">Overview</a>
  <a load="route:activity" t="projects.activity">Activity</a>
</nav>

<au-viewport></au-viewport>
```

Update `src/pages/projects-overview-page.html`:

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
</section>

<section class="project-create">
  <input
    value.bind="newProjectName"
    t="[placeholder]projects.newProjectPlaceholder"
    placeholder="New project name"
    keydown.trigger="handleNewProjectKeydown($event)" />
  <button disabled.bind="!newProjectName.trim()" click.trigger="addProject()" t="projects.addProject">
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
  <h2 t="projects.recentActivity">Recent activity</h2>
  <ul>
    <li repeat.for="entry of recentActivity">${entry}</li>
  </ul>
</aside>
```

The `t="[placeholder]key"` syntax translates an attribute instead of text content. You can translate multiple attributes with `t="[placeholder,title]key"`.

Update `src/pages/projects-activity-page.html`:

```html
<section class="activity-summary">
  <h2 t="projects.activitySummary">Activity Summary</h2>
  <p><span t="projects.totalProjects">Total projects</span>: ${totalProjects}</p>
  <p><span t="projects.tasksCompleted">Tasks completed</span>: ${completedTasks} / ${totalTasks}</p>
</section>
```

Update `src/pages/admin-page.html`:

```html
<import from="../components/app-shell"></import>

<app-shell>
  <h1 au-slot="title" t="admin.title">Admin</h1>
  <a au-slot="actions" load="../dashboard" t="admin.backToDashboard">Back to Dashboard</a>

  <p t="admin.adminOnly">Only admins can access this page.</p>
</app-shell>
```

Update `src/pages/forbidden-page.html`:

```html
<import from="../components/app-shell"></import>

<app-shell>
  <h1 au-slot="title" t="forbidden.title">Access denied</h1>
  <a au-slot="actions" load="../dashboard" t="admin.backToDashboard">Back to Dashboard</a>

  <p t="forbidden.message">You do not have permission to view that page.</p>
</app-shell>
```

## 9. Update the project detail page

Update `src/pages/project-detail-page.ts`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter, IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { I18N } from '@aurelia/i18n';
import { Project } from '../models';
import { PROJECTS } from '../project-data';

export class ProjectDetailPage implements IRouteViewModel {
  private readonly router = resolve(IRouter);
  private readonly i18n = resolve(I18N);

  project?: Project;
  notes = '';
  savedNotes = '';

  loading(params: Params): void {
    this.project = PROJECTS.find(item => item.id === params.id);
    this.notes = '';
    this.savedNotes = '';
  }

  get hasUnsavedChanges(): boolean {
    return this.notes !== this.savedNotes;
  }

  save(): void {
    this.savedNotes = this.notes;
  }

  canUnload(): boolean | string {
    if (this.hasUnsavedChanges) {
      return confirm(this.i18n.tr('detail.unsavedChanges'));
    }
    return true;
  }
}
```

Update `src/pages/project-detail-page.html`:

```html
<import from="../components/app-shell"></import>
<import from="../components/task-list"></import>

<app-shell>
  <h1 au-slot="title">${project?.name ?? 'Not found'}</h1>
  <a au-slot="actions" load="../overview" t="detail.backToOverview">Back to Overview</a>

  <template if.bind="project">
    <div class="project-meta">
      <span t="projects.createdOn">Created on</span>: ${project.createdAt | df:'long'}
      <br />
      <span t="projects.budget">Budget</span>: ${project.budget | nf:'currency'}
    </div>

    <task-list tasks.bind="project.tasks" project-id.bind="project.id"></task-list>

    <section class="notes">
      <h2 t="detail.notes">Notes</h2>
      <textarea
        value.bind="notes"
        rows="4"
        t="[placeholder]detail.notesPlaceholder"
        placeholder="Add notes about this project...">
      </textarea>
      <button click.trigger="save()" t="detail.save">Save</button>
    </section>
  </template>

  <p else>Project not found.</p>
</app-shell>
```

The `df:'long'` option uses the long date format. In British English this displays "15 June 2024", while American English shows "June 15, 2024".

## Recap

- `I18nConfiguration.customize()` registers the i18n plugin with i18next options.
- Translation resources use a nested object structure with keys like `dashboard.title`.
- The `t` attribute translates text content; `t="[attr]key"` translates attributes.
- The `df` and `nf` value converters format dates and numbers according to locale.
- `I18N.setLocale()` changes the locale at runtime; all translations update automatically.
- `I18N.tr()` translates strings programmatically with interpolation support.

Next step: [Step 8: Form validation with i18n](step-8-form-validation.md)

Back to: [Extended Tutorial overview](README.md)
