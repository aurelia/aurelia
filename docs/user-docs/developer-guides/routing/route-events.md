# Route events

The router emits several events via the [Event Aggregator](../event-aggregator.md) which allow you to listen to router events as they occur. In some situations, you might opt for a router hook, but in other use cases, an event might be what you are after.

The events fired are:

* au:router:location-change
* au:router:navigation-start
* au:router:navigation-end
* au:router:navigation-cancel
* au:router:navigation-error

To listen to these events, you subscribe to them using the event aggregator like this:

```typescript
import { ICustomElementViewModel, IEventAggregator } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {    
    constructor(@IEventAggregator readonly ea: IEventAggregator) {

    }
    
    bound() {
        this.ea.subscribe('au:router:navigation-start', payload => {
            // Do stuff inside of this callback
        });
    }
 }   
```

As you might expect, these events are named in an intuitive way depending on the action taking place inside of the router. If you want to fire an event consistently whenever the router is doing something, the best event for that would be `au:router:location-change` as this is fired whenever the route changes.

For loading events, it might be advisable to use numerous navigation events. Keep in mind that you will want to listen to the end, cancel and error navigation events if you're relying on displaying and hiding parts of the UI based on the router, to ensure you're checking for a true "done" state.
