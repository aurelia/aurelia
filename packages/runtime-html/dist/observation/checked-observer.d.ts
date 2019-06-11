import { CollectionKind, IAccessor, ICollectionObserver, ILifecycle, IndexMap, IObserverLocator, ISubscriber, ISubscriberCollection, LifecycleFlags, ObserversLookup, Priority, SetterObserver } from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';
import { ValueAttributeObserver } from './value-attribute-observer';
export interface IInputElement extends HTMLInputElement {
    model?: unknown;
    $observers?: ObserversLookup & {
        model?: SetterObserver;
        value?: ValueAttributeObserver;
    };
    matcher?: typeof defaultMatcher;
}
declare function defaultMatcher(a: unknown, b: unknown): boolean;
export interface CheckedObserver extends ISubscriberCollection {
}
export declare class CheckedObserver implements IAccessor<unknown> {
    readonly lifecycle: ILifecycle;
    readonly observerLocator: IObserverLocator;
    readonly handler: IEventSubscriber;
    readonly obj: IInputElement;
    currentValue: unknown;
    oldValue: unknown;
    hasChanges: boolean;
    priority: Priority;
    arrayObserver?: ICollectionObserver<CollectionKind.array>;
    valueObserver?: ValueAttributeObserver | SetterObserver;
    constructor(lifecycle: ILifecycle, observerLocator: IObserverLocator, handler: IEventSubscriber, obj: IInputElement);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    synchronizeElement(): void;
    handleEvent(): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
export {};
//# sourceMappingURL=checked-observer.d.ts.map