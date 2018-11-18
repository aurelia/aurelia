import { IDisposable } from '@aurelia/kernel';
import { INode } from '../dom';
export interface IEventWithStandardPropagation extends Event {
    propagationStopped?: boolean;
    standardStopPropagation?: Event['stopPropagation'];
}
export declare class ListenerTracker {
    private capture;
    private count;
    private eventName;
    private listener;
    constructor(eventName: string, listener: EventListenerOrEventListenerObject, capture: boolean);
    increment(): void;
    decrement(): void;
}
/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
export declare class DelegateOrCaptureSubscription {
    entry: ListenerTracker;
    lookup: Record<string, EventListenerOrEventListenerObject>;
    targetEvent: string;
    constructor(entry: ListenerTracker, lookup: Record<string, EventListenerOrEventListenerObject>, targetEvent: string, callback: EventListenerOrEventListenerObject);
    dispose(): void;
}
/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
export declare class TriggerSubscription {
    target: INode;
    targetEvent: string;
    callback: EventListenerOrEventListenerObject;
    constructor(target: INode, targetEvent: string, callback: EventListenerOrEventListenerObject);
    dispose(): void;
}
export interface IEventTargetWithLookups extends INode {
    delegatedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
    capturedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
}
export declare enum DelegationStrategy {
    none = 0,
    capturing = 1,
    bubbling = 2
}
export interface IElementConfiguration {
    tagName: string;
    properties: Record<string, string[]>;
}
export interface IEventSubscriber extends IDisposable {
    subscribe(node: INode, callbackOrListener: EventListenerOrEventListenerObject): void;
}
export declare class EventSubscriber implements IEventSubscriber {
    private readonly events;
    private target;
    private handler;
    constructor(events: string[]);
    subscribe(node: INode, callbackOrListener: EventListenerOrEventListenerObject): void;
    dispose(): void;
}
export declare type EventSubscription = DelegateOrCaptureSubscription | TriggerSubscription;
export interface IEventManager {
    registerElementConfiguration(config: IElementConfiguration): void;
    getElementHandler(target: INode, propertyName: string): IEventSubscriber | null;
    addEventListener(target: INode, targetEvent: string, callbackOrListener: EventListenerOrEventListenerObject, delegate: DelegationStrategy): IDisposable;
}
export declare const IEventManager: import("@aurelia/kernel/dist/di").InterfaceSymbol<IEventManager>;
//# sourceMappingURL=event-manager.d.ts.map