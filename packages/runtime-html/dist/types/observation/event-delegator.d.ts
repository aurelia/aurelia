import type { NodeObserverConfig } from './observer-locator.js';
import type { IDisposable } from '@aurelia/kernel';
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
    addEventListener(publisher: EventTarget, target: Node, eventName: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): IDisposable;
    dispose(): void;
}
//# sourceMappingURL=event-delegator.d.ts.map