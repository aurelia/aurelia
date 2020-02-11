# Cross-Component Communication

TODO: Convert below to Aurelia 2.

TODO: Port current Aurelia 1 EA docs and integrate with scenarios below.

## Use Case \#1 \(most common\)

A typical use case is to use the Event Aggregator as a global pub/sub \(publish/subscribe\). A child element would typically send \(publish\) data \(which could be any type\) with a key identifier which is used as a Singleton Service and then another VM or Service could listen \(subscribe\) to a particular message sent via a key identifier that we are monitoring and do something according to the data received.

### Example with Parent/Child communication

```typescript
// Child (sending user form)
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class HelloChild {

  constructor(private ea: EventAggregator) { }

  submit(user) {
    this.ea.publish('form:submitted', user);
  }
}
```

```typescript
// Parent (listening to user form)
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class HelloParent {
  subscription: Subscription;

  constructor(private ea: EventAggregator) {
    this.subscription = this.ea.subscribe('form:submitted', (user) => alert(`Hello ${user.firstName}`));
  }

  dispose() {
    // don't forget to dispose of the subscription to avoid any side effect
    this.subscription.dispose();
  }
}
```

## Use Case \#2 - Plugin with Internal Communication

Another use case could be for example if we develop a plugin \(say a data grid\) and we want to have internal communication within that plugin but not outside of it and we also want to make sure that if we reuse the plugin multiple times in a View, then their communications will be contained in each of them. A good example would be that if we create 2 grids in a View and the first grid sends a message saying that it cleared all its filters, we obviously want to make sure that only the grid we are interacting with will be the one which will receive that message and execcute an action accordingly and no other grids.

### Example with Plugin Communication

```typescript
// Plugin
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';

@inject(NewInstance.of(EventAggregator))
export class MyGridPlugin {
  subscription: Subscription;
  searchFilter = 'something';

  constructor(private ea: EventAggregator) {
    this.subscription = this.ea.subscribe('filter:cleared', () => this.searchFilter = '');
  }

  dispose() {
    this.subscription.dispose();
  }
}
```

```typescript
// Service
import { EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class FilterService {
  constructor(private ea: EventAggregator) { }

  clear() {
    this.ea.publish('filter:cleared', true);
  }
}
```

## Use Case \#3 - Plugin with both Internal Communication & Global Communication

Very similar to the previous use case, except that not only do we want internal communication, we also want to have global communication. An example of a global communication would be that we want to do a certain action in the plugin when the I18N published a locale changed, for example changing the text of a grid pagination. For that we can use the `NewInstance.of(EventAggregator).as(AnotherClass)`, this will allow us to have 2 instances of the Event Aggregator \(1 being local to the plugin and the other being a global one\).

### Example with Plugin Communication

#### Create a Plugin Event Aggregator \(EA used for the plugin communication\)

```typescript
import { Disposable } from 'aurelia-framework';

/**
 * A class that will be used for internal communication of parent-child
 * All methods are abstract for typings purposes only
 */
export abstract class PluginEventAggregator {
  abstract publish(event: string, data: any): void;

  abstract subscribe(event: string, callback: (data: any) => void): Disposable;
}
```

#### Use both Event Aggregators \(global + plugin\)

```typescript
// Plugin
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';

@inject(
  EventAggregator,                                          // Global EA
  NewInstance.of(EventAggregator).as(PluginEventAggregator) // Plugin EA
)
export class MyGridPlugin {
  subscriptions: Subscription[] = [];
  searchFilter = 'something';

  constructor(private globalEa: EventAggregator, private pluginEa: PluginEventAggregator) {
    this.subscriptions.push(
      this.pluginEa.subscribe('filter:cleared', () => this.searchFilter = ''),
      this.globalEa.subscribe('i18n:locale:changed', (payload) => this.translatePaginationTexts(payload))
    );
  }

  dispose() {
    subscriptions.forEach((subscription: Subscription) => this.subscription.dispose());
  }
}
```

```typescript
// Service
import { EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class PaginationService {
  constructor(private ea: EventAggregator) { }

  clear() {
    this.ea.publish('filter:cleared', true);
  }
}
```

## Use Case \#4 \(Extending Event Aggregator\)

In some cases, we maybe want to extend the Event Aggregator and add some extra functionalities. For example, say we want to know the entire list of subscribed events.

### Example

#### Extending the Event Aggregator

```typescript
export class ExtendedEventAggregator extends EventAggregator {
  subscriberNames: string[] = [];

  getAllSubscribedEventNames(): string {
    return this.subscriberNames;
  }

  // override the EA parent method with our own implementation and call the parent method when we're done
  // in our demo we'll simply keep track of the event key identifiers and push them into an array
  subscribe(event: string, callback: (data: any) => void): Disposable {
    this.subscriberNames.push(event);
    return super.subscribe(event, callback);
  }
}
```

#### Use our extended EA

```typescript
// Parent (listening to user form)
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { ExtendedEventAggregator } from './extendedEventAggregator';

@inject(ExtendedEventAggregator)
export class HelloParent {
  subscription: Subscription;
  subEventNames: string;

  constructor(private extendedEa: ExtendedEventAggregator) {
    this.subscription = this.extendedEa.subscribe('form:submitted', (user) => alert(`Hello ${user.firstName}`));
  }

  getSubscribedEvents() {
    // should return:: "form:submitted"
    this.subEventNames = this.ea.getAllSubscribedEventNames().join(', ');
  }

  dispose() {
    this.subscription.dispose();
  }
}
```

