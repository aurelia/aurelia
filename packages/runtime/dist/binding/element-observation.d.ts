import { IIndexable, Primitive } from '@aurelia/kernel';
import { IElement, IInputElement, INode } from '../dom';
import { ILifecycle } from '../lifecycle';
import { IBatchedCollectionSubscriber, IBindingTargetObserver, IndexMap, IObserversLookup, IPropertySubscriber, LifecycleFlags } from '../observation';
import { IEventSubscriber } from './event-manager';
import { IObserverLocator } from './observer-locator';
import { SetterObserver } from './property-observation';
export interface ValueAttributeObserver extends IBindingTargetObserver<INode, string, Primitive | IIndexable> {
}
export declare class ValueAttributeObserver implements ValueAttributeObserver {
    currentFlags: LifecycleFlags;
    currentValue: Primitive | IIndexable;
    defaultValue: Primitive | IIndexable;
    oldValue: Primitive | IIndexable;
    flush: () => void;
    handler: IEventSubscriber;
    lifecycle: ILifecycle;
    obj: INode;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: INode, propertyKey: string, handler: IEventSubscriber);
    getValue(): Primitive | IIndexable;
    setValueCore(newValue: Primitive | IIndexable, flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    private flushFileChanges;
}
interface IInternalInputElement extends IInputElement {
    matcher?: typeof defaultMatcher;
    model?: Primitive | IIndexable;
    $observers?: IObserversLookup & {
        model?: SetterObserver;
        value?: ValueAttributeObserver;
    };
}
export interface CheckedObserver extends IBindingTargetObserver<IInternalInputElement, string, Primitive | IIndexable>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
export declare class CheckedObserver implements CheckedObserver {
    currentFlags: LifecycleFlags;
    currentValue: Primitive | IIndexable;
    defaultValue: Primitive | IIndexable;
    flush: () => void;
    handler: IEventSubscriber;
    lifecycle: ILifecycle;
    obj: IInternalInputElement;
    observerLocator: IObserverLocator;
    oldValue: Primitive | IIndexable;
    private arrayObserver;
    private valueObserver;
    constructor(lifecycle: ILifecycle, obj: IInternalInputElement, handler: IEventSubscriber, observerLocator: IObserverLocator);
    getValue(): Primitive | IIndexable;
    setValueCore(newValue: Primitive | IIndexable, flags: LifecycleFlags): void;
    handleBatchedChange(): void;
    handleChange(newValue: Primitive | IIndexable, previousValue: Primitive | IIndexable, flags: LifecycleFlags): void;
    synchronizeElement(): void;
    notify(flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    unbind(): void;
}
declare type UntypedArray = (Primitive | IIndexable)[];
declare function defaultMatcher(a: Primitive | IIndexable, b: Primitive | IIndexable): boolean;
export interface ISelectElement extends IElement {
    multiple: boolean;
    value: string;
    options: ArrayLike<IOptionElement>;
    matcher?: typeof defaultMatcher;
}
export interface IOptionElement extends IElement {
    model?: Primitive | IIndexable;
    selected: boolean;
    value: string;
}
export interface SelectValueObserver extends IBindingTargetObserver<ISelectElement, string, Primitive | IIndexable | UntypedArray>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
export declare class SelectValueObserver implements SelectValueObserver {
    lifecycle: ILifecycle;
    obj: ISelectElement;
    handler: IEventSubscriber;
    observerLocator: IObserverLocator;
    currentValue: Primitive | IIndexable | UntypedArray;
    currentFlags: LifecycleFlags;
    oldValue: Primitive | IIndexable | UntypedArray;
    defaultValue: Primitive | UntypedArray;
    flush: () => void;
    private arrayObserver;
    private nodeObserver;
    constructor(lifecycle: ILifecycle, obj: ISelectElement, handler: IEventSubscriber, observerLocator: IObserverLocator);
    getValue(): Primitive | IIndexable | UntypedArray;
    setValueCore(newValue: Primitive | UntypedArray, flags: LifecycleFlags): void;
    handleBatchedChange(indexMap: number[]): void;
    handleChange(newValue: Primitive | UntypedArray, previousValue: Primitive | UntypedArray, flags: LifecycleFlags): void;
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