import { DI } from '../../../../kernel/dist/native-modules/index.js';
const defaultOptions = {
    capture: false,
};
class ListenerTracker {
    constructor(publisher, eventName, options = defaultOptions) {
        this.publisher = publisher;
        this.eventName = eventName;
        this.options = options;
        this.count = 0;
        this.captureLookups = new Map();
        this.bubbleLookups = new Map();
    }
    increment() {
        if (++this.count === 1) {
            this.publisher.addEventListener(this.eventName, this, this.options);
        }
    }
    decrement() {
        if (--this.count === 0) {
            this.publisher.removeEventListener(this.eventName, this, this.options);
        }
    }
    dispose() {
        if (this.count > 0) {
            this.count = 0;
            this.publisher.removeEventListener(this.eventName, this, this.options);
        }
        this.captureLookups.clear();
        this.bubbleLookups.clear();
    }
    /** @internal */
    getLookup(target) {
        const lookups = this.options.capture === true ? this.captureLookups : this.bubbleLookups;
        let lookup = lookups.get(target);
        if (lookup === void 0) {
            lookups.set(target, lookup = Object.create(null));
        }
        return lookup;
    }
    /** @internal */
    handleEvent(event) {
        const lookups = this.options.capture === true ? this.captureLookups : this.bubbleLookups;
        const path = event.composedPath();
        if (this.options.capture === true) {
            path.reverse();
        }
        for (const target of path) {
            const lookup = lookups.get(target);
            if (lookup === void 0) {
                continue;
            }
            const listener = lookup[this.eventName];
            if (listener === void 0) {
                continue;
            }
            if (typeof listener === 'function') {
                listener(event);
            }
            else {
                listener.handleEvent(event);
            }
            if (event.cancelBubble === true) {
                return;
            }
        }
    }
}
/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
export class DelegateSubscription {
    constructor(tracker, lookup, eventName, callback) {
        this.tracker = tracker;
        this.lookup = lookup;
        this.eventName = eventName;
        tracker.increment();
        lookup[eventName] = callback;
    }
    dispose() {
        this.tracker.decrement();
        this.lookup[this.eventName] = void 0;
    }
}
export class EventSubscriber {
    constructor(config) {
        this.config = config;
        this.target = null;
        this.handler = null;
    }
    subscribe(node, callbackOrListener) {
        this.target = node;
        this.handler = callbackOrListener;
        for (const event of this.config.events) {
            node.addEventListener(event, callbackOrListener);
        }
    }
    dispose() {
        const { target, handler } = this;
        if (target !== null && handler !== null) {
            for (const event of this.config.events) {
                target.removeEventListener(event, handler);
            }
        }
        this.target = this.handler = null;
    }
}
export const IEventDelegator = DI.createInterface('IEventDelegator', x => x.singleton(EventDelegator));
export class EventDelegator {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        this.trackerMaps = Object.create(null);
    }
    addEventListener(publisher, target, eventName, listener, options) {
        var _a;
        var _b;
        const trackerMap = (_a = (_b = this.trackerMaps)[eventName]) !== null && _a !== void 0 ? _a : (_b[eventName] = new Map());
        let tracker = trackerMap.get(publisher);
        if (tracker === void 0) {
            trackerMap.set(publisher, tracker = new ListenerTracker(publisher, eventName, options));
        }
        return new DelegateSubscription(tracker, tracker.getLookup(target), eventName, listener);
    }
    dispose() {
        for (const eventName in this.trackerMaps) {
            const trackerMap = this.trackerMaps[eventName];
            for (const tracker of trackerMap.values()) {
                tracker.dispose();
            }
            trackerMap.clear();
        }
    }
}
//# sourceMappingURL=event-delegator.js.map