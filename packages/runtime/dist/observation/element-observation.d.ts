import { IDOM } from '../dom';
import { IHTMLInputElement, IHTMLOptionElement, IHTMLSelectElement, INode } from '../dom.interfaces';
import { ILifecycle } from '../lifecycle';
import { IBatchedCollectionSubscriber, IBindingTargetObserver, IndexMap, IPropertySubscriber, LifecycleFlags, ObserversLookup } from '../observation';
import { IEventSubscriber } from './event-manager';
import { IObserverLocator } from './observer-locator';
import { SetterObserver } from './property-observation';
export interface ValueAttributeObserver extends IBindingTargetObserver<INode, string> {
}
export declare class ValueAttributeObserver implements ValueAttributeObserver {
    dom: IDOM;
    currentFlags: LifecycleFlags;
    currentValue: unknown;
    defaultValue: unknown;
    oldValue: unknown;
    flush: () => void;
    handler: IEventSubscriber;
    lifecycle: ILifecycle;
    obj: INode;
    propertyKey: string;
    constructor(dom: IDOM, lifecycle: ILifecycle, obj: INode, propertyKey: string, handler: IEventSubscriber);
    getValue(): unknown;
    setValueCore(newValue: unknown, flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    private flushFileChanges;
}
export interface IInputElement extends IHTMLInputElement {
    matcher?: typeof defaultMatcher;
    model?: unknown;
    $observers?: ObserversLookup & {
        model?: SetterObserver;
        value?: ValueAttributeObserver;
    };
}
export interface CheckedObserver extends IBindingTargetObserver<IInputElement, string>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
export declare class CheckedObserver implements CheckedObserver {
    dom: IDOM;
    currentFlags: LifecycleFlags;
    currentValue: unknown;
    defaultValue: unknown;
    flush: () => void;
    handler: IEventSubscriber;
    lifecycle: ILifecycle;
    obj: IInputElement;
    observerLocator: IObserverLocator;
    oldValue: unknown;
    private arrayObserver;
    private valueObserver;
    constructor(dom: IDOM, lifecycle: ILifecycle, obj: IInputElement, handler: IEventSubscriber, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValueCore(newValue: unknown, flags: LifecycleFlags): void;
    handleBatchedChange(): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    synchronizeElement(): void;
    notify(flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    unbind(): void;
}
declare function defaultMatcher(a: unknown, b: unknown): boolean;
export interface ISelectElement extends IHTMLSelectElement {
    options: ArrayLike<IOptionElement>;
    matcher?: typeof defaultMatcher;
}
export interface IOptionElement extends IHTMLOptionElement {
    model?: unknown;
}
export interface SelectValueObserver extends IBindingTargetObserver<ISelectElement, string>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
export declare class SelectValueObserver implements SelectValueObserver {
    dom: IDOM;
    currentValue: unknown;
    currentFlags: LifecycleFlags;
    oldValue: unknown;
    defaultValue: unknown;
    lifecycle: ILifecycle;
    obj: ISelectElement;
    handler: IEventSubscriber;
    observerLocator: IObserverLocator;
    flush: () => void;
    private arrayObserver;
    private nodeObserver;
    constructor(dom: IDOM, lifecycle: ILifecycle, obj: ISelectElement, handler: IEventSubscriber, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValueCore(newValue: unknown, flags: LifecycleFlags): void;
    handleBatchedChange(indexMap: number[]): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    notify(flags: LifecycleFlags): void;
    handleEvent(): void;
    synchronizeOptions(indexMap?: IndexMap): void;
    synchronizeValue(): boolean;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    bind(): void;
    unbind(): void;
    handleNodeChange(): void;
}
export {};
//# sourceMappingURL=element-observation.d.ts.map