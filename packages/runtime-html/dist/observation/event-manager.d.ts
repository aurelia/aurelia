import { IDisposable } from '@aurelia/kernel';
import { DelegationStrategy, IDOM } from '@aurelia/runtime';
export interface IManagedEvent extends Event {
    propagationStopped?: boolean;
    path?: EventTarget[];
    standardStopPropagation?(): void;
    deepPath?(): EventTarget[];
}
export declare class ListenerTracker {
    private readonly dom;
    private readonly capture;
    private readonly eventName;
    private readonly listener;
    private count;
    constructor(dom: IDOM, eventName: string, listener: EventListenerOrEventListenerObject, capture: boolean);
    increment(): void;
    decrement(): void;
}
/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
export declare class DelegateOrCaptureSubscription implements IDisposable {
    entry: {
        decrement(): void;
    };
    lookup: Record<string, EventListenerOrEventListenerObject>;
    targetEvent: string;
    constructor(entry: {
        decrement(): void;
    }, lookup: Record<string, EventListenerOrEventListenerObject>, targetEvent: string, callback: EventListenerOrEventListenerObject);
    dispose(): void;
}
/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
export declare class TriggerSubscription implements IDisposable {
    target: Node;
    targetEvent: string;
    callback: EventListenerOrEventListenerObject;
    private readonly dom;
    constructor(dom: IDOM, target: Node, targetEvent: string, callback: EventListenerOrEventListenerObject);
    dispose(): void;
}
export interface IEventTargetWithLookups extends Node {
    delegatedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
    capturedCallbacks?: Record<string, EventListenerOrEventListenerObject>;
}
export interface IElementConfiguration {
    tagName: string;
    properties: Record<string, string[]>;
}
export interface IEventSubscriber extends IDisposable {
    subscribe(node: Node, callbackOrListener: EventListenerOrEventListenerObject): void;
}
export declare class EventSubscriber implements IEventSubscriber {
    private readonly dom;
    private readonly events;
    private target;
    private handler;
    constructor(dom: IDOM, events: string[]);
    subscribe(node: Node, callbackOrListener: EventListenerOrEventListenerObject): void;
    dispose(): void;
}
export declare type EventSubscription = DelegateOrCaptureSubscription | TriggerSubscription;
export interface IEventManager extends IDisposable {
    addEventListener(dom: IDOM, target: Node, targetEvent: string, callbackOrListener: EventListenerOrEventListenerObject, delegate: DelegationStrategy): IDisposable;
}
export declare const IEventManager: import("@aurelia/kernel").InterfaceSymbol<IEventManager>;
//# sourceMappingURL=event-manager.d.ts.map