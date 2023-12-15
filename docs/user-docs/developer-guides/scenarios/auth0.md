# Integrating Auth0 with Aurelia 2

In this recipe, we will demonstrate how to integrate Auth0 with Aurelia 2 for authentication. Auth0 provides a flexible, drop-in solution to add authentication and authorization services to your applications.

## Prerequisites

Before we begin, make sure you have:

- An Auth0 account and a configured Auth0 application.
- The `@auth0/auth0-spa-js` package installed in your Aurelia project.

## Setting Up the Auth Service

First, we'll create an authentication service that will handle the interaction with Auth0.

```typescript
// src/services/auth-service.ts
import { IAuth0Client, Auth0Client, Auth0ClientOptions } from '@auth0/auth0-spa-js';
import { DI, IContainer } from 'aurelia';

export const IAuthService = DI.createInterface<IAuthService>('IAuthService', x => x.singleton(AuthService));
export type IAuthService = AuthService;

export class AuthService {
  private auth0Client: IAuth0Client;

  constructor(@IContainer private container: IContainer) {
    const options: Auth0ClientOptions = {
      domain: 'YOUR_AUTH0_DOMAIN',
      client_id: 'YOUR_AUTH0_CLIENT_ID',
      redirect_uri: window.location.origin,
      // ...other Auth0 client options
    };

    this.auth0Client = new Auth0Client(options);
  }

  async login(): Promise<void> {
    await this.auth0Client.loginWithRedirect();
  }

  async handleAuthentication(): Promise<void> {
    const query = window.location.search;
    if (query.includes('code=') && query.includes('state=')) {
      await this.auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  isAuthenticated(): Promise<boolean> {
    return this.auth0Client.isAuthenticated();
  }

  getUser(): Promise<any> {
    return this.auth0Client.getUser();
  }

  logout(): void {
    this.auth0Client.logout({
      returnTo: window.location.origin,
    });
  }
}
```

## Configuring the Auth0 Client

Replace `'YOUR_AUTH0_DOMAIN'` and `'YOUR_AUTH0_CLIENT_ID'` with the actual values from your Auth0 application settings.

## Setting Up the Auth0 Client Provider

Next, we'll create an Auth0 client provider to ensure our `AuthService` has access to the Auth0Client instance.

```typescript
// src/main.ts
import { Aurelia, Registration } from 'aurelia';
import { MyApp } from './my-app';
import { IAuthService } from './services/auth-service';

Aurelia
  .register(Registration.instance(IAuthService, new AuthService()))
  .app(MyApp)
  .start();
```

## Using the Auth Service in Components

Now that we have our `AuthService`, we can inject it into our components to use its functionality.

```typescript
// src/components/login.ts
import { customElement, ICustomElementViewModel } from 'aurelia';
import { IAuthService } from '../services/auth-service';

@customElement({ name: 'login', template: `<button click.trigger="login()">Login</button>` })
export class Login implements ICustomElementViewModel {

  constructor(@IAuthService private authService: IAuthService) {}

  login(): void {
    this.authService.login();
  }
}
```

## Handling Authentication Callbacks

After a successful login, Auth0 will redirect back to your application with the authentication result in the URL. We need to handle this in our application.

```typescript
// src/my-app.ts
import { IRouter, ICustomElementViewModel, watch } from 'aurelia';
import { IAuthService } from './services/auth-service';

export class MyApp implements ICustomElementViewModel {

  constructor(@IRouter private router: IRouter, @IAuthService private authService: IAuthService) {}

  binding(): void {
    this.handleAuthentication();
  }

  async handleAuthentication(): Promise<void> {
    if (await this.authService.isAuthenticated()) {
      // User is authenticated, redirect to the home route or perform other actions
    } else {
      await this.authService.handleAuthentication();
      // Handle post-login actions
    }
  }
  
  // ... Other component logic
}
```

## Conclusion

You have now integrated Auth0 with Aurelia 2 using TypeScript. This setup provides a starting point to secure your application with Auth0. Be sure to handle tokens securely and implement proper error handling as needed. Remember to replace placeholders with your actual Auth0 domain and client ID in the `AuthService`.
