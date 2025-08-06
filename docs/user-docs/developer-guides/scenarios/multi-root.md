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

In the `src/main.ts` entry point, we first set up the login wall application and subscribe to the authenticated event using an `AppTask`. Inside the event subscription, we stop the Aurelia application that provided the login wall and then call a `start()` function responsible for starting the main app.

```typescript
// src/main.ts
import { Aurelia, StandardConfiguration, AppTask } from '@aurelia/runtime-html';
import { IEventAggregator, resolve } from '@aurelia/kernel';
import { LoginWall } from './login-wall';
import { MyApp } from './my-app';

// Shared event constant - could also be defined in a separate constants file
export const AUTHENTICATED_EVENT = 'user:authenticated';

async function main() {
  const host = document.querySelector<HTMLElement>('login-wall')!;
  const au = new Aurelia();
  
  au.register(
    StandardConfiguration,
    AppTask.hydrated(() => {
      const ea = resolve(IEventAggregator);
      ea.subscribeOnce(AUTHENTICATED_EVENT, async () => {
        await au.stop();
        await startMainApp();
      });
    })
  );
  
  au.app({ host, component: LoginWall });
  await au.start();
}

main().catch(console.error);
```

Starting the main app just requires a new Aurelia instance and host element. It is omitted here, but the authenticated event could have been passed to the start function to provide the application with the users auth token and any other user information received in the login process.

```typescript
async function startMainApp() {
  const host = document.querySelector<HTMLElement>('my-app')!;
  const au = new Aurelia();
  
  au.register(
    StandardConfiguration
    // Add additional configurations for your main app:
    // RouterConfiguration, 
    // ValidationConfiguration,
    // etc.
  );
  
  au.app({ host, component: MyApp });
  await au.start();
  
  // Store reference if you need to stop this app later
  // window.mainApp = au;
}
```


## Handling Login and Root Transition

In `src/login-wall.ts`, we define the `LoginWall` class with a `login` method. This method will start and conduct the authentication flow and then publish the authenticated event which was subscribed to at the entry point of the application.

```typescript
// src/login-wall.ts
import { customElement } from '@aurelia/runtime-html';
import { IEventAggregator, resolve } from '@aurelia/kernel';
import { AUTHENTICATED_EVENT } from './main';

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
      this.ea.publish(AUTHENTICATED_EVENT, { 
        username: this.username,
        timestamp: new Date() 
      });
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

In your `index.html` or equivalent, you need to have placeholders for each root component. Make sure to provide unique identifiers for each.

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ... -->
</head>
<body>
  <!-- Placeholder for the LoginWall component - initially visible -->
  <login-wall style="display: block;"></login-wall>

  <!-- Placeholder for the main app - initially hidden -->
  <my-app style="display: none;"></my-app>

  <!-- Optional: Add a loading indicator -->
  <div id="loading" style="display: none;">
    <p>Loading application...</p>
  </div>

  <script>
    // Optional: Show loading during transition
    window.addEventListener('beforeunload', () => {
      document.getElementById('loading').style.display = 'block';
    });
  </script>
</body>
</html>
```

## Example

The following example shows a working skeleton of the approach described.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-query-jlcrp7rf?file=src%2Flogin.ts,package.json,tsconfig.json,src%2Fabout.html,src%2Fmain.ts,webpack.config.js" %}

## Managing Application State

When switching roots, you need to carefully manage application state since each root has its own DI container. Here are recommended approaches:

### Passing Data Between Roots

```typescript
// In main.ts - capture data from the authenticated event
ea.subscribeOnce(AUTHENTICATED_EVENT, async (userData) => {
  await au.stop();
  await startMainApp(userData); // Pass data to main app
});

// Modified startMainApp function
async function startMainApp(userData?: any) {
  const host = document.querySelector<HTMLElement>('my-app')!;
  const au = new Aurelia();
  
  au.register(
    StandardConfiguration,
    // Register user data as a singleton for the main app
    Registration.singleton('UserData', userData || {})
  );
  
  au.app({ host, component: MyApp });
  await au.start();
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

// Stop the application - this cleans up most internal subscriptions
await au.stop();

// Clear any global references
delete window.loginApp;
```

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
