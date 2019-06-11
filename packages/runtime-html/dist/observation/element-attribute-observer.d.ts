import { IBindingTargetObserver, ILifecycle, IObserverLocator, ISubscriber, ISubscriberCollection, LifecycleFlags, Priority } from '@aurelia/runtime';
export interface IHtmlElement extends HTMLElement {
    $mObserver: MutationObserver;
    $eMObservers: Set<ElementMutationSubscription>;
}
export interface ElementMutationSubscription {
    handleMutation(mutationRecords: MutationRecord[]): void;
}
export interface AttributeObserver extends IBindingTargetObserver<IHtmlElement, string>, ISubscriber, ISubscriberCollection {
}
/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
export declare class AttributeObserver implements AttributeObserver, ElementMutationSubscription {
    readonly lifecycle: ILifecycle;
    readonly observerLocator: IObserverLocator;
    readonly obj: IHtmlElement;
    readonly propertyKey: string;
    readonly targetAttribute: string;
    currentValue: unknown;
    oldValue: unknown;
    hasChanges: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, observerLocator: IObserverLocator, element: Element, propertyKey: string, targetAttribute: string);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    handleMutation(mutationRecords: MutationRecord[]): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=element-attribute-observer.d.ts.map