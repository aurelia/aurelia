import { IBatchedCollectionSubscriber, IBindingTargetObserver, ILifecycle, IObserverLocator, IPropertySubscriber, LifecycleFlags } from '@aurelia/runtime';
export interface IHtmlElement extends HTMLElement {
    $mObserver: MutationObserver;
    $eMObservers: Set<ElementMutationSubscription>;
}
export interface ElementMutationSubscription {
    handleMutation(mutationRecords: MutationRecord[]): void;
}
export interface AttributeObserver extends IBindingTargetObserver<IHtmlElement, string>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
export declare class AttributeObserver implements AttributeObserver, ElementMutationSubscription {
    readonly isDOMObserver: true;
    readonly persistentFlags: LifecycleFlags;
    observerLocator: IObserverLocator;
    lifecycle: ILifecycle;
    currentValue: unknown;
    currentFlags: LifecycleFlags;
    oldValue: unknown;
    defaultValue: unknown;
    obj: IHtmlElement;
    private readonly targetAttribute;
    constructor(flags: LifecycleFlags, lifecycle: ILifecycle, observerLocator: IObserverLocator, element: Element, targetAttribute: string, targetKey: string);
    getValue(): unknown;
    getValueInlineStyle(): string;
    getValueClassName(): boolean;
    setValueCore(newValue: unknown, flags: LifecycleFlags): void;
    setValueCoreInlineStyle(value: unknown): void;
    setValueCoreClassName(newValue: unknown): void;
    handleMutation(mutationRecords: MutationRecord[]): void;
    handleMutationCore(): void;
    handleMutationInlineStyle(): void;
    handleMutationClassName(): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
}
//# sourceMappingURL=element-attribute-observer.d.ts.map