import { CollectionKind, IAccessor, ICollectionObserver, IndexMap, ISubscriber, ISubscriberCollection, LifecycleFlags, ObserversLookup, SetterObserver, IScheduler, ITask, ILifecycle } from '@aurelia/runtime';
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
export declare class CheckedObserver implements IAccessor {
    readonly scheduler: IScheduler;
    lifecycle: ILifecycle;
    readonly handler: IEventSubscriber;
    readonly obj: IInputElement;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    task: ITask | null;
    collectionObserver?: ICollectionObserver<CollectionKind>;
    valueObserver?: ValueAttributeObserver | SetterObserver;
    constructor(scheduler: IScheduler, flags: LifecycleFlags, lifecycle: ILifecycle, handler: IEventSubscriber, obj: IInputElement);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
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