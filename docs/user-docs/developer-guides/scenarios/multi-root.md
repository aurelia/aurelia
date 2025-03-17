# Creating a Multi-Root Aurelia 2 Application

In a scenario where you need to manage multiple parts of an application that might not always be active or visible at the same time, you can utilize Aurelia's ability to handle multiple root components. This can be particularly useful for scenarios like switching between a public-facing website and a private application after login, or for loading different parts of an application on demand.

Below is a step-by-step guide on how to create a multi-root Aurelia 2 application, complete with detailed explanations and code examples.

## Strategy

The approach uses two independent Aurelia applications, the first is the simple login wall host where the user is initially directed. The login wall application provides just the authentication flow implementation, and publishes an authenticated event using the `ĒventAggregator` if the user successfully authenticates. At the entry point of the application, the authenticated event is subscribed to and when received, the login wall application is stopped and replaced by a new Aurelia application instance containing the app features.  

## Setting up

In the `src/main.ts` entry point, we first set up the login wall application and subscribe to the authenticated event using an `AppTask`. Inside the event subscription, we stop the Aurelia application that provided the login wall and then call a `start()` function responsible for starting the main app.

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { LoginWall } from './login-wall';
import { MyApp } from './my-app';

const host = document.querySelector<HTMLElement>('login-wall');
const au = new Aurelia();
au.register(
  StandardConfiguration,
  AppTask.hydrated(IEventAggregator, (ea) => {
    ea.subscribeOnce(authenticatedEvent, async () => {
      await au.stop();
      await start();
     });
  })
);
au.app({ host, component: LoginWall });
await au.start();
```

Starting the main app just requires a new Aurelia instance and host element. It is omitted here, but the authenticated event could have been passed to the start function to provide the application with the users auth token and any other user information received in the login process.

```typescript
async function start() {
  const host = document.querySelector<HTMLElement>('my-app');
  const au = new Aurelia();
  au.register(StandardConfiguration, RouterConfiguration);
  au.app({ host, component: MyApp });
  await au.start();
}
```


## Handling Login and Root Transition

In `src/login-wall.ts`, we define the `LoginWall` class with a `login` method. This method will start and conduct the authentication flow and then publish the authenticated event which was subscribed to at the entry point of the application.

```typescript
// src/login-wall.ts
import { customElement, inject, IEventAggregator } from 'aurelia';
import { AppRoot } from './app-root';

@customElement('login-wall')
@inject(IEventAggregator)
export class LoginWall {
  constructor(private _ea: IEventAggregator) {}

  async login() {
    this._ea.publish(authenticatedEvent);
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
  <!-- Placeholder for the LoginWall component -->
  <login-wall></login-wall>

  <!-- Placeholder for the AppRoot component -->
  <my-app></my-app>

  <!-- ... -->
</body>
</html>
```

## Example

The following example shows a working skeleton of the approach described.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-query-jlcrp7rf?file=src%2Flogin.ts,package.json,tsconfig.json,src%2Fabout.html,src%2Fmain.ts,webpack.config.js" %}

## Managing Application State

When switching roots, you might need to manage application state, like user sessions, and ensure a smooth transition. Consider using Aurelia's dependency injection, state management libraries, or browser storage mechanisms to maintain state across root transitions.

## Additional Considerations

- **Routing**: If your application uses routing, you'll need to configure the router for each root component separately.
- **Shared Resources**: shared resources like services or custom elements, will need to be registered independently in each application via the app entry point.
- **Cleanup**: When stopping an Aurelia app instance, make sure to clean up any event listeners or subscriptions to prevent memory leaks.

## Conclusion

Multi-root applications in Aurelia 2 allow for a modular and dynamic approach to managing different parts of your application. By following the steps above, you can create a multi-root setup that can handle complex scenarios, such as a public and private interface transition. Remember that each application is unique, and you may need to adjust this approach to fit your specific requirements.
