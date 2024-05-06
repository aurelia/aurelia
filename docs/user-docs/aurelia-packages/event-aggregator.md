# Event Aggregator

The Event Aggregator is a pub/sub event package that allows you to publish and subscribe custom events inside of your Aurelia applications. Some parts of the Aurelia framework use the event aggregator to publish certain events at various points of the lifecycle and actions taking place in the framework.

## Using the event aggregator

To use the Event Aggregator, we inject the `IEventAggregator` interface into our component. In the following code example, we inject it as `ea` on our component class.

```typescript
import { ICustomElementViewModel, IEventAggregator, resolve } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {
    readonly ea: IEventAggregator = resolve(IEventAggregator);
}
```

### Subscribing to events

The Event Aggregator provides a subscribe method to subscribe to published events.

```typescript
import { ICustomElementViewModel, IEventAggregator, resolve } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {
    readonly ea: IEventAggregator = resolve(IEventAggregator);

    bound() {
        this.ea.subscribe('event name', payload => {
            // Do stuff inside of this callback
        });
    }
}
```

In some situations, you might only want to subscribe to an event once. To do that, we can use the `subscribeOnce` method which will listen to the event and then dispose of itself once it has been fired.

```typescript
import { ICustomElementViewModel, IEventAggregator, resolve } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {
    readonly ea: IEventAggregator = resolve(IEventAggregator);

    bound() {
        this.ea.subscribeOnce('event name', payload => {
            // Do stuff inside of this callback just once
        });
    }
 }
```

### Publishing events

To publish (emit) an event, we use the `publish` method. You can provide an object to the publish method which allows you to emit data via the event (accessible as a parameter on the subscribe method).

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

        this.ea.publish('component bound', payload);
    }
}
```

### Disposing event listeners

It's considered best practice to dispose of your event listeners when you are finished with them. Inside of a component, you would usually do this inside of the `unbinding` method. The event will be of type `IDisposable` which we will use to strongly type our class property.

```typescript
import { ICustomElementViewModel, IEventAggregator, IDisposable, resolve } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {
    private myEvent: IDisposable;

    readonly ea: IEventAggregator = resolve(IEventAggregator);

    bound() {
        this.myEvent = this.ea.subscribe('event name', payload => {
            // Do stuff inside of this callback
        });
    }

    unbinding() {
        this.myEvent.dispose();
    }
}
```
