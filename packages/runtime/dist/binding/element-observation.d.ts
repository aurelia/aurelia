import { IIndexable, Primitive } from '@aurelia/kernel';
import { IElement, IInputElement, INode } from '../dom';
import { BindingFlags, IBatchedCollectionSubscriber, IBindingTargetObserver, IChangeSet, IndexMap, IObserversLookup, IPropertySubscriber } from '../observation';
import { IEventSubscriber } from './event-manager';
import { IObserverLocator } from './observer-locator';
import { SetterObserver } from './property-observation';
export interface ValueAttributeObserver extends IBindingTargetObserver<INode, string, Primitive | IIndexable> {
}
export declare class ValueAttributeObserver implements ValueAttributeObserver {
    changeSet: IChangeSet;
    obj: INode;
    propertyKey: string;
    handler: IEventSubscriber;
    currentValue: Primitive | IIndexable;
    currentFlags: BindingFlags;
    oldValue: Primitive | IIndexable;
    defaultValue: Primitive | IIndexable;
    flushChanges: () => void;
    constructor(changeSet: IChangeSet, obj: INode, propertyKey: string, handler: IEventSubscriber);
    getValue(): Primitive | IIndexable;
    setValueCore(newValue: Primitive | IIndexable, flags: BindingFlags): void;
    handleEvent(): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    private flushFileChanges;
}
interface IInternalInputElement extends IInputElement {
    matcher?: typeof defaultMatcher;
    model?: any;
    $observers?: IObserversLookup & {
        model?: SetterObserver;
        value?: ValueAttributeObserver;
    };
}
export interface CheckedObserver extends IBindingTargetObserver<IInternalInputElement, string, Primitive | IIndexable>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
export declare class CheckedObserver implements CheckedObserver {
    changeSet: IChangeSet;
    obj: IInternalInputElement;
    handler: IEventSubscriber;
    observerLocator: IObserverLocator;
    currentValue: Primitive | IIndexable;
    currentFlags: BindingFlags;
    oldValue: Primitive | IIndexable;
    defaultValue: Primitive | IIndexable;
    flushChanges: () => void;
    private arrayObserver;
    private valueObserver;
    constructor(changeSet: IChangeSet, obj: IInternalInputElement, handler: IEventSubscriber, observerLocator: IObserverLocator);
    getValue(): Primitive | IIndexable;
    setValueCore(newValue: Primitive | IIndexable, flags: BindingFlags): void;
    handleBatchedChange(): void;
    handleChange(newValue: Primitive | IIndexable, previousValue: Primitive | IIndexable, flags: BindingFlags): void;
    synchronizeElement(): void;
    notify(flags: BindingFlags): void;
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
    changeSet: IChangeSet;
    obj: ISelectElement;
    handler: IEventSubscriber;
    observerLocator: IObserverLocator;
    currentValue: Primitive | IIndexable | UntypedArray;
    currentFlags: BindingFlags;
    oldValue: Primitive | IIndexable | UntypedArray;
    defaultValue: Primitive | UntypedArray;
    flushChanges: () => void;
    private arrayObserver;
    private nodeObserver;
    constructor(changeSet: IChangeSet, obj: ISelectElement, handler: IEventSubscriber, observerLocator: IObserverLocator);
    getValue(): Primitive | IIndexable | UntypedArray;
    setValueCore(newValue: Primitive | UntypedArray, flags: BindingFlags): void;
    handleBatchedChange(indexMap: number[]): void;
    handleChange(newValue: Primitive | UntypedArray, previousValue: Primitive | UntypedArray, flags: BindingFlags): void;
    notify(flags: BindingFlags): void;
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