# Auth0 Integration

Integrate Auth0 authentication into your Aurelia 2 application using the modern Auth0 SPA SDK.

## Prerequisites

- Auth0 account with configured application
- Install the Auth0 SPA SDK:

```bash
npm install @auth0/auth0-spa-js
```

## Environment Configuration

Store Auth0 configuration securely:

```typescript
// src/environment.ts
export const environment = {
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    redirectUri: window.location.origin,
    // Additional scopes for your application
    scope: 'openid profile email'
  }
};
```

## Auth Service

```typescript
// src/services/auth.ts
import { DI, Registration } from '@aurelia/kernel';
import { createAuth0Client, Auth0Client, User } from '@auth0/auth0-spa-js';
import { environment } from '../environment';

export const IAuthService = DI.createInterface<IAuthService>('IAuthService');

export interface IAuthService {
  isAuthenticated(): Promise<boolean>;
  getUser(): Promise<User | undefined>;
  login(): Promise<void>;
  logout(): void;
  handleRedirectCallback(): Promise<void>;
  getAccessToken(): Promise<string>;
}

export class AuthService implements IAuthService {
  private auth0Client?: Auth0Client;

  async initialize(): Promise<void> {
    if (this.auth0Client) return;

    this.auth0Client = await createAuth0Client({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: environment.auth0.redirectUri,
        scope: environment.auth0.scope
      },
      useRefreshTokens: true,
      cacheLocation: 'localstorage'
    });
  }

  async login(): Promise<void> {
    await this.ensureInitialized();
    await this.auth0Client!.loginWithRedirect();
  }

  async handleRedirectCallback(): Promise<void> {
    await this.ensureInitialized();
    const query = window.location.search;
    
    if (query.includes('code=') && query.includes('state=')) {
      await this.auth0Client!.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    await this.ensureInitialized();
    return this.auth0Client!.isAuthenticated();
  }

  async getUser(): Promise<User | undefined> {
    await this.ensureInitialized();
    return this.auth0Client!.getUser();
  }

  async getAccessToken(): Promise<string> {
    await this.ensureInitialized();
    return this.auth0Client!.getTokenSilently();
  }

  logout(): void {
    this.auth0Client?.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.auth0Client) {
      await this.initialize();
    }
  }
}

export const AuthServiceRegistration = Registration.singleton(IAuthService, AuthService);
```

## Application Setup

Register the service and initialize Auth0:

```typescript
// src/main.ts
import { Aurelia, StandardConfiguration, AppTask } from '@aurelia/runtime-html';
import { AuthServiceRegistration, IAuthService } from './services/auth';
import { resolve } from '@aurelia/kernel';
import { MyApp } from './my-app';

const au = new Aurelia();
au.register(
  StandardConfiguration,
  AuthServiceRegistration,
  AppTask.creating(() => {
    // Initialize Auth0 before the app starts
    const authService = resolve(IAuthService);
    return authService.initialize();
  })
);

au.app({ host: document.querySelector('my-app'), component: MyApp });
await au.start();
```

## Authentication Component

```typescript
// src/components/auth.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { IAuthService } from '../services/auth';
import { User } from '@auth0/auth0-spa-js';

@customElement('auth-component')
export class AuthComponent {
  isAuthenticated = false;
  user: User | undefined;
  isLoading = true;

  private readonly authService: IAuthService = resolve(IAuthService);

  async attached() {
    try {
      await this.authService.handleRedirectCallback();
      this.isAuthenticated = await this.authService.isAuthenticated();
      
      if (this.isAuthenticated) {
        this.user = await this.authService.getUser();
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async login() {
    await this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
```

```html
<!-- src/components/auth.html -->
<div class="auth-component">
  <div if.bind="isLoading">
    Loading...
  </div>
  
  <div if.bind="!isLoading && !isAuthenticated">
    <button click.trigger="login()">Login with Auth0</button>
  </div>
  
  <div if.bind="!isLoading && isAuthenticated">
    <h3>Welcome, ${user.name}!</h3>
    <p>Email: ${user.email}</p>
    <button click.trigger="logout()">Logout</button>
  </div>
</div>
```

## Router Integration

Protect routes using Auth0:

```typescript
// src/auth-guard.ts
import { lifecycleHooks } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';
import { IAuthService } from './services/auth';

@lifecycleHooks()
export class AuthGuard {
  private readonly authService: IAuthService = resolve(IAuthService);

  async canLoad(): Promise<boolean> {
    const isAuthenticated = await this.authService.isAuthenticated();
    
    if (!isAuthenticated) {
      await this.authService.login();
      return false;
    }
    
    return true;
  }
}
```

```typescript
// src/my-app.ts
import { route } from '@aurelia/router';
import { AuthGuard } from './auth-guard';

@route({
  routes: [
    { path: '', component: import('./home'), title: 'Home' },
    { 
      path: '/protected', 
      component: import('./protected'), 
      title: 'Protected',
      dependencies: [AuthGuard]
    }
  ]
})
export class MyApp {}
```

## API Calls with Tokens

Use access tokens for API requests:

```typescript
// src/services/api.ts
import { resolve } from '@aurelia/kernel';
import { IAuthService } from './auth';

export class ApiService {
  private readonly authService: IAuthService = resolve(IAuthService);

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    try {
      const token = await this.authService.getAccessToken();
      
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}
```

## Best Practices

- Store Auth0 credentials as environment variables
- Use refresh tokens for better security in browsers that block third-party cookies
- Handle token expiration gracefully
- Implement proper error handling for authentication failures
- Test authentication flows in different browsers

This integration follows Auth0's latest SDK patterns and Aurelia 2 best practices for dependency injection and component lifecycle management.
