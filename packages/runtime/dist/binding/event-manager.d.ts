import { IDisposable } from '@aurelia/kernel';
import { IEventListenerOrEventListenerObject, INode } from '../dom.interfaces';
export declare class ListenerTracker {
    private capture;
    private count;
    private eventName;
    private listener;
    constructor(eventName: string, listener: IEventListenerOrEventListenerObject, capture: boolean);
    increment(): void;
    decrement(): void;
}
/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
export declare class DelegateOrCaptureSubscription {
    entry: ListenerTracker;
    lookup: Record<string, IEventListenerOrEventListenerObject>;
    targetEvent: string;
    constructor(entry: ListenerTracker, lookup: Record<string, IEventListenerOrEventListenerObject>, targetEvent: string, callback: IEventListenerOrEventListenerObject);
    dispose(): void;
}
/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
export declare class TriggerSubscription {
    target: INode;
    targetEvent: string;
    callback: IEventListenerOrEventListenerObject;
    constructor(target: INode, targetEvent: string, callback: IEventListenerOrEventListenerObject);
    dispose(): void;
}
export interface IEventTargetWithLookups extends INode {
    delegatedCallbacks?: Record<string, IEventListenerOrEventListenerObject>;
    capturedCallbacks?: Record<string, IEventListenerOrEventListenerObject>;
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
    subscribe(node: INode, callbackOrListener: IEventListenerOrEventListenerObject): void;
}
export declare class EventSubscriber implements IEventSubscriber {
    private readonly events;
    private target;
    private handler;
    constructor(events: string[]);
    subscribe(node: INode, callbackOrListener: IEventListenerOrEventListenerObject): void;
    dispose(): void;
}
export declare type EventSubscription = DelegateOrCaptureSubscription | TriggerSubscription;
export interface IEventManager {
    registerElementConfiguration(config: IElementConfiguration): void;
    getElementHandler(target: INode, propertyName: string): IEventSubscriber | null;
    addEventListener(target: INode, targetEvent: string, callbackOrListener: IEventListenerOrEventListenerObject, delegate: DelegationStrategy): IDisposable;
}
export declare const IEventManager: import("@aurelia/kernel/dist/di").InterfaceSymbol<IEventManager>;
//# sourceMappingURL=event-manager.d.ts.map