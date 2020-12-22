import type { NodeObserverConfig } from './observer-locator';
import type { IDisposable } from '@aurelia/kernel';
declare class ListenerTracker implements IDisposable {
    private readonly publisher;
    private readonly eventName;
    private readonly options;
    private count;
    private readonly captureLookups;
    private readonly bubbleLookups;
    constructor(publisher: EventTarget, eventName: string, options?: AddEventListenerOptions);
    increment(): void;
    decrement(): void;
    dispose(): void;
}
/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
export declare class DelegateSubscription implements IDisposable {
    private readonly tracker;
    private readonly lookup;
    private readonly eventName;
    constructor(tracker: ListenerTracker, lookup: Record<string, EventListenerOrEventListenerObject | undefined>, eventName: string, callback: EventListenerOrEventListenerObject);
    dispose(): void;
}
export declare class EventSubscriber {
    readonly config: NodeObserverConfig;
    private target;
    private handler;
    constructor(config: NodeObserverConfig);
    subscribe(node: EventTarget, callbackOrListener: EventListenerOrEventListenerObject): void;
    dispose(): void;
}
export interface IEventDelegator extends EventDelegator {
}
export declare const IEventDelegator: import("@aurelia/kernel").InterfaceSymbol<IEventDelegator>;
export declare class EventDelegator implements IDisposable {
    private readonly trackerMaps;
    constructor();
    addEventListener(publisher: EventTarget, target: Node, eventName: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): IDisposable;
    dispose(): void;
}
export {};
//# sourceMappingURL=event-delegator.d.ts.map