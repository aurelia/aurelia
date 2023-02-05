---
description: >-
  Learn about how to subscribe to and handle router events.
---

# Router events

You can use the lifecycle hooks ([instance](./routing-lifecycle.md) and [shared](./router-hooks.md)) to intercept different stages of the navigation when you are working with the routed components directly.
However, if you want to tap into different navigation phases from a non-routed component, such as standalone service or a simple custom element, then you need to leverage router events.
This section discusses that.

## Emitted events

The router emits the following events.

- `au:router:location-change`: Emitted when the browser location is changed via the [`popstate`](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event) and [`hashchange`](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event) events.
- `au:router:navigation-start`: Emitted by router before executing a routing instruction; or in other words, before performing navigation.
- `au:router:navigation-end`: Emitted when the navigation is completed successfully.
- `au:router:navigation-cancel`: Emitted when the navigation is cancelled via a non-`true` return value from `canLoad` or `canUnload` lifecycle hooks.
- `au:router:navigation-error`: Emitted when the navigation is erred.

## Subscribing to the events

The events can be subscribed to using the [event aggregator](../aurelia-packages/event-aggregator.md).
However, there is another type-safe alternative to that.

To this end, inject the `IRouterEvents` and use the `IRouterEvents#subscribe`.

```typescript
import {
  IRouterEvents,
  LocationChangeEvent,
  NavigationStartEvent,
  NavigationEndEvent,
  NavigationCancelEvent,
  NavigationErrorEvent,
} from '@aurelia/router-lite';
import { IDisposable } from 'aurelia';

export class SomeService implements IDisposable {
  private readonly subscriptions: IDisposable[];
  public log: string[] = [];
  public constructor(@IRouterEvents events: IRouterEvents) {
    this.subscriptions = [
      events.subscribe('au:router:location-change',   (event: LocationChangeEvent) =>   { /* handle event */ }),
      events.subscribe('au:router:navigation-start',  (event: NavigationStartEvent) =>  { /* handle event */ }),
      events.subscribe('au:router:navigation-end',    (event: NavigationEndEvent) =>    { /* handle event */ }),
      events.subscribe('au:router:navigation-cancel', (event: NavigationCancelEvent) => { /* handle event */ }),
      events.subscribe('au:router:navigation-error',  (event: NavigationErrorEvent) =>  { /* handle event */ }),
    ];
  }
  public dispose(): void {
    const subscriptions = this.subscriptions;
    this.subscriptions.length = 0;
    const len = subscriptions.length;
    for (let i = 0; i < len; i++) {
      subscriptions[i].dispose();
    }
  }
}
```

Note that the event-data for every event has a different type.
When you are using TypeScript, using `IRouterEvents` correctly types the event-data to the corresponding event type and naturally provides you with intellisense.

The following example demonstrates the usage of router events, where the root component displays a spinner at the start of navigation, and removes it when the navigation ends.

```typescript
import { IRouterEvents } from '@aurelia/router-lite';

export class MyApp {
  private navigating: boolean = false;
  public constructor(@IRouterEvents events: IRouterEvents) {
    events.subscribe(
      'au:router:navigation-start',
      () => (this.navigating = true)
    );
    events.subscribe(
      'au:router:navigation-end',
      () => (this.navigating = false)
    );
  }
}
```

This is shown in action below.

{% embed url="https://stackblitz.com/edit/router-lite-events?ctl=1&embed=1&file=src/my-app.ts" %}
