# Event Aggregator

The Event Aggregator provides a lightweight pub/sub mechanism for communication between components in your Aurelia applications. This documentation covers the basics of using the Event Aggregator, along with several advanced use cases for cross-component communication.

{% hint style="info" %}
The Event Aggregator is designed solely for handling custom events within your application—it is not intended to replace native DOM events. For native event handling, continue to use standard event listeners.
{% endhint %}

## Basic Usage

To use the Event Aggregator in Aurelia, inject the `IEventAggregator` interface into your component. One common pattern is to resolve it using the `resolve` function.

### Injecting and Subscribing

```typescript
import { ICustomElementViewModel, IEventAggregator, resolve } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {
  readonly ea: IEventAggregator = resolve(IEventAggregator);

  bound() {
    this.ea.subscribe('event-name', payload => {
      // Handle the event payload
    });
  }
}
```

### Publishing Events

To publish an event with an optional payload, simply call the `publish` method. Any component subscribed to the event will receive the data.

```typescript
import { ICustomElementViewModel, IEventAggregator, resolve } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {
  readonly ea: IEventAggregator = resolve(IEventAggregator);

  bound() {
    const payload = {
      component: 'my-component',
      prop: 'value',
      child: {
        prop: 'value'
      }
    };

    this.ea.publish('component:bound', payload);
  }
}
```

### Disposing of Subscriptions

It is best practice to dispose of your subscriptions when a component is no longer active—typically in the `unbinding` lifecycle hook—to prevent memory leaks.

```typescript
import { ICustomElementViewModel, IEventAggregator, IDisposable, resolve } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {
  private myEventSubscription: IDisposable;
  readonly ea: IEventAggregator = resolve(IEventAggregator);

  bound() {
    this.myEventSubscription = this.ea.subscribe('event-name', payload => {
      // Handle the event payload
    });
  }

  unbinding() {
    this.myEventSubscription.dispose();
  }
}
```

## Advanced Scenarios for Cross-Component Communication

The Event Aggregator can be used in several advanced scenarios where components need to communicate in a decoupled manner.

### Use Case #1: Parent/Child Communication

In this use case, a child component publishes an event (e.g., a form submission), and a parent component subscribes to that event.

#### Child Component (Publishing an Event)

```typescript
import { IEventAggregator, resolve } from 'aurelia';

export class HelloChild {
  readonly ea: IEventAggregator = resolve(IEventAggregator);

  submit(user: any): void {
    this.ea.publish('form:submitted', user);
  }
}
```

#### Parent Component (Subscribing to the Event)

```typescript
import { IEventAggregator, IDisposable, resolve } from 'aurelia';

export class HelloParent {
  readonly ea: IEventAggregator = resolve(IEventAggregator);
  private subscription: IDisposable;

  bound() {
    this.subscription = this.ea.subscribe('form:submitted', (user: any) => {
      alert(`Hello ${user.firstName}`);
    });
  }

  unbinding() {
    if (this.subscription) {
      this.subscription.dispose();
    }
  }
}
```

### Use Case #2: Plugin with Internal Communication

Sometimes a plugin needs to communicate internally without affecting global event subscriptions. You can create a new instance of the Event Aggregator to scope these events locally.

#### Plugin Component (Internal Communication)

```typescript
import { IEventAggregator, IDisposable, NewInstance } from 'aurelia';

export class MyGridPlugin {
  searchFilter: string = 'something';
  private subscription: IDisposable;

  // Create a new instance for isolated internal communication.
  constructor(private ea: IEventAggregator = NewInstance.of(IEventAggregator)) {
    this.subscription = this.ea.subscribe('filter:cleared', () => {
      this.searchFilter = '';
    });
  }

  dispose(): void {
    this.subscription.dispose();
  }
}
```

#### Service (Triggering the Event)

```typescript
import { IEventAggregator, resolve } from 'aurelia';

export class FilterService {
  readonly ea: IEventAggregator = resolve(IEventAggregator);

  clear(): void {
    this.ea.publish('filter:cleared', true);
  }
}
```

### Use Case #3: Plugin with Both Internal and Global Communication

A plugin can require both local (plugin-scoped) event handling as well as listening to global events. In this scenario, inject two separate instances of the Event Aggregator.

```typescript
import { IEventAggregator, IDisposable, NewInstance, resolve } from 'aurelia';

export class MyGridPlugin {
  searchFilter: string = 'something';
  private subscriptions: IDisposable[] = [];

  constructor(
    // Global Event Aggregator for externally triggered events
    private globalEa: IEventAggregator = resolve(IEventAggregator),
    // Plugin-specific Event Aggregator for isolated internal events
    private pluginEa: IEventAggregator = NewInstance.of(IEventAggregator)
  ) {
    this.subscriptions.push(
      this.pluginEa.subscribe('filter:cleared', () => {
        this.searchFilter = '';
      }),
      this.globalEa.subscribe('i18n:locale:changed', (payload: any) => {
        this.translatePaginationTexts(payload);
      })
    );
  }

  translatePaginationTexts(payload: any): void {
    // Implement text translation logic here.
  }

  dispose(): void {
    this.subscriptions.forEach(subscription => subscription.dispose());
  }
}
```

### Use Case #4: Extending the Event Aggregator

You may wish to extend the functionality of the Event Aggregator by wrapping or subclassing it. For example, the following implementation tracks every event for which a subscription was created.

#### Extended Event Aggregator Implementation

```typescript
import { IEventAggregator, IDisposable, resolve } from 'aurelia';

export class ExtendedEventAggregator implements IEventAggregator {
  subscriberNames: string[] = [];
  private innerEa: IEventAggregator = resolve(IEventAggregator);

  publish(event: string, data?: any): void {
    this.innerEa.publish(event, data);
  }

  subscribe(event: string, callback: (data?: any) => void): IDisposable {
    this.subscriberNames.push(event);
    return this.innerEa.subscribe(event, callback);
  }

  subscribeOnce(event: string, callback: (data?: any) => void): IDisposable {
    return this.innerEa.subscribeOnce(event, callback);
  }

  getAllSubscribedEventNames(): string {
    return this.subscriberNames.join(', ');
  }
}
```

#### Using the Extended Event Aggregator

```typescript
import { IEventAggregator, IDisposable, resolve } from 'aurelia';
import { ExtendedEventAggregator } from './extended-event-aggregator';

export class HelloParent {
  private subscription: IDisposable;
  subEventNames: string;
  readonly ea: ExtendedEventAggregator = resolve(ExtendedEventAggregator);

  bound(): void {
    this.subscription = this.ea.subscribe('form:submitted', (user: any) => {
      alert(`Hello ${user.firstName}`);
    });
  }

  getSubscribedEvents(): void {
    // Retrieve a comma-separated list of all subscribed event names.
    this.subEventNames = this.ea.getAllSubscribedEventNames();
  }

  unbinding(): void {
    if (this.subscription) {
      this.subscription.dispose();
    }
  }
}
```

{% hint style="warning" %}
Always dispose of your subscriptions when they are no longer needed to prevent memory leaks.
{% endhint %}
