# Creating a Multi-Root Aurelia 2 Application

In a scenario where you need to manage multiple parts of an application that might not always be active or visible at the same time, you can utilize Aurelia's ability to handle multiple root components. This can be particularly useful for scenarios like switching between a public-facing website and a private application after login, or for loading different parts of an application on demand.

Below is a step-by-step guide on how to create a multi-root Aurelia 2 application, complete with detailed explanations and code examples.

## Strategy

The multi-root approach uses two independent Aurelia applications that can be started and stopped independently. This provides complete isolation between different parts of your application, which is beneficial for:

- **Complete application context separation** - Each root has its own DI container, configuration, and lifecycle
- **Memory management** - Unused application parts can be fully disposed of
- **Different configurations** - Each root can have different plugins, services, or settings
- **Lazy loading of major application sections** - Load heavy application parts only when needed
- **Legacy integration** - Migrate parts of existing applications incrementally

The approach works by starting with a lightweight login application that handles authentication. Once authenticated, it stops the login application and starts the main application, ensuring clean separation of concerns and optimal resource usage.  

## Setting up

In the `src/main.ts` entry point, keep explicit references to the hosts and to each `Aurelia` instance. Doing so lets you dispose the login root completely before booting the authenticated root, and gives you a place to store any cross-root state the login flow collects.

```typescript
// src/main.ts
import { Aurelia, StandardConfiguration, AppTask } from '@aurelia/runtime-html';
import { IEventAggregator, resolve } from '@aurelia/kernel';
import { LoginWall } from './login-wall';
import { MyApp } from './my-app';

export const AUTHENTICATED_EVENT = 'user:authenticated';
export interface AuthenticatedPayload {
  username: string;
  timestamp: Date;
  token?: string;
}

const loginHost = document.querySelector<HTMLElement>('#login-root')!;
const appHost = document.querySelector<HTMLElement>('#main-root')!;

let loginApp: Aurelia | null = null;
let mainApp: Aurelia | null = null;

async function startLoginApp() {
  loginHost.hidden = false;

  loginApp = new Aurelia();
  loginApp.register(
    StandardConfiguration,
    AppTask.hydrated(() => {
      const ea = resolve(IEventAggregator);
      ea.subscribeOnce<AuthenticatedPayload>(AUTHENTICATED_EVENT, async (payload) => {
        loginHost.hidden = true;
        await loginApp?.stop(true); // dispose the login root before booting the next one
        loginApp = null;
        await startMainApp(payload);
      });
    }),
  );

  loginApp.app({ host: loginHost, component: LoginWall });
  await loginApp.start();
}

async function startMainApp(userData?: AuthenticatedPayload) {
  appHost.hidden = false;

  mainApp = new Aurelia();
  mainApp.register(
    StandardConfiguration,
    // Add additional configurations for your main app:
    // RouterConfiguration,
    // ValidationConfiguration,
    // etc.
  );

  mainApp.app({ host: appHost, component: MyApp });
  await mainApp.start();

  // Store reference if you need to stop this app later
  // window.mainApp = mainApp;
}

startLoginApp().catch(console.error);
```

Calling `stop(true)` ensures the login root is disposed before the authenticated root starts, which prevents orphaned controllers and DOM nodes. The `AuthenticatedPayload` interface in the snippet documents the data you plan to emit from the login wall—adjust it to match what your back end returns.


## Handling Login and Root Transition

In `src/login-wall.ts`, we define the `LoginWall` class with a `login` method. This method will start and conduct the authentication flow and then publish the authenticated event which was subscribed to at the entry point of the application.

```typescript
// src/login-wall.ts
import { customElement } from '@aurelia/runtime-html';
import { IEventAggregator, resolve } from '@aurelia/kernel';
import { AUTHENTICATED_EVENT, AuthenticatedPayload } from './main';

@customElement('login-wall')
export class LoginWall {
  private readonly ea: IEventAggregator = resolve(IEventAggregator);
  
  username = '';
  password = '';
  isLoading = false;

  async login() {
    this.isLoading = true;
    
    try {
      // Simulate authentication API call
      await this.authenticate(this.username, this.password);
      
      // Publish success event with user data if needed
      const payload: AuthenticatedPayload = {
        username: this.username,
        timestamp: new Date(),
      };
      this.ea.publish(AUTHENTICATED_EVENT, payload);
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error (show message, etc.)
    } finally {
      this.isLoading = false;
    }
  }
  
  private async authenticate(username: string, password: string) {
    // Replace with actual authentication logic
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password) {
          resolve(true);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }
}
```

## Updating the HTML Structure

In your `index.html` or equivalent, you need to have placeholders for each root component. Make sure to provide unique identifiers for each and rely on the native `hidden` attribute so your bootstrap code can switch visibility without adding inline styles.

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ... -->
</head>
<body>
  <!-- Placeholder for the LoginWall component - initially visible -->
  <login-wall id="login-root"></login-wall>

  <!-- Placeholder for the main app - initially hidden via the hidden attribute -->
  <my-app id="main-root" hidden></my-app>

  <!-- Optional: Add a loading indicator -->
  <div id="loading" hidden>
    <p>Loading application...</p>
  </div>

  <script>
    // Optional: Show loading during transition
    window.addEventListener('beforeunload', () => {
      document.getElementById('loading')!.hidden = false;
    });
  </script>
</body>
</html>
```

## Example

To try this locally or in an online sandbox:

1. Scaffold a fresh Aurelia 2 app (`npm create aurelia@latest`).
2. Replace the generated `main.ts`, `login-wall.ts`, and `my-app.ts` with the snippets above.
3. Add two host elements (`<login-root>` and `<my-app>`) to `index.html` and run `npm start`.

The login root will boot first, publish `AUTHENTICATED_EVENT`, and then the authenticated root will take over exactly as described in this recipe.

## Managing Application State

When switching roots, you need to carefully manage application state since each root has its own DI container. Here are recommended approaches:

### Passing Data Between Roots

Define a typed payload and register it as an instance in the authenticated root. `Registration.singleton` expects a constructable type and will try to instantiate it, so use `Registration.instance` for plain objects.

```typescript
// main.ts
import { DI, Registration, resolve } from '@aurelia/kernel';

export const IUserSession = DI.createInterface<AuthenticatedPayload>('IUserSession');

ea.subscribeOnce(AUTHENTICATED_EVENT, async (userData) => {
  await loginApp?.stop(true);
  loginApp = null;
  await startMainApp(userData);
});

async function startMainApp(userData?: AuthenticatedPayload) {
  appHost.hidden = false;
  const session = userData ?? { username: '', timestamp: new Date(0) };

  mainApp = new Aurelia();
  mainApp.register(
    StandardConfiguration,
    Registration.instance(IUserSession, session),
  );

  mainApp.app({ host: appHost, component: MyApp });
  await mainApp.start();
}

// Anywhere in your authenticated root
export class MyApp {
  private readonly session = resolve(IUserSession);
}
```

### Persistent State Options

- **Browser Storage** - Use localStorage/sessionStorage for data that should persist
- **State Management Libraries** - Use libraries like Aurelia Store that can work across app boundaries  
- **Server State** - Store critical state on the server and refetch as needed
- **URL Parameters** - Pass simple state through URL parameters

## Additional Considerations

### Memory Management and Cleanup

When stopping an Aurelia application, most cleanup happens automatically, but be aware of:

```typescript
// Before stopping, clean up any global listeners you added
window.removeEventListener('beforeunload', myHandler);

// Stop the application and dispose the root container
await au.stop(true);

// Clear any global references
delete window.loginApp;
```

If you no longer need the `Aurelia` instance itself, call `au.dispose()` after the stop promise resolves so its container tree is released.

### Routing Configuration

Each root needs its own router configuration:

```typescript
// login-wall might not need routing
au.register(StandardConfiguration);

// main app with full routing
au.register(
  StandardConfiguration,
  RouterConfiguration.customize({ /* routing options */ })
);
```

`RouterConfiguration` (from `@aurelia/router`) registers `RouteContext.setRoot` under the hood, so avoid registering it twice in the same container tree. With independent `Aurelia` instances per root this is naturally enforced—just register the router in each `register` call that belongs to that root.

### Shared Resources

Resources like custom elements, services, or value converters need to be registered in each application that uses them:

```typescript
// Shared service registration in both apps
import { MySharedService } from './services/shared-service';

au.register(
  StandardConfiguration,
  Registration.singleton(MySharedService)
);
```

## Alternative Approaches

While multi-root provides complete isolation, simpler alternatives may be sufficient for many use cases:

### Router Hooks (For Authentication)
```typescript
// Use canLoad hooks for route protection
@lifecycleHooks()
export class AuthGuard {
  canLoad(): boolean {
    return this.authService.isAuthenticated();
  }
}
```

### Dynamic Composition
```html
<!-- Switch components without stopping applications -->
<au-compose component.bind="isAuthenticated ? 'main-app' : 'login-wall'"></au-compose>
```

### Conditional Rendering  
```html
<!-- Simple show/hide approach -->
<login-wall if.bind="!isAuthenticated"></login-wall>
<main-app if.bind="isAuthenticated"></main-app>
```

Choose multi-root when you need complete application isolation. For simpler scenarios, the alternatives above may be more appropriate.

## Conclusion

Multi-root applications in Aurelia 2 provide complete isolation between different parts of your application, making them ideal for scenarios requiring separate application contexts, different configurations, or memory-intensive sections that benefit from being fully disposed. By following the steps above, you can create a robust multi-root setup that handles complex scenarios like public/private application transitions.
