---
description: Use route data for roles and enforce access with a router hook.
---

# Step 6: Route data + auth roles

Optional step: This adds route data for role requirements and enforces it with a router hook. You will also add a small auth status widget to toggle the admin role in the UI. If you want to keep the tutorial beginner-friendly, you can stop after Step 5.

## 1. Create a tiny auth service

Create `src/services/auth-service.ts`:

```typescript
import { DI } from '@aurelia/kernel';

export type User = {
  name: string;
  roles: string[];
};

export const IAuthService = DI.createInterface<IAuthService>(
  'IAuthService',
  x => x.singleton(AuthService)
);

export interface IAuthService extends AuthService {}

export class AuthService {
  private user: User | null = { name: 'Taylor', roles: ['member'] };

  getCurrentUser(): User | null {
    return this.user;
  }

  hasRole(role: string): boolean {
    return !!this.user?.roles.includes(role);
  }

  toggleRole(role: string): void {
    if (!this.user) return;

    if (this.user.roles.includes(role)) {
      this.user = { ...this.user, roles: this.user.roles.filter(item => item !== role) };
      return;
    }

    this.user = { ...this.user, roles: [...this.user.roles, role] };
  }
}
```

## 2. Create a role-based router hook

Create `src/role-hook.ts`:

```typescript
import { resolve } from '@aurelia/kernel';
import { lifecycleHooks } from '@aurelia/runtime-html';
import { IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { IAuthService } from './services/auth-service';

@lifecycleHooks()
export class RoleHook {
  private readonly auth = resolve(IAuthService);

  canLoad(_viewModel: IRouteViewModel, _params: Params, next: RouteNode): boolean | string {
    const requiredRoles = next.data?.roles as string[] | undefined;
    const fallbackRoute = (next.data?.fallbackRoute as string | undefined) ?? 'forbidden';

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRequiredRole = requiredRoles.some(role => this.auth.hasRole(role));
    return hasRequiredRole ? true : fallbackRoute;
  }
}
```

Register the hook in `src/main.ts`:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';
import { RoleHook } from './role-hook';

Aurelia
  .register(
    RouterConfiguration.customize({ activeClass: 'is-active' }),
    RoleHook
  )
  .app(MyApp)
  .start();
```

## 3. Add protected routes with route data

Create `src/pages/admin-page.ts`:

```typescript
export class AdminPage {}
```

Create `src/pages/admin-page.html`:

```html
<import from="../components/app-shell"></import>

<app-shell>
  <h1 au-slot="title">Admin</h1>
  <a au-slot="actions" load="../dashboard">Back to Dashboard</a>

  <p>Only admins can access this page.</p>
</app-shell>
```

Create `src/pages/forbidden-page.ts`:

```typescript
export class ForbiddenPage {}
```

Create `src/pages/forbidden-page.html`:

```html
<import from="../components/app-shell"></import>

<app-shell>
  <h1 au-slot="title">Access denied</h1>
  <a au-slot="actions" load="../dashboard">Back to Dashboard</a>

  <p>You do not have permission to view that page.</p>
</app-shell>
```

Update `src/my-app.ts` to add route data:

```typescript
import { route } from '@aurelia/router';
import { AdminPage } from './pages/admin-page';
import { DashboardPage } from './pages/dashboard-page';
import { ForbiddenPage } from './pages/forbidden-page';
import { ProjectsPage } from './pages/projects-page';

@route({
  routes: [
    { path: ['', 'dashboard'], component: DashboardPage, title: 'Dashboard' },
    { path: 'projects', component: ProjectsPage, title: 'Projects' },
    {
      path: 'admin',
      component: AdminPage,
      title: 'Admin',
      data: {
        roles: ['admin'],
        fallbackRoute: 'forbidden'
      }
    },
    { path: 'forbidden', component: ForbiddenPage, title: 'Access denied' }
  ]
})
export class MyApp {}
```

## 4. Add an auth status widget

Create `src/components/auth-status.ts`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IAuthService, User } from '../services/auth-service';

export class AuthStatus {
  private readonly auth = resolve(IAuthService);

  user: User | null = this.auth.getCurrentUser();

  toggleAdmin(): void {
    this.auth.toggleRole('admin');
    this.user = this.auth.getCurrentUser();
  }
}
```

Create `src/components/auth-status.html`:

```html
<section class="auth-status">
  <p if.bind="user">
    Signed in as ${user.name}. Roles: ${user.roles.join(', ')}
  </p>
  <p if.bind="!user">Signed out.</p>

  <button click.trigger="toggleAdmin()">Toggle Admin Role</button>
</section>
```

Update `src/pages/dashboard-page.html` to show it:

```html
<import from="../components/app-shell"></import>
<import from="../components/auth-status"></import>

<app-shell>
  <h1 au-slot="title">Dashboard</h1>
  <a au-slot="actions" load="../projects">View Projects</a>

  <p>Welcome to Project Pulse. Use the Projects page to manage tasks.</p>

  <auth-status></auth-status>
</app-shell>
```

Finally, add the Admin link in `src/my-app.html`:

```html
<nav class="main-nav">
  <a load="dashboard">Dashboard</a>
  <a load="projects">Projects</a>
  <a load="admin">Admin</a>
</nav>

<au-viewport></au-viewport>
```

## Recap

- Route `data` carries the `roles` requirement.
- The `RoleHook` reads `next.data` and redirects to `forbidden` if roles are missing.
- `activeClass` keeps the main nav styled for the active route.

Back to: [Extended Tutorial overview](README.md)
