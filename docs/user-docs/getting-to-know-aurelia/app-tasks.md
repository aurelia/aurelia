---
description: Run application-level setup and cleanup at defined points in Aurelia's root lifecycle.
---

# App Tasks

App tasks give plugins and applications a DI-aware place to coordinate startup and shutdown with the root lifecycle. They keep application-wide setup out of the root component and let Aurelia wait for it at the appropriate phase.

## Lifecycle Phases

App tasks run at key moments in the Aurelia lifecycle. The table below summarizes each phase:

| **Phase**      | **When It Runs**                                                                                                                                               | **Use Cases**                                                                                         |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| **creating**   | Just before DI creates the root component.                                                                                                                   | Last chance to register dependencies that must be injected into the root component.                   |
| **hydrating**  | After instantiating the root view, but before compiling the root and its child elements.                                                                       | Ideal for plugins (e.g., routers) to perform initial work before child elements are processed.       |
| **hydrated**   | After self-hydration of the root controller, but before hydrating child elements.                                                                               | Allows pre-hydration tasks to complete before further initialization.                                |
| **activating** | Immediately before root activation, after creation and hydration have completed.                                                                                | Load application data or prepare services used during activation.                                   |
| **activated**  | After the root component and its component tree finish activation.                                                                                               | Start work that requires a running application.                                                      |
| **deactivating**| Before root deactivation while the application remains active.                                                                                                  | Save state or ask a service to prepare for shutdown.                                                 |
| **deactivated**| After the root component finishes deactivation.                                                                                                                 | Finish cleanup that depends on detached and unbound components.                                      |

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

Each of these methods accepts a callback, and optionally a key, to perform operations during that phase. App tasks can be registered with the DI container during application instantiation or within plugins.

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

Return a Promise when a task must finish asynchronous work, such as a dynamic import, before the application continues.

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

## Ordering and failure behavior

Aurelia invokes app tasks in registration order. Promises returned by those tasks may remain pending at the same time. A successful phase completes after all returned Promises settle.

If a callback throws synchronously, later tasks in that phase do not start. A rejected Promise ends the phase as soon as Aurelia observes the rejection. Aurelia reports the original thrown or rejected value. Tasks that already started continue independently, and Aurelia observes any later rejection from them.

A task failure ends the affected application transition and leaves that Aurelia instance in a terminal state. Aurelia preserves the original failure. When the value is an `Error`, its stack helps identify the callback. Fix the cause before creating a new application instance.

Return the complete asynchronous operation from a task so Aurelia can observe its result:

```typescript
const SaveBeforeStop = AppTask.deactivating(
  IWorkspace,
  workspace => workspace.save(),
);
```

If `workspace.save()` rejects, `au.stop()` rejects with that error. Fix the task before creating and starting another Aurelia instance.

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

App tasks make integrations feel native to Aurelia's lifecycle. A plugin can prepare services before components need them and close shared resources with the application. The same setup remains reusable across root components.
