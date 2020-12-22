import { LifecycleFlags, AccessorType } from '@aurelia/runtime';
import { IPlatform } from '../platform.js';
import type { IObserver, IObserverLocator, ISubscriber, ISubscriberCollection } from '@aurelia/runtime';
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
export declare class AttributeObserver implements AttributeObserver, ElementMutationSubscription {
    private readonly platform;
    readonly observerLocator: IObserverLocator;
    readonly obj: IHtmlElement;
    readonly propertyKey: string;
    readonly targetAttribute: string;
    currentValue: unknown;
    oldValue: unknown;
    hasChanges: boolean;
    type: AccessorType;
    constructor(platform: IPlatform, observerLocator: IObserverLocator, obj: IHtmlElement, propertyKey: string, targetAttribute: string);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    handleMutation(mutationRecords: MutationRecord[]): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
//# sourceMappingURL=element-attribute-observer.d.ts.map