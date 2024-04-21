# Route Events

The router emits several events via the [Event Aggregator](../getting-to-know-aurelia/event-aggregator.md), which allows you to listen to router events as they occur. In some situations, you might opt for a router hook, but in other cases, an event might be what you are after.

A good example of where using events might be more appropriate is showing and hiding loaders and other parts of your applications that relate to routing.

**The events fired are:**

* au:router:router-start
* au:router:router-stop
* au:router:navigation-start
* au:router:navigation-end
* au:router:navigation-cancel
* au:router:navigation-error

To listen to these events, you subscribe to them using the event aggregator like this:

```typescript
import { IEventAggregator, resolve } from 'aurelia';
import { IRouteableComponent } from '@aurelia/router';

export class MyComponent implements IRouteableComponent {
    readonly ea: IEventAggregator = resolve(IEventAggregator);

    bound() {
        this.ea.subscribe('au:router:navigation-start', payload => {
            // Do stuff inside of this callback
        });
    }
 }
```

As you might expect, these events are named in an intuitive way depending on the action taking place inside of the router.

{% hint style="info" %}
You will want to listen to the end, cancel and error navigation events if you're relying on displaying and hiding parts of the UI based on the router, to ensure you're checking for a true "done" state.
{% endhint %}
