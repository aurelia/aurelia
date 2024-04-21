# Event Aggregator

The Event Aggregator is a pub/sub-event package that allows you to publish and subscribe to custom events inside your Aurelia applications. Some parts of the Aurelia framework use the event aggregator to publish certain events at various stages of the lifecycle and actions taking place.

{% hint style="info" %}
The Event Aggregator is not for listening to native events. For those, you still use `addEventListener` and `detachEventListener` the event aggregator is a pub/sub package for publishing and subscribing to custom events.
{% endhint %}

## Using the event aggregator

To use the Event Aggregator, we inject the `IEventAggregator` interface into our component. We inject it as `IEventAggregator` on our component class in the following code example.

```typescript
import { ICustomElementViewModel, IEventAggregator, resolve } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {
    readonly ea: IEventAggregator = resolve(IEventAggregator);
}
```

### Subscribing to events

The Event Aggregator provides a subscription method to subscribe to published events.

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

Sometimes, you might only want to subscribe to an event once. To do that, we can use the `subscribeOnce` method to listen to the event and dispose of itself once it has been fired.

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

To publish (emit) an event, we use the `publish` method. You can provide an object to the `publish` method, which allows you to emit data via the event (accessible as a parameter on the subscribe method).

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

### Disposing of event listeners

It's considered best practice to dispose of your event listeners when you are finished with them. Inside a component, you would usually do this inside of the `unbinding` method. The event will be of type `IDisposable` that we will use to type our class property strongly.

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

{% hint style="warning" %}
Always clean up after yourself. Like native Javascript events, you should dispose of any events properly to avoid memory leaks and other potential performance issues in your Aurelia applications.
{% endhint %}
