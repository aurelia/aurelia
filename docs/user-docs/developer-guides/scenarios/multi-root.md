# Creating a Multi-Root Aurelia 2 Application

In a scenario where you need to manage multiple parts of an application that might not always be active or visible at the same time, you can utilize Aurelia's ability to handle multiple root components. This can be particularly useful for scenarios like switching between a public-facing website and a private application after login, or for loading different parts of an application on demand.

Below is a step-by-step guide on how to create a multi-root Aurelia 2 application, complete with detailed explanations and code examples.

## Setting up the Initial Root

In `src/main.ts`, we set up the initial root of the application. This is typically the entry point of your Aurelia app.

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { LoginWall } from './login-wall';

// Start the Aurelia app with the LoginWall component as the root,
// attaching it to the 'login-wall' element in the HTML.
await Aurelia.app({
  component: LoginWall,
  host: document.querySelector('login-wall'),
}).start();
```

## Handling Login and Root Transition

In `src/login-wall.ts`, we define the `LoginWall` class with a `login` method. This method will stop the current Aurelia instance and start a new one with a different root component.

```typescript
// src/login-wall.ts
import Aurelia from 'aurelia';
import { AppRoot } from './app-root';

export class LoginWall {
  constructor(private au: Aurelia) {}

  async login() {
    // Stop the current Aurelia instance.
    await this.au.stop();

    // Start a new Aurelia app with the AppRoot component as the root,
    // attaching it to the 'app-root' element in the HTML.
    await Aurelia.app({
      component: AppRoot,
      host: document.querySelector('app-root'),
    }).start();
  }
}
```

## Defining Multiple Root Components

Each root component represents a different part of your application. For instance, `LoginWall` could be the public-facing login page, and `AppRoot` could be the main interface of the private application.

```typescript
// src/app-root.ts
import { customElement } from 'aurelia';

@customElement('app-root')
export class AppRoot {
  // Application logic for the private app interface goes here.
}

// src/login-wall.ts (updated)
import { customElement } from 'aurelia';

@customElement('login-wall')
export class LoginWall {
  // Logic for the login page goes here.
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
  <!-- Placeholder for the LoginWall component -->
  <login-wall></login-wall>

  <!-- Placeholder for the AppRoot component -->
  <app-root></app-root>

  <!-- ... -->
</body>
</html>
```

## Managing Application State

When switching roots, you might need to manage application state, like user sessions, and ensure a smooth transition. Consider using Aurelia's dependency injection, state management libraries, or browser storage mechanisms to maintain state across root transitions.

## Additional Considerations

- **Routing**: If your application uses routing, you'll need to configure the router for each root component separately.
- **Shared Resources**: If multiple roots share resources like services or custom elements, ensure they are registered globally or are accessible by each root component.
- **Cleanup**: When stopping an Aurelia app instance, make sure to clean up any event listeners or subscriptions to prevent memory leaks.

## Conclusion

Multi-root applications in Aurelia 2 allow for a modular and dynamic approach to managing different parts of your application. By following the steps above, you can create a multi-root setup that can handle complex scenarios, such as a public and private interface transition. Remember that each application is unique, and you may need to adjust this approach to fit your specific requirements.
