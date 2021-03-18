import { LifecycleFlags, AccessorType } from '@aurelia/runtime';
import { IPlatform } from '../platform.js';
import type { IObserver, IObserverLocator, ISubscriber, ISubscriberCollection, IFlushable, IWithFlushQueue, FlushQueue } from '@aurelia/runtime';
export interface IHtmlElement extends HTMLElement {
    $mObserver: MutationObserver;
    $eMObservers: Set<ElementMutationSubscription>;
}
export interface ElementMutationSubscription {
    handleMutation(mutationRecords: MutationRecord[]): void;
}
export interface AttributeObserver extends IObserver, ISubscriber, ISubscriberCollection {
}
/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
export declare class AttributeObserver implements AttributeObserver, ElementMutationSubscription, IWithFlushQueue, IFlushable {
    private readonly platform;
    readonly observerLocator: IObserverLocator;
    readonly obj: IHtmlElement;
    readonly propertyKey: string;
    readonly targetAttribute: string;
    value: unknown;
    oldValue: unknown;
    hasChanges: boolean;
    type: AccessorType;
    readonly queue: FlushQueue;
    private f;
    constructor(platform: IPlatform, observerLocator: IObserverLocator, obj: IHtmlElement, propertyKey: string, targetAttribute: string);
    getValue(): unknown;
    setValue(value: unknown, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    handleMutation(mutationRecords: MutationRecord[]): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    flush(): void;
}
//# sourceMappingURL=element-attribute-observer.d.ts.map