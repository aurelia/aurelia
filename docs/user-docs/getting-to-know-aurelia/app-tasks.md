---
description: >-
  App tasks provide injection points to run code at certain points in the
  compiler lifecycle, allowing you to interface with different parts of the
  framework and execute code.
---

# App Tasks

Falling between component lifecycles and lifecycle hooks, app tasks offer injection points into Aurelia applications that occur at certain points of the compiler lifecycle. Think of them as higher-level framework hooks.

## Lifecycle Phases

App tasks run at key moments in the Aurelia lifecycle. The table below summarizes each phase:

| **Phase**      | **When It Runs**                                                                                                                                               | **Use Cases**                                                                                         |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| **creating**   | Just before DI creates the root component.                                                                                                                   | Last chance to register dependencies that must be injected into the root component.                   |
| **hydrating**  | After instantiating the root view, but before compiling the root and its child elements.                                                                       | Ideal for plugins (e.g., routers) to perform initial work before child elements are processed.       |
| **hydrated**   | After self-hydration of the root controller, but before hydrating child elements.                                                                               | Allows pre-hydration tasks to complete before further initialization.                                |
| **activating** | Right before the root component is activated; at this point, the scope hierarchy is formed and bindings are being bound.                                          | Prepare the application for activation (e.g., feature toggling, initial data loading).              |
| **activated**  | Immediately after the root component is activated.                                                                                                           | The app is fully running; additional startup logic may be executed here.                             |
| **deactivating**| Right before the root component is deactivated; scope hierarchy is unlinked and bindings are getting unbound.                                                   | Useful for cleanup or saving state before the application stops.                                    |
| **deactivated**| Immediately after the root component is deactivated.                                                                                                         | Final cleanup tasks and post-deactivation processing.                                               |

---

## App Task API Overview

Aurelia’s app task API provides methods that correspond to each lifecycle phase. The common app task methods include:

- `AppTask.creating(...)`
- `AppTask.hydrating(...)`
- `AppTask.hydrated(...)`
- `AppTask.activating(...)`
- `AppTask.activated(...)`
- `AppTask.deactivating(...)`
- `AppTask.deactivated(...)`

Each of these methods accepts a callback—and optionally a key—to perform operations during that phase. App tasks can be registered with the DI container during application instantiation or within plugins.

---

## Registering App Tasks

Register app tasks with your DI container (typically in `main.ts`) or from within a plugin.

### Example – Registering an Activating Task

```typescript
import Aurelia, { AppTask } from 'aurelia';

const au = new Aurelia();

au.register(
  AppTask.activating(() => {
    console.log('Activating: before root component activation.');
  })
);
```

Within a plugin, you would export a registration function that receives the container:

```typescript
export function register(container: IContainer) {
  container.register(
    AppTask.activating(() => {
      console.log('Plugin activating: before root component activation.');
    })
  );
}
```

---

## Asynchronous App Tasks

App tasks can also be asynchronous. This is useful for scenarios where you need to perform asynchronous operations (such as dynamic imports) before the application fully starts.

### Example – Asynchronous Hydrating Task

```typescript
import { IContainer } from '@aurelia/kernel';
import { AppTask, DI, Registration } from 'aurelia';

Aurelia.register(
  AppTask.hydrating(IContainer, async container => {
    // Example: conditionally register a dependency
    if (config.enableSpecificOption) {
      const file = await import('file');
      Registration.instance(ISpecificOption, file.do()).register(container);
    }
    Registration.instance(IBootstrapV5Options, config).register(container);
  })
);
```

In this example, the hydrating task waits for an asynchronous import and registers the result with the DI container before the application proceeds.

---

## Examples

### Google Analytics Example

This example demonstrates using an app task to initialize and attach the Google Analytics SDK during the `activating` phase.

```typescript
import { IGoogleAnalytics } from './../resources/services/google-analytics';
import { AppTask } from 'aurelia';

export const GoogleAnalyticsTask = AppTask.activating(IGoogleAnalytics, (ga) => {
  ga.init('UA-44935027-5');
  ga.attach();
});
```

Register the task in `main.ts`:

```typescript
Aurelia.register(GoogleAnalyticsTask);
```

The Google Analytics SDK is initialized and attached during the activating phase of the application lifecycle.

---

## Additional Examples

### Dynamic Feature Loading Based on User Roles

This app task dynamically loads features based on the current user’s roles, ideal for role-based access control.

```typescript
import { IUserService, UserRoles } from './../services/user-service';
import { AppTask } from 'aurelia';

export const DynamicFeatureLoadingTask = AppTask.activating(IUserService, async (userService) => {
  const userRoles = await userService.getCurrentUserRoles();

  if (userRoles.includes(UserRoles.Admin)) {
    await import('./features/admin-feature');
  }

  if (userRoles.includes(UserRoles.User)) {
    await import('./features/user-feature');
  }
});

// Register in main.ts:
Aurelia.register(DynamicFeatureLoadingTask);
```

### Global Error Handling Setup

Set up a global error handler during the `creating` phase to catch any uncaught errors.

```typescript
import { AppTask, ILogger } from 'aurelia';
import { GlobalErrorHandler } from './../services/global-error-handler';

export const GlobalErrorHandlingTask = AppTask.creating(ILogger, logger => {
  window.onerror = (message, source, lineno, colno, error) => {
    const errorHandler = new GlobalErrorHandler(logger);
    errorHandler.handle(error);
    return true; // Prevents default browser error handling.
  };
});

// Register in main.ts:
Aurelia.register(GlobalErrorHandlingTask);
```

### Application Telemetry Setup

Initialize and start a telemetry session after the application is hydrated.

```typescript
import { AppTask } from 'aurelia';
import { TelemetryService } from './../services/telemetry-service';

export const TelemetrySetupTask = AppTask.hydrated(TelemetryService, telemetryService => {
  telemetryService.initialize();
  telemetryService.startSession();
});

// Register in main.ts:
Aurelia.register(TelemetrySetupTask);
```

---

By using app tasks, you can inject custom behavior at critical points in your Aurelia application’s lifecycle. Whether you’re setting up global error handling, dynamically loading features, or initializing third-party integrations, app tasks provide a powerful, flexible mechanism to customize the startup (and shutdown) of your application.
