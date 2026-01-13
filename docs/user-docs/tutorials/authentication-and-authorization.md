# Authentication and Authorization with Aurelia Router

Building secure applications requires proper authentication (verifying user identity) and authorization (controlling access to resources). This tutorial demonstrates how to implement authentication and route guards using Aurelia 2's router (`@aurelia/router`).

## Table of Contents

1. [Overview](#overview)
2. [Setting Up Authentication Service](#setting-up-authentication-service)
3. [JWT Token Management](#jwt-token-management)
4. [Creating Login and Logout](#creating-login-and-logout)
5. [Protecting Routes with canLoad](#protecting-routes-with-canload)
6. [Global Authentication Hooks](#global-authentication-hooks)
7. [Handling Unauthorized Access](#handling-unauthorized-access)
8. [Persisting Authentication State](#persisting-authentication-state)
9. [Complete Example](#complete-example)

## Overview

In this tutorial, you'll learn how to:

- Create an authentication service with login/logout functionality
- Manage JWT tokens securely
- Protect routes using the `canLoad` lifecycle hook
- Implement global authentication guards
- Handle unauthorized access and redirects
- Persist authentication state across page refreshes

## Setting Up Authentication Service

First, let's create an authentication service that manages user state.

```typescript
// src/services/auth-service.ts
import { DI } from '@aurelia/kernel';

export const IAuthService = DI.createInterface<IAuthService>(
  'IAuthService',
  x => x.singleton(AuthService)
);

export interface IAuthService extends AuthService {}

export interface User {
  id: number;
  username: string;
  email: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private currentUser: User | null = null;

  get user(): User | null {
    return this.currentUser;
  }

  get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.currentUser = data.user;

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  logout(): void {
    this.currentUser = null;
  }

  async loadCurrentUser(): Promise<void> {
    // Load user from token or session
    // This will be implemented in the JWT section
  }
}
```

## JWT Token Management

For production applications, use JWT tokens for authentication. Create a token service to handle token storage and validation.

```typescript
// src/services/jwt-service.ts
import { DI, IPlatform } from '@aurelia/kernel';

export const IJwtService = DI.createInterface<IJwtService>(
  'IJwtService',
  x => x.singleton(JwtService)
);

export interface IJwtService extends JwtService {}

const TOKEN_KEY = 'auth_token';

export class JwtService {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
  }

  saveToken(token: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  destroyToken(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEY);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Parse JWT token to check expiration
      const payload = this.parseJwt(token);
      const expiry = payload.exp * 1000; // Convert to milliseconds

      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  }
}
```

Now update the `AuthService` to use JWT tokens:

```typescript
// src/services/auth-service.ts (updated)
import { DI, resolve } from '@aurelia/kernel';
import { IJwtService } from './jwt-service';

export const IAuthService = DI.createInterface<IAuthService>(
  'IAuthService',
  x => x.singleton(AuthService)
);

export interface IAuthService extends AuthService {}

export interface User {
  id: number;
  username: string;
  email: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private jwtService = resolve(IJwtService);
  private currentUser: User | null = null;

  get user(): User | null {
    return this.currentUser;
  }

  get isAuthenticated(): boolean {
    return this.currentUser !== null && this.jwtService.isTokenValid();
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.setAuth(data.user);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  logout(): void {
    this.clearAuth();
  }

  async loadCurrentUser(): Promise<void> {
    if (!this.jwtService.isTokenValid()) {
      this.clearAuth();
      return;
    }

    try {
      const token = this.jwtService.getToken();
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.user;
      } else {
        this.clearAuth();
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      this.clearAuth();
    }
  }

  private setAuth(user: User): void {
    this.jwtService.saveToken(user.token);
    this.currentUser = user;
  }

  private clearAuth(): void {
    this.jwtService.destroyToken();
    this.currentUser = null;
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.jwtService.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}
```

## Creating Login and Logout

Create login and logout components that use the authentication service.

### Login Component

```typescript
// src/pages/login.ts
import { customElement, resolve } from '@aurelia/runtime-html';
import { IRouter } from '@aurelia/router';
import { IAuthService } from '../services/auth-service';

@customElement('login-page')
export class LoginPage {
  private authService = resolve(IAuthService);
  private router = resolve(IRouter);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  async submit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const success = await this.authService.login({
      email: this.email,
      password: this.password
    });

    this.isLoading = false;

    if (success) {
      // Redirect to home or intended page
      await this.router.load('/dashboard');
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
```

```html
<!-- src/pages/login.html -->
<div class="login-page">
  <div class="login-form">
    <h2>Login</h2>

    <form submit.trigger="submit()">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          value.bind="email"
          disabled.bind="isLoading"
          placeholder="Enter your email">
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          value.bind="password"
          disabled.bind="isLoading"
          placeholder="Enter your password">
      </div>

      <div if.bind="errorMessage" class="error-message">
        ${errorMessage}
      </div>

      <button type="submit" disabled.bind="isLoading">
        <span if.bind="!isLoading">Login</span>
        <span if.bind="isLoading">Logging in...</span>
      </button>
    </form>
  </div>
</div>
```

### Navigation with Logout

```typescript
// src/components/nav-bar.ts
import { customElement, resolve } from '@aurelia/runtime-html';
import { IRouter } from '@aurelia/router';
import { IAuthService } from '../services/auth-service';

@customElement('nav-bar')
export class NavBar {
  private authService = resolve(IAuthService);
  private router = resolve(IRouter);

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  get username(): string {
    return this.authService.user?.username ?? '';
  }

  async logout(): Promise<void> {
    this.authService.logout();
    await this.router.load('/login');
  }
}
```

```html
<!-- src/components/nav-bar.html -->
<nav class="navbar">
  <div class="nav-brand">
    <a href="/">My App</a>
  </div>

  <div class="nav-menu">
    <a load="/home">Home</a>

    <div if.bind="isAuthenticated">
      <a load="/dashboard">Dashboard</a>
      <a load="/profile">Profile</a>
      <span class="username">${username}</span>
      <button click.trigger="logout()">Logout</button>
    </div>

    <div if.bind="!isAuthenticated">
      <a load="/login">Login</a>
    </div>
  </div>
</nav>
```

## Protecting Routes with canLoad

The `canLoad` lifecycle hook allows you to protect individual routes by preventing navigation if certain conditions aren't met.

### Component-Level Route Guard

```typescript
// src/pages/dashboard.ts
import { customElement, resolve } from '@aurelia/runtime-html';
import { IRouteViewModel, Params, RouteNode, NavigationInstruction } from '@aurelia/router';
import { IAuthService } from '../services/auth-service';

@customElement('dashboard-page')
export class DashboardPage implements IRouteViewModel {
  private authService = resolve(IAuthService);

  canLoad(
    params: Params,
    next: RouteNode,
    current: RouteNode | null
  ): boolean | NavigationInstruction {
    if (!this.authService.isAuthenticated) {
      // Redirect to login page
      return 'login';
    }

    // Allow navigation
    return true;
  }

  // Component implementation
  dashboardData = [];

  async loading(): Promise<void> {
    // Load dashboard data
    await this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    const response = await fetch('/api/dashboard', {
      headers: this.authService.getAuthHeaders()
    });

    if (response.ok) {
      this.dashboardData = await response.json();
    }
  }
}
```

```html
<!-- src/pages/dashboard.html -->
<div class="dashboard">
  <h1>Dashboard</h1>
  <div class="dashboard-content">
    <!-- Dashboard content -->
  </div>
</div>
```

### Preserving Intended Route

When redirecting to login, you often want to return to the intended page after successful authentication:

```typescript
// src/pages/dashboard.ts (enhanced)
import { customElement, resolve } from '@aurelia/runtime-html';
import {
  IRouteViewModel,
  Params,
  RouteNode,
  NavigationInstruction,
  INavigationOptions
} from '@aurelia/router';
import { IAuthService } from '../services/auth-service';

@customElement('dashboard-page')
export class DashboardPage implements IRouteViewModel {
  private authService = resolve(IAuthService);

  canLoad(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options: INavigationOptions
  ): boolean | NavigationInstruction {
    if (!this.authService.isAuthenticated) {
      // Store intended route and redirect to login
      const returnUrl = encodeURIComponent(next.path);
      return `login?returnUrl=${returnUrl}`;
    }

    return true;
  }
}
```

Update login to handle return URL:

```typescript
// src/pages/login.ts (enhanced)
import { customElement, resolve } from '@aurelia/runtime-html';
import { IRouter, IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { IAuthService } from '../services/auth-service';

@customElement('login-page')
export class LoginPage implements IRouteViewModel {
  private authService = resolve(IAuthService);
  private router = resolve(IRouter);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  returnUrl = '/dashboard';

  loading(params: Params): void {
    // Get return URL from query params
    this.returnUrl = params.returnUrl || '/dashboard';
  }

  async submit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const success = await this.authService.login({
      email: this.email,
      password: this.password
    });

    this.isLoading = false;

    if (success) {
      // Redirect to intended page
      await this.router.load(this.returnUrl);
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
```

## Global Authentication Hooks

For applications with many protected routes, create a reusable authentication hook that can be applied globally.

```typescript
// src/hooks/auth-hook.ts
import { DI, resolve } from '@aurelia/kernel';
import { ILifecycleHooks, lifecycleHooks } from '@aurelia/runtime-html';
import {
  IRouteViewModel,
  Params,
  RouteNode,
  NavigationInstruction,
  INavigationOptions
} from '@aurelia/router';
import { IAuthService } from '../services/auth-service';

export const IAuthHook = DI.createInterface<IAuthHook>(
  'IAuthHook',
  x => x.singleton(AuthHook)
);

export interface IAuthHook extends AuthHook {}

@lifecycleHooks()
export class AuthHook implements ILifecycleHooks<IRouteViewModel, 'canLoad'> {
  private authService = resolve(IAuthService);

  canLoad(
    vm: IRouteViewModel,
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options: INavigationOptions
  ): boolean | NavigationInstruction {
    if (!this.authService.isAuthenticated) {
      const returnUrl = encodeURIComponent(next.path);
      return `login?returnUrl=${returnUrl}`;
    }

    return true;
  }
}
```

### Applying Global Hook to Routes

```typescript
// src/app.ts
import { customElement, resolve } from '@aurelia/runtime-html';
import { route } from '@aurelia/router';
import { IAuthHook } from './hooks/auth-hook';

@route({
  routes: [
    {
      path: '',
      redirectTo: 'home'
    },
    {
      path: 'home',
      component: () => import('./pages/home'),
      title: 'Home'
    },
    {
      path: 'login',
      component: () => import('./pages/login'),
      title: 'Login'
    },
    {
      path: 'dashboard',
      component: () => import('./pages/dashboard'),
      title: 'Dashboard',
      data: {
        auth: IAuthHook
      }
    },
    {
      path: 'profile',
      component: () => import('./pages/profile'),
      title: 'Profile',
      data: {
        auth: IAuthHook
      }
    }
  ]
})
@customElement({
  name: 'app-root',
  template: `
    <nav-bar></nav-bar>
    <div class="main-content">
      <au-viewport></au-viewport>
    </div>
  `
})
export class App {}
```

Register the hook in your main file:

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { IAuthHook, AuthHook } from './hooks/auth-hook';
import { IAuthService, AuthService } from './services/auth-service';
import { IJwtService, JwtService } from './services/jwt-service';
import { App } from './app';

Aurelia
  .register(
    RouterConfiguration,
    IAuthService,
    IJwtService,
    IAuthHook
  )
  .app(App)
  .start();
```

## Handling Unauthorized Access

Handle 401 Unauthorized responses from your API by automatically logging out and redirecting to login.

```typescript
// src/services/api-client.ts
import { DI, resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { IAuthService } from './auth-service';

export const IApiClient = DI.createInterface<IApiClient>(
  'IApiClient',
  x => x.singleton(ApiClient)
);

export interface IApiClient extends ApiClient {}

export class ApiClient {
  private authService = resolve(IAuthService);
  private router = resolve(IRouter);

  private baseUrl = '/api';

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.authService.getAuthHeaders()
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
      // Unauthorized - clear auth and redirect to login
      this.authService.logout();
      await this.router.load('/login');
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}
```

## Persisting Authentication State

Load the user's authentication state when the application starts.

```typescript
// src/app.ts (enhanced)
import { customElement, resolve } from '@aurelia/runtime-html';
import { route, IRouter } from '@aurelia/router';
import { IAuthService } from './services/auth-service';

@route({
  routes: [
    // ... routes configuration
  ]
})
@customElement({
  name: 'app-root',
  template: `
    <div if.bind="loading" class="loading">Loading...</div>
    <div if.bind="!loading">
      <nav-bar></nav-bar>
      <div class="main-content">
        <au-viewport></au-viewport>
      </div>
    </div>
  `
})
export class App {
  private authService = resolve(IAuthService);

  loading = true;

  async binding(): Promise<void> {
    // Load authentication state before rendering
    await this.authService.loadCurrentUser();
    this.loading = false;
  }
}
```

## Complete Example

Here's a complete working example that ties everything together:

### Project Structure

```
src/
  ├── app.ts
  ├── main.ts
  ├── components/
  │   └── nav-bar.ts
  │   └── nav-bar.html
  ├── pages/
  │   ├── home.ts
  │   ├── home.html
  │   ├── login.ts
  │   ├── login.html
  │   ├── dashboard.ts
  │   └── dashboard.html
  ├── services/
  │   ├── auth-service.ts
  │   ├── jwt-service.ts
  │   └── api-client.ts
  └── hooks/
      └── auth-hook.ts
```

### Main Configuration

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { IAuthService } from './services/auth-service';
import { IJwtService } from './services/jwt-service';
import { IApiClient } from './services/api-client';
import { IAuthHook } from './hooks/auth-hook';
import { App } from './app';

Aurelia
  .register(
    RouterConfiguration,
    IAuthService,
    IJwtService,
    IApiClient,
    IAuthHook
  )
  .app(App)
  .start();
```

### App Root with Routes

```typescript
// src/app.ts
import { customElement, resolve } from '@aurelia/runtime-html';
import { route } from '@aurelia/router';
import { IAuthService } from './services/auth-service';
import { IAuthHook } from './hooks/auth-hook';

@route({
  routes: [
    {
      path: '',
      redirectTo: 'home'
    },
    {
      path: 'home',
      component: () => import('./pages/home'),
      title: 'Home'
    },
    {
      path: 'login',
      component: () => import('./pages/login'),
      title: 'Login'
    },
    {
      path: 'dashboard',
      component: () => import('./pages/dashboard'),
      title: 'Dashboard',
      data: {
        auth: IAuthHook
      }
    }
  ]
})
@customElement({
  name: 'app-root',
  template: `
    <div if.bind="loading" class="app-loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
    <div if.bind="!loading" class="app-container">
      <nav-bar></nav-bar>
      <main class="main-content">
        <au-viewport></au-viewport>
      </main>
    </div>
  `
})
export class App {
  private authService = resolve(IAuthService);

  loading = true;

  async binding(): Promise<void> {
    await this.authService.loadCurrentUser();
    this.loading = false;
  }
}
```

## Conclusion

You now have a complete authentication and authorization system with:

- ✅ Secure JWT token management
- ✅ Login and logout functionality
- ✅ Protected routes using `canLoad` lifecycle hooks
- ✅ Global authentication guards
- ✅ Automatic handling of unauthorized requests
- ✅ Persistent authentication state
- ✅ Return URL support after login

### Security Best Practices

1. **Never store sensitive data in localStorage** - Only store tokens, not passwords
2. **Always use HTTPS in production** - Protect tokens in transit
3. **Implement token refresh** - Use refresh tokens for better security
4. **Set appropriate token expiration** - Balance security and user experience
5. **Validate tokens server-side** - Never trust client-side validation alone
6. **Use HTTP-only cookies** - For even better security, consider HTTP-only cookies instead of localStorage
7. **Implement CSRF protection** - Protect against cross-site request forgery
8. **Rate limit authentication endpoints** - Prevent brute force attacks

### Next Steps

- Implement role-based authorization
- Add password reset functionality
- Implement multi-factor authentication (MFA)
- Add social login (OAuth)
- Implement refresh token rotation

For more information on the Aurelia router, see the [official router documentation](https://docs.aurelia.io/router/).
