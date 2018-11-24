import { IElement, IInputElement, INode } from '../dom';
import { ILifecycle } from '../lifecycle';
import { IBatchedCollectionSubscriber, IBindingTargetObserver, IndexMap, IObserversLookup, IPropertySubscriber, LifecycleFlags } from '../observation';
import { IEventSubscriber } from './event-manager';
import { IObserverLocator } from './observer-locator';
import { SetterObserver } from './property-observation';
export interface ValueAttributeObserver extends IBindingTargetObserver<INode, string> {
}
export declare class ValueAttributeObserver implements ValueAttributeObserver {
    currentFlags: LifecycleFlags;
    currentValue: unknown;
    defaultValue: unknown;
    oldValue: unknown;
    flush: () => void;
    handler: IEventSubscriber;
    lifecycle: ILifecycle;
    obj: INode;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: INode, propertyKey: string, handler: IEventSubscriber);
    getValue(): unknown;
    setValueCore(newValue: unknown, flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    private flushFileChanges;
}
interface IInternalInputElement extends IInputElement {
    matcher?: typeof defaultMatcher;
    model?: unknown;
    $observers?: IObserversLookup & {
        model?: SetterObserver;
        value?: ValueAttributeObserver;
    };
}
export interface CheckedObserver extends IBindingTargetObserver<IInternalInputElement, string>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
export declare class CheckedObserver implements CheckedObserver {
    currentFlags: LifecycleFlags;
    currentValue: unknown;
    defaultValue: unknown;
    flush: () => void;
    handler: IEventSubscriber;
    lifecycle: ILifecycle;
    obj: IInternalInputElement;
    observerLocator: IObserverLocator;
    oldValue: unknown;
    private arrayObserver;
    private valueObserver;
    constructor(lifecycle: ILifecycle, obj: IInternalInputElement, handler: IEventSubscriber, observerLocator: IObserverLocator);
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
export interface ISelectElement extends IElement {
    multiple: boolean;
    value: string;
    options: ArrayLike<IOptionElement>;
    matcher?: typeof defaultMatcher;
}
export interface IOptionElement extends IElement {
    model?: unknown;
    selected: boolean;
    value: string;
}
export interface SelectValueObserver extends IBindingTargetObserver<ISelectElement, string>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
export declare class SelectValueObserver implements SelectValueObserver {
    lifecycle: ILifecycle;
    obj: ISelectElement;
    handler: IEventSubscriber;
    observerLocator: IObserverLocator;
    currentValue: unknown;
    currentFlags: LifecycleFlags;
    oldValue: unknown;
    defaultValue: unknown;
    flush: () => void;
    private arrayObserver;
    private nodeObserver;
    constructor(lifecycle: ILifecycle, obj: ISelectElement, handler: IEventSubscriber, observerLocator: IObserverLocator);
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