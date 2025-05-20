---
description: Access information about the active route via ICurrentRoute.
---

# Current route

`ICurrentRoute` is a dependency injection token that exposes details of the route that is currently active. The instance is updated whenever navigation finishes so that you can inspect the active path, URL and query information from any component or service.

`ICurrentRoute` has the following shape:

```ts
interface ICurrentRoute {
  readonly path: string;
  readonly url: string;
  readonly title: string;
  readonly query: URLSearchParams;
  readonly parameterInformation: readonly ParameterInformation[];
}

interface ParameterInformation {
  readonly config: RouteConfig | null;
  readonly viewport: string | null;
  readonly params: Readonly<Params> | null;
  readonly children: readonly ParameterInformation[];
}
```

To use it, inject the token and read its properties:

```ts
import { ICurrentRoute } from '@aurelia/router-lite';
import { resolve } from 'aurelia';

export class MyApp {
  private readonly currentRoute = resolve(ICurrentRoute);

  attached() {
    console.log('Active path:', this.currentRoute.path);
    console.log('Active url:', this.currentRoute.url);
  }
}
```

The `parameterInformation` array mirrors the hierarchy of viewport instructions of the current navigation. It allows you to inspect route parameters and nested routes programmatically.